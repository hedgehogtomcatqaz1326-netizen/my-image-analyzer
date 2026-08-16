"use client";

import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<{ summary: string; labels: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // アプリ起動（マウント時）と同時に自動でカメラ（ファイル選択ダイアログ）を起動する
  useEffect(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
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
      // 外国語対応を取り消したため、言語指定は常に日本語固定
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

      <div style={{ backgroundColor: "#f9f9f9", padding: "20px", borderRadius: "8px", border: "1px solid #ddd", marginBottom: "20px" }}>
        <p style={{ marginBottom: "15px", fontWeight: "bold", textAlign: "center" }}>
          アプリを開くと同時にカメラが起動します
        </p>

        {/* 隠しファイル入力：capture="environment" によりスマホでは直接外カメラが起動 */}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={fileInputRef}
          onChange={handleImageChange}
          style={{ display: "none" }}
        />

        <div style={{ textAlign: "center", marginBottom: "15px" }}>
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: "10px 20px",
              backgroundColor: "#6c757d",
              color: "#fff",
              fontSize: "14px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              marginBottom: "15px"
            }}
          >
            📸 もう一度写真を撮る / 選ぶ
          </button>
        </div>

        {previewUrl && (
          <div style={{ textAlign: "center", marginBottom: "15px" }}>
            <img src={previewUrl} alt="プレビュー" style={{ maxWidth: "100%", maxHeight: "250px", borderRadius: "4px" }} />
          </div>
        )}

        <button
          onClick={handleAnalyze}
          disabled={loading || !selectedImage}
          style={{
            width: "100%",
            padding: "15px",
            backgroundColor: loading || !selectedImage ? "#ccc" : "#0070f3",
            color: "#fff",
            fontSize: "18px",
            fontWeight: "bold",
            border: "none",
            borderRadius: "4px",
            cursor: loading || !selectedImage ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "解析中..." : "解析する"}
        </button>
      </div>

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
          <p style={{ whiteSpace: "pre-line", fontSize: "16px", lineHeight: "1.6", marginBottom: "15px" }}>
            {result.summary}
          </p>
          <div style={{ marginBottom: "10px", fontSize: "14px", color: "#555", fontWeight: "bold" }}>
            気になる言葉を押すと、詳しく調べたり画像を見ることができます：
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {result.labels.map((label: string, index: number) => (
              <a
                key={index}
                href={`https://www.google.com/search?q=${encodeURIComponent(label)}&tbm=isch`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  backgroundColor: "#c8e6c9",
                  color: "#1b5e20",
                  padding: "6px 12px",
                  borderRadius: "20px",
                  fontSize: "14px",
                  textDecoration: "none",
                  fontWeight: "bold",
                  border: "1px solid #81c784",
                  display: "inline-block"
                }}
              >
                #{label} 🔍
              </a>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}