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

    // 画像をバイナリデータに変換
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes).toString("base64");

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // AIへの指示：メインの対象を1つに絞らせる
    const prompt = `この画像に写っている「主要な商品、物、または人物」を1つだけ特定し、以下のJSON形式で回答してください。
    {
      "summary": "3行以内の簡潔な説明文",
      "label": "特定した名称のみ"
    }
    ※説明文の中に検索対象のハッシュタグなどは含めないでください。`;

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
    // JSON部分だけを抽出する処理
    const jsonStr = text.replace(/```json|```/g, "").trim();
    const data = JSON.parse(jsonStr);

    return NextResponse.json(data);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "解析中にエラーが発生しました" }, { status: 500 });
  }
}