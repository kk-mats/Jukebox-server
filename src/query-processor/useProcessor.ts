import * as path from "path";
import axios from "axios";

import * as Failable from "src/types/failure/Failable";
import FailureCode from "src/types/failure/FailureCode";
import DetectionResponse from "src/types/response/DetectionResponse";
import DetectionQuery from "src/types/query/DetectionQuery";

import resolveSystem from "src/query-processor/resolvers/resolveSystem";
import ConfigRepository from "src/repository/ConfigRepository";
import ProjectRepository from "src/repository/ProjectRepository";

const useProcessor = (slug: string, version?: string) => {
	return async (rawQuery: any): Promise<Failable.Type<DetectionResponse>> => {
		const address = ConfigRepository.address(slug, version);
		if (address.failure) {
			return Failable.delegate(address);
		}

		if (typeof rawQuery !== "object" || !rawQuery) {
			return Failable.fail(
				FailureCode.property.invalidPropertyType(
					"detection query",
					typeof rawQuery,
					"object",
					rawQuery
				)
			);
		}

		// eslint-disable-next-line no-restricted-syntax
		for (const p of ["from", "parameters"]) {
			if (p in rawQuery) {
				if (typeof rawQuery[p] !== "object") {
					return Failable.fail(
						FailureCode.property.invalidPropertyType(
							p,
							typeof rawQuery[p],
							"object",
							JSON.stringify(rawQuery)
						)
					);
				}
			} else {
				return Failable.fail(
					FailureCode.property.missingProperty(
						p,
						JSON.stringify(rawQuery)
					)
				);
			}
		}

		const query = rawQuery as { from: object; parameters: object };

		const project = await resolveSystem(query.from);
		if (project.failure) {
			return Failable.delegate(project);
		}

		try {
			const res = await axios.post<Failable.Type<DetectionResponse>>(
				`http://${address.value}/run/${slug}/${version || ""}`,
				{
					target: {
						relative: path.relative(
							ConfigRepository.paths.projects,
							project.value.targetDir
						),
						absolute: project.value.targetDir
					},
					output: ConfigRepository.paths.outputs,
					parameters: query.parameters
				} as DetectionQuery
			);

			if (res.data.failure) {
				const r = await ProjectRepository.deleteProject(
					project.value.name
				);
				if (r.failure) {
					return r;
				}
			}

			return res.data;
		} catch (err) {
			const r = await ProjectRepository.deleteProject(project.value.name);
			if (
				"code" in err &&
				(err.code === "ECONNREFUSED" || err.code === "ECONNRESET")
			) {
				return Failable.fail(
					FailureCode.detector.serverUnavailable(
						address.value,
						slug,
						version
					)
				);
			}

			if (r.failure) {
				throw r.failure;
			}

			throw err;
		}
	};
};

export default useProcessor;
