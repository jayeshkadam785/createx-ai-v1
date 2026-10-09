"use client";

import {
  Home,
  Globe,
  Image,
  Video,
  Mic,
  FileText,
  Megaphone,
  Search,
  FolderOpen,
  Settings,
  Rocket,
  Sparkles,
  LayoutTemplate,
  Code2,
} from "lucide-react";

const navigation = [
  { label: "Dashboard", icon: Home },
  { label: "Websites", icon: Globe },
  { label: "Apps", icon: Code2 },
  { label: "Images", icon: Image },
  { label: "Videos", icon: Video },
  { label: "Voice", icon: Mic },
  { label: "AI Content", icon: FileText },
  { label: "Marketing", icon: Megaphone },
  { label: "SEO Assistant", icon: Search },
  { label: "My Projects", icon: FolderOpen },
  { label: "Templates", icon: LayoutTemplate },
];

export default function Sidebar() {
  return (
    <aside className="flex min-h-screen w-64 flex-col border-r border-white/10 bg-[#10111b] p-5 text-white">
      <div className="mb-9 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
          <Sparkles size={23} />
        </div>

        <div>
          <h1 className="text-lg font-bold">CreateX AI</h1>
          <p className="text-xs text-gray-400">Create without limits</p>
        </div>
      </div>

      <button className="mb-7 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 font-semibold">
        <Sparkles size={18} />
        Create with AI
      </button>

      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
        Workspace
      </p>

      <nav className="flex-1 space-y-1">
        {navigation.map(({ label, icon: Icon }, index) => (
          <button
            key={label}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
              index === 0
                ? "bg-blue-500/15 text-blue-400"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </nav>

      <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <Rocket size={21} className="mb-3 text-purple-400" />
        <h3 className="font-semibold">Upgrade your plan</h3>
        <p className="mt-2 text-xs leading-5 text-gray-400">
          Unlock more AI generations and advanced creation tools.
        </p>

        <button className="mt-3 w-full rounded-lg bg-white/10 py-2 text-sm hover:bg-white/15">
          Explore plans
        </button>
      </div>

      <button className="mt-5 flex items-center gap-3 px-2 text-sm text-gray-400 hover:text-white">
        <Settings size={18} />
        Settings
      </button>
    </aside>
  );
}
