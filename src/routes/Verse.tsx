import { useMemo, useState } from "react";
import { useLoaderData } from "react-router-dom";
import VerseText from "../components/VerseText";
import WordInfo from "../components/WordInfo";
import { parseVerse } from "../lib/parseVerse";
import { fetchConcordance } from "../lib/concordance";
import type { VerseData } from "./verseLoader";
import "./Verse.css";

export default function Verse() {
  const data = useLoaderData() as VerseData;
  const tokens = useMemo(() => parseVerse(data.text), [data.text]);

  const [clickedKey, setClickedKey] = useState<string | null>(null);
  const [clickedTarget, setClickedTarget] = useState<HTMLElement | null>(null);

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
  const entry = clickedStrongsId ? fetchConcordance(clickedStrongsId) : null;

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
