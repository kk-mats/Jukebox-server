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

	public static async login(
		accountId: string,
		cleartextPassword: string
	): Promise<User | null> {
		return UserRepository.authenticate(accountId, cleartextPassword);
	}
}

export default UserService;
