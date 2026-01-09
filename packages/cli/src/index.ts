#!/usr/bin/env node
import { Command } from "commander";
import { Relasy , exit } from "@relasy/core";

export const main = async () => {
  const easy = await Relasy.load();

  const cli = new Command()
    .name("Relasy")
    .description("Generate Automated Releases")
    .version("0.1.1");

  cli
    .command("changelog")
    .action(() => easy.changelog("changelog").then(() => undefined));

  cli.parse();
};

main().catch(exit);
