import { consola } from "consola";

export async function askQuestion(
  query: string,
  defaultValue = "",
): Promise<string> {
  const res = await consola.prompt(query, {
    type: "text",
    default: defaultValue,
  });
  if (typeof res === "symbol" || res === undefined) {
    return defaultValue;
  }
  return String(res).trim() || defaultValue;
}

export async function selectOption(
  query: string,
  options: { label: string; value: string }[],
  defaultIndex = 0,
): Promise<string> {
  const choices = options.map((opt) => ({
    label: opt.label,
    value: opt.value,
  }));
  const res = await consola.prompt(query, {
    type: "select",
    options: choices,
    initial: options[defaultIndex]?.value,
  });
  if (typeof res === "symbol" || res === undefined) {
    return options[defaultIndex].value;
  }
  return String(res);
}

export async function confirmAction(
  query: string,
  defaultValue = true,
): Promise<boolean> {
  const res = await consola.prompt(query, {
    type: "confirm",
    initial: defaultValue,
  });
  if (typeof res === "boolean") {
    return res;
  }
  return defaultValue;
}
