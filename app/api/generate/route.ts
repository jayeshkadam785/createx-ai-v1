import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

interface GenerateRequest {
  prompt?: string;
}

const MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3.6-flash",
  "gemini-3.7-flash",
  "gemini-3.8-flash",
];

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
      return NextResponse.json(
        {
          error:
            "Gemini API key is missing. Check Vercel Environment Variables.",
        },
        { status: 500 }
      );
    }

    const input = `${SYSTEM_PROMPT}\n\nUser website request:\n${prompt}`;
    const errors: string[] = [];

    for (const model of MODELS) {
      try {
        console.log(`Trying Gemini model: ${model}`);

        const response = await fetch(
          "https://generativelanguage.googleapis.com/v1beta/interactions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": apiKey,
            },
            body: JSON.stringify({
              model,
              input,
              store: false,
            }),
            signal: AbortSignal.timeout(12000),
          }
        );

        const result = await response.json();

        if (!response.ok) {
          const message =
            result?.error?.message || "Unknown Gemini API error";

          console.error(`Gemini ${model} failed:`, {
            status: response.status,
            message,
          });

          if (
            response.status === 400 ||
            response.status === 401 ||
            response.status === 403
          ) {
            errors.push(`${model}: ${message}`);

            // These errors generally need configuration changes,
            // not another model name.
            if (
              response.status === 401 ||
              response.status === 403
            ) {
              break;
            }

            continue;
          }

          errors.push(`${model}: ${message}`);
          continue;
        }

        if (
          result?.status &&
          result.status !== "completed"
        ) {
          errors.push(
            `${model}: generation status ${result.status}`
          );
          continue;
        }

        let outputText = "";

        if (typeof result?.output_text === "string") {
          outputText = result.output_text;
        } else if (Array.isArray(result?.output)) {
          outputText = result.output
            .flatMap(
              (item: {
                content?: Array<{ text?: string }>;
              }) =>
                Array.isArray(item?.content)
                  ? item.content
                  : []
            )
            .map(
              (part: { text?: string }) =>
                part.text || ""
            )
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
          errors.push(`${model}: incomplete HTML response`);
          continue;
        }

        const titleMatch = html.match(
          /<title[^>]*>([\s\S]*?)<\/title>/i
        );

        const title =
          titleMatch?.[1]
            ?.replace(/<[^>]*>/g, "")
            .trim() || "CreateX AI Website";

        return NextResponse.json({
          success: true,
          mode: "gemini",
          model,
          title: title.slice(0, 120),
          html,
          message: "Your AI-generated website is ready!",
        });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Request failed";

        console.error(
          `Gemini ${model} request failed:`,
          message
        );

        errors.push(`${model}: ${message}`);
      }
    }

    console.error("Gemini model attempts failed:", errors);

    return NextResponse.json(
      {
        error:
          "Website generation failed for all configured Gemini models. Check the Vercel Function Logs for the actual error. Verify model availability, API key permissions and quota in Google AI Studio.",
      },
      { status: 503 }
    );
  } catch (error) {
    console.error("Website generation failed:", error);

    return NextResponse.json(
      {
        error:
          "Unable to generate the website. Please try again.",
      },
      { status: 500 }
    );
  }
}
