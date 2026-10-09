"use client";

import { useState } from "react";
import { Sparkles, ArrowRight } from "lucide-react";

interface HeroSectionProps {
  onGenerate: (prompt: string) => void;
}

export default function HeroSection({ onGenerate }: HeroSectionProps) {
  const [prompt, setPrompt] = useState("");

  const suggestions = [
    "Create a restaurant website",
    "Build a portfolio",
    "Design a gym website",
  ];

  function handleGenerate() {
    if (!prompt.trim()) return;

    onGenerate(prompt.trim());
  }

  return (
    <section className="relative overflow-hidden rounded-2xl border border-blue-400/20 bg-gradient-to-br from-blue-950 via-[#20143e] to-[#151525] p-6 md:p-9">
      <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />

      <div className="relative z-10 max-w-3xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-blue-200">
          <Sparkles size={14} />
          AI-powered creation platform
        </span>

        <h2 className="mt-5 text-3xl font-bold leading-tight text-white md:text-4xl">
          Turn your ideas into
          <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            something amazing.
          </span>
        </h2>

        <p className="mt-3 max-w-xl text-sm leading-6 text-gray-300">
          Describe what you want to create. CreateX AI helps you turn your idea
          into a website and digital content.
        </p>

        <div className="mt-7 rounded-xl border border-white/15 bg-black/20 p-3">
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Describe your website idea..."
            rows={3}
            className="w-full resize-y bg-transparent p-2 text-sm text-white outline-none placeholder:text-gray-400"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3">
            <span className="text-xs text-gray-400">
              Describe your idea in simple English.
            </span>

            <button
              onClick={handleGenerate}
              disabled={!prompt.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Generate <ArrowRight size={16} />
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => setPrompt(suggestion)}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-300 hover:bg-white/10"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
