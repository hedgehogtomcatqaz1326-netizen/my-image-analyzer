"use client";

import { useState, useRef } from "react";

export default function Home() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // カメラ・ファイル選択時の処理
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
    }
  };

  // タップしてカメラ/ファイル選択を起動
  const triggerCamera = () => {
    fileInputRef.current?.click();
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("image", selectedFile);
    
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "解析失敗");
      setResult(data);
    } catch (error) {
      alert("解析に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  // ボタン用のスタイル
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
    <main style={{ maxWidth: "600px", margin: "0 auto", padding: "20px", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "22px", textAlign: "center", marginBottom: "20px" }}>AI画像解析</h1>

      {/* カメラ起動用の隠しinput（capture="environment" で直接カメラが起動） */}
      <input 
        type="file" 
        name="image" 
        accept="image/*" 
        capture="environment" 
        ref={fileInputRef} 
        onChange={handleImageChange} 
        style={{ display: "none" }} 
      />

      {/* タップしてカメラを起動するエリア */}
      <div 
        onClick={triggerCamera} 
        style={{ border: "2px dashed #0070f3", padding: "20px", textAlign: "center", cursor: "pointer", borderRadius: "8px", backgroundColor: "#f8fafc", marginBottom: "15px" }}
      >
        {previewUrl ? (
          <img src={previewUrl} alt="プレビュー" style={{ maxWidth: "100%", maxHeight: "250px", borderRadius: "4px" }} />
        ) : (
          <div>
            <p style={{ fontSize: "16px", fontWeight: "bold", color: "#0070f3", marginBottom: "5px" }}>📷 タップして写真を撮る / 画像を選ぶ</p>
            <p style={{ fontSize: "12px", color: "#64748b" }}>スマホならカメラが起動します</p>
          </div>
        )}
      </div>

      {/* 画像が選ばれている時だけ解析ボタンを表示 */}
      {previewUrl && !result && (
        <button 
          onClick={handleAnalyze} 
          disabled={loading} 
          style={{ width: "100%", padding: "15px", backgroundColor: "#0070f3", color: "#fff", border: "none", borderRadius: "6px", fontSize: "16px", fontWeight: "bold", cursor: "pointer", marginBottom: "20px" }}
        >
          {loading ? "解析中..." : "この画像を解析"}
        </button>
      )}

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