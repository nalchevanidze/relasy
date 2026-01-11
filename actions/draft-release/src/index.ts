import { info, setFailed } from "@actions/core";
import { Relasy } from "@relasy/core";

async function run() {
  try {
    const easy = await Relasy.load();

    await easy.release();

    info("Draft release finished.");
  } catch (e: any) {
    setFailed(e?.message ?? String(e));
  }
}

if (require.main === module) {
  run();
}
