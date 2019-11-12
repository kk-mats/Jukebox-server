import * as express from "express";

const router = express.Router();

router.get<{ uid: string }>("/", (req, res) => {
	res.send({ uid: req.params.uid, message: "authed" });
});

export default router;
