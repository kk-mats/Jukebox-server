import * as express from "express";
import * as session from "express-session";
import * as passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";

import UserRepository from "src/repository/UserRepository";

import version from "src/routes/version";
import play from "src/routes/play";
import register from "src/routes/register";

const server = express();
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(
	session({
		resave: false,
		secret: "jukebox todo",
		cookie: {
			secure: false,
			maxAge: 60 * 60 * 24
		}
	})
);
server.use(passport.initialize());
server.use(passport.session());

passport.use(
	new LocalStrategy(async (uid, password, done) => {
		try {
			const r = await UserRepository.authenticate(uid, password);
			if (r.failure) {
				return done(r.failure);
			}

			return done(null, r.value || false);
		} catch (err) {
			return done(err);
		}
	})
);

server.use("/version", version);
server.use("/play", play);
server.use("/register", register);

server.listen(3000, () => {
	console.log("server started");
});
