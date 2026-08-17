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
        summary: "通信エラーが発生しました。もう一度お試しください。",
        labels: ["画像解析"]
      });
    } finally {
      setLoading(false);
    }
  };

  const currentKeyword = result?.labels?.[0] || "画像解析";

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
          <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "10px", color: "#166534" }}>解析結果</h2>
          
          <div style={{ marginBottom: "20px", fontSize: "15px", lineHeight: "1.6", color: "#1e293b", whiteSpace: "pre-line" }}>
            {result.summary}
          </div>

          <div style={{ backgroundColor: "#eff6ff", padding: "15px", borderRadius: "8px", textAlign: "center" }}>
            <p style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "12px", color: "#1e3a8a" }}>
              「{currentKeyword}」について調べる
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <a 
                href={`[https://www.google.com/search?q=$](https://www.google.com/search?q=$){encodeURIComponent(currentKeyword)}`} 
                target="_blank" 
                rel="noreferrer"
                style={{ padding: "10px", backgroundColor: "#fff", color: "#1e293b", textDecoration: "none", borderRadius: "6px", fontSize: "14px", fontWeight: "bold", border: "1px solid #cbd5e1", textAlign: "center" }}
              >
                Google検索
              </a>
              <a 
                href={`[https://ja.wikipedia.org/wiki/Special:Search?search=$](https://ja.wikipedia.org/wiki/Special:Search?search=$){encodeURIComponent(currentKeyword)}`} 
                target="_blank" 
                rel="noreferrer"
                style={{ padding: "10px", backgroundColor: "#fff", color: "#1e293b", textDecoration: "none", borderRadius: "6px", fontSize: "14px", fontWeight: "bold", border: "1px solid #cbd5e1", textAlign: "center" }}
              >
                Wikipedia
              </a>
              <a 
                href={`[https://www.youtube.com/results?search_query=$](https://www.youtube.com/results?search_query=$){encodeURIComponent(currentKeyword)}`} 
                target="_blank" 
                rel="noreferrer"
                style={{ padding: "10px", backgroundColor: "#fff", color: "#1e293b", textDecoration: "none", borderRadius: "6px", fontSize: "14px", fontWeight: "bold", border: "1px solid #cbd5e1", textAlign: "center" }}
              >
                YouTube
              </a>
              <a 
                href={`[https://www.google.com/search?q=$](https://www.google.com/search?q=$){encodeURIComponent(currentKeyword)}&tbm=isch`} 
                target="_blank" 
                rel="noreferrer"
                style={{ padding: "10px", backgroundColor: "#fff", color: "#1e293b", textDecoration: "none", borderRadius: "6px", fontSize: "14px", fontWeight: "bold", border: "1px solid #cbd5e1", textAlign: "center" }}
              >
                画像検索
              </a>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}