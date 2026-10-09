"use client";

import { Zap, ArrowRight, Globe, Sparkles } from "lucide-react";

export default function RightSidebar() {
  return (
    <aside className="space-y-5">
      <section className="rounded-2xl border border-white/10 bg-[#151621] p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-white">Your Plan</h2>
          <Zap size={20} className="text-yellow-400" />
        </div>

        <p className="mt-3 text-2xl font-bold text-white">Free Plan</p>

        <p className="mt-2 text-sm text-gray-400">
          Get started with your first AI creation.
        </p>

        <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
        </div>

        <p className="mt-2 text-xs text-gray-500">
          Usage indicator — demo only
        </p>

        <button className="mt-4 w-full rounded-lg border border-white/10 py-2.5 text-sm text-white hover:bg-white/5">
          Explore plans
        </button>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#151621] p-5">
        <h2 className="font-semibold text-white">Popular Templates</h2>

        {["Startup Landing Page", "Creative Portfolio", "Restaurant Website"].map(
          (template) => (
            <button
              key={template}
              className="mt-3 flex w-full items-center gap-3 rounded-lg border border-white/5 p-3 text-left hover:bg-white/5"
            >
              <div className="rounded-lg bg-purple-500/10 p-2 text-purple-400">
                <Globe size={18} />
              </div>

              <span className="flex-1 text-sm text-gray-300">{template}</span>

              <ArrowRight size={15} className="text-gray-500" />
            </button>
          ),
        )}
      </section>

      <section className="rounded-2xl border border-purple-400/20 bg-gradient-to-br from-purple-950/60 to-blue-950/60 p-5">
        <Sparkles size={25} className="text-purple-300" />

        <h2 className="mt-3 font-bold text-white">
          Have an idea?
        </h2>

        <p className="mt-2 text-sm leading-5 text-gray-300">
          Start with a prompt and turn your idea into a digital project.
        </p>

        <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 py-2.5 text-sm font-semibold text-white hover:bg-purple-500">
          Create Now <ArrowRight size={16} />
        </button>
      </section>
    </aside>
  );
}
