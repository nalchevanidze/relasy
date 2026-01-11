import { Github } from "../gh";
import { ChangeType, Config } from "../config";
import { Module } from "../module/types";

export type Commit = {
  message: string;
  associatedPullRequests: {
    nodes: Array<{ number: number; repository: { nameWithOwner: string } }>;
  };
};

export type PR = {
  number: number;
  title: string;
  body: string;
  author: { login: string; url: string };
  labels: { nodes: { name: string }[] };
};

export type Change = PR & {
  type: ChangeType;
  scopes: string[];
};

export class Api {
  constructor(
    protected config: Config,
    public github: Github,
    public module: Module
  ) {}
}
