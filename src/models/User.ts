import * as mongoose from "mongoose";

import { user } from "../constants/limitations";

export type Type = mongoose.Document & {
	_id: mongoose.Types.ObjectId;
	uid: string;
	password: string;
};

const Schema = new mongoose.Schema({
	uid: {
		type: String,
		unique: String,
		required: true,
		...user.uid
	},
	password: {
		type: String,
		requried: true,
		...user.password
	}
});

export const ModelName = "User";
export const Model = mongoose.model<Type>(ModelName, Schema);

export default Model;
