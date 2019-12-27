import * as express from "express";

import * as User from "../models/User";
import * as ProjectComm from "../types/comm/Project";
import * as Failable from "../types/failure/Failable";

import ProjectRepository from "../repository/ProjectRepository";

const router = express.Router();

router.post("/git", (req, res) => {
	if (req.user) {
		const u = req.user as User.Type;
		const body = req.body as ProjectComm.ImportByGitUrlQuery;
		(async (): Promise<void> => {
			const p = await ProjectRepository.createByGitUrl(u._id, body);
			if (p.failure) {
				res.status(400).send(p);
				return;
			}
			res.send(Failable.succeed({
				slug: p.value.slug
			}) as ProjectComm.CreateResponse);
		})();
		return;
	}
	res.sendStatus(500);
});

export default router;
