import { user } from "src/constants/limitations";
import * as accountIdErrors from "src/error/user/AccountId";

class AccountId {
	readonly value: string;

	constructor(rawValue: string) {
		if (rawValue.length < user.accountId.minlength) {
			throw new accountIdErrors.TooShortAccountIdError(
				rawValue,
				user.accountId.minlength
			);
		}

		if (user.accountId.maxlength < rawValue.length) {
			throw new accountIdErrors.TooLongAccountIdError(
				rawValue,
				user.accountId.maxlength
			);
		}

		if (!user.accountId.validator.test(rawValue)) {
			throw new accountIdErrors.InvalidAccountIdError(rawValue);
		}
		this.value = rawValue;
	}
}

export default AccountId;
