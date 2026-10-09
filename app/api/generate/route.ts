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

    // V1 demo mode: no paid AI API required.
    const safeTitle = prompt
      .replace(/[<>]/g, "")
      .slice(0, 80);

    const escapeHtml = (value: string) =>
      value.replace(/[&<>"']/g, (character) => {
        const entities: Record<string, string> = {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        };

        return entities[character];
      });

    const title = escapeHtml(safeTitle);
    const description = escapeHtml(prompt);

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Arial, sans-serif;
      color: #172033;
      background: #f5f7ff;
    }
    header {
      padding: 22px 8%;
      background: #ffffff;
      border-bottom: 1px solid #e5e7eb;
      font-size: 22px;
      font-weight: bold;
    }
    main {
      max-width: 900px;
      margin: 80px auto;
      padding: 40px 24px;
      text-align: center;
    }
    h1 {
      font-size: clamp(32px, 6vw, 58px);
      margin-bottom: 20px;
    }
    p {
      color: #5b6475;
      font-size: 18px;
      line-height: 1.7;
    }
    a {
      display: inline-block;
      margin-top: 22px;
      padding: 14px 24px;
      background: #5b4bff;
      color: white;
      text-decoration: none;
      border-radius: 10px;
    }
  </style>
</head>
<body>
  <header>${title}</header>
  <main>
    <h1>${title}</h1>
    <p>${description}</p>
    <a href="#about">Explore More</a>
    <section id="about">
      <h2>Welcome to our website</h2>
      <p>This is your CreateX AI demo website. Customize it as your project grows.</p>
    </section>
  </main>
</body>
</html>`;

    return NextResponse.json({
      success: true,
      mode: "demo",
      title: safeTitle,
      html,
      message: "Demo website created successfully.",
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to generate the website. Please try again." },
      { status: 500 }
    );
  }
}
