"use client";

import { useState, useRef } from "react";

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  // 型定義を修正：resultはnullの可能性があるため安全に扱えるようにします
  const [result, setResult] = useState<{ summary: string; label: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const triggerCamera = () => {
    fileInputRef.current?.click();
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedImage);
      
      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "解析失敗");

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ボタンデザインの共通スタイル
  const btnStyle: React.CSSProperties = {
    padding: "10px",
    fontSize: "13px",
    backgroundColor: "#fff",
    border: "1px solid #ccc",
    borderRadius: "5px",
    textAlign: "center",
    textDecoration: "none",
    color: "#333",
    fontWeight: "bold",
    display: "block"
  };

  return (
    <main style={{ maxWidth: "600px", margin: "0 auto", padding: "20px", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "22px", textAlign: "center", marginBottom: "20px" }}>AI画像解析</h1>

      <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleImageChange} style={{ display: "none" }} />

      <div onClick={triggerCamera} style={{ border: "2px dashed #0070f3", padding: "20px", textAlign: "center", cursor: "pointer", borderRadius: "8px" }}>
        {previewUrl ? <img src={previewUrl} alt="プレビュー" style={{ maxWidth: "100%", maxHeight: "200px" }} /> : <p>タップして写真を撮る</p>}
      </div>

      {previewUrl && !result && (
        <button onClick={handleAnalyze} disabled={loading} style={{ width: "100%", padding: "15px", marginTop: "10px", backgroundColor: "#0070f3", color: "#fff", border: "none", borderRadius: "5px" }}>
          {loading ? "解析中..." : "この画像を解析"}
        </button>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}

      {result && (
        <div style={{ marginTop: "20px", padding: "20px", backgroundColor: "#f0fdf4", borderRadius: "8px", border: "1px solid #bbf7d0" }}>
          <h2 style={{ fontSize: "18px", marginBottom: "10px" }}>解析結果</h2>
          <p style={{ whiteSpace: "pre-line", marginBottom: "20px" }}>{result.summary}</p>
          
          <div style={{ backgroundColor: "#eef2ff", padding: "15px", borderRadius: "8px" }}>
            <p style={{ textAlign: "center", fontWeight: "bold", marginBottom: "10px" }}>「{result.label}」について調べる</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <a href={`https://www.google.com/search?q=${encodeURIComponent(result.label)}`} target="_blank" style={btnStyle}>Google検索</a>
              <a href={`https://ja.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(result.label)}`} target="_blank" style={btnStyle}>Wikipedia</a>
              <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(result.label)}`} target="_blank" style={btnStyle}>YouTube</a>
              <a href={`https://www.google.com/search?q=${encodeURIComponent(result.label)}&tbm=isch`} target="_blank" style={btnStyle}>画像検索</a>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}