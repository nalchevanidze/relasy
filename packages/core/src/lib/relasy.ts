import { FetchApi } from "./changelog/fetch";
import { RenderAPI } from "./changelog/render";
import { lastTag } from "./git";
import { Api, isBreaking } from "./changelog/types";
import { Github } from "./gh";
import { writeFile } from "fs/promises";
import { Config, loadConfig } from "./config";
import { setupEnv } from "./utils";
import { setupModule } from "./module";

export class Relasy extends Api {
  private fetch: FetchApi;
  private render: RenderAPI;

  constructor(config: Config) {
    const github = new Github(config.gh, config.user);
    const module = setupModule(config.manager);
    super(config, github, module);
    this.fetch = new FetchApi(config, github, module);
    this.render = new RenderAPI(config, github, module);
  }

  public static async load() {
    setupEnv();
    return new Relasy(await loadConfig());
  }

  public version = () => this.module.version();

  private initialVersion = () => {
    const version = lastTag();
    const projectVersion = this.module.version();

    if (version.replace(/^v/, "") !== projectVersion.replace(/^v/, "")) {
      throw Error(`versions does not match: ${version} ${projectVersion}`);
    }

    return version;
  };

  public changelog = async (save?: string) => {
    const version = this.initialVersion();
    const changes = await this.fetch.changes(version);
    await this.module.next(isBreaking(changes));
    const txt = await this.render.changes(this.module.version(), changes);

    if (save) {
      await writeFile(`./${save}.md`, txt, "utf8");
    }

    return txt;
  };
}
