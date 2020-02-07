import * as bcrypt from "bcrypt";

import { user } from "src/constants/limitations";
import EncryptedPassword from "src/domain/object/value/user/EncryptedPassword";
import * as passwordErrors from "src/error/user/password";

class CleartextPassword {
	readonly value: string;

	constructor(rawValue: string, queryField?: string) {
		if (rawValue.length < user.password.minlength) {
			throw passwordErrors.tooShortPasswordError(
				user.accountId.minlength,
				queryField
			);
		}

		if (user.password.maxlength < rawValue.length) {
			throw passwordErrors.tooLongPasswordError(
				user.accountId.maxlength,
				queryField
			);
		}

		if (!user.password.validator.test(rawValue)) {
			throw passwordErrors.invalidPasswordError(queryField);
		}
		this.value = rawValue;
	}

	public async encrypt(): Promise<EncryptedPassword> {
		return new EncryptedPassword(await bcrypt.hash(this.value, 8));
	}
}

export default CleartextPassword;
