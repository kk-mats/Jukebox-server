type DetectionQuery = {
	target: {
		absolute: string;
		relative: string;
	};
	output: string;
	parameters: object;
};

export default DetectionQuery;
