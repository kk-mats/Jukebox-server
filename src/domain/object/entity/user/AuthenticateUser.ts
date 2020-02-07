import { missingParameter } from "src/error/common";

class AuthenticateUser {
	readonly accountId: string;

	readonly cleartextPassword: string;

	constructor(rawAccountId?: string, cleartextPassword?: string) {
		if (!rawAccountId) {
			throw missingParameter("accountId");
		}

		if (!cleartextPassword) {
			throw missingParameter("password");
		}

		this.accountId = rawAccountId;
		this.cleartextPassword = cleartextPassword;
	}
}

export default AuthenticateUser;
