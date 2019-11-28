import { promises as fs } from "fs";
import * as path from "path";

import * as express from "express";
import axios from "axios";

import ConfigRepository from "src/repository/ConfigRepository";
import FailureCode from "src/types/failure/FailureCode";
import DetectionQuery from "src/types/query/DetectionQuery";
import Target from "src/types/query/Target";
import * as User from "../../models/User";

import ProjectRepository from "../../repository/ProjectRepository";

import JobRepository from "../../repository/JobRepository";

import * as Failable from "../../types/failure/Failable";

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

			(async (): Promise<void> => {
				try {
					const relative: Target = req.body.target || {
						targetDir: "./"
					};

					const absolute = await ProjectRepository.resolveTarget(
						u._id,
						project,
						relative
					);

					if (absolute.failure) {
						res.status(400).send(absolute);
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
							target: relative.targetDir,
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
							target: {
								absolute: absolute.value.targetDir,
								relative: relative.targetDir
							},
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

router.get<{ project: string; hid: string }>("/histories/:hid", (req, res) => {
	if (req.user) {
		const u = req.user as User.Type;
		const { project, hid } = req.params;
		(async (): Promise<void> => {
			const p = await ProjectRepository.findHistory(u._id, project, hid);
			if (p.failure) {
				res.status(404).send(p);
				return;
			}
			res.send(Failable.succeed(p.value));
		})();
	}
});

router.get<{ project: string }>("/histories", (req, res) => {
	if (req.user) {
		const u = req.user as User.Type;
		const { project } = req.params;
		(async (): Promise<void> => {
			const p = await ProjectRepository.getHistories(u._id, project);
			if (p.failure) {
				res.status(404).send(p);
				return;
			}
			res.send(Failable.succeed(p.value));
		})();
	}
});

export default router;
