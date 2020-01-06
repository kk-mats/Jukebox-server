import * as mongoose from "mongoose";

class UserId {
	constructor(readonly value: mongoose.Types.ObjectId) {}

	get toString(): string {
		return this.value.toHexString();
	}
}

export default UserId;
