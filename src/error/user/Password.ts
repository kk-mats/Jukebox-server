import InternalError from "src/error/InternalError";

import Boom = require("boom");

export const tooShortPasswordError = (
	minlength: number,
	queryField?: string
): InternalError => {
	return new InternalError(
		Boom.badRequest(`Password must be at least ${minlength} characters.`),
		queryField
	);
};

export const tooLongPasswordError = (
	maxlength: number,
	queryField?: string
): InternalError => {
	return new InternalError(
		Boom.badRequest(`Password must be ${maxlength} characters or less.`),
		queryField
	);
};

export const invalidPasswordError = (queryField?: string): InternalError => {
	return new InternalError(
		Boom.badRequest("InvalidPasswordError", `Password must begin with "`),
		queryField
	);
};
