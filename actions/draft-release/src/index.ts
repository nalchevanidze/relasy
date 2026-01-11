import { info, setFailed } from "@actions/core";
import { exit, Relasy } from "@relasy/core";

async function run() {
  try {
    const easy = await Relasy.load();

    const open = async (body: string) => {
      easy.github.setup();
      easy.github.release(await easy.module.version(), body);
    };

    await easy
      .changelog()
      .then((txt) => easy.module.setup().then(() => open(txt)))
      .catch(exit);

    info("Draft release finished.");
  } catch (e: any) {
    setFailed(e?.message ?? String(e));
  }
}

if (require.main === module) {
  run();
}
