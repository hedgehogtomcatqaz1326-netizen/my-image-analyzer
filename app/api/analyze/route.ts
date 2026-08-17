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

    const promptText = `この画像を細部まで解析し、以下のキーを持つ有効なJSON形式のみで出力してください。
条件（余計な文字やMarkdownのバッククォートは一切含めず、純粋なJSONのみを返してください）：
{
  "productName": "製品名",
  "price": "おおよその価格帯",
  "company": "産地または製造元会社名",
  "basicInfo": "基礎情報",
  "trivia": "豆知識",
  "searchQuery": "類似画像検索用のキーワード"
}
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
      return NextResponse.json({ 
        productName: "解析エラー", 
        price: "-", 
        company: "-", 
        basicInfo: data.error?.message || "API通信に失敗しました。", 
        trivia: "-", 
        searchQuery: "画像解析" 
      }, { status: 500 });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return NextResponse.json({ 
        productName: "解析エラー", 
        price: "-", 
        company: "-", 
        basicInfo: "AIからの応答が空です。", 
        trivia: "-", 
        searchQuery: "画像解析" 
      }, { status: 500 });
    }

    // バッククォートや余分な文字を徹底的に除去して安全にJSONを抽出する
    let jsonString = text.trim();
    jsonString = jsonString.replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/\s*```$/, "");
    
    const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsedData = JSON.parse(jsonMatch[0]);
      return NextResponse.json(parsedData);
    }

    throw new Error("JSON形式の抽出に失敗しました");

  } catch (error: any) {
    return NextResponse.json({ 
      productName: "解析失敗", 
      price: "不明", 
      company: "不明", 
      basicInfo: "画像の解析処理中にエラーが発生しました。もう一度お試しください。", 
      trivia: "-", 
      searchQuery: "画像解析" 
    }, { status: 500 });
  }
}