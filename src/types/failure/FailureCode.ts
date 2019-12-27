import Failure from "src/types/failure/Failure";
import { RawTarget } from "../query/Target";

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
		serverUnavailable: (name: string, version?: string): Failure => {
			return {
				code: "SERVER_UNAVAILABLE",
				message: `${name} Server ${
					version ? `ver. ${version}` : ""
				} is unavailable`
			};
		}
	},
	user: {
		uidNotFound: (uid: string): Failure => {
			return {
				code: "USER_NOT_FOUND",
				message: `user of uid: ${uid} is not found`
			};
		},
		idNotFound: (id: string): Failure => {
			return {
				code: "USER_NOT_FOUND",
				message: `user of id: ${id} is not found`
			};
		}
	},
	project: {
		slugNotFound: (slug: string): Failure => {
			return {
				code: "PROJECT_NOT_FOUND",
				message: `project of slug: ${slug} is not found`
			};
		},
		slugAlreadyExists: (slug: string): Failure => {
			return {
				code: "PROJECT_ALREADY_EXISTS",
				message: `project of slug: ${slug} already exists`
			};
		},
		historyNotFound: (slug: string, hid: string): Failure => {
			return {
				code: "HISTORY_NOT_FOUND",
				message: `history ${hid} is not found at project ${slug}`
			};
		},
		unversioned: (slug: string): Failure => {
			return {
				code: "PROJECT_UNVERSIONED",
				message: `project ${slug} is unversioned`
			};
		},
		commitIdNotFound: (commitId: string): Failure => {
			return {
				code: "COMMIT_ID_NOT_FOUND",
				message: `commit ID ${commitId} is not found`
			};
		},
		jobUnavailable: (slug: string, versions: string[]): Failure => {
			return {
				code: "JOB_UNAVAILABLE",
				message: `job unavailable for ${slug} ver.${versions.toString()}`
			};
		},
		jobNotFound: (hid: string): Failure => {
			return {
				code: "JOB_NOT_FOUND",
				message: `job of history ${hid} is not found`
			};
		},
		invalidDirectory: (slug: string, directory?: string): Failure => {
			return {
				code: "INVALID_DIRECTORY",
				message: `target ${directory ||
					"./"} on project ${slug} is not a file or a directory`
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
