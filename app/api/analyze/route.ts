import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = formData.get("image") as File;

    if (!image) {
      return NextResponse.json({ error: "画像がありません" }, { status: 400 });
    }

    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes).toString("base64");

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `この画像を解析し、以下の形式のJSONのみで返してください。
{
  "summary": "簡潔な説明（3行以内）",
  "label": "最も主要な名称（1つだけ）"
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
    // JSON部分のみを抜き出す
    const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const data = JSON.parse(cleanJson);

    return NextResponse.json(data);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "解析に失敗しました" }, { status: 500 });
  }
}