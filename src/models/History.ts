import * as mongoose from "mongoose";

import Detector from "src/types/Detector";
import Status from "src/types/Status";

export type Type = mongoose.Document & {
	_id: mongoose.Types.ObjectId;
	created: Date;
	dispatched: Date;
	finished: Date;
	detector: Detector;
	query: {
		target: string;
		parameters: object;
	};
	status: Status;
};

export const Schema = new mongoose.Schema({
	created: {
		type: Date,
		required: true,
		default: new Date()
	},
	dispatched: {
		type: Date
	},
	finished: {
		type: Date
	},
	detector: {
		type: {
			name: String,
			slug: String,
			version: String
		},
		required: true
	},
	query: {
		type: {
			target: String,
			parameters: Object
		},
		required: true
	},
	status: {
		type: String,
		validate: /[Succeeded|Failed|Pending|Running]/,
		default: "Pending"
	}
});

export default Schema;
