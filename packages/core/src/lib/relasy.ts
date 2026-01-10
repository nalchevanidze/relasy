import { FetchApi } from "./changelog/fetch";
import { RenderAPI } from "./changelog/render";
import { lastTag } from "./git";
import { Change, Api } from "./changelog/types";
import { propEq } from "ramda";
import { Github } from "./gh";
import { writeFile } from "fs/promises";
import { execVoid, exec, exit } from "./utils";
import { Config, loadConfig } from "./config";

const isBreaking = (changes: Change[]) =>
  Boolean(changes.find(propEq("type", "breaking")));

export class Relasy extends Api {
  private fetch: FetchApi;
  private render: RenderAPI;

  constructor(config: Config) {
    const github = new Github(config.gh, config.user);
    super(config, github);
    this.fetch = new FetchApi(config, github);
    this.render = new RenderAPI(config, github);
  }

  public static async load() {
    return new Relasy(await loadConfig());
  }

  public version = () => exec(this.config.version);

  private initialVersion = () => {
    const version = lastTag();
    const projectVersion = this.version();

    if (version.replace(/^v/, "") !== projectVersion.replace(/^v/, "")) {
      throw Error(`versions does not match: ${version} ${projectVersion}`);
    }

    return version;
  };

  private next = async (isBreaking: boolean) => {
    const { next } = this.config;
    return execVoid(isBreaking ? `${next} -b` : next);
  };

  private open = async (body: string) => {
    this.github.setup();
    this.github.release(await this.version(), body);
  };

  private genChangelog = async (save?: string) => {
    const version = this.initialVersion();
    const changes = await this.fetch.changes(version);
    await this.next(isBreaking(changes));
    const txt = await this.render.changes(this.version(), changes);

    if (save) {
      await writeFile(`./${save}.md`, txt, "utf8");
    }

    return txt;
  };

  public changelog = async (save?: string) =>
    this.genChangelog(save).catch(exit);

  public release = () =>
    this.genChangelog()
      .then((txt) => execVoid(this.config.setup).then(() => this.open(txt)))
      .catch(exit);
}
