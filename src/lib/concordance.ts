export type ConcordanceEntry = {
  description: string;
  native: string;
  english: string;
};

export function fetchConcordance(strongsId: string): ConcordanceEntry {
  return {
    description: "Definition pending — concordance data not yet available.",
    native: "—",
    english: strongsId,
  };
}
