import * as express from "express";
import * as session from "express-session";
import * as passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";

import User from "src/domain/object/entity/user/User";
import UserRepository from "src/infrastructure/repository/UserRepository";

import mongoDBStore = require("connect-mongodb-session");

const init = (): void => {
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
				usernameField: "accountId",
				passwordField: "password",
				passReqToCallback: true
			},
			async (req, accountId, password, done) => {
				const user = await UserRepository.authenticate(
					accountId,
					password
				);

				if (user) {
					return done(null, user);
				}
				return done(null, false);
			}
		)
	);

	passport.serializeUser<User, unknown>((user, done) => {
		done(null, user.userId);
	});

	passport.deserializeUser<User, string>(
		async (userId, done): Promise<void> => {
			const user = await UserRepository.findByAccountId(userId);
			if (user) {
				return done(null, user);
			}
			return done(null);
		}
	);
};

export default init;
