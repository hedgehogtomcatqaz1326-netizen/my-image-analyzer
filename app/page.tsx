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
      alert(
        "【解析に失敗しました】\n\n" +
        "原因：AIが正しくデータを読み取れなかったか、通信が一時的に不安定です。\n\n" +
        "【次にどうするべきか】\n" +
        "1. もう一度「この画像を解析」ボタンを押し直してください。\n" +
        "2. それでも失敗する場合は、別の写真（明るい場所で撮った写真や、ファイルサイズの小さい画像）に選び直して再度お試しください。"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: "600px", margin: "0 auto", padding: "20px", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "22px", textAlign: "center", marginBottom: "20px" }}>AI画像解析</h1>

      {/* カメラ起動用の隠しinput */}
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
          <h2 style={{ fontSize: "20px", marginBottom: "15px", color: "#166534" }}>{result.productName}</h2>
          
          <div style={{ marginBottom: "20px", fontSize: "14px", lineHeight: "1.6", color: "#1e293b" }}>
            <p style={{ marginBottom: "8px" }}><strong>およその価格:</strong> {result.price}</p>
            <p style={{ marginBottom: "8px" }}><strong>会社名 / 産地:</strong> {result.company}</p>
            <p style={{ marginBottom: "8px" }}><strong>基礎情報:</strong> {result.basicInfo}</p>
            <p style={{ marginBottom: "8px" }}><strong>豆知識:</strong> {result.trivia}</p>
          </div>

          <div style={{ textAlign: "center" }}>
            <a 
              href={`https://www.google.com/search?q=${encodeURIComponent(result.searchQuery || result.productName)}&tbm=isch`} 
              target="_blank" 
              rel="noreferrer"
              style={{
                display: "block",
                padding: "12px",
                backgroundColor: "#2563eb",
                color: "#fff",
                textDecoration: "none",
                borderRadius: "6px",
                fontWeight: "bold"
              }}
            >
              類似画像を検索して詳細を見る
            </a>
          </div>
        </div>
      )}
    </main>
  );
}