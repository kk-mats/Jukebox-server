import * as express from "express";
import * as passport from "passport";

import { authenticationFailed } from "src/error/common";

import * as Result from "src/domain/object/entity/Result";

import notLoggedIn from "src/application/middleware/notLoggedIn";

const router = express.Router();

type Response = {
	accountId: string;
};

const toResponse = (accountId: string): Result.Type<Response> => {
	return Result.toValue({ accountId });
};

router.post(
	"/",
	notLoggedIn,
	passport.authenticate("local"),
	(req, res, next) => {
		try {
			if (!req.user) {
				next(authenticationFailed());
				return;
			}
			res.send(toResponse(req.user.accountId.value));
		} catch (err) {
			next(err);
		}
	}
);

export default router;
