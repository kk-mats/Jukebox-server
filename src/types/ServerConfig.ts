export type Paths = {
	projects: string;
	outputs: string;
};

export type Server = {
	versions: string[];
	address: string;
};

export type Plugin = {
	name: string;
	servers: Server[];
};

export type Type = {
	paths: Paths;
	plugins: {
		[P in string]: Plugin;
	};
};

export default Type;
