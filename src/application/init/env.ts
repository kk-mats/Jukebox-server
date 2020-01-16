import * as express from "express";
import errorHandler from "src/application/middleware/errorHandler";

const init = (): void => {
	process.on("unhandledRejection", (reason, promise) => {
		console.dir(reason);
		console.dir(promise);
	});

	const server = express();
	server.use(errorHandler);
};

export default init;
