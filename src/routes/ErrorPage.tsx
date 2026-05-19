import { isRouteErrorResponse, Link, useRouteError } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError();

  let title = "Couldn't load verse";
  let message = "An unexpected error occurred.";

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      title = "Verse not found";
      message = "We couldn't find that verse.";
    } else {
      message = error.statusText || message;
    }
  }

  return (
    <main className="container">
      <h1>{title}</h1>
      <p>{message}</p>
      <Link to="/">← Back home</Link>
    </main>
  );
}
