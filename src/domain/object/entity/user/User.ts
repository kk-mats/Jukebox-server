import * as mongoose from "mongoose";

import AccountId from "src/domain/object/value/user/AccountId";
import UserId from "src/domain/object/value/user/UserId";
import Password from "src/domain/object/value/user/Password";

class User {
	readonly userId: UserId;

	readonly accountId: AccountId;

	readonly password: Password;

	constructor(
		rawUserId: mongoose.Types.ObjectId,
		rawAccountId: string,
		rawCryptedPassword: string
	) {
		this.userId = new UserId(rawUserId);
		this.accountId = new AccountId(rawAccountId);
		this.password = new Password(rawCryptedPassword);
	}
}

export default User;
