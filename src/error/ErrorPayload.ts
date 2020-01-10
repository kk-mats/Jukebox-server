import { InternalErrorPayload } from "src/error/InternalError";

type ErrorPayload = Readonly<
	{
		status: Readonly<{
			code: number;
			message: string;
		}>;
	} & Required<InternalErrorPayload>
>;

export default ErrorPayload;
