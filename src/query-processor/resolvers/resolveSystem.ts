import FailureCode from "src/types/failure/FailureCode";
import * as Failable from "src/types/failure/Failable";
import GitUrl from "src/types/query/GitUrl";
import LocalSystem from "src/types/query/LocalSystem";

import localSystem from "src/query-processor/resolvers/localSystem";
import gitUrl from "src/query-processor/resolvers/gitUrl";

const resolveSystem = async (
	from: any
): Promise<Failable.Type<{ name: string; targetDir: string }>> => {
	if ("url" in from) {
		return gitUrl(from as GitUrl);
	}

	if ("name" in from) {
		return localSystem(from as LocalSystem);
	}

	return Failable.fail(
		FailureCode.property.missingProperty(
			"url or name",
			JSON.stringify(from)
		)
	);
};

export default resolveSystem;
