import { useState } from "react";
import { Link } from "react-router-dom";
import { searchApi } from "../api/client";

export default function AdminPage() {
  const [seedUrl, setSeedUrl] = useState("http://spring.io/blog");
  const [maxPages, setMaxPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [reindexing, setReindexing] = useState(false);

  const crawl = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await searchApi.crawl(seedUrl, Number(maxPages));
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };
}
const reindex = async () => {
  setReindexing(true);
  try {
    const data = await searchApi.reindex();
    alert(`Reeindexed ${data.indexed} documents`);
  } catch (err) {
    alert(` REdinex failed: ${err.message}`);
  } finally {
    setReindexing(false);
  }
};
return (
  <div className="min-h-screen bg-gray-50">
    <header className="bg-white border-b">
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-medium">
          Mini<span className="gradient-text">Search</span> Admin
        </Link>
        <Link to="/" className="text-sm text-gray-600 hover:text-gray-900">
          ← Back to search
        </Link>
      </div>
    </header>

    <main className="max-w-4xl mx-auto px-6 py-10">
      <section className="bg-white rounded-2xl p-8 shadow-sm">
        <h1 className="text-2xl font-medium mb-6">🕷️ Crawler</h1>

        <div className="space-y-5">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Seed URL</label>
            <input
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
              value={seedUrl}
              onChange={(e) => setSeedUrl(e.target.value)}
              placeholder="https://example.com/blog"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Max pages: <span className="font-medium">{maxPages}</span>
            </label>
            <input
              type="range"
              min="5"
              max="200"
              step="5"
              value={maxPages}
              onChange={(e) => setMaxPages(e.target.value)}
              className="w-full"
            />
          </div>

          <button onClick={crawl} disabled={loading} className="btn-primary">
            {loading ? "Crawling..." : "Start Crawl"}
          </button>

          {loading && (
            <p className="text-gray-500 text-sm">
              Crawling up to {maxPages} pages. This can take 30-90 seconds.
            </p>
          )}

          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm">
              ❌ {error}
            </div>
          )}

          {result && (
            <div className="bg-green-50 text-green-800 p-4 rounded-lg text-sm space-y-1">
              <p className="font-medium">✅ Crawl complete</p>
              <p>Pages crawled: {result.pagesCrawled}</p>
              <p>Pages indexed: {result.pagesIndexed}</p>
              <p>Duplicates skipped: {result.duplicatesSkipped}</p>
              <p>Duration: {result.durationMs} ms</p>
              {result.errors?.length > 0 && (
                <details className="mt-2">
                  <summary className="cursor-pointer">
                    {result.errors.length} errors
                  </summary>
                  <ul className="list-disc ml-5 mt-1">
                    {result.errors.slice(0, 10).map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="bg-white rounded-2xl p-8 shadow-sm mt-6">
        <h2 className="text-xl font-medium mb-3">🔁 Rebuild Index</h2>
        <p className="text-sm text-gray-600 mb-4">
          Rebuild the in-memory inverted index from all documents in the
          database. Use this if the app was restarted or data changed
          externally.
        </p>
        <button
          onClick={reindex}
          disabled={reindexing}
          className="px-5 py-2.5 bg-gray-800 text-white rounded-full text-sm
                       hover:bg-gray-900 disabled:opacity-50"
        >
          {reindexing ? "Reindexing..." : "Rebuild Index"}
        </button>
      </section>
    </main>
  </div>
);
