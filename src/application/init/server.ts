import * as express from "express";
import * as session from "express-session";
import * as passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";

import { ACCOUNT_ID, PASSWORD } from "src/constants/fieldNames";
import { authenticationFailed } from "src/error/common";

import User from "src/domain/object/entity/user/User";
import AuthenticateUser from "src/domain/object/entity/user/AuthenticateUser";
import UserRepository from "src/infrastructure/repository/UserRepository";

import mongoDBStore = require("connect-mongodb-session");

const init = (): express.Express => {
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
				usernameField: ACCOUNT_ID,
				passwordField: PASSWORD,
				passReqToCallback: true
			},
			async (req, accountId, password, done) => {
				try {
					const user = await UserRepository.authenticate(
						new AuthenticateUser(accountId, password)
					);
					if (user) {
						return done(null, user);
					}
					throw authenticationFailed();
				} catch (err) {
					return done(err, false);
				}
			}
		)
	);

	passport.serializeUser<User, unknown>((user, done) => {
		if (user) {
			done(null, user.userId.value);
		}
	});

	passport.deserializeUser<User, string>(
		async (userId, done): Promise<void> => {
			const user = await UserRepository.findByUserId(userId);
			done(null, user || undefined);
		}
	);

	return server;
};

export default init;
