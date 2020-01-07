import * as bcrypt from "bcrypt";

import { user } from "src/constants/limitations";
import EncryptedPassword from "src/domain/object/value/user/EncryptedPassword";
import * as passwordErrors from "src/error/user/Password";

class CleartextPassword {
	readonly value: string;

	constructor(rawValue: string) {
		if (rawValue.length < user.password.minlength) {
			throw new passwordErrors.TooShortPasswordError(
				rawValue,
				user.accountId.minlength
			);
		}

		if (user.password.maxlength < rawValue.length) {
			throw new passwordErrors.TooLongPasswordError(
				rawValue,
				user.accountId.maxlength
			);
		}

		if (!user.password.validator.test(rawValue)) {
			throw new passwordErrors.InvalidPasswordError(rawValue);
		}
		this.value = rawValue;
	}

	public async encrypt(): Promise<EncryptedPassword> {
		return new EncryptedPassword(await bcrypt.hash(this.value, 8));
	}
}

export default CleartextPassword;
