"use client";

import { Bell, Search, ChevronDown } from "lucide-react";

export default function DashboardHeader() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-6 py-4">
      <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 md:max-w-xl">
        <Search size={19} className="shrink-0 text-gray-400" />

        <input
          type="text"
          placeholder="Search projects, tools, templates..."
          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
        />

        <span className="hidden rounded border border-white/10 px-2 py-1 text-xs text-gray-500 md:inline">
          Ctrl K
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button
          aria-label="Notifications"
          className="relative rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white"
        >
          <Bell size={20} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-500" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 font-bold">
            J
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-white">Jayesh</p>
            <p className="text-xs text-gray-400">Free Plan</p>
          </div>

          <ChevronDown size={16} className="text-gray-400" />
        </div>
      </div>
    </header>
  );
}
