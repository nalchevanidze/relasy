import { FetchApi } from "./changelog/fetch";
import { RenderAPI } from "./changelog/render";
import { lastTag } from "./git";
import { Change, Api } from "./changelog/types";
import { propEq } from "ramda";
import { Github } from "./gh";
import { writeFile } from "fs/promises";
import { Config, loadConfig } from "./config";
import { NpmModule } from "./module/npm";
import { CustomModule } from "./module/custom";

const isBreaking = (changes: Change[]) =>
  Boolean(changes.find(propEq("type", "breaking")));

export class Relasy extends Api {
  private fetch: FetchApi;
  private render: RenderAPI;

  constructor(config: Config) {
    const github = new Github(config.gh, config.user);
    const module =
      config.manager.type === "npm"
        ? new NpmModule()
        : new CustomModule(config.manager);

    super(config, github, module);
    this.fetch = new FetchApi(config, github, module);
    this.render = new RenderAPI(config, github, module);
  }

  public static async load() {
    const token = process.env.GITHUB_TOKEN || process.env.GITHUB_API_TOKEN;
    if (!token) throw new Error("Missing GITHUB_TOKEN (or GITHUB_API_TOKEN).");

    // provide both names for compatibility
    process.env.GITHUB_TOKEN = process.env.GITHUB_TOKEN || token;
    process.env.GITHUB_API_TOKEN = process.env.GITHUB_API_TOKEN || token;

    // run in the checked-out repo
    const cwd = process.env.GITHUB_WORKSPACE || process.cwd();
    process.chdir(cwd);

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
