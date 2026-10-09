import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

interface GenerateRequest {
  prompt?: string; 
}

const MODEL = "gemini-3.5-flash";

const SYSTEM_PROMPT = `
You are CreateX AI, an expert website generator.

Generate a complete, attractive, responsive website using HTML and CSS.

Requirements:
- Return ONLY a complete HTML document.
- Include CSS inside a style tag.
- Do not use Markdown code fences.
- Include a navbar, hero section, useful content sections and footer.
- Use modern typography, spacing, colors, cards and buttons.
- Make the website responsive on mobile, tablet and desktop.
- Include realistic sample content relevant to the user's request.
- Use accessible HTML and readable CSS.
- Do not include scripts that access cookies, credentials,
  browser storage or external APIs.
- Do not claim that features work if they are only visual demonstrations.
- Start with <!DOCTYPE html> and include html, head and body elements.
`;

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
      console.error("GEMINI_API_KEY is missing.");

      return NextResponse.json(
        {
          error:
            "Gemini API key is missing. Check Vercel Environment Variables.",
        },
        { status: 500 }
      );
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/interactions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          model: MODEL,
          input: `${SYSTEM_PROMPT}\n\nUser website request:\n${prompt}`,
          store: false,
        }),
        signal: AbortSignal.timeout(45000),
      }
    );

    const rawResponse = await response.text();

    let result: any;

    try {
      result = JSON.parse(rawResponse);
    } catch {
      result = {};
    }

    if (!response.ok) {
      const apiMessage =
        result?.error?.message ||
        result?.message ||
        rawResponse.slice(0, 1000) ||
        "Unknown Gemini API error";

      // Do not log the API key or request headers.
      console.error("Gemini API request failed:", {
        status: response.status,
        model: MODEL,
        message: apiMessage,
      });

      const status =
        response.status === 429 ? 429 :
        response.status === 401 || response.status === 403 ? 502 :
        response.status === 400 ? 502 :
        response.status >= 500 ? 502 : 502;

      return NextResponse.json(
        {
          error:
            response.status === 429
              ? "Gemini rate limit or quota reached. Check your Google AI Studio usage and try again later."
              : response.status === 401 || response.status === 403
              ? "Gemini rejected the API key or access. Check your key and model permissions."
              : "Gemini API request failed. Check Vercel Function Logs for details.",
          details:
            process.env.NODE_ENV === "development"
              ? apiMessage
              : undefined,
        },
        { status }
      );
    }

    if (result?.status && result.status !== "completed") {
      console.error("Gemini interaction did not complete:", {
        status: result.status,
        model: MODEL,
        errors: result?.errors,
      });

      return NextResponse.json(
        {
          error:
            "Gemini did not complete the generation. Check Vercel Function Logs.",
        },
        { status: 502 }
      );
    }

    let outputText = "";

    if (typeof result?.output_text === "string") {
      outputText = result.output_text;
    } else if (Array.isArray(result?.output)) {
      outputText = result.output
        .flatMap((item: any) =>
          Array.isArray(item?.content) ? item.content : []
        )
        .map((part: any) => part?.text || "")
        .join("\n");
    }

    const html = outputText
      .replace(/^```html\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    if (
      !html ||
      !/<html[\s>]/i.test(html) ||
      !/<body[\s>]/i.test(html)
    ) {
      console.error("Gemini returned incomplete HTML.", {
        model: MODEL,
        outputLength: outputText.length,
      });

      return NextResponse.json(
        {
          error:
            "Gemini responded, but the website HTML was incomplete. Please try again.",
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
      model: MODEL,
      title: title.slice(0, 120),
      html,
      message: "Your AI-generated website is ready!",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown server error";

    console.error("Website generation exception:", message);

    return NextResponse.json(
      {
        error:
          message.includes("Timeout") ||
          message.includes("timed out") ||
          message.includes("abort")
            ? "Gemini took too long to respond. Please try again."
            : "Unable to generate the website. Check Vercel Function Logs.",
      },
      { status: 500 }
    );
  }
}
