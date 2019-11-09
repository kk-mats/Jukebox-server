import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";

import * as ServerConfig from "src/types/ServerConfig";
import * as Failable from "src/types/failure/Failable";
import FailureCode from "src/types/failure/FailureCode";

class Type {
	private readonly path: string;

	private readonly config: ServerConfig.Type;

	public constructor() {
		const index = process.argv.findIndex(value => value === "-c");
		if (index !== -1 && index + 1 in process.argv) {
			this.path = path.resolve("./", process.argv[index + 1]);
		} else {
			this.path = path.resolve("./", "jukebox-server-config.yaml");
		}
		const raw = yaml.safeLoad(fs.readFileSync(this.path, "utf8"));
		this.config = {
			...raw,
			paths: {
				projects: path.resolve("./", raw.paths.projects),
				outputs: path.resolve("./", raw.paths.outputs)
			}
		};
		console.log(`read config: ${this.path}`);
	}

	public get paths(): ServerConfig.Paths {
		return this.config.paths;
	}

	public plugin(slug: string): Failable.Type<ServerConfig.Plugin> {
		if (slug in this.config.plugins) {
			return Failable.succeed(this.config.plugins[slug]);
		}
		return Failable.fail(FailureCode.serverConfig.serverNotFound(slug));
	}

	public servers(slug: string): Failable.Type<ServerConfig.Server[]> {
		const plugin = this.plugin(slug);
		if (plugin.failure) {
			return Failable.delegate(plugin);
		}

		return Failable.succeed(plugin.value.servers);
	}

	public address(slug: string, version?: string): Failable.Type<string> {
		const plugin = this.config.plugins[slug];
		if (plugin.servers.length > 0) {
			if (!version) {
				return Failable.succeed(plugin.servers[0].address);
			}

			const server = plugin.servers.find(value => {
				return value.versions.includes(version);
			});
			if (server) {
				return Failable.succeed(server.address);
			}
		}

		return Failable.fail(
			FailureCode.serverConfig.serverNotFound(slug, version)
		);
	}
}

const ConfigRepository = new Type();

export default ConfigRepository;
