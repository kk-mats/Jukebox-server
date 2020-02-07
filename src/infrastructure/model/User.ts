import * as mongoose from "mongoose";
import { user } from "src/constants/limitations";

export type DocumentType = mongoose.Document & {
	_id: mongoose.Types.ObjectId;
	accountId: string;
	password: string;
};

const Schema = new mongoose.Schema({
	accountId: {
		type: String,
		unique: String,
		required: true,
		...user.accountId
	},
	password: {
		type: String,
		required: true,
		...user.password
	}
});

export const ModelName = "User";
export const Model = mongoose.model<DocumentType>(ModelName, Schema);

export default Model;
