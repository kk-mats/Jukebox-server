import * as rimraf from "rimraf";
import * as path from "path";
import { promisify } from "util";

import * as Failable from "src/types/failure/Failable";
import FailureCode from "src/types/failure/FailureCode";

import ConfigRepository from "src/repository/ConfigRepository";

class Type {
	readonly project = ConfigRepository.paths.projects;

	public async deleteProject(name: string): Promise<Failable.Type<string>> {
		const p = path.resolve(this.project, name);
		try {
			await promisify(rimraf)(p);
			return Failable.succeed(p);
		} catch (err) {
			if ("code" in err) {
				if (err.code === "ENOENT" || err.code === "ENOTDIR") {
					return Failable.fail(
						FailureCode.systemResolver.projectNotFound(name)
					);
				}
			}
			return Failable.fail(
				FailureCode.common.unknown("removal of project", {
					path: p,
					error: err
				})
			);
		}
	}
}

const ProjectRepository = new Type();
export default ProjectRepository;
