import * as mongoose from "mongoose";

import AccountId from "src/domain/object/value/user/AccountId";
import UserId from "src/domain/object/value/user/UserId";
import EncryptedPassword from "src/domain/object/value/user/EncryptedPassword";

class User {
	readonly userId: UserId;

	readonly accountId: AccountId;

	readonly password: EncryptedPassword;

	constructor(
		rawUserId: mongoose.Types.ObjectId,
		rawAccountId: string,
		rawEncryptedPassword: string
	) {
		this.userId = new UserId(rawUserId);
		this.accountId = new AccountId(rawAccountId);
		this.password = new EncryptedPassword(rawEncryptedPassword);
	}
}

export default User;
