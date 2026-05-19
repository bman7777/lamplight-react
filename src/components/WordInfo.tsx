import { useLayoutEffect, useState } from "react";
import type { ConcordanceEntry } from "../lib/concordance";

type Props = {
  target: HTMLElement | null;
  entry: ConcordanceEntry | null;
};

type Position = { top: number; left: number; dropHeight: number };

const DESIRED_DROP = 230;
const DOT_GAP = 4;
const MIN_TOP = 10;
const MIN_DROP = 170;

function computePosition(target: HTMLElement): Position {
  const lx = target.offsetLeft;
  const ly = target.offsetTop;

  let dropHeight = DESIRED_DROP;
  let topY = ly - DOT_GAP - dropHeight;

  if (topY < MIN_TOP) {
    const offset = MIN_TOP - topY;
    dropHeight = Math.max(MIN_DROP, dropHeight - offset);
    topY = ly - DOT_GAP - dropHeight;
  }

  return {
    top: topY,
    left: lx + target.offsetWidth / 2,
    dropHeight,
  };
}

export default function WordInfo({ target, entry }: Props) {
  const [pos, setPos] = useState<Position | null>(null);

  useLayoutEffect(() => {
    if (!target) return;
    const update = () => setPos(computePosition(target));
    update();

    window.addEventListener("resize", update);
    const ro = new ResizeObserver(update);
    ro.observe(target);
    ro.observe(document.body);

    return () => {
      window.removeEventListener("resize", update);
      ro.disconnect();
    };
  }, [target]);

  if (!target || !entry || !pos) return null;

  return (
    <div
      className="word-info"
      style={{ top: pos.top, left: pos.left, height: pos.dropHeight }}
    >
      <svg
        className="word-info-svg"
        width="44"
        height={pos.dropHeight}
        style={{ height: pos.dropHeight }}
      >
        <polyline
          points={`42,2 2,2 2,${pos.dropHeight}`}
          className="word-info-line"
        />
      </svg>
      <div className="word-info-details">
        <div className="word-info-description">{entry.description}</div>
        <div className="concept-row">
          <div className="left-concept">{entry.native}</div>
          <div className="right-concept">{entry.english}</div>
        </div>
      </div>
      <div className="word-info-dot" />
    </div>
  );
}
