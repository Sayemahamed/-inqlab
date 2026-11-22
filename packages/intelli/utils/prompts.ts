import { createInterface } from "node:readline";

export async function askQuestion(
  query: string,
  defaultValue = "",
): Promise<string> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    const prompt = defaultValue ? `${query} [${defaultValue}]: ` : `${query}: `;
    rl.question(prompt, (answer) => {
      rl.close();
      const trimmed = answer.trim();
      resolve(trimmed || defaultValue);
    });
  });
}

export async function selectOption(
  query: string,
  options: { label: string; value: string }[],
  defaultIndex = 0,
): Promise<string> {
  console.log(`\n${query}`);
  options.forEach((opt, idx) => {
    const isDefault = idx === defaultIndex ? " (default)" : "";
    console.log(`  ${idx + 1}. ${opt.label}${isDefault}`);
  });

  const answer = await askQuestion("Select number", String(defaultIndex + 1));
  const num = parseInt(answer, 10);
  if (!isNaN(num) && num >= 1 && num <= options.length) {
    return options[num - 1].value;
  }
  return options[defaultIndex].value;
}
