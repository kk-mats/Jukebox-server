import ErrorPayload from "src/error/ErrorPayload";

export type Type<T = unknown> =
	| {
			error: ErrorPayload;
	  }
	| {
			value: T;
			error?: undefined;
	  };

export const toError = <T = unknown>(error: ErrorPayload): Type<T> => {
	return {
		error
	};
};

export const toValue = <T = unknown>(value: T): Type<T> => {
	return {
		value
	};
};

export default Type;
