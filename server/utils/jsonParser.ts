import { logger } from './logger';

/**
 * Robust JSON extraction and repair utility for AI provider outputs
 */
export function extractAndParseJson<T = any>(rawContent: string): { data: T; repaired: boolean } {
  if (!rawContent || typeof rawContent !== 'string') {
    throw new Error('Empty or non-string content provided to JSON parser');
  }

  let text = rawContent.trim();

  // 1. Strip reasoning blocks (e.g. DeepSeek R1 <think>...</think>)
  if (text.includes('</think>')) {
    text = text.split('</think>')[1].trim();
  }

  // 2. Direct clean parse attempt
  try {
    const direct = JSON.parse(text);
    return { data: direct as T, repaired: false };
  } catch {
    // Continue to repair pipeline
  }

  // 3. Remove markdown fences
  if (text.includes('```')) {
    // Match content between ```json and ``` or ``` and ```
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (codeBlockMatch && codeBlockMatch[1]) {
      const extracted = codeBlockMatch[1].trim();
      try {
        return { data: JSON.parse(extracted) as T, repaired: true };
      } catch {
        text = extracted;
      }
    } else {
      text = text.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
    }
  }

  // 4. Find outermost bounds for Object `{}` or Array `[]`
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  const firstBracket = text.indexOf('[');
  const lastBracket = text.lastIndexOf(']');

  let candidate = '';
  if (firstBrace !== -1 && lastBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    candidate = text.substring(firstBrace, lastBrace + 1);
  } else if (firstBracket !== -1 && lastBracket !== -1) {
    candidate = text.substring(firstBracket, lastBracket + 1);
  } else if (firstBrace !== -1) {
    // Truncated object without closing brace
    candidate = text.substring(firstBrace) + '}';
  } else if (firstBracket !== -1) {
    // Truncated array without closing bracket
    candidate = text.substring(firstBracket) + ']';
  } else {
    candidate = text;
  }

  // 5. Try candidate directly
  try {
    return { data: JSON.parse(candidate) as T, repaired: true };
  } catch {
    // Continue to advanced string repairs
  }

  // 6. Apply progressive regex repairs
  let repairedStr = candidate;

  // 6a. Remove trailing commas before closing braces/brackets
  repairedStr = repairedStr.replace(/,\s*([}\]])/g, '$1');

  try {
    return { data: JSON.parse(repairedStr) as T, repaired: true };
  } catch {
    // Continue
  }

  // 6b. Fix unquoted keys: { key: "value" } -> { "key": "value" }
  repairedStr = repairedStr.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');

  // 6c. Fix single quoted property values: "key": 'value' -> "key": "value"
  repairedStr = repairedStr.replace(/:\s*'([^']*)'/g, ':"$1"');

  // 6d. Remove accidental JavaScript comments
  repairedStr = repairedStr.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');

  // 6e. Strip non-printable control characters except standard whitespace
  repairedStr = repairedStr.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, '');

  try {
    return { data: JSON.parse(repairedStr) as T, repaired: true };
  } catch {
    // Try balanced closure if truncated
    const openBraces = (repairedStr.match(/\{/g) || []).length;
    const closeBraces = (repairedStr.match(/\}/g) || []).length;
    if (openBraces > closeBraces) {
      const balanced = repairedStr + '}'.repeat(openBraces - closeBraces);
      try {
        return { data: JSON.parse(balanced) as T, repaired: true };
      } catch {}
    }

    const openBrackets = (repairedStr.match(/\[/g) || []).length;
    const closeBrackets = (repairedStr.match(/\]/g) || []).length;
    if (openBrackets > closeBrackets) {
      const balanced = repairedStr + ']'.repeat(openBrackets - closeBrackets);
      try {
        return { data: JSON.parse(balanced) as T, repaired: true };
      } catch {}
    }
  }

  // 7. Fallback: Loose key-value regex recovery for common dictionary outputs
  if (candidate.includes(':')) {
    const recoveredObj: Record<string, any> = {};
    const kvRegex = /"([^"]+)"\s*:\s*("(?:[^"\\]|\\.)*"|true|false|null|\d+(?:\.\d+)?|\[[^\]]*\])/g;
    let match;
    let found = 0;
    while ((match = kvRegex.exec(candidate)) !== null) {
      try {
        const key = match[1];
        const rawVal = match[2];
        recoveredObj[key] = JSON.parse(rawVal);
        found++;
      } catch {
        // Skip unparseable token
      }
    }
    if (found > 0) {
      logger.info(`Recovered ${found} JSON fields via regex parser.`);
      return { data: recoveredObj as T, repaired: true };
    }
  }

  throw new Error(`Unable to extract valid JSON payload from model response (length: ${rawContent.length})`);
}
