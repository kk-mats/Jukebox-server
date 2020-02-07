const init = (): void => {
	process.on("unhandledRejection", (reason, promise) => {
		console.dir(reason);
		console.dir(promise);
	});
};

export default init;
