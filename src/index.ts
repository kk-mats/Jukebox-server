import * as express from "express";

import version from "src/routes/version";

const server = express();
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

server.use("/version", version);

server.listen(3000, () => {
	console.log("server started");
});
