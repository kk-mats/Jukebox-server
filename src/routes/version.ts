import * as express from "express";

import * as Failable from "../types/failure/Failable";

const router = express.Router();

router.get("/", (req, res) => {
	res.json(Failable.succeed("1.0"));
});

export default router;
