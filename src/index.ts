import * as express from "express";
import * as session from "express-session";
import * as cookieParser from "cookie-parser";
import * as passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";

import UserRepository from "src/repository/UserRepository";

import version from "src/routes/version";
import play from "src/routes/play";
import register from "src/routes/register";
import home from "src/routes/home";
import root from "src/routes/root";

const server = express();
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(cookieParser());
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
	new LocalStrategy(
		{ usernameField: "uid", passwordField: "password" },
		async (uid, password, done) => {
			try {
				const r = await UserRepository.authenticate(uid, password);
				if (r.failure) {
					return done(r.failure);
				}

				if (r.value === null) {
					return done(null, false);
				}

				return done(null, r.value.uid);
			} catch (err) {
				console.log(err);
				return done(err);
			}
		}
	)
);

passport.serializeUser((user, done) => {
	done(null, user);
});

passport.deserializeUser(
	async (id, done): Promise<void> => {
		try {
			const r = await UserRepository.findByUid(id as string);
			if (r.failure) {
				return done(r.failure, null);
			}
			return done(null, r.value);
		} catch (err) {
			console.log(err);
		}
	}
);

const loggined = <T extends express.Request>(
	req: T,
	res: express.Response,
	next: express.NextFunction
): void => {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect("/");
};

server.use("/version", version);
server.use("/play", play);
server.use("/register", register);
server.post(
	"/login",
	passport.authenticate("local", { failureRedirect: "/" }),
	(req, res) => {
		res.send({ redirect: `/${req.user}` });
	}
);
server.use("/", root);

server.use<{ uid: string }>(
	"/{uid}",
	loggined,
	(req, res, next): void => {
		if (req.user === req.params.uid) {
			return next();
		}
		res.sendStatus(403);
	},
	home
);

server.listen(3000, () => {
	console.log("server started");
});
