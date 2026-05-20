export type ConcordanceEntry = {
  description: string;
  original: string;
  translation: string;
  alternates: string[];
};

type ConcordanceResponse = {
  concord_id: string;
  original_word: string;
  transliteration: string;
  part_of_speech: string;
  english_translations: { translation: string; count: number }[];
  outline_definitions: string[];
  strongs_definition: string[];
};

const MAX_DESCRIPTION = 100;
const MAX_TRANSLATION = 16;
const cache = new Map<string, Promise<ConcordanceEntry>>();

function truncate(text: string, limit: number): string {
  if (text.length <= limit) return text;
  const sliced = text.slice(0, limit);
  const lastSpace = sliced.lastIndexOf(" ");
  const base = lastSpace > limit * 0.6 ? sliced.slice(0, lastSpace) : sliced;
  return base.replace(/[\s,;:.\-—]+$/, "") + "...";
}

export function fetchConcordance(strongsId: string): Promise<ConcordanceEntry> {
  const cached = cache.get(strongsId);
  if (cached) return cached;

  const promise = (async () => {
    const res = await fetch(`/ll/concordance/${strongsId}/`);
    if (!res.ok) {
      throw new Error(`Concordance fetch failed: ${res.status}`);
    }
    const data = (await res.json()) as ConcordanceResponse;
    const alternates = data.english_translations
      .slice(1, 3)
      .filter((t) => t.count > 1)
      .map((t) => truncate(t.translation, MAX_TRANSLATION));
    const primary = data.english_translations[0]?.translation ?? "";
    const description = truncate(
      data.outline_definitions[0] ?? "",
      MAX_DESCRIPTION,
    );
    const original = data.original_word ?? "";
    if (!description && !primary && !original) {
      console.warn(`Concordance ${strongsId}: empty response`, data);
    }
    return {
      description,
      original,
      translation: truncate(primary, MAX_TRANSLATION),
      alternates,
    };
  })();

  cache.set(strongsId, promise);
  promise.catch(() => cache.delete(strongsId));
  return promise;
}
