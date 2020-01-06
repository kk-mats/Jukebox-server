import ErrorBase from "src/error/ErrorBase";

export class TooShortAccountIdError extends ErrorBase {
	constructor(readonly accountId: string, minlength: number) {
		super(
			"TooShortAccountIdError",
			`Account ID must be at least ${minlength} characters.`
		);
	}
}

export class TooLongAccountIdError extends ErrorBase {
	constructor(readonly accountId: string, maxlength: number) {
		super(
			"TooLongAccountIdError",
			`Account ID must be ${maxlength} characters or less.`
		);
	}
}

export class InvalidAccountIdError extends ErrorBase {
	constructor(readonly accountId: string) {
		super("InvalidAccountIdError", `Account ID must begin with "`);
	}
}

export class UnavailableAccountIdError extends ErrorBase {
	constructor(readonly accountId: string) {
		super("UnavaialbleAccountIdError", `Accound ID is not available.`);
	}
}
