import { Manager } from "../config";
import { CustomModule } from "./custom";
import { NpmModule } from "./npm";
import { Module } from "./types";

export const setupModule = (manager: Manager): Module =>
  manager.type === "npm" ? new NpmModule() : new CustomModule(manager);
