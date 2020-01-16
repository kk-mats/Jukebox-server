import { Boom } from "@hapi/boom";

export type InternalErrorPayload = {
	queryField?: string;
	message: string;
};

class InternalError {
	constructor(private boom: Boom, private queryField?: string) {}

	get status(): { code: number; message: string } {
		return {
			code: this.boom.output.statusCode,
			message: this.boom.output.payload.error
		};
	}

	get payload(): InternalErrorPayload {
		return {
			queryField: this.queryField,
			message: this.boom.message
		};
	}
}

export default InternalError;
