import * as mongoose from "mongoose";
import axios from "axios";

import * as Job from "./models/Job";
import ConfigRepository from "./repository/ConfigRepository";
import JobRepository from "./repository/JobRepository";
import ProjectRepository from "./repository/ProjectRepository";

import Failable from "./types/failure/Failable";

mongoose.set("debug", true);

const dispatchJob = async (
	address: string,
	slug: string,
	versions: string[]
): Promise<void> => {
	const job = await JobRepository.first(slug, versions);

	if (job.failure) {
		return;
	}

	try {
		await ProjectRepository.dispatch(
			job.value.ownerId,
			job.value.projectSlug,
			job.value.hid
		);

		if (job.value.query.target.revision) {
			await ProjectRepository.checkout(
				job.value.ownerId,
				job.value.projectSlug,
				job.value.query.target.revision
			);
		}

		const { data } = await axios.post<Failable<any>>(
			`http://${address}/run/${job.value.detector.slug}/${job.value.detector.version}`,
			job.value.query
		);

		if (job.value.query.target.revision) {
			await ProjectRepository.checkout(
				job.value.ownerId,
				job.value.projectSlug,
				"master"
			);
		}
		console.dir(data);

		if (data.failure) {
			await ProjectRepository.failed(
				job.value.ownerId,
				job.value.projectSlug,
				job.value.hid
			);
		} else {
			await ProjectRepository.succeeded(
				job.value.ownerId,
				job.value.projectSlug,
				job.value.hid
			);
		}
		await JobRepository.remove(job.value._id);
	} catch (err) {
		const d = await JobRepository.remove(job.value._id);
		console.dir(err);
		if (!d.failure) {
			await ProjectRepository.failed(
				d.value.ownerId,
				d.value.projectSlug,
				d.value.hid
			);
		}
	}
};

const runScheduler = async (): Promise<void> => {
	const delay = 5 * 1000;
	await Promise.all(
		ConfigRepository.servers().map(async value => {
			setTimeout(async function f() {
				await dispatchJob(value.address, value.slug, value.versions);
				setTimeout(f, delay);
			}, delay);
		})
	);
};

const init = () => {
	mongoose.connection.on("connected", () => {
		console.log("Mongoose default connection is open");
	});

	mongoose.connection.on("error", err => {
		console.error(`Mongoose default connection has occured ${err}`);
	});

	mongoose.connection.on("disconnected", () => {
		console.log("Mongoose default connection is disconnected");
	});

	const c = mongoose.connect(process.env.USER_DB_URI as string, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useCreateIndex: true,
		useFindAndModify: false
	});

	runScheduler().then(() => {
		console.log("scheduler started");
	});

	return c;
};

export default init;
