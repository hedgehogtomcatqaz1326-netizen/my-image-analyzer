import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    const formData = await request.formData();
    const image = formData.get("image") as File;
    const lang = (formData.get("lang") as string) || "日本語";

    if (!image) {
      return NextResponse.json({ 
        price: "-", 
        company: "-", 
        basicInfo: "画像が取得できませんでした。", 
        trivia: "-", 
        searchQuery: "画像解析" 
      }, { status: 400 });
    }

    const arrayBuffer = await image.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");

    const promptText = `この画像を詳細に解析し、必ず以下のJSONフォーマットのみで出力してください。マークダウンや他の文字列は一切含めないでください。
{
  "price": "およその価格",
  "company": "会社名 / 産地",
  "basicInfo": "基礎情報",
  "trivia": "豆知識",
  "searchQuery": "類似画像検索用のキーワード"
}
出力言語: ${lang}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
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
        price: "-", 
        company: "-", 
        basicInfo: data.error?.message || "APIエラーが発生しました。", 
        trivia: "-", 
        searchQuery: "画像解析" 
      });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return NextResponse.json({ 
        price: "-", 
        company: "-", 
        basicInfo: "AIからの応答が空です。", 
        trivia: "-", 
        searchQuery: "画像解析" 
      });
    }

    let cleanText = text.trim();
    cleanText = cleanText.replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/\s*```$/, "");

    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return NextResponse.json({
        price: parsed.price || "-",
        company: parsed.company || "-",
        basicInfo: parsed.basicInfo || text,
        trivia: parsed.trivia || "-",
        searchQuery: parsed.searchQuery || "画像解析"
      });
    }

    return NextResponse.json({ 
      price: "-", 
      company: "-", 
      basicInfo: text, 
      trivia: "-", 
      searchQuery: "画像解析" 
    });

  } catch (error: any) {
    return NextResponse.json({ 
      price: "-", 
      company: "-", 
      basicInfo: "サーバーエラーが発生しました。", 
      trivia: "-", 
      searchQuery: "画像解析" 
    }, { status: 500 });
  }
}