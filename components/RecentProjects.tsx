"use client";

import { ExternalLink, Globe, Clock } from "lucide-react";

const projects = [
  {
    name: "Bakery Website",
    type: "Website",
    updated: "Just now",
    status: "Draft",
  },
  {
    name: "Personal Portfolio",
    type: "Website",
    updated: "Yesterday",
    status: "Draft",
  },
  {
    name: "Startup Landing Page",
    type: "Website",
    updated: "2 days ago",
    status: "Draft",
  },
];

export default function RecentProjects() {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#151621] p-5">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">Recent Projects</h2>

        <button className="text-sm text-blue-400 hover:text-blue-300">
          View all
        </button>
      </div>

      <div className="space-y-3">
        {projects.map((project) => (
          <div
            key={project.name}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/5 p-3 hover:bg-white/[0.03]"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/10 p-3 text-blue-400">
                <Globe size={20} />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white">
                  {project.name}
                </h3>

                <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                  <Clock size={12} />
                  {project.updated}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs text-yellow-400">
                {project.status}
              </span>

              <button aria-label={`Open ${project.name}`}>
                <ExternalLink size={16} className="text-gray-400" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
