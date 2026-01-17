const INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+all\s+previous\s+instructions/i,
  /disregard\s+the\s+above/i,
  /you\s+are\s+chatgpt/i,
  /system\s+prompt/i,
  /developer\s+message/i,
  /override\s+the\s+rules/i,
  /do\s+not\s+follow\s+these\s+rules/i,
  /act\s+as\s+an?\s+agent/i,
  /exfiltrate/i,
  /confidential/i,
];

export interface PromptInjectionResult {
  score: number;
  matches: string[];
}

export function detectPromptInjection(text: string): PromptInjectionResult {
  const matches: string[] = [];
  let score = 0;

  for (const pattern of INJECTION_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      matches.push(match[0]);
      score += 1;
    }
  }

  if (/prompt|instruction/i.test(text)) {
    score += 0.5;
  }

  return { score, matches };
}

export function buildInjectionWarnings(result: PromptInjectionResult): string[] {
  if (result.score <= 0) {
    return [];
  }

  const warnings = [
    `Potential prompt-injection content detected (${result.score.toFixed(1)}).`,
  ];

  if (result.matches.length > 0) {
    warnings.push(`Matched phrases: ${result.matches.slice(0, 3).join(', ')}.`);
  }

  return warnings;
}
