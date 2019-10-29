import * as express from "express";

const router = express.Router();

router.get("/", (req, res) => {
	res.json({ version: "1.0" });
});

export default router;
