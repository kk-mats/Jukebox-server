type Target<T = string> = {
	directory: T;
	revision?: string;
};

export type RawTarget =
	| {
			directory?: string;
			branch: string;
			commitId: undefined;
	  }
	| {
			directory?: string;
			branch: undefined;
			commitId: string;
	  }
	| undefined;

export type ValidatedTarget = Target<{ relative: string; absolute: string }>;
export type TargetForHistory = Target;
