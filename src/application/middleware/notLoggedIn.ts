import * as express from "express";

const notLoggedIn = <T extends express.Request>(
	req: T,
	res: express.Response,
	next: express.NextFunction
): void => {
	if (req.isUnauthenticated() || !req.user) {
		next();
		return;
	}
	res.send();
};

export default notLoggedIn;
