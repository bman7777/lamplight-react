import { useLayoutEffect, useState } from "react";
import type { ConcordanceEntry } from "../lib/concordance";

type Props = {
  target: HTMLElement | null;
  entry: ConcordanceEntry | null;
};

type Position = {
  top: number;
  left: number;
  dropHeight: number;
  flipped: boolean;
};

const DOT_GAP = 4;
const MIN_TOP = -150;
const MIN_DROP = 170;
const DETAILS_WIDTH = 260;
const DETAILS_OFFSET = 12;
const EDGE_BUFFER = 16;

function computePosition(target: HTMLElement): Position {
  const lx = target.offsetLeft;
  const ly = target.offsetTop;

  const available = ly - DOT_GAP - MIN_TOP;
  const dropHeight = Math.max(MIN_DROP, available);
  const topY = ly - DOT_GAP - dropHeight;
  const left = lx + target.offsetWidth / 2;

  const parent = target.offsetParent as HTMLElement | null;
  const parentWidth = parent?.clientWidth ?? Infinity;
  const flipped =
    left + DETAILS_OFFSET + DETAILS_WIDTH + EDGE_BUFFER > parentWidth;

  return { top: topY, left, dropHeight, flipped };
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
      className={`word-info${pos.flipped ? " word-info-flipped" : ""}`}
      style={{ top: pos.top, left: pos.left, height: pos.dropHeight }}
    >
      <svg
        className="word-info-svg"
        width="44"
        height={pos.dropHeight}
        style={{ height: pos.dropHeight }}
      >
        <polyline
          points={
            pos.flipped
              ? `-40,2 2,2 2,${pos.dropHeight}`
              : `42,2 2,2 2,${pos.dropHeight}`
          }
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
