import * as bcrypt from "bcrypt";

class EncryptedPassword {
	constructor(readonly value: string) {}

	public async compare(cleartextPassword: string): Promise<boolean> {
		return bcrypt.compare(cleartextPassword, this.value);
	}
}

export default EncryptedPassword;
