import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    const formData = await request.formData();
    const image = formData.get("image") as File;
    const lang = (formData.get("lang") as string) || "日本語";

    if (!image) {
      return NextResponse.json({ error: "画像が取得できません。もう一度画像を選んでください。" }, { status: 400 });
    }

    const arrayBuffer = await image.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");

    const promptText = `この画像を解析してください。
以下の条件を必ず守ってください：
1. 画像に写っているものの説明や情報を集めてください。
2. 機械が苦手な人や外国人のために、小学生でも分かるように3行の箇条書き（summary）と、キーワードのラベル（labels）にまとめてください。
3. 出力する言語は「${lang}」で翻訳して出力してください。
4. 必ず以下のJSON形式のみで回答してください（Markdownのバッククォートなども含めず純粋なJSON文字列にしてください）。
{"summary": "1行目\\n2行目\\n3行目", "labels": ["項目1", "項目2"]}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
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
      return NextResponse.json({ error: data.error?.message || "API通信エラーが発生しました。" }, { status: 500 });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return NextResponse.json({ error: "AIからの応答が空です。" }, { status: 500 });
    }

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ summary: text, labels: [] });
    }

    return NextResponse.json(JSON.parse(jsonMatch[0]));
  } catch (error: any) {
    return NextResponse.json({ error: "サーバー内部エラーが発生しました。" }, { status: 500 });
  }
}