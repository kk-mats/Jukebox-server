import { Model as UserModel } from "src/infrastructure/model/User";

import User from "src/domain/object/entity/user/User";
import RegisterUser from "src/domain/object/entity/user/RegisterUser";

class UserRepository {
	public static async create(registerUser: RegisterUser): Promise<User> {
		const user = await UserModel.create(registerUser);
		return new User(user._id, user.accountId, user.password);
	}
}

export default UserRepository;
