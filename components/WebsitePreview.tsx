"use client";

import { useState } from "react";
import { Monitor, Smartphone, RefreshCw, Globe } from "lucide-react";

interface WebsitePreviewProps {
  title?: string;
  html?: string;
}

export default function WebsitePreview({
  title = "Website Preview",
  html,
}: WebsitePreviewProps) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

  return (
    <section className="rounded-2xl border border-white/10 bg-[#151621] p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-bold text-white">{title}</h2>
          <p className="mt-1 text-xs text-gray-400">
            Preview your website design
          </p>
        </div>

        <div className="flex gap-2">
          <button
            aria-label="Desktop preview"
            onClick={() => setDevice("desktop")}
            className={`rounded-lg p-2 ${
              device === "desktop"
                ? "bg-blue-500/20 text-blue-400"
                : "text-gray-400 hover:bg-white/5"
            }`}
          >
            <Monitor size={18} />
          </button>

          <button
            aria-label="Mobile preview"
            onClick={() => setDevice("mobile")}
            className={`rounded-lg p-2 ${
              device === "mobile"
                ? "bg-blue-500/20 text-blue-400"
                : "text-gray-400 hover:bg-white/5"
            }`}
          >
            <Smartphone size={18} />
          </button>

          <button
            aria-label="Refresh preview"
            onClick={() => window.location.reload()}
            className="rounded-lg p-2 text-gray-400 hover:bg-white/5"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      <div className="flex justify-center rounded-xl bg-[#0b0c12] p-3 md:p-5">
        <div
          className={`overflow-hidden rounded-lg border border-gray-200 bg-white transition-all ${
            device === "mobile" ? "w-[320px]" : "w-full"
          }`}
        >
          {html ? (
            <iframe
              title="Generated website preview"
              srcDoc={html}
              sandbox=""
              className="h-[480px] w-full border-0"
            />
          ) : (
            <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center text-gray-800">
              <Globe size={38} className="text-blue-600" />

              <h3 className="mt-4 text-xl font-bold">
                Your website preview
              </h3>

              <p className="mt-2 max-w-sm text-sm text-gray-500">
                Enter a website prompt in the dashboard to start creating.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
