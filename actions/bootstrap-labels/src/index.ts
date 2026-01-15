import { setFailed } from "@actions/core";
import { context, getOctokit } from "@actions/github";
import { Relasy, Label, createLabel } from "@relasy/core";

const { owner, repo } = context.repo;

async function run() {
  try {
    const relasy = await Relasy.load();
    const octokit = getOctokit(process.env.GITHUB_TOKEN || "");

    const labels = (
      await octokit.paginate(octokit.rest.issues.listLabelsForRepo, {
        owner,
        repo,
        per_page: 100,
      })
    )
      .map((l) => relasy.parseLabel(l.name))
      .filter((l) => l !== undefined);

    const map = new Map<string, Label>();
    labels.forEach((l) => map.set(l.name, l));

    const changeTypes = Object.entries(relasy.config.changeTypes).map(
      ([name, longName]) => createLabel("changeTypes", name, longName)
    );
    const scopes = Object.entries(relasy.config.scopes).map(
      ([name, longName]) => createLabel("scopes", name, longName)
    );

    Promise.all(
      [...changeTypes, ...scopes].map(async (label) => {
        const existing = map.get(label.name);

        if (existing?.existing) {
          return octokit.rest.issues.updateLabel({
            owner,
            repo,
            name: existing.existing,
            color: label.color,
            description: label.description,
            new_name: label.name, // keep same, but explicit
          });
        }

        await octokit.rest.issues.createLabel({
          owner,
          repo,
          name: label.name,
          color: label.color,
          description: label.description,
        });
      })
    );
  } catch (error) {
    if (error instanceof Error) {
      setFailed(error.message);
    } else {
      setFailed(String(error));
    }
  }
}

if (require.main === module) {
  run();
}
