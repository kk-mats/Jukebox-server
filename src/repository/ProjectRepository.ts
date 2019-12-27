import { promises as fs, unwatchFile } from "fs";
import * as rimraf from "rimraf";
import * as path from "path";
import { promisify } from "util";

import * as mongoose from "mongoose";
import * as simplegit from "simple-git/promise";
import slugify from "slugify";

import * as pathUtils from "src/util";

import * as Failable from "src/types/failure/Failable";
import FailureCode from "src/types/failure/FailureCode";
import * as ProjectComm from "src/types/comm/Project";

import * as Project from "src/models/Project";
import * as History from "src/models/History";

import ConfigRepository from "src/repository/ConfigRepository";
import VCS from "src/types/VCS";
import Status from "src/types/Status";
import Detector from "src/types/Detector";
import { RawTarget, ValidatedTarget } from "src/types/query/Target";

export class Type {
	private static openGit(project: Project.Type): simplegit.SimpleGit {
		const directory = pathUtils.resolveChildrenPath(
			project.ownerId,
			project._id
		).codes;
		console.log(`Git repository opened: ${directory}`);
		return simplegit(directory);
	}

	private static async findWithGit(
		ownerId: mongoose.Types.ObjectId,
		slug: string
	): Promise<
		Failable.Type<{ project: Project.Type; git: simplegit.SimpleGit }>
	> {
		const r = await this.findBySlug(ownerId, slug);
		if (r.failure) {
			return Failable.delegate(r);
		}

		if (r.value.vcs === "Unversioned") {
			return Failable.fail(FailureCode.project.unversioned(slug));
		}

		return Failable.succeed({
			project: r.value,
			git: this.openGit(r.value)
		});
	}

	public static async findByOwnerId(
		ownerId: mongoose.Types.ObjectId
	): Promise<Failable.Type<Project.Type[]>> {
		return Failable.succeed(await Project.Model.find({ ownerId }).exec());
	}

	public static async findBySlug(
		ownerId: mongoose.Types.ObjectId,
		slug: string
	): Promise<Failable.Type<Project.Type>> {
		const r = await Project.Model.findOne({ ownerId, slug }).exec();
		if (r) {
			return Failable.succeed(r);
		}
		return Failable.fail(FailureCode.project.slugNotFound(slug));
	}

	private static async validateDirectory(
		project: Project.Type,
		directory?: string
	): Promise<Failable.Type<{ absolute: string; relative: string }>> {
		const relative = directory || "./";
		const absolute = path.resolve(
			pathUtils.resolveChildrenPath(project.ownerId, project._id).codes,
			relative
		);

		const stat = await fs.stat(absolute);
		if (!stat.isDirectory && !stat.isFile) {
			return Failable.fail(
				FailureCode.project.invalidDirectory(project.slug, directory)
			);
		}

		return Failable.succeed({ relative, absolute });
	}

	private static async validateRevision(
		project: Project.Type,
		branch?: string,
		commitId?: string
	): Promise<Failable.Type<string>> {
		if (project.vcs === "Unversioned") {
			return Failable.fail(FailureCode.project.unversioned(project.slug));
		}
		const git = this.openGit(project);
		let revision = "";
		if (commitId) {
			if (
				await this.hasCommitId(project.ownerId, project.slug, commitId)
			) {
				revision = commitId;
			} else {
				return Failable.fail(
					FailureCode.project.commitIdNotFound(commitId)
				);
			}
		} else {
			let b = branch;
			if (!b) {
				const defaultBranch = await this.defaultBranch(
					project.ownerId,
					project.slug,
					git
				);
				if (defaultBranch.failure) {
					return Failable.delegate(defaultBranch);
				}
				b = defaultBranch.value;
			}

			const latest = await this.latestCommitId(
				project.ownerId,
				project.slug,
				b,
				git
			);
			if (latest.failure) {
				return Failable.delegate(latest);
			}
			revision = latest.value;
		}

		return Failable.succeed(revision);
	}

	public static async validateTarget(
		ownerId: mongoose.Types.ObjectId,
		slug: string,
		target: RawTarget
	): Promise<Failable.Type<ValidatedTarget>> {
		const p = await this.findBySlug(ownerId, slug);

		if (p.failure) {
			return Failable.delegate(p);
		}

		const [directory, revision] = await Promise.all([
			this.validateDirectory(p.value, target && target.directory),
			this.validateRevision(
				p.value,
				target && target.branch,
				target && target.commitId
			)
		]);

		if (directory.failure) {
			return Failable.delegate(directory);
		}

		if (revision.failure) {
			return Failable.delegate(revision);
		}

		return Failable.succeed({
			directory: directory.value,
			revision: revision.value
		});
	}

