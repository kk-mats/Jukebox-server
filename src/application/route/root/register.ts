import * as express from "express";

import * as Result from "src/domain/object/entity/Result";
import UserService from "src/domain/service/UserService";

import notLoggedIn from "src/application/middleware/notLoggedIn";

const router = express.Router();

type Response = {
	accountId: string;
};

const toResponse = (accountId: string): Result.Type<Response> => {
	return Result.toValue({ accountId });
};

router.post("/", notLoggedIn, async (req, res, next) => {
	// ToDo: add check for duplicate users.
	try {
		const user = await UserService.register(
			req.body.accountId,
			req.body.password
		);
		res.send(toResponse(user.accountId.value));
	} catch (err) {
		next(err);
	}
});

export default router;
