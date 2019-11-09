import Target from "src/types/query/Target";

type GitUrl = Target & {
	url: string;
	branch?: string;
};

export default GitUrl;
