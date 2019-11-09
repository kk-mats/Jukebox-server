import Failure from "src/types/failure/Failure";

export type Type<T> = { failure: Failure } | { failure?: undefined; value: T };

export const delegate = <R>(failable: { failure: Failure }): Type<R> => {
	return { failure: failable.failure };
};

export const succeed = <T>(value: T): Type<T> => {
	return { value };
};

export const fail = <T>(failure: Failure): Type<T> => {
	return { failure };
};

export default Type;
