import * as express from "express";

import errorHandler from "src/application/middleware/errorHandler";

const server = express();

server.use(errorHandler);
