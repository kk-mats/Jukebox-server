import ErrorPayload from "src/error/ErrorPayload";

type Result<T = unknown> =
	| {
			error: ErrorPayload;
	  }
	| {
			value: T;
			error?: undefined;
	  };

export default Result;
