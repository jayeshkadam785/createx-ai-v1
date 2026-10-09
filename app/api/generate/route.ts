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
        {
          error:
            "Gemini API key is missing. Check Vercel Environment Variables.",
        },
        { status: 500 }
      );
    }

    const systemPrompt = `
You are CreateX AI, an expert website generator.

Generate a complete, attractive, responsive website using HTML and CSS.

Requirements:
- Return ONLY the complete HTML document.
- Include CSS inside a style tag.
- Do not use Markdown code fences.
- Include a navbar, hero section, useful content sections, and footer.
- Use a modern, professional design suitable for the user's request.
- Make the website responsive for mobile, tablet, and desktop.
- Use suitable colors, typography, spacing, cards, and buttons.
- Include realistic sample content relevant to the website.
- Do not include scripts that access cookies, credentials, browser storage, or external APIs.
- Do not claim that features work if they are only visual demonstrations.
- Escape special characters correctly inside HTML.
- Start with <!DOCTYPE html> and return valid HTML.
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/interactions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          model: "gemini-3.8-flash",
          store: false,
          input: `${systemPrompt}\n\nUser website request:\n${prompt}`,
          generation_config: {
            thinking_level: "low",
          },
        }),
        signal: AbortSignal.timeout(90000),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("Gemini API error:", {
        status: response.status,
        message: result?.error?.message,
      });

      return NextResponse.json(
        {
          error:
            result?.error?.message ||
            "Gemini could not generate the website. Please try again.",
        },
        {
          status: response.status === 429 ? 429 : 502,
        }
      );
    }

    // Read text from the Interactions API response.
    let generatedText = "";

    if (typeof result?.output_text === "string") {
      generatedText = result.output_text;
    } else if (Array.isArray(result?.output)) {
      generatedText = result.output
        .flatMap((item: { content?: Array<{ text?: string }> }) =>
          Array.isArray(item?.content) ? item.content : []
        )
        .map((part: { text?: string }) => part.text || "")
        .join("\n");
    }

    const html = generatedText
      .replace(/^```html\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    if (!html) {
      console.error("Gemini returned no text output.");

      return NextResponse.json(
        {
          error:
            "Gemini returned an empty response. Please try a different prompt.",
        },
        { status: 502 }
      );
    }

    if (!/<html[\s>]/i.test(html) || !/<body[\s>]/i.test(html)) {
      console.error("Gemini response was not a complete HTML document.");

      return NextResponse.json(
        {
          error:
            "The AI did not return a complete website. Please try again.",
        },
        { status: 502 }
      );
    }

    const titleMatch = html.match(
      /<title[^>]*>([\s\S]*?)<\/title>/i
    );

    const title =
      titleMatch?.[1]?.replace(/<[^>]*>/g, "").trim() ||
      "CreateX AI Website";

    return NextResponse.json({
      success: true,
      mode: "gemini",
      title: title.slice(0, 120),
      html,
      message: "Your AI-generated website is ready!",
    });
  } catch (error) {
    console.error(
      "Website generation failed:",
      error instanceof Error ? error.message : "Unknown error"
    );

    return NextResponse.json(
      {
        error:
          "Unable to generate the website. Check your connection and try again.",
      },
      { status: 500 }
    );
  }
}
