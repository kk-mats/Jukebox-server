import * as express from "express";
import InternalError from "src/error/InternalError";
import * as Result from "src/domain/object/entity/Result";

import Boom = require("@hapi/boom");

const toResult = (error: InternalError): Result.Type => {
	const { status, payload } = error;
	return {
		error: {
			status,
			queryField: payload.queryField,
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
