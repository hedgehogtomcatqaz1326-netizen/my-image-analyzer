import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    const formData = await request.formData();
    const image = formData.get("image") as File;
    const lang = (formData.get("lang") as string) || "日本語";

    if (!image) {
      return NextResponse.json({ error: "画像が取得できません。" }, { status: 400 });
    }

    const arrayBuffer = await image.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");

    // 複雑なJSON指定をせず、確実に応答が得られるプロンプトにする
    const promptText = `この画像を詳しく解析し、以下の形式のJSONのみで答えてください。
他の文字やマークダウンは一切含めないこと。
{
  "summary": "ここに画像の詳細な説明、価格や会社名、基礎情報、豆知識などをまとめて分かりやすく書いてください",
  "labels": ["検索キーワード1", "検索キーワード2"]
}
出力言語: ${lang}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: promptText },
                {
                  inlineData: {
                    mimeType: image.type,
                    data: base64Image
                  }
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ 
        summary: "画像から情報を取得できませんでした。", 
        labels: ["画像解析"] 
      });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return NextResponse.json({ 
        summary: "応答が空です。", 
        labels: ["画像解析"] 
      });
    }

    // JSONを安全に抽出し、失敗してもテキストをそのまま返す
    let cleanText = text.trim();
    cleanText = cleanText.replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/\s*```$/, "");

    try {
      const parsed = JSON.parse(cleanText);
      return NextResponse.json({
        summary: parsed.summary || text,
        labels: parsed.labels || ["画像解析"]
      });
    } catch (e) {
      // JSONパースに失敗した場合でも、AIの返答テキストをそのままサマリーとして表示する
      return NextResponse.json({
        summary: text,
        labels: ["画像解析"]
      });
    }

  } catch (error: any) {
    return NextResponse.json({ 
      summary: "解析処理中にエラーが発生しました。", 
      labels: ["画像解析"] 
    }, { status: 500 });
  }
}