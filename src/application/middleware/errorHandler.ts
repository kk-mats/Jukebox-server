import * as express from "express";

import InternalError from "src/error/InternalError";
import Result from "src/domain/object/entity/Result";

import Boom = require("boom");

const toResult = (error: InternalError): Result => {
	const { status, payload } = error;
	return {
		error: {
			status,
			queryField: payload.queryField || "unknown field",
			message: payload.message
		}
	};
};

const errorHandler: express.ErrorRequestHandler = (err, req, res, next) => {
	if (res.headersSent) {
		return next(err);
	}

	console.dir({
		req,
		err
	});

	return res
		.status(err.status.code)
		.send(
			toResult(
				err instanceof InternalError
					? err
					: new InternalError(Boom.internal())
			)
		);
};

export default errorHandler;
