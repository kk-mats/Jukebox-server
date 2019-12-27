import { RawTarget, ValidatedTarget } from "./Target";

type DetectionQuery<Target> = {
	target: Target;
	parameters: object;
};

export type RawDetectionQuery = DetectionQuery<RawTarget>;
export type ValidatedDetectionQuery = DetectionQuery<ValidatedTarget> & {
	output: string;
};
