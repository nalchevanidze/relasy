import { Config, LabelType } from "./config";

type Label = {
  name: string;
  color: string; // hex without #
  description?: string;
  existingName?: string;
};

const COLORS: Record<string, string> = {
  major: "B60205", // red (GitHub danger)
  breaking: "B60205", // red (same as major)
  feature: "0E8A16", // green
  fix: "1D76DB", // blue
  minor: "D4DADF", // light gray
  chore: "D4DADF", // light gray
  pkg: "c2e0c6", // teal (package scope / grouping)
};

export const createLabel = (
  type: string,
  existing: Map<string, { name: string }>,
  name: string,
  longName: string
): Label => ({
  name: `${type}/${name}`,
  color: COLORS[name] || COLORS.pkg,
  description:
    type === "type"
      ? `Relasy type label for versioning & changelog: ${longName}`
      : `Relasy scope label for grouping changes: "${longName}"`,
  existingName: existing.has(`${type}/${name}`)
    ? existing.get(`${type}/${name}`)?.name
    : undefined,
});

const prefixMap = {
  changeTypes: "type",
  scopes: "scope",
};

export const parseLabel = <T extends LabelType>(
  config: Config,
  t: T,
  label: string
): keyof Config[T] | undefined => {
  const values: Record<string, unknown> = config[t];
  const [prefix, key, ...rest] = label.split("/");

  if (rest.length) {
    throw new Error(
      `invalid label ${label}. only one '/' is allowed in labels for ${t}`
    );
  }

  if (key === undefined) {
    if (values[prefix] && t === "changeTypes") return prefix as keyof Config[T];

    return undefined;
  }

  if (prefix !== prefixMap[t]) return undefined;

  if (values[key]) return key as keyof Config[T];

  const fields = Object.keys(values).join(", ");

  throw new Error(
    `invalid label ${label}. key ${key} could not be found on object with fields: ${fields}`
  );
};

export const parseLabels = <T extends LabelType>(
  config: Config,
  t: T,
  labels: string[]
): Array<keyof Config[T]> =>
  labels
    .map((label) => parseLabel(config, t, label))
    .filter((x) => x !== undefined) as Array<keyof Config[T]>;
