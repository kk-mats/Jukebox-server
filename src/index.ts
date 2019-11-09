import * as express from "express";

import version from "src/routes/version";
import play from "src/routes/play";

const server = express();
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

server.use("/version", version);
server.use("/play", play);

server.listen(3000, () => {
	console.log("server started");
});
