import * as express from "express";

import * as User from "../models/User";
import { Type as ProjectRepository } from "../repository/ProjectRepository";

import * as Failable from "../types/failure/Failable";

import project from "./project/index";

const router = express.Router();

router.get("/", (req, res) => {
	if (req.user) {
		const u = req.user as User.Type;
		(async (): Promise<void> => {
			const p = await ProjectRepository.findByOwnerId(u._id);

			if (p.failure) {
				res.sendStatus(500);
				return;
			}
			const r = p.value.map(value => {
				return {
					name: value.name,
					slug: value.slug,
					vcs: value.vcs
				};
			});
			res.send(Failable.succeed(r));
		})();
		return;
	}
	res.end();
});

router.use<{ project: string }>("/:project", project);

export default router;
