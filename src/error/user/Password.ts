import ErrorBase from "src/error/ErrorBase";

export class TooShortPasswordError extends ErrorBase {
	constructor(readonly accountId: string, minlength: number) {
		super(
			"TooShortPasswordError",
			`Password must be at least ${minlength} characters.`
		);
	}
}

export class TooLongPasswordError extends ErrorBase {
	constructor(readonly accountId: string, maxlength: number) {
		super(
			"TooLongPasswordError",
			`Password must be ${maxlength} characters or less.`
		);
	}
}

export class InvalidPasswordError extends ErrorBase {
	constructor(readonly accountId: string) {
		super("InvalidPasswordError", `Password must begin with "`);
	}
}
