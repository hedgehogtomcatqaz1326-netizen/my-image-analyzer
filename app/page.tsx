"use client";

import { useState } from "react";

export default function Home() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  // ファイル選択時にプレビューを表示する処理
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
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
        <div style={{ marginBottom: "15px" }}>
          <input 
            type="file" 
            name="image" 
            accept="image/*" 
            onChange={handleImageChange}
            required 
          />
        </div>

        {/* 選択した画像のプレビュー表示 */}
        {preview && (
          <div style={{ marginBottom: "15px", border: "2px dashed #cbd5e1", padding: "10px", textAlign: "center", borderRadius: "8px" }}>
            <img src={preview} alt="プレビュー" style={{ maxWidth: "100%", maxHeight: "250px", borderRadius: "4px" }} />
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading}
          style={{ padding: "10px 20px", backgroundColor: "#0070f3", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
        >
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