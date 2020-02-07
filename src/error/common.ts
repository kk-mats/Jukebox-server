import * as Boom from "@hapi/boom";

import InternalError from "src/error/InternalError";

export const missingParameter = (parameterName: string): InternalError => {
	return new InternalError(
		Boom.badRequest(
			`Required parameter "${parameterName}" is missing in the request.`
		),
		parameterName
	);
};

export const authenticationFailed = (): InternalError => {
	return new InternalError(
		Boom.unauthorized(`Incorrect account ID or password.`)
	);
};
