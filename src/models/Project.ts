import * as mongoose from "mongoose";

import * as User from "./User";
import * as History from "./History";
import VCS from "../types/VCS";

export type Type = mongoose.Document & {
	_id: mongoose.Types.ObjectId;
	ownerId: string;
	name: string;
	slug: string;
	vcs: VCS;
	histories: History.Type[];
};

const Schema = new mongoose.Schema({
	ownerId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: User.ModelName,
		required: true
	},
	name: {
		type: String,
		required: true,
		unique: true
	},
	slug: {
		type: String,
		required: true,
		unique: true
	},
	vcs: {
		type: String,
		required: true,
		validate: /[(Git)|(Unversioned)]/
	},
	histories: {
		type: [History.Schema],
		required: true
	}
});

export const ModelName = "Project";
export const Model = mongoose.model<Type>(ModelName, Schema, "projects");

export default Model;
