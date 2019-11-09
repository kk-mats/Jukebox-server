import Failure from "src/types/failure/Failure";

const FailureCode = {
	property: {
		missingProperty: (name: string, source: unknown): Failure => {
			return {
				code: "MISSING_PROPERTY",
				message: `missing property: ${name}:\n${JSON.stringify(source)}`
			};
		},

		invalidPropertyType: (
			name: string,
			given: string,
			expected: string,
			source: unknown
		): Failure => {
			return {
				code: "INVALID_PROPERTY_TYPE",
				message: `invalid property: given type of ${name} is ${given}, expected is ${expected}:\n${JSON.stringify(
					source
				)}`
			};
		}
	},
	serverConfig: {
		serverNotFound: (slug: string, version?: string): Failure => {
			return {
				code: "SERVER_NOT_FOUND",
				message: `server ${slug} ${
					version ? `ver: ${version} ` : ""
				}not found on jukebox-server-config.yaml`
			};
		}
	},
	systemResolver: {
		projectAlreadyExists: (name: string): Failure => {
			return {
				code: "PROJECT_ALREADY_EXISTS",
				message: `project ${name} already exits`
			};
		},
		projectNotFound: (name: string): Failure => {
			return {
				code: "PROJECY_NOT_FOUND",
				message: `project ${name} not found`
			};
		}
	},
	detector: {
		serverUnavailable: (
			address: string,
			name: string,
			version?: string
		): Failure => {
			return {
				code: "SERVER_UNAVAILABLE",
				message: `detector server of ${name}${
					version ? `ver. ${version}` : ""
				} (${address}) is unavailable`
			};
		}
	},
	common: {
		unknown: (source: string, body: unknown): Failure => {
			return {
				code: "UNKNOWN_ERROR",
				message: `unknown error happened at ${source}:\n${JSON.stringify(
					body
				)}`
			};
		}
	}
};

export default FailureCode;
