import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// APIキー設定
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = formData.get("image") as File;

    if (!image) {
      return NextResponse.json({ error: "画像がアップロードされていません" }, { status: 400 });
    }

    // 画像データの変換
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes).toString("base64");

    // 安定して動作していた 1.5-flash を指定
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `この画像を解析してください。
以下のJSON形式で、JSON以外の余計な文字を含めずに回答してください。
{
  "summary": "3行以内の簡潔な説明",
  "label": "最も主要な名称"
}`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: buffer,
          mimeType: image.type,
        },
      },
    ]);

    const text = result.response.text();
    
    // 【重要】AIの回答から { } で囲まれた部分のみを抽出する正規表現
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("JSON形式の結果が得られませんでした");
    }
    
    const data = JSON.parse(jsonMatch[0]);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "解析に失敗しました" }, { status: 500 });
  }
}