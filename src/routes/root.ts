import * as express from "express";

const router = express.Router();

router.get("/", (req, res) => {
	res.send("root");
});

export default router;
