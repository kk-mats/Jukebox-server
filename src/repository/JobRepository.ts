import * as mongoose from "mongoose";

import * as Job from "src/models/Job";
import * as Failable from "src/types/failure/Failable";
import FailureCode from "src/types/failure/FailureCode";

import { ValidatedDetectionQuery } from "src/types/query/DetectionQuery";

class Type {
	public static async push(
		ownerId: mongoose.Types.ObjectId,
		projectSlug: string,
		hid: mongoose.Types.ObjectId,
		detector: { slug: string; version: string },
		query: ValidatedDetectionQuery
	): Promise<Job.Type> {
		return Job.Model.create({
			ownerId,
			projectSlug,
			hid,
			scheduled: new Date(),
			detector,
			query
		});
	}

	public static async first(
		slug: string,
		versions: string[]
	): Promise<Failable.Type<Job.Type>> {
		const j = await Job.Model.findOne(
			{
				"detector.slug": slug,
				"detector.version": { $in: versions }
			},
			null,
			{
				sort: { scheduled: 1 }
			}
		).exec();

		if (j) {
			return Failable.succeed(j);
		}
		return Failable.fail(
			FailureCode.project.jobUnavailable(slug, versions)
		);
	}

	public static async remove(
		jid: mongoose.Types.ObjectId
	): Promise<Failable.Type<Job.Type>> {
		const j = await Job.Model.findByIdAndRemove(jid);
		if (j) {
			return Failable.succeed(j);
		}
		return Failable.fail(
			FailureCode.project.jobNotFound(jid.toHexString())
		);
	}

	public static async finished(
		hid: mongoose.Types.ObjectId
	): Promise<Failable.Type<Job.Type>> {
		const j = await Job.Model.findByIdAndUpdate(
			{ hid },
			{ dispatched: new Date() }
		);

		if (j) {
			return Failable.succeed(j);
		}
		return Failable.fail(
			FailureCode.project.jobNotFound(hid.toHexString())
		);
	}
}

export default Type;
