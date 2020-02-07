import * as express from "express";

const loggedIn = <T extends express.Request>(
	req: T,
	res: express.Response,
	next: express.NextFunction
): void => {
	if (req.isAuthenticated()) {
		next();
		return;
	}
	res.sendStatus(401);
};

export default loggedIn;
