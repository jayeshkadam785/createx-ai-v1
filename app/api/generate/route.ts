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

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(safeTitle)}</title>
  <style>
    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      font-family: Arial, sans-serif;
      color: #172033;
      background: #f8fafc;
    }

    nav {
      padding: 22px 8%;
      background: white;
      border-bottom: 1px solid #e5e7eb;
      font-size: 20px;
      font-weight: bold;
    }

    main {
      max-width: 1000px;
      margin: 70px auto;
      padding: 30px;
      text-align: center;
    }

    .hero {
      padding: 70px 25px;
      border-radius: 24px;
      color: white;
      background: linear-gradient(135deg, #2563eb, #7c3aed);
    }

    h1 {
      font-size: clamp(30px, 5vw, 54px);
      overflow-wrap: anywhere;
    }

    p {
      line-height: 1.7;
      overflow-wrap: anywhere;
    }

    .button {
      display: inline-block;
      margin-top: 20px;
      padding: 14px 24px;
      border-radius: 10px;
      background: white;
      color: #4338ca;
      text-decoration: none;
      font-weight: bold;
    }

    #about {
      padding: 45px 15px;
    }

    footer {
      padding: 25px;
      text-align: center;
      color: #64748b;
    }
  </style>
</head>
<body>
  <nav>CreateX AI</nav>

  <main>
    <section class="hero">
      <h1>${escapeHtml(safeTitle)}</h1>
      <p>Your idea deserves a great online presence.</p>
      <p>Website concept created with CreateX AI.</p>
      <a class="button" href="#about">Explore More</a>
    </section>

    <section id="about">
      <h2>Built Around Your Idea</h2>
      <p>${escapeHtml(prompt)}</p>
    </section>
  </main>

  <footer>Created with CreateX AI</footer>
</body>
</html>`;

    return NextResponse.json({
      success: true,
      mode: "demo",
      title: safeTitle,
      html,
      message: "Demo website created successfully."
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request. Please try again." },
      { status: 400 }
    );
  }
}

function escapeHtml(value: string): string {
  const entities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  };

  return value.replace(/[&<>"']/g, (character) => {
    return entities[character];
  });
}
