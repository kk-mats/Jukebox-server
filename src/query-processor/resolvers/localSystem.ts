import { promises as fs } from "fs";
import * as path from "path";

import FailureCode from "src/types/failure/FailureCode";
import * as Failable from "src/types/failure/Failable";
import LocalSystem from "src/types/query/LocalSystem";

import ConfigRepository from "src/repository/ConfigRepository";

const localSystem = async (
	query: LocalSystem
): Promise<Failable.Type<{ name: string; targetDir: string }>> => {
	const { name, targetDir } = query;
	const target = path.resolve(
		ConfigRepository.paths.projects,
		name,
		targetDir || ""
	);

	const stat = await fs.stat(target);
	if (!stat.isDirectory || !stat.isFile) {
		return Failable.fail(
			FailureCode.systemResolver.projectNotFound(target)
		);
	}

	return Failable.succeed({
		name,
		targetDir: target
	});
};

export default localSystem;
