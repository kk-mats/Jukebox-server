import { promises as fs, createWriteStream } from "fs";
import * as path from "path";

import * as express from "express";
import axios from "axios";
import * as mongoose from "mongoose";
import * as archiver from "archiver";

import * as Failable from "src/types/failure/Failable";
import FailureCode from "src/types/failure/FailureCode";
import { RawDetectionQuery } from "src/types/query/DetectionQuery";
import * as User from "src/models/User";

import ConfigRepository from "src/repository/ConfigRepository";
import ProjectRepository from "src/repository/ProjectRepository";
import JobRepository from "src/repository/JobRepository";

import * as pathUtils from "src/util";

const router = express.Router({ mergeParams: true });

router.get<{ project: string }>("/", (req, res) => {
	if (req.user) {
		const u = req.user as User.Type;
		const { project } = req.params;
		(async (): Promise<void> => {
			const p = await ProjectRepository.findBySlug(u._id, project);
			if (p.failure) {
				res.status(404).send(p);
				return;
			}
			res.send(
				Failable.succeed({
					name: p.value.name,
					vcs: p.value.vcs,
					histories: p.value.histories
				})
			);
		})();
	}
});

router.delete<{ project: string }>("/", (req, res) => {
	if (req.user) {
		const u = req.user as User.Type;
		const { project } = req.params;
		(async (): Promise<void> => {
			const p = await ProjectRepository.delete(u._id, project);
			if (p) {
				res.send(p);
				return;
			}
			res.status(400).send(p);
		})();
	}
});

router.get<{ project: string }>("/branches", (req, res) => {
	if (req.user) {
		const u = req.user as User.Type;
		const { project } = req.params;
		(async (): Promise<void> => {
			const p = await ProjectRepository.getBranches(u._id, project);
			if (p.failure) {
				res.status(404).send(p);
				return;
			}
			res.send(Failable.succeed(p.value));
		})();
	}
});

router.post<{ project: string; detector: string; version: string }>(
	"/play/:detector/:version?",
	(req, res) => {
		if (req.user) {
			const u = req.user as User.Type;
			const { project, detector, version } = req.params;
			const q = req.body as RawDetectionQuery;

			(async (): Promise<void> => {
				try {
					const validatedTarget = await ProjectRepository.validateTarget(
						u._id,
						project,
						q.target
					);

					if (validatedTarget.failure) {
						res.status(400).send(validatedTarget);
						return;
					}

					const d = ConfigRepository.server(detector, version);
					if (d.failure) {
						res.status(400).send(d);
						return;
					}

					const { data } = await axios.post<Failable.Type<boolean>>(
						`http://${
							d.value.address
						}/validate/${detector}/${version || ""}`,
						req.body.parameters
					);

					if (data.failure) {
						res.status(400).send(data.failure);
						return;
					}

					const history = await ProjectRepository.createHistory(
						u._id,
						project,
						{
							name: d.value.name,
							slug: detector,
							version: d.value.version
						},
						{
							target: validatedTarget.value,
							parameters: req.body.parameters
						}
					);

					if (history.failure) {
						res.status(500).send(history);
						return;
					}

					await JobRepository.push(
						u._id,
						project,
						history.value.hid,
						{
							slug: detector,
							version: d.value.version
						},
						{
							target: validatedTarget.value,
							output: history.value.historyDir,
							parameters: req.body.parameters
						}
					);
					res.send(Failable.succeed(history.value.hid));
				} catch (err) {
					if (err.code && err.code === "ECONNREFUSED") {
						res.status(503).send(
							Failable.fail(
								FailureCode.detector.serverUnavailable(
									detector,
									version
								)
							)
						);
						return;
					}
					res.sendStatus(500);
					throw err;
				}
			})();
		}
	}
);

router.get<{ project: string; hid: string }>(
	"/histories/:hid/artifacts",
	(req, res) => {
		if (req.user) {
			const u = req.user as User.Type;
			const { project, hid } = req.params;
			(async (): Promise<void> => {
				const r = await ProjectRepository.findHistory(
					u._id,
					project,
					hid
				);
				if (r.failure) {
					res.status(404).send(r);
					return;
				}

				const artifactsPath = pathUtils.resolveArtifactsPath(
					u._id,
					r.value.project._id,
					r.value.history._id
				);

				const archivePath = path.resolve(
					path.resolve(
						artifactsPath,
						"../",
						`${project}-${hid}-artifacts.zip`
					)
				);
				const archive = archiver("zip", { zlib: { level: 9 } });
				archive.pipe(createWriteStream(archivePath));
				archive.directory(artifactsPath, false);
				await archive.finalize();
				res.sendFile(archivePath);
			})();
		}
	}
);
router.get<{ project: string; hid: string }>("/histories/:hid", (req, res) => {
	if (req.user) {
		const u = req.user as User.Type;
		const { project, hid } = req.params;
		(async (): Promise<void> => {
			const r = await ProjectRepository.findHistory(u._id, project, hid);
			if (r.failure) {
				res.status(404).send(r);
				return;
			}

			const artifacts = (await fs.readdir(
				path.resolve(
					ConfigRepository.paths.projects,
					u._id.toHexString(),
					r.value.project._id.toHexString(),
					"histories",
					r.value.history._id.toHexString(),
					"artifacts"
				),
				{
					withFileTypes: true
				}
			))
				.filter(entry => entry.isFile())
				.map(entry => entry.name);

			res.send(
				Failable.succeed({
					_id: mongoose.Types.ObjectId(
						r.value.history._id
					).toHexString(),
					created: r.value.history.created,
					dispatched: r.value.history.dispatched,
					finished: r.value.history.finished,
					detector: r.value.history.detector,
					query: r.value.history.query,
					status: r.value.history.status,
					artifacts
				})
			);
		})();
	}
});

router.get<{ project: string }>("/histories", (req, res) => {
	if (req.user) {
		const u = req.user as User.Type;
		const { project } = req.params;
		(async (): Promise<void> => {
			const histories = await ProjectRepository.getHistories(
				u._id,
				project
			);
			if (histories.failure) {
				res.status(404).send(histories);
				return;
			}
			res.send(
				Failable.succeed(
					histories.value.map(history => {
						return {
							_id: mongoose.Types.ObjectId(
								history._id
							).toHexString(),
							created: history.created,
							dispatched: history.dispatched,
							finished: history.finished,
							detector: history.detector,
							query: history.query,
							status: history.status
						};
					})
				)
			);
		})();
	}
});

export default router;
