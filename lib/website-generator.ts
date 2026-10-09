export interface GenerateWebsiteResult {
  success: boolean;
  html?: string;
  error?: string;
}

export async function generateWebsite(
  prompt: string,
): Promise<GenerateWebsiteResult> {
  if (!prompt.trim()) {
    return {
      success: false,
      error: "Please enter a website description.",
    };
  }

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || "Website generation failed.",
      };
    }

    return {
      success: true,
      ...data,
    };
  } catch {
    return {
      success: false,
      error: "Unable to connect to the generation server.",
    };
  }
}
