import { missingParameter } from "src/error/common";

import AccountId from "src/domain/object/value/user/AccountId";
import CleartextPassword from "src/domain/object/value/user/CleartextPassword";

import { ACCOUNT_ID, PASSWORD } from "src/constants/fieldNames";

class RegisterUser {
	readonly accountId: AccountId;

	readonly password: CleartextPassword;

	constructor(rawAccountId?: string, cleartextPassword?: string) {
		if (!rawAccountId) {
			throw missingParameter(ACCOUNT_ID);
		}

		if (!cleartextPassword) {
			throw missingParameter(PASSWORD);
		}

		this.accountId = new AccountId(rawAccountId, ACCOUNT_ID);
		this.password = new CleartextPassword(cleartextPassword, PASSWORD);
	}
}

export default RegisterUser;
