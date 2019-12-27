import * as express from "express";
import * as passport from "passport";

const router = express.Router();

router.post(
	"/",
	passport.authenticate("local", { failureRedirect: "/" }),
	(req, res) => {
		const name = req.user;
		res.json({ redirect: `${name}` });
	}
);

export default router;
