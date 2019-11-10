type DetectionQuery = {
	target: {
		relative: string;
		absolute: string;
	};
	output: string;
	parameters: any;
};

export default DetectionQuery;
