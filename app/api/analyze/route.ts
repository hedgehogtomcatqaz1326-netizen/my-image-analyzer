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

    const promptText = `この画像を解析してください。
以下の条件を必ず守ってください：
1. 画像に写っているものの説明や情報を集めてください。
2. 小学生でも分かるように3行の箇条書き（summary）と、キーワードのラベル（labels）にまとめてください。
3. 出力する言語は「${lang}」にしてください。
4. 必ずJSON形式のみで回答してください。
{"summary": "1行目\\n2行目\\n3行目", "labels": ["項目1", "項目2"]}`;

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
        summary: "画像を解析できませんでした。", 
        labels: ["画像解析"] 
      });
    }

    // JSONを安全に抽出（失敗しても絶対に500エラーにせず、テキストをそのままサマリーにする）
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return NextResponse.json({
          summary: parsed.summary || text,
          labels: parsed.labels || ["画像解析"]
        });
      }
    } catch (e) {
      // パース失敗時のフォールバック
    }

    return NextResponse.json({ 
      summary: text, 
      labels: ["画像解析"] 
    });

  } catch (error: any) {
    // 万が一何かが起きても500エラーで止めず、安全にテキストを返す
    return NextResponse.json({ 
      summary: "解析処理中にエラーが発生しました。", 
      labels: ["画像解析"] 
    });
  }
}