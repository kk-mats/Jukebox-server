import * as bcrypt from "bcrypt";

import { user } from "src/constants/limitations";
import * as passwordErrors from "src/error/user/Password";

class Password {
	readonly value: string;

	constructor(rawValue: string, encrypt = false) {
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
		this.value = encrypt ? bcrypt.hashSync(rawValue, 8) : rawValue;
	}

	public async compare(rawPassword: string): Promise<boolean> {
		return bcrypt.compare(rawPassword, this.value);
	}
}

export default Password;
