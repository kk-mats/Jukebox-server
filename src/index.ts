import * as express from "express";
import * as session from "express-session";
import * as passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";

import init from "src/init";
import UserRepository from "src/repository/UserRepository";

import * as User from "src/models/User";

import version from "src/routes/version";
import register from "src/routes/register";
import projects from "src/routes/projects";
import New from "src/routes/new";
import * as Failable from "./types/failure/Failable";

import mongoDBStore = require("connect-mongodb-session");

init();

process.on("unhandledRejection", (reason, promise) => {
	console.dir(reason);
	console.dir(promise);
});

const Store = new (mongoDBStore(session))({
	uri: process.env.SESSION_DB_URI as string,
	collection: "sessions"
});
const server = express();
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(
	session({
		resave: false,
		saveUninitialized: true,
		secret: process.env.SESSION_SECRET as string,
		cookie: {
			maxAge: 1000 * 60 * 60 * 24
		},
		store: Store
	})
);

server.use(passport.initialize());
server.use(passport.session());
passport.use(
	new LocalStrategy(
		{
			usernameField: "uid",
			passwordField: "password",
			passReqToCallback: true
		},
		async (req, uid, password, done) => {
			try {
				const r = await UserRepository.authenticate(uid, password);
				if (r.failure) {
					return done(r.failure);
				}

				if (r.value === null) {
					return done(null, false);
				}

				return done(null, r.value);
			} catch (err) {
				console.log(err);
				return done(err);
			}
		}
	)
);

passport.serializeUser<User.Type, unknown>((user, done) => {
	done(null, user._id);
});

passport.deserializeUser<User.Type, string>(
	async (id, done): Promise<void> => {
		try {
			const r = await UserRepository.findById(id as string);
			if (r.failure) {
				return done(r.failure);
			}
			return done(null, r.value);
		} catch (err) {
			console.log(err);
			return done(err);
		}
	}
);

const loggedin = <T extends express.Request>(
	req: T,
	res: express.Response,
	next: express.NextFunction
): void => {
	if (req.isAuthenticated()) {
		next();
		return;
	}
	res.sendStatus(401);
};

const notLoggedin = <T extends express.Request>(
	req: T,
	res: express.Response,
	next: express.NextFunction
): void => {
	if (req.isUnauthenticated()) {
		next();
		return;
	}
	const u = req.user as User.Type;
	res.send(Failable.succeed(u.uid));
};

server.use("/version", version);
server.use("/register", register);
server.use(
	"/login",
	notLoggedin,
	passport.authenticate("local"),
	express.Router().post("/", (req, res) => {
		const u = req.user as User.Type;
		res.send(Failable.succeed(u.uid));
	})
);
server.use(
	"/loginAs",
	express.Router().get("/", (req, res) => {
		if (req.isUnauthenticated()) {
			res.send(Failable.succeed(undefined));
			return;
		}

		const u = req.user as User.Type;
		res.send(Failable.succeed(u.uid));
	})
);
server.use(
	"/logout",
	express.Router().get("/", (req, res) => {
		req.logout();
		res.send({});
	})
);
server.use("/projects", loggedin, projects);
server.use("/new", loggedin, New);

server.listen(3000, () => {
	console.log("server started");
});
