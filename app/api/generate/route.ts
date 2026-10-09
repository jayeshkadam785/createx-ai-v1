import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

interface GenerateRequest {
  prompt?: string;
}

const MODEL = "gemini-3.5-flash";
const API_URL =
  "https://generativelanguage.googleapis.com/v1beta/interactions";

const MAX_OUTPUT_TOKENS = 20000;
const MAX_CONTINUATIONS = 2;

const SYSTEM_PROMPT = `
You are CreateX AI, an expert website generator.

Your task is to generate a complete, attractive, responsive website.

STRICT REQUIREMENTS:
- Return ONLY a complete HTML document.
- Start with <!DOCTYPE html>.
- Include <html>, <head>, <body>, and their closing tags.
- Include CSS inside a <style> tag.
- Put JavaScript inside a <script> tag only when needed.
- Include a navbar, hero section, useful content sections, and footer.
- Use modern typography, spacing, colors, cards, and buttons.
- Make the website responsive on mobile, tablet, and desktop.
- Include realistic sample content relevant to the user's request.
- Use semantic and accessible HTML.
- Do not use Markdown code fences.
- Do not omit sections or use placeholder comments.
- Do not claim features work when they are only visual demonstrations.
- Do not include scripts that access cookies, credentials, browser storage, or external APIs.
- Avoid unnecessary external dependencies.
- Keep the implementation concise enough to finish completely.
- Check that all HTML tags and JavaScript blocks are closed.
- Output the complete HTML, not an explanation.
`;

function extractOutputText(result: any): string {
  if (typeof result?.output_text === "string") {
    return result.output_text;
  }

  if (Array.isArray(result?.output)) {
    return result.output
      .flatMap((item: any) =>
        Array.isArray(item?.content) ? item.content : []
      )
      .map((part: any) =>
        typeof part?.text === "string" ? part.text : ""
      )
      .filter(Boolean)
      .join("\n");
  }

  return "";
}

function cleanHtml(text: string): string {
  return text
    .replace(/^```(?:html)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();
}

function isCompleteHtml(html: string): boolean {
  return Boolean(
    html &&
      /<!doctype\s+html/i.test(html) &&
      /<html(?:\s[^>]*)?>/i.test(html) &&
      /<head(?:\s[^>]*)?>/i.test(html) &&
      /<\/head\s*>/i.test(html) &&
      /<body(?:\s[^>]*)?>/i.test(html) &&
      /<\/body\s*>/i.test(html) &&
      /<\/html\s*>/i.test(html)
  );
}

async function callGemini(
  apiKey: string,
  payload: Record<string, unknown>
): Promise<{ response: Response; result: any }> {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(45000),
    cache: "no-store",
  });

  const rawResponse = await response.text();

  let result: any;

  try {
    result = JSON.parse(rawResponse);
  } catch {
    result = {
      message: rawResponse.slice(0, 1000),
    };
  }

  return { response, result };
}

export async function POST(request: Request) {
  try {
    let body: GenerateRequest;

    try {
      body = (await request.json()) as GenerateRequest;
    } catch {
      return NextResponse.json(
        { error: "Invalid request. Please try again." },
        { status: 400 }
      );
    }

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

    const initialInput = `${SYSTEM_PROMPT}

Generate a complete, self-contained HTML website for this request:

${prompt}

Final checklist:
1. Include the complete HTML document.
2. Include all required CSS in the document.
3. Close the head, body, and html tags.
4. Return only HTML.
`;

    let { response, result } = await callGemini(apiKey, {
      model: MODEL,
      input: initialInput,
      store: false,
      generation_config: {
        max_output_tokens: MAX_OUTPUT_TOKENS,
        thinking_level: "minimal",
      },
    });

    if (!response.ok) {
      const apiMessage =
        result?.error?.message ||
        result?.message ||
        "Unknown Gemini API error";

      console.error("Gemini API request failed:", {
        status: response.status,
        model: MODEL,
        message: apiMessage,
      });

      if (response.status === 429) {
        return NextResponse.json(
          {
            error:
              "Gemini quota or rate limit reached. Check Google AI Studio usage and try again later.",
          },
          { status: 429 }
        );
      }

      if (response.status === 401 || response.status === 403) {
        return NextResponse.json(
          {
            error:
              "Gemini rejected the API key or access. Check your Vercel environment variable and model access.",
          },
          { status: 502 }
        );
      }

      return NextResponse.json(
        {
          error:
            "Gemini API request failed. Check the Vercel Function Logs.",
          details:
            process.env.NODE_ENV === "development"
              ? apiMessage
              : undefined,
        },
        { status: 502 }
      );
    }

    console.log("Gemini initial status:", result?.status);
    console.log(
      "Gemini continuation available:",
      Boolean(result?.continuation_token)
    );

    let outputText = extractOutputText(result);
    let html = cleanHtml(outputText);
    let continuationCount = 0;

    /*
     * Continue only when Gemini explicitly reports an incomplete response
     * and provides a continuation token.
     */
    while (
      !isCompleteHtml(html) &&
      result?.status === "incomplete" &&
      typeof result?.continuation_token === "string" &&
      result.continuation_token.length > 0 &&
      continuationCount < MAX_CONTINUATIONS
    ) {
      continuationCount++;

      console.log("Continuing Gemini output:", {
        model: MODEL,
        attempt: continuationCount,
      });

      const continuation = await callGemini(apiKey, {
        model: MODEL,
        continuation_token: result.continuation_token,
        input:
          "Continue the previous HTML output from exactly where it stopped. " +
          "Do not repeat the beginning. Finish all remaining HTML, CSS, and JavaScript. " +
          "Close the head, body, and html tags. Return only the continuation text.",
        store: false,
        generation_config: {
          max_output_tokens: MAX_OUTPUT_TOKENS,
          thinking_level: "minimal",
        },
      });

      response = continuation.response;
      result = continuation.result;

      if (!response.ok) {
        console.error("Gemini continuation request failed:", {
          status: response.status,
          model: MODEL,
          attempt: continuationCount,
          message:
            result?.error?.message ||
            result?.message ||
            "Unknown error",
        });

        break;
      }

      const continuationText = extractOutputText(result);

      if (continuationText) {
        outputText += "\n" + continuationText;
        html = cleanHtml(outputText);
      }

      console.log("Gemini continuation status:", result?.status);
      console.log("Gemini output length:", outputText.length);

      if (result?.status === "completed") {
        break;
      }
    }

    html = cleanHtml(outputText);

    if (!isCompleteHtml(html)) {
      console.error("Gemini returned incomplete HTML:", {
        model: MODEL,
        status: result?.status,
        outputLength: outputText.length,
        continuationCount,
        continuationAvailable: Boolean(result?.continuation_token),
      });

      return NextResponse.json(
        {
          error:
            "Gemini could not finish the website HTML. Try a shorter prompt or try again.",
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

    const isTimeout =
      message.toLowerCase().includes("timeout") ||
      message.toLowerCase().includes("timed out") ||
      message.toLowerCase().includes("abort");

    return NextResponse.json(
      {
        error: isTimeout
          ? "Gemini took too long to respond. Please try again."
          : "Unable to generate the website. Check Vercel Function Logs.",
      },
      { status: isTimeout ? 504 : 500 }
    );
  }
}
