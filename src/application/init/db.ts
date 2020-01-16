import * as mongoose from "mongoose";

const init = (): void => {
	mongoose.set("debug", true);

	mongoose.connection.on("connected", () => {
		console.log("Mongoose default connection is open.");
	});

	mongoose.connection.on("error", err => {
		console.error(`Mongoose default connection has occurred ${err}.`);
	});

	mongoose.connection.on("disconnected", () => {
		console.log("Mongoose default connection is disconnected.");
	});

	mongoose.connect(process.env.USER_DB_URI as string, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useCreateIndex: true,
		useFindAndModify: false
	});
};

export default init;
