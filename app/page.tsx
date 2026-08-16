"use client";

import { useState } from "react";

export default function Home() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // ボタン用のスタイル定義
  const btnStyle = {
    display: "block",
    padding: "10px",
    textAlign: "center" as const,
    backgroundColor: "#ffffff",
    border: "1px solid #cbd5e1",
    borderRadius: "6px",
    color: "#1e293b",
    textDecoration: "none",
    fontWeight: "500",
  };

  const handleAnalyze = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      alert("解析に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h1>AI画像解析</h1>
      
      <form onSubmit={handleAnalyze}>
        <input type="file" name="image" accept="image/*" required />
        <button type="submit" disabled={loading}>
          {loading ? "解析中..." : "この画像を解析"}
        </button>
      </form>

      {/* 解析結果の表示 */}
      {result && (
        <div style={{ marginTop: "20px", padding: "20px", backgroundColor: "#f0fdf4", borderRadius: "8px", border: "1px solid #bbf7d0" }}>
          <h2 style={{ fontSize: "18px", marginBottom: "10px" }}>解析結果</h2>
          <p style={{ whiteSpace: "pre-line", marginBottom: "20px" }}>{result.summary}</p>
          
          {(() => {
            const searchKeyword = result.labels?.[0] || result.label || "検索ワード";
            
            return (
              <div style={{ backgroundColor: "#eef2ff", padding: "15px", borderRadius: "8px" }}>
                <p style={{ textAlign: "center", fontWeight: "bold", marginBottom: "10px" }}>
                  「{searchKeyword}」について調べる
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <a href={`https://www.google.com/search?q=${encodeURIComponent(searchKeyword)}`} target="_blank" rel="noreferrer" style={btnStyle}>Google検索</a>
                  <a href={`https://ja.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(searchKeyword)}`} target="_blank" rel="noreferrer" style={btnStyle}>Wikipedia</a>
                  <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(searchKeyword)}`} target="_blank" rel="noreferrer" style={btnStyle}>YouTube</a>
                  <a href={`https://www.google.com/search?q=${encodeURIComponent(searchKeyword)}&tbm=isch`} target="_blank" rel="noreferrer" style={btnStyle}>画像検索</a>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </main>
  );
}