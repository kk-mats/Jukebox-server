import * as express from "express";

import initEnv from "src/application/init/env";
import initDb from "src/application/init/db";
import initSession from "src/application/init/server";

import UserEntity from "src/domain/object/entity/user/User";

declare global {
	namespace Express {
		// eslint-disable-next-line @typescript-eslint/no-empty-interface
		interface User extends UserEntity {}
	}
}

const init = (): express.Express => {
	initEnv();
	initDb();
	return initSession();
};

export default init;
