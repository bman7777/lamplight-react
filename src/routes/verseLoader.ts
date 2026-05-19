export type VerseData = {
  book: string;
  chapter: number;
  verse: number;
  text: string;
};

export async function verseLoader(): Promise<VerseData> {
  const res = await fetch(
    "/ll/bible/*/*/*/?order=random&limit=1&dataset=faves"
  );
  if (!res.ok) {
    throw new Response("Failed to fetch verse", { status: res.status });
  }
  const payload = await res.json();
  const v = payload.data?.[0];
  if (!v) {
    throw new Response("No verse returned", { status: 502 });
  }
  return { book: v.book, chapter: v.chapter, verse: v.verse, text: v.text };
}
