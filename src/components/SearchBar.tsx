import { useEffect, useRef, useState } from "react";
import type { SearchCriterion } from "../lib/search";
import { criterionKey, criterionLabel } from "../lib/search";
import "./SearchBar.css";

type Props = {
  criteria: SearchCriterion[];
  onAdd: (criterion: SearchCriterion) => void;
  onRemove: (key: string) => void;
  onClear: () => void;
};

type PendingType = "text" | "author" | "speaker" | "book";

const TYPED_TYPES: { value: PendingType; label: string }[] = [
  { value: "author", label: "Author" },
  { value: "speaker", label: "Speaker" },
  { value: "book", label: "Book" },
];

export default function SearchBar({ criteria, onAdd, onRemove, onClear }: Props) {
  const [text, setText] = useState("");
  const [pendingType, setPendingType] = useState<PendingType>("text");
  const [menuOpen, setMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [criteria.length]);

  useEffect(() => {
    if (!menuOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [menuOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (pendingType !== "text") {
        setPendingType("text");
        return;
      }
      if (criteria.length === 0 && text === "") return;
      setText("");
      if (criteria.length > 0) onClear();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pendingType, criteria.length, text, onClear]);

  const clearAll = () => {
    setText("");
    setPendingType("text");
    onClear();
  };

  const commitText = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onAdd({ type: pendingType, value: trimmed });
    setText("");
    setPendingType("text");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitText();
    } else if (e.key === "Escape" && pendingType !== "text") {
      setPendingType("text");
    } else if (
      e.key === "Backspace" &&
      text === "" &&
      pendingType === "text" &&
      criteria.length > 0
    ) {
      onRemove(criterionKey(criteria[criteria.length - 1]));
    }
  };

  const pickType = (value: PendingType) => {
    setPendingType(value);
    setMenuOpen(false);
    inputRef.current?.focus();
  };

  const pickTestament = (value: "old" | "new") => {
    onAdd({ type: "testament", value });
    setMenuOpen(false);
  };

  const placeholder =
    pendingType === "text"
      ? criteria.length === 0
        ? "Search words or verse references…"
        : ""
      : `type ${pendingType} name…`;

  return (
    <>
    <div className="search-bar">
      <div className="search-bar-scroll" ref={scrollRef}>
        {criteria.map((c) => {
          const key = criterionKey(c);
          return (
            <span key={key} className={`search-pill search-pill-${c.type}`}>
              <button
                type="button"
                className="search-pill-remove"
                aria-label={`Remove ${c.value}`}
                onClick={() => onRemove(key)}
              >
                <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden>
                  <circle cx="8" cy="8" r="7" className="search-pill-x-circle" />
                  <path
                    d="M5 5 L11 11 M11 5 L5 11"
                    className="search-pill-x-stroke"
                  />
                </svg>
              </button>
              <span className="search-pill-body">
                <span className="search-pill-type">{criterionLabel(c)}</span>
                <span className="search-pill-value">{c.value}</span>
              </span>
            </span>
          );
        })}
        {pendingType !== "text" && (
          <span className="search-pill search-pill-pending">
            <span className="search-pill-type">{pendingType.toUpperCase()}</span>
          </span>
        )}
        <input
          ref={inputRef}
          className="search-bar-input"
          type="text"
          value={text}
          placeholder={placeholder}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
        />
      </div>
      <div className="search-bar-plus-wrap" ref={menuRef}>
        <button
          type="button"
          className="search-bar-plus"
          aria-label="Add filter"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
            <circle cx="12" cy="12" r="10" className="search-bar-plus-circle" />
            <path
              d="M12 7 V17 M7 12 H17"
              className="search-bar-plus-stroke"
            />
          </svg>
        </button>
        {menuOpen && (
          <div className="search-bar-menu" role="menu">
            {TYPED_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                role="menuitem"
                className="search-bar-menu-item"
                onClick={() => pickType(t.value)}
              >
                {t.label}
              </button>
            ))}
            <div className="search-bar-menu-sep" />
            <button
              type="button"
              role="menuitem"
              className="search-bar-menu-item"
              onClick={() => pickTestament("old")}
            >
              Old Testament
            </button>
            <button
              type="button"
              role="menuitem"
              className="search-bar-menu-item"
              onClick={() => pickTestament("new")}
            >
              New Testament
            </button>
          </div>
        )}
      </div>
    </div>
    {criteria.length > 0 && (
      <div className="search-bar-clear-hint">
        <span>
          Press <kbd>Esc</kbd> to clear search
        </span>
        <button
          type="button"
          className="search-bar-clear-x"
          aria-label="Clear search"
          onClick={clearAll}
        >
          <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden>
            <circle cx="8" cy="8" r="7" className="search-bar-clear-circle" />
            <path
              d="M5 5 L11 11 M11 5 L5 11"
              className="search-bar-clear-stroke"
            />
          </svg>
        </button>
      </div>
    )}
    </>
  );
}
