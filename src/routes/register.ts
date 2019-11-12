import * as express from "express";

import UserRepository from "src/repository/UserRepository";

const router = express.Router();

router.post("/", (req, res) => {
	const { body } = req;

	if (!body.uid || typeof body.uid !== "string") {
		res.send("uid");
		return;
	}

	if (!body.password || typeof body.password !== "string") {
		res.send("password");
		return;
	}

	(async (): Promise<void> => {
		const r = await UserRepository.create(body.uid, body.password);
		res.send(r.failure || r.value);
	})();
});

export default router;
