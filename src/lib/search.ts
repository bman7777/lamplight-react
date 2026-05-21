export type SearchCriterion =
  | { type: "text"; value: string }
  | { type: "english"; value: string }
  | { type: "hebrew"; value: string; concordance_id: string }
  | { type: "greek"; value: string; concordance_id: string }
  | { type: "author"; value: string }
  | { type: "speaker"; value: string }
  | { type: "book"; value: string }
  | { type: "testament"; value: "old" | "new" };

export type SearchVerse = {
  book: string;
  chapter: number;
  verse: number;
  text: string;
};

export type SearchResponse = {
  total: number;
  verses: SearchVerse[];
};

export function criterionKey(c: SearchCriterion): string {
  if (c.type === "hebrew" || c.type === "greek") {
    return `${c.type}:${c.concordance_id}`;
  }
  return `${c.type}:${c.value.toLowerCase()}`;
}

export function criterionLabel(c: SearchCriterion): string {
  return c.type.toUpperCase();
}

export async function searchVerses(
  criteria: SearchCriterion[],
  opts: { page: number; limit: number },
  signal?: AbortSignal,
): Promise<SearchResponse> {
  const qs = new URLSearchParams({
    page: String(opts.page),
    limit: String(opts.limit),
  });
  const res = await fetch(`/ll/search/?${qs}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ criteria }),
    signal,
  });
  if (!res.ok) {
    throw new Error(`Search failed: ${res.status}`);
  }
  return (await res.json()) as SearchResponse;
}

export function totalPages(total: number, limit: number): number {
  return Math.max(1, Math.ceil(total / limit));
}
