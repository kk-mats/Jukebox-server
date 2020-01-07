import { Model as UserModel } from "src/infrastructure/model/User";

import User from "src/domain/object/entity/user/User";
import RegisterUser from "src/domain/object/entity/user/RegisterUser";

class UserRepository {
	public static async create(registerUser: RegisterUser): Promise<User> {
		const user = await UserModel.create({
			accountId: registerUser.accountId.value,
			password: (await registerUser.password.encrypt()).value
		});
		return new User(user._id, user.accountId, user.password);
	}

	public static async findByAccountId(
		accountId: string
	): Promise<User | null> {
		const user = await UserModel.findOne({
			accountId
		}).exec();

		return user && new User(user._id, user.accountId, user.password);
	}

	public static async authenticate(
		accountId: string,
		cleartextPassword: string
	): Promise<User | null> {
		const user = await this.findByAccountId(accountId);
		return user && user.password.compare(cleartextPassword) ? user : null;
	}
}

export default UserRepository;
