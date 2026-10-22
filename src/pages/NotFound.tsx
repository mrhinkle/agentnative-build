import { Link } from "react-router";

export default function NotFound() {
  return (
    <section className="hero-dark min-h-[70vh] flex items-center">
      <div className="container pt-24">
        <p className="label-mono text-[#f44800] mb-3">404 · not_found</p>
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4">That page does not exist.</h1>
        <pre className="font-mono text-sm text-emerald-300/90 mb-6">{`{ "error": { "code": "not_found", "fix": "Try /, /future or /examples", "retryable": false } }`}</pre>
        <Link to="/" className="inline-flex rounded bg-[#2563EB] px-6 py-3 text-sm font-semibold text-white">Back to the guide</Link>
      </div>
    </section>
  );
}
