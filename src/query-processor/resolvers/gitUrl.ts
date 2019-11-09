import * as path from "path";
import { promises as fs } from "fs";
import * as simplegit from "simple-git/promise";

import GitUrl from "src/types/query/GitUrl";
import * as Failable from "src/types/failure/Failable";
import FailureCode from "src/types/failure/FailureCode";

import ConfigRepository from "src/repository/ConfigRepository";
import ProjectRepository from "src/repository/ProjectRepository";

import localSystem from "src/query-processor/resolvers/localSystem";

Object.entries(ConfigRepository.paths).forEach(entry => {
	const p = path.resolve("./", entry[1]);
	(async (): Promise<void> => {
		await fs.mkdir(p, { recursive: true });
		console.log(`make directory for paths.${entry[0]}: ${p}`);
	})();
});

const git = simplegit(ConfigRepository.paths.projects);

const errorHandler = <T>(err: Error): Failable.Type<T> => {
	const match = /^fatal: destination path '(\w+)' already exists and is not an empty directory\.\n$/.exec(
		err.message
	);

	if (match) {
		return Failable.fail(
			FailureCode.systemResolver.projectAlreadyExists(match[1])
		);
	}

	return Failable.fail(FailureCode.common.unknown("Git", err));
};

const importByGitUrl = async (
	query: GitUrl
): Promise<Failable.Type<{ name: string; targetDir: string }>> => {
	const { url, branch, targetDir } = query;
	try {
		await git.clone(url, branch ? { "-d": branch } : {});
		const match = /((git|ssh|https?)|(git@[\w.]+)):(\/\/)?[\w.@:/\-~]+\/([\w\-_]+)\.git\/?/.exec(
			url
		);

		if (!match) {
			throw Error(`Cannot extract name from url: ${url}`);
		}

		const name = match[match.length - 1];
		const target = await localSystem({ name, targetDir });

		if (target.failure) {
			const r = await ProjectRepository.deleteProject(name);
			return r.failure ? r : target;
		}

		return Failable.succeed({
			name,
			targetDir: path.resolve(
				ConfigRepository.paths.projects,
				match[match.length - 1]
			)
		});
	} catch (err) {
		if ("message" in err) {
			return errorHandler(err);
		}

		return Failable.fail(FailureCode.common.unknown("Git", err));
	}
};

export default importByGitUrl;
