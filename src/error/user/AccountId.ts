import InternalError from "src/error/InternalError";

import Boom = require("boom");

export const tooShortAccountIdError = (
	accountId: string,
	minlength: number,
	queryField?: string
): InternalError => {
	return new InternalError(
		Boom.badRequest(`Account ID must be at least ${minlength} characters.`),
		queryField
	);
};

export const tooLongAccountIdError = (
	accountId: string,
	maxlength: number,
	queryField?: string
): InternalError => {
	return new InternalError(
		Boom.badRequest(`Account ID must be ${maxlength} characters or less.`),
		queryField
	);
};

export const invalidAccountIdError = (
	accountId: string,
	queryField?: string
): InternalError => {
	return new InternalError(
		Boom.badRequest(`Account ID must begin with "`),
		queryField
	);
};

export const unavailableAccountIdError = (
	accountId: string,
	queryField?: string
): InternalError => {
	return new InternalError(
		Boom.conflict(`Account ID is not available.`),
		queryField
	);
};
