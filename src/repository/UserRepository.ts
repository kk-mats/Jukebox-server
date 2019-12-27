import * as bcrypt from "bcrypt";

import * as Failable from "src/types/failure/Failable";
import FailureCode from "src/types/failure/FailureCode";

import * as User from "src/models/User";

class Type {
	private static async encrypto(password: string): Promise<string> {
		return bcrypt.hash(password, 8);
	}

	private static unknonFailure<R>(fun: string, err: any): Failable.Type<R> {
		return Failable.fail(FailureCode.common.unknown(`${fun} at DB`, err));
	}

	public static async register(
		uid: string,
		password: string
	): Promise<Failable.Type<{ uid: string }>> {
		const u = new User.Model({
			uid,
			password: await this.encrypto(password)
		});
		return Failable.succeed({ uid: (await u.save()).uid });
	}

	public static async findById(
		id: string
	): Promise<Failable.Type<User.Type>> {
		const r = await User.Model.findById(id);
		if (r) {
			return Failable.succeed(r);
		}
		return Failable.fail(FailureCode.user.idNotFound(id));
	}

	public static async findByUid(
		uid: string
	): Promise<Failable.Type<User.Type>> {
		const r = await User.Model.findOne({ uid }).exec();
		if (r) {
			return Failable.succeed(r);
		}
		return Failable.fail(FailureCode.user.uidNotFound(uid));
	}

	public static async isAvailable(
		uid: string
	): Promise<Failable.Type<User.Type>> {
		const r = await this.findByUid(uid);
		if (r.failure) {
			return Failable.delegate(r);
		}
		return r;
	}

	public static async authenticate(
		uid: string,
		password: string
	): Promise<Failable.Type<User.Type | null>> {
		const u = await this.findByUid(uid);
		if (!u.failure) {
			return Failable.succeed(
				(await bcrypt.compare(password, u.value.password))
					? u.value
					: null
			);
		}
		return Failable.delegate(u);
	}
}

export default Type;
