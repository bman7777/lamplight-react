export type Token =
  | { type: "fragment"; id: string; text: string }
  | { type: "text"; text: string };

const TAG = /<([GH]\d+)>([\s\S]+?)<\/\1>/g;

export function parseVerse(text: string): Token[] {
  const tokens: Token[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = TAG.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: "text", text: text.slice(lastIndex, match.index) });
    }
    tokens.push({ type: "fragment", id: match[1], text: match[2] });
    lastIndex = TAG.lastIndex;
  }

  if (lastIndex < text.length) {
    tokens.push({ type: "text", text: text.slice(lastIndex) });
  }

  return tokens;
}
