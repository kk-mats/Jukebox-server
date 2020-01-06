import AccountId from "src/domain/object/value/user/AccountId";
import Password from "src/domain/object/value/user/Password";

class RegisterUser {
	readonly accountId: AccountId;

	readonly password: Password;

	constructor(rawAccountId: string, rawPassword: string) {
		this.accountId = new AccountId(rawAccountId);
		this.password = new Password(rawPassword, true);
	}
}

export default RegisterUser;
