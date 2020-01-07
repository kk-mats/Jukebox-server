import AccountId from "src/domain/object/value/user/AccountId";
import CleartextPassword from "src/domain/object/value/user/CleartextPassword";

class RegisterUser {
	readonly accountId: AccountId;

	readonly password: CleartextPassword;

	constructor(rawAccountId: string, cleartextPassword: string) {
		this.accountId = new AccountId(rawAccountId);
		this.password = new CleartextPassword(cleartextPassword);
	}
}

export default RegisterUser;
