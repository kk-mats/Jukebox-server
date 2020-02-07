import init from "src/application/init";
import errorHandler from "src/application/middleware/errorHandler";

import register from "src/application/route/root/register";
import login from "src/application/route/root/login";

const server = init();

server.use("/register", register);
server.use("/login", login);

server.use(errorHandler);

server.listen(3000, () => {
	console.log("server started");
});
