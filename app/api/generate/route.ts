import { NextResponse } from "next/server";

export const runtime = "nodejs";

interface GenerateRequest {
  prompt?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateRequest;
    const prompt = body.prompt?.trim();

    if (!prompt) {
      return NextResponse.json(
        { error: "Please enter a website description." },
        { status: 400 }
      );
    }

    if (prompt.length > 5000) {
      return NextResponse.json(
        { error: "Your prompt must be under 5000 characters." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key is missing. Check Vercel Environment Variables." },
        { status: 500 }
      );
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: `You are CreateX AI, an expert website generator.
Generate a complete, attractive, responsive website using HTML and CSS.
Return ONLY the HTML document, with inline CSS inside a style tag.
Do not use Markdown code fences.
Include a navbar, hero section, useful content sections, and footer.
Use a modern design suitable for the user's request.
Do not include scripts that access cookies, credentials, browser storage, or external APIs.
Do not claim features work if they are only visual demonstrations.`,
              },
            ],
          },
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
          },
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("Gemini API error:", result);

      return NextResponse.json(
        {
          error:
            result?.error?.message ||
            "Gemini could not generate the website. Please try again.",
        },
        { status: response.status === 429 ? 429 : 502 }
      );
    }

    const html = result?.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text || "")
      .join("")
      .trim();

    if (!html) {
      return NextResponse.json(
        { error: "Gemini returned an empty response. Try a different prompt." },
        { status: 502 }
      );
    }

    const cleanHtml = html
      .replace(/^```html\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const titleMatch = cleanHtml.match(/<title[^>]*>([\s\S]*?)<\/title>/i);

    const title = titleMatch?.[1]?.replace(/<[^>]*>/g, "").trim()
      || "CreateX AI Website";

    return NextResponse.json({
      success: true,
      mode: "gemini",
      title: title.slice(0, 120),
      html: cleanHtml,
      message: "Your AI-generated website is ready!",
    });
  } catch (error) {
    console.error("Website generation failed:", error);

    return NextResponse.json(
      { error: "Unable to generate the website. Please try again." },
      { status: 500 }
    );
  }
}
