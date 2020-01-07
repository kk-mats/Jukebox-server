import User from "src/domain/object/entity/user/User";
import RegisterUser from "src/domain/object/entity/user/RegisterUser";

import UserRepository from "src/infrastructure/repository/UserRepository";

class UserService {
	public static async register(
		accountId: string,
		password: string
	): Promise<User> {
		return UserRepository.create(new RegisterUser(accountId, password));
	}
}

export default UserService;
