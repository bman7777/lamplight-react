import { useCallback, useEffect, useMemo, useState } from "react";
import { useLoaderData } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import SearchResults from "../components/SearchResults";
import VerseText from "../components/VerseText";
import WordInfo from "../components/WordInfo";
import { parseVerse } from "../lib/parseVerse";
import { fetchConcordance, type ConcordanceEntry } from "../lib/concordance";
import {
  criterionKey,
  searchVerses,
  type SearchCriterion,
  type SearchVerse,
} from "../lib/search";
import type { VerseData } from "./verseLoader";
import "./Verse.css";

const PAGE_SIZE = 20;

export default function Verse() {
  const loader = useLoaderData() as VerseData;
  const [active, setActive] = useState<VerseData>(loader);
  const tokens = useMemo(() => parseVerse(active.text), [active.text]);

  const [clickedKey, setClickedKey] = useState<string | null>(null);
  const [clickedTarget, setClickedTarget] = useState<HTMLElement | null>(null);
  const [entry, setEntry] = useState<ConcordanceEntry | null>(null);
  const [criteria, setCriteria] = useState<SearchCriterion[]>([]);
  const [results, setResults] = useState<SearchVerse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addCriterion = useCallback((c: SearchCriterion) => {
    setCriteria((prev) => {
      const key = criterionKey(c);
      if (prev.some((p) => criterionKey(p) === key)) return prev;
      return [...prev, c];
    });
  }, []);

  const removeCriterion = useCallback((key: string) => {
    setCriteria((prev) => prev.filter((c) => criterionKey(c) !== key));
  }, []);

  const handleClick = (key: string, element: HTMLElement) => {
    if (clickedKey === key) {
      setClickedKey(null);
      setClickedTarget(null);
      return;
    }
    setClickedKey(key);
    setClickedTarget(element);
  };

  const clickedStrongsId = clickedKey
    ? clickedKey.split("-").slice(1).join("-")
    : null;

  const handleConceptClick = useCallback(
    (kind: "english" | "original", value: string) => {
      if (!value) return;
      if (kind === "english") {
        addCriterion({ type: "english", value });
        return;
      }
      if (!clickedStrongsId) return;
      const type = clickedStrongsId.startsWith("G") ? "greek" : "hebrew";
      addCriterion({ type, value, concordance_id: clickedStrongsId });
    },
    [addCriterion, clickedStrongsId],
  );

  useEffect(() => {
    if (!clickedStrongsId) {
      setEntry(null);
      return;
    }
    let cancelled = false;
    setEntry(null);
    fetchConcordance(clickedStrongsId)
      .then((result) => {
        if (!cancelled) setEntry(result);
      })
      .catch((err) => {
        console.warn(`Concordance ${clickedStrongsId}: fetch failed`, err);
        if (!cancelled) setEntry(null);
      });
    return () => {
      cancelled = true;
    };
  }, [clickedStrongsId]);

  useEffect(() => {
    setPage(1);
  }, [criteria]);

  useEffect(() => {
    if (criteria.length === 0) {
      setResults([]);
      setTotal(0);
      setError(null);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setLoading(true);
      searchVerses(criteria, { page, limit: PAGE_SIZE }, controller.signal)
        .then((res) => {
          setResults(res.verses);
          setTotal(res.total);
          setError(null);
        })
        .catch((err) => {
          if (err.name === "AbortError") return;
          console.warn("Search failed", err);
          setError("Search failed");
          setResults([]);
          setTotal(0);
        })
        .finally(() => {
          setLoading(false);
        });
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [criteria, page]);

  const handleSelectResult = useCallback((v: SearchVerse) => {
    setActive(v);
    setClickedKey(null);
    setClickedTarget(null);
    setEntry(null);
  }, []);

  return (
    <main className="verse-page">
      <div className="verse-container">
        <div className="verse-reference">
          <span className="verse-reference-book">{active.book}</span>
          <span className="verse-reference-num">
            {active.chapter}:{active.verse}
          </span>
        </div>
        <div className="verse-content">
          <VerseText
            tokens={tokens}
            clickedKey={clickedKey}
            onFragmentClick={handleClick}
          />
        </div>
        <WordInfo
          target={clickedTarget}
          entry={entry}
          onConceptClick={handleConceptClick}
        />
        <div className="verse-search-row">
          <SearchBar
            criteria={criteria}
            onAdd={addCriterion}
            onRemove={removeCriterion}
          />
        </div>
        <div className="verse-search-row">
          <SearchResults
            results={results}
            total={total}
            page={page}
            pageSize={PAGE_SIZE}
            loading={loading}
            error={error}
            hasCriteria={criteria.length > 0}
            onPageChange={setPage}
            onSelect={handleSelectResult}
          />
        </div>
      </div>
    </main>
  );
}
