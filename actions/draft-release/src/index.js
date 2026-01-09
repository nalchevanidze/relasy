const core = require("@actions/core");
const { releasy } = require("@releasy/core");

async function run() {
    try {
        const token = process.env.GITHUB_TOKEN || process.env.GITHUB_API_TOKEN;
        if (!token) throw new Error("Missing GITHUB_TOKEN (or GITHUB_API_TOKEN).");

        // Provide both env var names for compatibility
        process.env.GITHUB_TOKEN = process.env.GITHUB_TOKEN || token;
        process.env.GITHUB_API_TOKEN = process.env.GITHUB_API_TOKEN || token;

        // Ensure we run in the checked-out repo
        const cwd = process.env.GITHUB_WORKSPACE || process.cwd();
        process.chdir(cwd);

        await releasy.open();

        core.info("Draft release finished.");
    } catch (err) {
        core.setFailed(err?.message ?? String(err));
    }
}

run();
