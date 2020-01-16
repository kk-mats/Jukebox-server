import * as express from "express";
import * as session from "express-session";
import * as passport from "passport";

import initEnv from "src/application/init/env";
import initDb from "src/application/init/db";
import initSession from "src/application/init/session";

import UserEntity from "src/domain/object/entity/user/User";

declare global {
	namespace Express {
		// eslint-disable-next-line @typescript-eslint/no-empty-interface
		interface User extends UserEntity {}
	}
}

const init = (): void => {
	initEnv();
	initDb();
	initSession();
};

export default init;
