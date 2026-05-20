import { useEffect, useMemo, useState } from "react";
import { useLoaderData } from "react-router-dom";
import VerseText from "../components/VerseText";
import WordInfo from "../components/WordInfo";
import { parseVerse } from "../lib/parseVerse";
import { fetchConcordance, type ConcordanceEntry } from "../lib/concordance";
import type { VerseData } from "./verseLoader";
import "./Verse.css";

export default function Verse() {
  const data = useLoaderData() as VerseData;
  const tokens = useMemo(() => parseVerse(data.text), [data.text]);

  const [clickedKey, setClickedKey] = useState<string | null>(null);
  const [clickedTarget, setClickedTarget] = useState<HTMLElement | null>(null);
  const [entry, setEntry] = useState<ConcordanceEntry | null>(null);

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
        <WordInfo target={clickedTarget} entry={entry} />
      </div>
    </main>
  );
}
