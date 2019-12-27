import * as path from "path";
import * as mongoose from "mongoose";

import ConfigRepository from "./repository/ConfigRepository";

export const resolveProjectPath = (
	ownerId: mongoose.Types.ObjectId,
	projectId: mongoose.Types.ObjectId
): string => {
	return path.resolve(
		ConfigRepository.paths.projects,
		ownerId.toHexString(),
		projectId.toHexString()
	);
};

export const resolveChildrenPath = (
	ownerId: mongoose.Types.ObjectId,
	projectId: mongoose.Types.ObjectId
): { codes: string; histories: string } => {
	const base = resolveProjectPath(ownerId, projectId);
	return {
		codes: path.resolve(base, "codes"),
		histories: path.resolve(base, "histories")
	};
};

export const resolveHistoryPath = (
	ownerId: mongoose.Types.ObjectId,
	projectId: mongoose.Types.ObjectId,
	historyId: mongoose.Types.ObjectId
): string => {
	return path.resolve(
		ConfigRepository.paths.projects,
		ownerId.toHexString(),
		projectId.toHexString(),
		"histories",
		historyId.toHexString()
	);
};

export const resolveArtifactsPath = (
	ownerId: mongoose.Types.ObjectId,
	projectId: mongoose.Types.ObjectId,
	historyId: mongoose.Types.ObjectId
): string => {
	return path.resolve(
		ConfigRepository.paths.projects,
		ownerId.toHexString(),
		projectId.toHexString(),
		"histories",
		historyId.toHexString(),
		"artifacts"
	);
};
