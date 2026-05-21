import { useCallback, useEffect, useMemo, useState } from "react";
import { useLoaderData } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import VerseText from "../components/VerseText";
import WordInfo from "../components/WordInfo";
import { parseVerse } from "../lib/parseVerse";
import { fetchConcordance, type ConcordanceEntry } from "../lib/concordance";
import {
  criterionKey,
  searchVerses,
  type SearchCriterion,
} from "../lib/search";
import type { VerseData } from "./verseLoader";
import "./Verse.css";

export default function Verse() {
  const data = useLoaderData() as VerseData;
  const tokens = useMemo(() => parseVerse(data.text), [data.text]);

  const [clickedKey, setClickedKey] = useState<string | null>(null);
  const [clickedTarget, setClickedTarget] = useState<HTMLElement | null>(null);
  const [entry, setEntry] = useState<ConcordanceEntry | null>(null);
  const [criteria, setCriteria] = useState<SearchCriterion[]>([]);

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
    if (criteria.length === 0) return;
    const controller = new AbortController();
    searchVerses(criteria, controller.signal)
      .then((res) => {
        console.log("search results", res);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.warn("Search failed", err);
        }
      });
    return () => controller.abort();
  }, [criteria]);

  return (
    <main className="verse-page">
      <div className="verse-container">
        <div className="verse-reference">
          <span className="verse-reference-book">{data.book}</span>
          <span className="verse-reference-num">
            {data.chapter}:{data.verse}
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
      </div>
    </main>
  );
}
