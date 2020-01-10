import { user } from "src/constants/limitations";
import * as accountIdErrors from "src/error/user/accountId";

class AccountId {
	readonly value: string;

	constructor(rawValue: string, field?: string) {
		if (rawValue.length < user.accountId.minlength) {
			throw accountIdErrors.tooShortAccountIdError(
				rawValue,
				user.accountId.minlength,
				field
			);
		}

		if (user.accountId.maxlength < rawValue.length) {
			throw accountIdErrors.tooLongAccountIdError(
				rawValue,
				user.accountId.maxlength,
				field
			);
		}

		if (!user.accountId.validator.test(rawValue)) {
			throw accountIdErrors.invalidAccountIdError(rawValue, field);
		}
		this.value = rawValue;
	}
}

export default AccountId;
