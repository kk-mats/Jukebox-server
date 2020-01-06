class ErrorBase implements Error {
	constructor(readonly name: string, readonly message: string) {}
}

export default ErrorBase;
