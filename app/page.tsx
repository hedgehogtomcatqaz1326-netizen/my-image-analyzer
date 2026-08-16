"use client";

import { useState, useRef } from "react";

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<{ summary: string; labels: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ファイルが選択されたときの処理
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  // 写真選択エリアまたはボタンを押したときにカメラを起動
  const triggerCamera = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      setError("写真が選択されていません。");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedImage);
      formData.append("lang", "日本語");

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "解析に失敗しました。");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || "通信エラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: "600px", margin: "0 auto", padding: "20px", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", textAlign: "center", marginBottom: "20px" }}>
        AI画像かんたん解析アプリ
      </h1>

      {/* 隠しファイル入力：スマホでは直接カメラが起動 */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={fileInputRef}
        onChange={handleImageChange}
        style={{ display: "none" }}
      />

      {/* 画面全体の撮影トリガーエリア */}
      <div 
        onClick={triggerCamera}
        style={{ 
          backgroundColor: "#f9f9f9", 
          padding: "30px 20px", 
          borderRadius: "8px", 
          border: "2px dashed #0070f3", 
          textAlign: "center", 
          marginBottom: "20px",
          cursor: "pointer"
        }}
      >
        <p style={{ fontSize: "18px", fontWeight: "bold", color: "#0070f3", margin: "0 0 10px 0" }}>
          📸 タップして写真を撮る / 選ぶ
        </p>
        <p style={{ fontSize: "14px", color: "#666", margin: "0" }}>
          ここを押すとすぐにカメラが起動します
        </p>

        {previewUrl && (
          <div style={{ marginTop: "15px" }} onClick={(e) => e.stopPropagation()}>
            <img src={previewUrl} alt="プレビュー" style={{ maxWidth: "100%", maxHeight: "250px", borderRadius: "4px" }} />
          </div>
        )}
      </div>

      {previewUrl && (
        <button
          onClick={handleAnalyze}
          disabled={loading}
          style={{
            width: "100%",
            padding: "15px",
            backgroundColor: loading ? "#ccc" : "#0070f3",
            color: "#fff",
            fontSize: "18px",
            fontWeight: "bold",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
            marginBottom: "20px"
          }}
        >
          {loading ? "解析中..." : "解析する"}
        </button>
      )}

      {error && (
        <div style={{ backgroundColor: "#ffebee", color: "#c62828", padding: "15px", borderRadius: "4px", marginBottom: "20px" }}>
          <strong>エラー：</strong> {error}
        </div>
      )}

      {result && (
        <div style={{ backgroundColor: "#e8f5e9", padding: "20px", borderRadius: "4px", border: "1px solid #a5d6a7" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "10px", color: "#2e7d32" }}>
            解析結果
          </h2>
          <p style={{ whiteSpace: "pre-line", fontSize: "16px", lineHeight: "1.6", marginBottom: "20px" }}>
            {result.summary}
          </p>

          <div style={{ marginBottom: "15px", fontSize: "14px", color: "#333", fontWeight: "bold" }}>
            キーワードから詳細を調べる：
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            {result.labels.map((label: string, index: number) => (
              <div key={index} style={{ backgroundColor: "#fff", padding: "12px", borderRadius: "6px", border: "1px solid #c8e6c9" }}>
                <div style={{ fontWeight: "bold", marginBottom: "8px", color: "#1b5e20" }}>
                  #{label}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(label)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: "12px", padding: "6px 10px", backgroundColor: "#e3f2fd", color: "#0d47a1", textDecoration: "none", borderRadius: "4px", fontWeight: "bold" }}
                  >
                    Googleで検索
                  </a>
                  <a
                    href={`https://ja.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(label)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: "12px", padding: "6px 10px", backgroundColor: "#f3e5f5", color: "#4a148c", textDecoration: "none", borderRadius: "4px", fontWeight: "bold" }}
                  >
                    ウィキペディアで検索
                  </a>
                  <a
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(label)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: "12px", padding: "6px 10px", backgroundColor: "#ffebee", color: "#b71c1c", textDecoration: "none", borderRadius: "4px", fontWeight: "bold" }}
                  >
                    YouTubeで検索
                  </a>
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(label)}&tbm=isch`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: "12px", padding: "6px 10px", backgroundColor: "#e8f5e9", color: "#1b5e20", textDecoration: "none", borderRadius: "4px", fontWeight: "bold" }}
                  >
                    類似画像を検索
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}