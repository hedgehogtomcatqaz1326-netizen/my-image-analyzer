"use client";

import { useState, useRef } from "react";

export default function Home() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
    }
  };

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
      setResult(data);
    } catch (error) {
      setResult({
        price: "-",
        company: "-",
        basicInfo: "通信エラーが発生しました。",
        trivia: "-",
        searchQuery: "画像解析"
      });
    } finally {
      setLoading(false);
    }
  };

  const searchQuery = result?.searchQuery || "画像解析";

  return (
    <main style={{ maxWidth: "600px", margin: "0 auto", padding: "20px", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "22px", textAlign: "center", marginBottom: "20px", fontWeight: "bold" }}>AI画像解析</h1>

      <input 
        type="file" 
        name="image" 
        accept="image/*" 
        capture="environment" 
        ref={fileInputRef} 
        onChange={handleImageChange} 
        style={{ display: "none" }} 
      />

      <div 
        onClick={triggerCamera} 
        style={{ border: "2px dashed #60a5fa", padding: "15px", textAlign: "center", cursor: "pointer", borderRadius: "12px", backgroundColor: "#f8fafc", marginBottom: "15px" }}
      >
        {previewUrl ? (
          <div style={{ position: "relative", display: "inline-block" }}>
            <img src={previewUrl} alt="プレビュー" style={{ maxWidth: "100%", maxHeight: "250px", borderRadius: "8px" }} />
            <div style={{ position: "absolute", bottom: "10px", right: "10px", backgroundColor: "rgba(0,0,0,0.6)", color: "#fff", padding: "6px", borderRadius: "50%" }}>
              🔍
            </div>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: "16px", fontWeight: "bold", color: "#2563eb", marginBottom: "5px" }}>📷 タップして写真を撮る / 画像を選ぶ</p>
            <p style={{ fontSize: "12px", color: "#64748b" }}>スマホならカメラが起動します</p>
          </div>
        )}
      </div>

      {previewUrl && !result && (
        <button 
          onClick={handleAnalyze} 
          disabled={loading} 
          style={{ width: "100%", padding: "14px", backgroundColor: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "bold", cursor: "pointer", marginBottom: "20px" }}
        >
          {loading ? "解析中..." : "この画像を解析"}
        </button>
      )}

      {result && (
        <div style={{ marginTop: "20px", padding: "20px", backgroundColor: "#f0fdf4", borderRadius: "12px", border: "1px solid #bbf7d0" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "15px", color: "#166534" }}>解析結果</h2>
          
          <div style={{ marginBottom: "12px", fontSize: "15px", lineHeight: "1.5", color: "#1e293b" }}>
            <strong>およその価格:</strong><br />
            <span>{result.price}</span>
          </div>

          <div style={{ marginBottom: "12px", fontSize: "15px", lineHeight: "1.5", color: "#1e293b" }}>
            <strong>会社名 / 産地:</strong><br />
            <span>{result.company}</span>
          </div>

          <div style={{ marginBottom: "12px", fontSize: "15px", lineHeight: "1.5", color: "#1e293b" }}>
            <strong>基礎情報:</strong><br />
            <span style={{ whiteSpace: "pre-line" }}>{result.basicInfo}</span>
          </div>

          <div style={{ marginBottom: "20px", fontSize: "15px", lineHeight: "1.5", color: "#1e293b" }}>
            <strong>豆知識:</strong><br />
            <span style={{ whiteSpace: "pre-line" }}>{result.trivia}</span>
          </div>

          <div style={{ textAlign: "center" }}>
            <a 
              href={`[https://www.google.com/search?q=$](https://www.google.com/search?q=$){encodeURIComponent(searchQuery)}&tbm=isch`} 
              target="_blank" 
              rel="noreferrer"
              style={{ display: "block", width: "100%", padding: "14px", backgroundColor: "#2563eb", color: "#fff", textDecoration: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "bold", textAlign: "center", boxShadow: "0 4px 6px rgba(37, 99, 235, 0.2)" }}
            >
              類似画像を検索して詳細を見る
            </a>
          </div>
        </div>
      )}
    </main>
  );
}