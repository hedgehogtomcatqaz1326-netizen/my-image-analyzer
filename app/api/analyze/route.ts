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

    const promptText = `この画像を細部まで解析し、以下の情報を必ず有効なJSON形式のみで出力してください。
条件：
1. productName: 製品名
2. price: おおよその価格帯
3. company: 産地または製造元会社名
4. basicInfo: 基礎情報
5. trivia: 豆知識
6. searchQuery: 類似画像検索用のキーワード
出力フォーマット例：
{"productName": "...", "price": "...", "company": "...", "basicInfo": "...", "trivia": "...", "searchQuery": "..."}
出力言語：「${lang}」`;

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
      return NextResponse.json({ error: data.error?.message || "APIエラー" }, { status: 500 });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return NextResponse.json({ error: "応答が空です" }, { status: 500 });
    }

    let jsonString = text.trim();
    jsonString = jsonString.replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/\s*```$/, "");

    const parsedData = JSON.parse(jsonString);
    return NextResponse.json(parsedData);

  } catch (error: any) {
    return NextResponse.json({ error: "解析失敗" }, { status: 500 });
  }
}