	public static async hasBranch(
		ownerId: mongoose.Types.ObjectId,
		slug: string,
		branch: string,
		git?: simplegit.SimpleGit
	): Promise<boolean> {
		let g = git;
		if (!g) {
			const r = await this.findWithGit(ownerId, slug);
			if (r.failure) {
				return false;
			}
			g = r.value.git;
		}

		const branches = await this.getBranches(ownerId, slug, g);
		return !branches.failure && branches.value.includes(branch);
	}

	public static async defaultBranch(
		ownerId: mongoose.Types.ObjectId,
		slug: string,
		git?: simplegit.SimpleGit
	): Promise<Failable.Type<string>> {
		let g = git;
		if (!g) {
			const r = await this.findWithGit(ownerId, slug);
			if (r.failure) {
				return Failable.delegate(r);
			}
			g = r.value.git;
		}

		// ToDo
		return Failable.succeed("master");
	}

	public static async hasCommitId(
		ownerId: mongoose.Types.ObjectId,
		slug: string,
		commitId: string,
		git?: simplegit.SimpleGit
	): Promise<boolean> {
		let g = git;
		if (!g) {
			const r = await this.findWithGit(ownerId, slug);
			if (r.failure) {
				return false;
			}
			g = r.value.git;
		}

		return !(await g.show([commitId])).startsWith("fatal: bad object");
	}

	public static async latestCommitId(
		ownerId: mongoose.Types.ObjectId,
		slug: string,
		branch: string,
		git?: simplegit.SimpleGit
	): Promise<Failable.Type<string>> {
		let g = git;
		if (!g) {
			const r = await this.findWithGit(ownerId, slug);
			if (r.failure) {
				return Failable.delegate(r);
			}
			g = r.value.git;
		}
		const log = await g.log(["-n", 1, "--first-parent", branch]);
		return Failable.succeed(log.latest.hash);
	}

	public static async getBranches(
		ownerId: mongoose.Types.ObjectId,
		slug: string,
		git?: simplegit.SimpleGit
	): Promise<Failable.Type<string[]>> {
		let g = git;
		if (!g) {
			const r = await this.findWithGit(ownerId, slug);
			if (r.failure) {
				return Failable.delegate(r);
			}
			g = r.value.git;
		}

		return Failable.succeed((await g.branchLocal()).all);
	}

	public static async checkout(
		ownerId: mongoose.Types.ObjectId,
		slug: string,
		revision: string
	): Promise<Failable.Type<void>> {
		const r = await this.findWithGit(ownerId, slug);
		if (r.failure) {
			return Failable.delegate(r);
		}

		return Failable.succeed(await r.value.git.checkout(revision));
	}

	public static async getHistories(
		ownerId: mongoose.Types.ObjectId,
		slug: string
	): Promise<Failable.Type<History.Type[]>> {
		const r = await this.findBySlug(ownerId, slug);
		if (r.failure) {
			return Failable.delegate(r);
		}
		return Failable.succeed(r.value.histories);
	}

	public static async findHistory(
		ownerId: mongoose.Types.ObjectId,
		slug: string,
		hid: string
	): Promise<
		Failable.Type<{ project: Project.Type; history: History.Type }>
	> {
		const p = await this.findBySlug(ownerId, slug);
		if (p.failure) {
			return Failable.delegate(p);
		}

		const h = p.value.histories.find(value => {
			return value._id.toHexString() === hid;
		});

		if (!h) {
			return Failable.fail(
				FailureCode.project.historyNotFound(slug, hid)
			);
		}

		return Failable.succeed({
			project: p.value,
			history: h
		});
	}

	private static async create(
		ownerId: mongoose.Types.ObjectId,
		name: string,
		vcs: VCS,
		loader: (codesDir: string, artifactsDir: string) => Promise<void>
	): Promise<Failable.Type<Project.Type>> {
		try {
			const p = await Project.Model.create({
				ownerId,
				name,
				slug: slugify(name),
				vcs,
				histories: []
			});

			const { codes, histories } = pathUtils.resolveChildrenPath(
				ownerId,
				p._id
			);

			await fs.mkdir(codes, { recursive: true });
			await Promise.all([
				fs.mkdir(histories, { recursive: true }),
				loader(codes, histories)
			]);

			return Failable.succeed(p);
		} catch (err) {
			if (err.code && err.code === 11000) {
				return Failable.fail(
					FailureCode.project.slugAlreadyExists(name)
				);
			}
			return Failable.fail(
				FailureCode.common.unknown("ProjectRepository::create", err)
			);
		}
	}

