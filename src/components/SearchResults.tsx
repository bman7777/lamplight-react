import type { SearchVerse } from "../lib/search";
import { totalPages } from "../lib/search";
import { parseVerse } from "../lib/parseVerse";
import "./SearchResults.css";

function plainText(text: string): string {
  return parseVerse(text)
    .map((t) => t.text)
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}

type ResultGroup = { book: string; verses: SearchVerse[] };

function groupByBook(results: SearchVerse[]): ResultGroup[] {
  const groups: ResultGroup[] = [];
  for (const v of results) {
    const last = groups[groups.length - 1];
    if (last && last.book === v.book) {
      last.verses.push(v);
    } else {
      groups.push({ book: v.book, verses: [v] });
    }
  }
  return groups;
}

type Props = {
  results: SearchVerse[];
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
  hasCriteria: boolean;
  onPageChange: (page: number) => void;
  onSelect: (verse: SearchVerse) => void;
};

export default function SearchResults({
  results,
  total,
  page,
  pageSize,
  loading,
  error,
  hasCriteria,
  onPageChange,
  onSelect,
}: Props) {
  if (!hasCriteria) return null;

  if (error) {
    return (
      <div className="search-results">
        <div className="search-results-message search-results-error">
          {error}
        </div>
      </div>
    );
  }

  if (loading && results.length === 0) {
    return (
      <div className="search-results">
        <div className="search-results-message">Searching…</div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="search-results">
        <div className="search-results-message">
          No verses matched these filters.
        </div>
      </div>
    );
  }

  const pages = totalPages(total, pageSize);
  const showPager = total > pageSize;
  const groups = groupByBook(results);

  return (
    <div className="search-results">
      <ul className="search-results-groups">
        {groups.map((g, gi) => (
          <li key={`${g.book}-${gi}`} className="search-results-group">
            <h3 className="search-results-group-book">{g.book}</h3>
            <ul className="search-results-group-list">
              {g.verses.map((v) => (
                <li key={`${v.book}-${v.chapter}-${v.verse}`}>
                  <button
                    type="button"
                    className="search-results-row"
                    onClick={() => onSelect(v)}
                  >
                    <span className="search-results-ref-num">
                      {v.chapter}:{v.verse}
                    </span>
                    <span className="search-results-text">
                      {plainText(v.text)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      {showPager && (
        <div className="search-results-pager">
          <button
            type="button"
            className="search-results-pager-btn"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
          >
            Prev
          </button>
          <span className="search-results-pager-label">
            Page {page} of {pages}
          </span>
          <button
            type="button"
            className="search-results-pager-btn"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= pages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
