import * as express from "express";

import useProcessor from "src/query-processor/useProcessor";

const router = express.Router();

router.post<{ detector: string; version: string }>(
	"/:detector/:version?",
	(req, res) => {
		const { detector, version } = req.params;
		(async (): Promise<void> => {
			const processor = useProcessor(detector, version);
			try {
				const j = await processor(req.body);
				res.send(j);
			} catch (err) {
				console.log(err);
			}
		})();
	}
);

export default router;
