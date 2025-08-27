import React, { useEffect, useMemo, useState } from "react";

const cities = [
  "Ahmedabad", "Bangalore", "Chennai", "Delhi", "Hyderabad",
  "Jaipur", "Kolkata", "Mumbai", "Pune", "Surat"
];

export default function ZoneMeter() {
  const [fromCity, setFromCity] = useState("Mumbai");
  const [toCity, setToCity] = useState("Bangalore");
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [autoCompare, setAutoCompare] = useState(true);

  const handleCompare = async () => {
    setError("");
    setLoading(true);
    setComparison(null);
    try {
      const res = await fetch(
        `http://localhost:8000/api/move-meter/?from_city=${encodeURIComponent(fromCity)}&to_city=${encodeURIComponent(toCity)}`
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch comparison");
      }
      setComparison(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Debounced auto-compare when cities change
  useEffect(() => {
    if (!autoCompare) return;
    const id = setTimeout(() => {
      if (fromCity && toCity) handleCompare();
    }, 400);
    return () => clearTimeout(id);
  }, [fromCity, toCity, autoCompare]);

  const swapCities = () => {
    setFromCity((prev) => {
      return toCity;
    });
    setToCity((prev) => {
      return fromCity;
    });
  };

  const Bar = ({ label, fromScore, toScore }) => {
    const fromWidth = Math.max(0, Math.min(100, Number(fromScore || 0)));
    const toWidth = Math.max(0, Math.min(100, Number(toScore || 0)));
    const winner = fromWidth === toWidth ? 'tie' : (fromWidth > toWidth ? 'from' : 'to');
    return (
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-800 font-medium">{label}</span>
            {winner !== 'tie' && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${winner === 'from' ? 'bg-blue-100 text-blue-800' : 'bg-blue-50 text-blue-700'}`}>
                Advantage: {winner === 'from' ? comparison?.from_city?.City : comparison?.to_city?.City}
              </span>
            )}
            {winner === 'tie' && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">Even</span>
            )}
          </div>
          <span className="text-gray-500">{fromWidth}% vs {toWidth}%</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-100 rounded h-3 overflow-hidden">
            <div className="bg-blue-600 h-3 transition-all duration-500" style={{ width: `${fromWidth}%` }} />
          </div>
          <div className="bg-gray-100 rounded h-3 overflow-hidden">
            <div className="bg-blue-400 h-3 transition-all duration-500" style={{ width: `${toWidth}%` }} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-800 to-blue-600">
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-12">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-extrabold text-white drop-shadow-sm">ZoneMeter</h2>
          <p className="text-blue-100 mt-2">Compare cities across housing, jobs, living costs, amenities and lifestyle.</p>
        </div>

      {/* City Selectors */}
        {/* Controls Card */}
        <div className="bg-white rounded-2xl shadow-xl p-5 md:p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3 items-end">
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">From City</label>
              <select
                value={fromCity}
                onChange={(e) => setFromCity(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {cities.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="hidden md:flex md:col-span-1 items-center justify-center pb-3">
              <button onClick={swapCities} className="px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700" title="Swap cities">
                ⇄
              </button>
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">To City</label>
              <select
                value={toCity}
                onChange={(e) => setToCity(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {cities.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={handleCompare}
                disabled={loading}
                className={`px-5 py-2 rounded-lg text-white ${loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {loading ? 'Comparing...' : 'Compare Now'}
              </button>
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked={autoCompare} onChange={(e) => setAutoCompare(e.target.checked)} />
                Auto compare on change
              </label>
            </div>
            <div className="flex items-center gap-2">
              {[["Mumbai","Bangalore"],["Delhi","Pune"],["Hyderabad","Chennai"]].map(([a,b]) => (
                <button key={`${a}-${b}`} onClick={() => {setFromCity(a); setToCity(b);}} className="text-sm px-3 py-1.5 rounded-full border border-blue-200 text-blue-700 hover:bg-blue-50">
                  {a} → {b}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        {comparison && !comparison.error && (
          <div className="mt-6">
            <div className="flex items-baseline justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{comparison.from_city.City}</h3>
                <p className="text-sm text-gray-500">Base city</p>
              </div>
              <div className="text-right">
                <h3 className="text-xl font-semibold text-gray-900">{comparison.to_city.City}</h3>
                <p className="text-sm text-gray-500">Target city</p>
              </div>
            </div>

            {/* Metric bars */}
            <div className="bg-white rounded-2xl shadow-xl p-5 md:p-6">
              {Array.isArray(comparison.metrics) && comparison.metrics.map((m) => (
                <Bar key={m.key} label={m.label} fromScore={m.from_score} toScore={m.to_score} />
              ))}

              {/* Raw values */}
              <div className="mt-6 grid grid-cols-2 gap-6 text-sm">
                <div className="space-y-2">
                  <div className="font-medium text-gray-700">Housing Cost (₹/sq.ft)</div>
                  <div className="text-gray-900">{comparison.from_city.Housing_Cost_per_sqft}</div>
                  <div className="font-medium text-gray-700 mt-3">Job Market</div>
                  <div className="text-gray-900">{comparison.from_city.Job_Market_Score}</div>
                  <div className="font-medium text-gray-700 mt-3">Cost of Living</div>
                  <div className="text-gray-900">{comparison.from_city.Cost_of_Living_Index}</div>
                </div>
                <div className="space-y-2 text-right">
                  <div className="font-medium text-gray-700">Housing Cost (₹/sq.ft)</div>
                  <div className="text-gray-900">{comparison.to_city.Housing_Cost_per_sqft}</div>
                  <div className="font-medium text-gray-700 mt-3">Job Market</div>
                  <div className="text-gray-900">{comparison.to_city.Job_Market_Score}</div>
                  <div className="font-medium text-gray-700 mt-3">Cost of Living</div>
                  <div className="text-gray-900">{comparison.to_city.Cost_of_Living_Index}</div>
                </div>
              </div>
            </div>

            {/* Summary */}
            {comparison.summary && (
              <div className="mt-6 p-5 bg-blue-50 border border-blue-200 rounded-2xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <div>
                    <div className="text-sm text-gray-600">Overall Score</div>
                    <div className="text-2xl font-bold text-blue-800">{comparison.summary.from_overall}</div>
                    <div className="text-xs text-gray-500">{comparison.from_city.City}</div>
                  </div>
                  <div className="h-10 flex items-center justify-center">
                    <div className="px-3 py-1 rounded-full bg-white text-blue-700 border border-blue-200 text-sm font-semibold">
                      {comparison.summary.winner === 'tie' ? 'Comparable' : (comparison.summary.winner === 'to' ? `${comparison.to_city.City} favored` : `${comparison.from_city.City} favored`)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Overall Score</div>
                    <div className="text-2xl font-bold text-blue-800">{comparison.summary.to_overall}</div>
                    <div className="text-xs text-gray-500">{comparison.to_city.City}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Loading / Error */}
        {loading && (
          <div className="mt-6 bg-white rounded-2xl shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-3 bg-gray-100 rounded w-full mb-3"></div>
            ))}
          </div>
        )}

        {error && (
          <p className="text-red-600 mt-4">⚠ {error}</p>
        )}
      </div>
    </div>
  );
}
