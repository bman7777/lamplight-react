import type { Token } from "../lib/parseVerse";

type Props = {
  tokens: Token[];
  clickedKey: string | null;
  onFragmentClick: (key: string, element: HTMLElement) => void;
};

export default function VerseText({
  tokens,
  clickedKey,
  onFragmentClick,
}: Props) {
  return (
    <p className="verse-body">
      {tokens.map((token, i) => {
        if (token.type === "text") {
          return <span key={i}>{token.text}</span>;
        }
        const key = `${i}-${token.id}`;
        const isClicked = key === clickedKey;
        return (
          <span
            key={key}
            className={isClicked ? "clicked-word" : "kw"}
            onClick={(e) => onFragmentClick(key, e.currentTarget)}
          >
            {token.text}
          </span>
        );
      })}
    </p>
  );
}