	public static async delete(
		ownerId: mongoose.Types.ObjectId,
		slug: string
	): Promise<Failable.Type<boolean>> {
		const p = await Project.Model.findOneAndDelete({
			ownerId,
			slug
		}).exec();
		if (p) {
			await promisify(rimraf)(
				pathUtils.resolveProjectPath(ownerId, p._id)
			);
			return Failable.succeed(true);
		}
		return Failable.fail(FailureCode.project.slugNotFound(slug));
	}

	public static async createHistory(
		ownerId: mongoose.Types.ObjectId,
		slug: string,
		detector: Detector,
		query: {
			target: ValidatedTarget;
			parameters: object;
		}
	): Promise<
		Failable.Type<{ hid: mongoose.Types.ObjectId; historyDir: string }>
	> {
		const p = await Project.Model.findOneAndUpdate(
			{ ownerId, slug },
			{
				$push: {
					histories: {
						created: new Date(),
						detector,
						query: {
							target: {
								directory: query.target.directory.relative,
								revision: query.target.revision
							},
							parameters: query.parameters
						},
						status: "Pending"
					}
				}
			},
			{ new: true }
		).exec();

		if (!p) {
			return Failable.fail(FailureCode.project.slugNotFound(slug));
		}
		const hid = p.histories[p.histories.length - 1]._id;
		const historyDir = path.resolve(
			pathUtils.resolveChildrenPath(ownerId, p._id).histories,
			hid.toHexString(),
			"artifacts"
		);
		await fs.mkdir(historyDir, { recursive: true });

		return Failable.succeed({
			hid,
			historyDir
		});
	}

	private static async updateHistoryStatus(
		ownerId: mongoose.Types.ObjectId,
		projectSlug: string,
		historyId: mongoose.Types.ObjectId,
		status: Status
	): Promise<Failable.Type<boolean>> {
		const p = await Project.Model.findOneAndUpdate(
			{ ownerId, slug: projectSlug, "histories._id": historyId },
			{
				$set: {
					"histories.$.dispatched": new Date(),
					"histories.$.status": status
				}
			}
		).exec();

		if (p) {
			return Failable.succeed(true);
		}

		return Failable.fail(
			FailureCode.project.historyNotFound(
				projectSlug,
				historyId.toHexString()
			)
		);
	}

	public static async dispatch(
		ownerId: mongoose.Types.ObjectId,
		projectSlug: string,
		historyId: mongoose.Types.ObjectId
	): Promise<Failable.Type<boolean>> {
		return this.updateHistoryStatus(
			ownerId,
			projectSlug,
			historyId,
			"Running"
		);
	}

	public static async succeeded(
		ownerId: mongoose.Types.ObjectId,
		projectSlug: string,
		historyId: mongoose.Types.ObjectId
	): Promise<Failable.Type<boolean>> {
		return this.updateHistoryStatus(
			ownerId,
			projectSlug,
			historyId,
			"Succeeded"
		);
	}

	public static async failed(
		ownerId: mongoose.Types.ObjectId,
		projectSlug: string,
		historyId: mongoose.Types.ObjectId
	): Promise<Failable.Type<boolean>> {
		return this.updateHistoryStatus(
			ownerId,
			projectSlug,
			historyId,
			"Failed"
		);
	}

	public static async createByGitUrl(
		ownerId: mongoose.Types.ObjectId,
		query: ProjectComm.ImportByGitUrlQuery
	): Promise<Failable.Type<Project.Type>> {
		return this.create(
			ownerId,
			query.name,
			"Git",
			async (codesDir: string, artifactsDir: string) => {
				const git = simplegit(codesDir);
				await git.clone(query.gitUrl, codesDir);
				const branches = (await git.branch(["-r"])).all
					.filter(
						branch =>
							branch.startsWith("origin/") &&
							!branch.startsWith("origin/master")
					)
					.map(remote => {
						return {
							remote,
							local: remote.substr("origin/".length)
						};
					});
				branches.forEach(({ remote, local }) => {
					(async (): Promise<void> => {
						await git.raw(["branch", "--track", local, remote]);
					})();
				});

				await git.fetch(undefined, undefined, ["--all"]);
				await git.pull(undefined, undefined, ["--all"]);
			}
		);
	}

	public static async deleteProject(
		name: string
	): Promise<Failable.Type<string>> {
		const p = path.resolve(ConfigRepository.paths.projects, name);
		try {
			await promisify(rimraf)(p);
			return Failable.succeed(p);
		} catch (err) {
			if ("code" in err) {
				if (err.code === "ENOENT" || err.code === "ENOTDIR") {
					return Failable.fail(
						FailureCode.systemResolver.projectNotFound(name)
					);
				}
			}
			return Failable.fail(
				FailureCode.common.unknown("removal of project", {
					path: p,
					error: err
				})
			);
		}
	}
}

export default Type;
