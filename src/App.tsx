import { useState, useEffect, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Settings {
  filterKeywords: string[];
  blockedKeywords: string[];
  whitelistedChannels: string[];
  hideShorts: boolean;
  focusMode: boolean;
  filterEnabled: boolean;
}

type TabId = "filters" | "blocked" | "channels" | "settings" | "install" | "code";



// ─── Chip Component ───────────────────────────────────────────────────────────
function Chip({
  label,
  onRemove,
  variant = "default",
}: {
  label: string;
  onRemove: () => void;
  variant?: "default" | "blocked" | "channel";
}) {
  const [removing, setRemoving] = useState(false);

  const handleRemove = () => {
    setRemoving(true);
    setTimeout(onRemove, 180);
  };

  const variantStyles = {
    default:
      "border-red-500/20 bg-red-500/5 text-gray-200 hover:border-red-500/40",
    blocked:
      "border-orange-500/20 bg-orange-900/20 text-gray-200 hover:border-orange-500/40",
    channel:
      "border-green-500/20 bg-green-500/5 text-gray-200 hover:border-green-500/40",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium transition-all duration-150
        ${variantStyles[variant]}
        ${removing ? "opacity-0 scale-90" : "opacity-100 scale-100"}
      `}
    >
      {label}
      <button
        onClick={handleRemove}
        className="flex items-center justify-center w-3.5 h-3.5 rounded-full text-gray-500 hover:text-red-400 hover:bg-red-500/15 transition-colors duration-150"
      >
        <svg
          width="8"
          height="8"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        >
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </span>
  );
}

// ─── Toggle Switch ────────────────────────────────────────────────────────────
function Toggle({
  checked,
  onChange,
  small = false,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  small?: boolean;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative rounded-full border transition-all duration-200 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-red-500/40
        ${small ? "w-9 h-5" : "w-11 h-6"}
        ${
          checked
            ? "bg-red-600/20 border-red-500"
            : "bg-[#252535] border-white/10"
        }
      `}
    >
      <span
        className={`absolute top-1/2 -translate-y-1/2 rounded-full transition-all duration-200 shadow-md
          ${small ? "w-3.5 h-3.5" : "w-4 h-4"}
          ${
            checked
              ? `${small ? "left-[calc(100%-17px)]" : "left-[calc(100%-20px)]"} bg-red-500 shadow-red-500/50`
              : `left-0.5 bg-gray-500`
          }
        `}
        style={
          checked
            ? { boxShadow: "0 0 8px rgba(255,0,0,0.6)" }
            : {}
        }
      />
    </button>
  );
}

// ─── Add Input Row ─────────────────────────────────────────────────────────────
function AddInputRow({
  placeholder,
  onAdd,
  btnLabel,
  btnVariant = "primary",
}: {
  placeholder: string;
  onAdd: (val: string) => void;
  btnLabel: string;
  btnVariant?: "primary" | "danger" | "success";
}) {
  const [value, setValue] = useState("");
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    const trimmed = value.trim();
    if (!trimmed) {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }
    onAdd(trimmed);
    setValue("");
    inputRef.current?.focus();
  };

  const btnStyles = {
    primary:
      "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20 hover:shadow-red-500/30",
    danger:
      "bg-red-900/70 hover:bg-red-900 text-red-200 border border-red-500/30 hover:border-red-500/60",
    success:
      "bg-green-900/70 hover:bg-green-900 text-green-200 border border-green-500/30 hover:border-green-500/60",
  };

  return (
    <div className="flex gap-2">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        placeholder={placeholder}
        maxLength={80}
        className={`flex-1 bg-[#0f0f1a] border border-white/8 text-gray-100 placeholder-gray-600 text-xs px-3 py-2 rounded-lg outline-none
          focus:border-red-500/40 focus:ring-2 focus:ring-red-500/10 transition-all duration-150
          ${shake ? "animate-shake border-red-500/60" : ""}
        `}
      />
      <button
        onClick={handleAdd}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap ${btnStyles[btnVariant]}`}
      >
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.8"
          strokeLinecap="round"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
        {btnLabel}
      </button>
    </div>
  );
}

// ─── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({
  value,
  label,
  accent,
}: {
  value: number;
  label: string;
  accent?: "red" | "green";
}) {
  const colors = {
    red: "text-red-400",
    green: "text-green-400",
    default: "text-gray-100",
  };
  return (
    <div className="bg-[#1a1a2a] border border-white/7 rounded-xl p-3 text-center hover:border-white/14 transition-colors duration-150">
      <span
        className={`block text-2xl font-bold leading-none mb-1 ${colors[accent ?? "default"]}`}
      >
        {value}
      </span>
      <span className="block text-[9px] font-semibold uppercase tracking-widest text-gray-500">
        {label}
      </span>
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({
  icon,
  title,
  hint,
}: {
  icon: string;
  title: string;
  hint: string;
}) {
  return (
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-100">
        <span className="text-base">{icon}</span>
        {title}
      </div>
      <span className="text-[10px] text-gray-500 italic mt-0.5">{hint}</span>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({
  icon,
  title,
  sub,
}: {
  icon: string;
  title: string;
  sub: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-6 text-center gap-2">
      <span className="text-4xl opacity-40">{icon}</span>
      <p className="text-xs font-medium text-gray-400">{title}</p>
      <p className="text-[11px] text-gray-600">{sub}</p>
    </div>
  );
}

// ─── PopupPreview ─────────────────────────────────────────────────────────────
function PopupPreview() {
  const [settings, setSettings] = useState<Settings>({
    filterKeywords: ["python", "web development", "machine learning"],
    blockedKeywords: ["prank", "drama"],
    whitelistedChannels: ["fireship", "freecodecamp"],
    hideShorts: true,
    focusMode: false,
    filterEnabled: true,
  });
  const [activeTab, setActiveTab] = useState<
    "filters" | "blocked" | "channels" | "settings"
  >("filters");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs: { id: "filters" | "blocked" | "channels" | "settings"; label: string }[] =
    [
      { id: "filters", label: "Filters" },
      { id: "blocked", label: "Blocked" },
      { id: "channels", label: "Channels" },
      { id: "settings", label: "Settings" },
    ];

  const addItem = (field: keyof Settings) => (val: string) => {
    const arr = settings[field] as string[];
    const lower = val.toLowerCase();
    if (!arr.includes(lower)) {
      setSettings((s) => ({ ...s, [field]: [...arr, lower] }));
    }
  };

  const removeItem = (field: keyof Settings, item: string) => {
    setSettings((s) => ({
      ...s,
      [field]: (s[field] as string[]).filter((i) => i !== item),
    }));
  };

  return (
    <div
      className="flex flex-col bg-[#121212] rounded-2xl overflow-hidden shadow-2xl"
      style={{ width: 380, minHeight: 520, fontFamily: "'Segoe UI', system-ui, sans-serif" }}
    >
      {/* Header */}
      <div className="relative flex items-center justify-between px-4 py-3.5 bg-[#1E1E2E] border-b border-white/7">
        <div
          className="absolute bottom-0 left-4 right-4 h-px opacity-40"
          style={{
            background:
              "linear-gradient(90deg, #FF0000 0%, transparent 100%)",
          }}
        />
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span
              className="text-red-500 text-sm"
              style={{ textShadow: "0 0 8px rgba(255,0,0,0.6)" }}
            >
              ▶
            </span>
            <span className="text-sm font-bold text-gray-100 tracking-tight">
              Filter<span className="text-red-500">Tube</span>
            </span>
          </div>
          <span className="text-[9px] font-semibold text-gray-500 bg-[#252535] border border-white/7 px-1.5 py-0.5 rounded-full tracking-wider">
            v1.0
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <button className="flex items-center justify-center w-7 h-7 rounded-lg border border-white/7 text-gray-500 hover:text-gray-300 hover:bg-[#252535] transition-all duration-150">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
          </button>
          <Toggle
            small
            checked={settings.filterEnabled}
            onChange={(v) => setSettings((s) => ({ ...s, filterEnabled: v }))}
          />
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-[#1E1E2E] border-b border-white/5 text-[11px] text-gray-400 font-medium">
        <span
          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
            settings.filterEnabled
              ? "bg-green-400 shadow-[0_0_6px_#22c55e] animate-pulse"
              : "bg-gray-600"
          }`}
        />
        {settings.filterEnabled
          ? "Active — Filtering YouTube"
          : "Disabled — Click toggle to enable"}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 px-3 py-3">
        <StatCard value={settings.filterKeywords.length} label="Filter Words" />
        <StatCard
          value={settings.blockedKeywords.length}
          label="Blocked Words"
          accent="red"
        />
        <StatCard
          value={settings.whitelistedChannels.length}
          label="Whitelisted"
          accent="green"
        />
      </div>

      {/* Tab nav */}
      <div className="flex px-3 gap-0.5">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 py-1.5 text-[11.5px] font-medium rounded-t-lg border-b-2 transition-all duration-150
              ${
                activeTab === t.id
                  ? "border-red-500 text-gray-100 bg-[#1E1E2E]"
                  : "border-transparent text-gray-500 hover:text-gray-300 hover:bg-[#252535]/50"
              }
            `}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 bg-[#1E1E2E] border-t border-white/7 px-3 py-3.5">
        {/* FILTERS */}
        {activeTab === "filters" && (
          <div className="animate-fadeIn">
            <SectionHeader
              icon="🎯"
              title="Filter Keywords"
              hint="Show only matching videos"
            />
            <div className="mb-3">
              <AddInputRow
                placeholder="e.g. Python, AI, Web Dev..."
                onAdd={addItem("filterKeywords")}
                btnLabel="Add"
                btnVariant="primary"
              />
            </div>
            {settings.filterKeywords.length === 0 ? (
              <EmptyState
                icon="🔍"
                title="No filter keywords yet"
                sub="Add keywords to show only matching videos."
              />
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {settings.filterKeywords.map((kw) => (
                  <Chip
                    key={kw}
                    label={kw}
                    variant="default"
                    onRemove={() => removeItem("filterKeywords", kw)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* BLOCKED */}
        {activeTab === "blocked" && (
          <div className="animate-fadeIn">
            <SectionHeader
              icon="🚫"
              title="Blocked Keywords"
              hint="Hide videos with these words"
            />
            <div className="mb-3">
              <AddInputRow
                placeholder="e.g. Prank, Gossip, Drama..."
                onAdd={addItem("blockedKeywords")}
                btnLabel="Block"
                btnVariant="danger"
              />
            </div>
            {settings.blockedKeywords.length === 0 ? (
              <EmptyState
                icon="🛡️"
                title="No blocked keywords yet"
                sub="Block keywords to never see matching videos."
              />
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {settings.blockedKeywords.map((kw) => (
                  <Chip
                    key={kw}
                    label={kw}
                    variant="blocked"
                    onRemove={() => removeItem("blockedKeywords", kw)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* CHANNELS */}
        {activeTab === "channels" && (
          <div className="animate-fadeIn">
            <SectionHeader
              icon="⭐"
              title="Channel Whitelist"
              hint="Always show these channels"
            />
            <div className="mb-3">
              <AddInputRow
                placeholder="e.g. Fireship, Traversy Media..."
                onAdd={addItem("whitelistedChannels")}
                btnLabel="Add"
                btnVariant="success"
              />
            </div>
            {settings.whitelistedChannels.length === 0 ? (
              <EmptyState
                icon="📺"
                title="No whitelisted channels yet"
                sub="Whitelisted channels always show regardless of filters."
              />
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {settings.whitelistedChannels.map((ch) => (
                  <Chip
                    key={ch}
                    label={ch}
                    variant="channel"
                    onRemove={() => removeItem("whitelistedChannels", ch)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* SETTINGS */}
        {activeTab === "settings" && (
          <div className="animate-fadeIn space-y-2">
            {/* Hide Shorts */}
            <div className="flex items-center justify-between bg-[#1a1a2a] border border-white/7 rounded-xl p-3 hover:border-white/14 transition-colors duration-150">
              <div className="mr-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-100 mb-0.5">
                  <span>⚡</span> Hide YouTube Shorts
                </div>
                <p className="text-[10.5px] text-gray-500">
                  Remove Shorts shelves from all pages
                </p>
              </div>
              <Toggle
                checked={settings.hideShorts}
                onChange={(v) =>
                  setSettings((s) => ({ ...s, hideShorts: v }))
                }
              />
            </div>

            {/* Focus Mode */}
            <div className="flex items-center justify-between bg-[#1a1a2a] border border-white/7 rounded-xl p-3 hover:border-white/14 transition-colors duration-150">
              <div className="mr-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-100 mb-0.5">
                  <span>🎯</span> Focus Mode
                </div>
                <p className="text-[10.5px] text-gray-500">
                  Hide sidebar &amp; distracting recommendations
                </p>
              </div>
              <Toggle
                checked={settings.focusMode}
                onChange={(v) =>
                  setSettings((s) => ({ ...s, focusMode: v }))
                }
              />
            </div>

            {/* Divider */}
            <div className="flex items-center gap-2 py-1">
              <div className="flex-1 h-px bg-white/7" />
              <span className="text-[9px] font-semibold uppercase tracking-widest text-gray-600">
                Danger Zone
              </span>
              <div className="flex-1 h-px bg-white/7" />
            </div>

            <button
              onClick={() => {
                setSettings({
                  filterKeywords: [],
                  blockedKeywords: [],
                  whitelistedChannels: [],
                  hideShorts: false,
                  focusMode: false,
                  filterEnabled: true,
                });
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-500/8 hover:border-red-500/40 transition-all duration-150"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
              Reset All Settings
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 px-3 py-2.5 bg-[#121212] border-t border-white/7">
        <button
          onClick={handleSave}
          className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white text-[13px] font-semibold py-2.5 rounded-lg transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-500/30 active:translate-y-0"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
          Save Settings
        </button>
        <span
          className={`text-xs font-semibold text-green-400 transition-opacity duration-200 whitespace-nowrap ${
            saved ? "opacity-100" : "opacity-0"
          }`}
        >
          ✓ Saved!
        </span>
      </div>
    </div>
  );
}

// ─── Feature Card ─────────────────────────────────────────────────────────────
function FeatureCard({
  icon,
  title,
  description,
  badge,
}: {
  icon: string;
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <div className="group relative bg-[#1E1E2E] border border-white/7 rounded-2xl p-5 hover:border-red-500/30 hover:bg-[#1E1E2E]/80 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-red-500/5">
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        {badge && (
          <span className="text-[9px] font-bold uppercase tracking-wider text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </div>
      <h3 className="text-sm font-bold text-gray-100 mb-1.5">{title}</h3>
      <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
}

// ─── Filter Demo ──────────────────────────────────────────────────────────────
const DEMO_VIDEOS = [
  { title: "Build a Full Stack App with Python & FastAPI", channel: "Fireship", img: "🐍" },
  { title: "Try Not To Laugh Challenge – PRANK Edition", channel: "FunChannel", img: "😂" },
  { title: "Machine Learning Crash Course 2024", channel: "freeCodeCamp.org", img: "🤖" },
  { title: "Celebrity Drama – The Truth Exposed!", channel: "GossipTV", img: "🎭" },
  { title: "Web Development Full Course – HTML CSS JS", channel: "Traversy Media", img: "🌐" },
  { title: "AI Tools That Changed Everything", channel: "TechWith Tim", img: "⚡" },
  { title: "Top 10 Meme Compilation 2024", channel: "MemeLord", img: "🐸" },
  { title: "Python Async/Await Deep Dive", channel: "ArjanCodes", img: "🔄" },
];

function FilterDemo() {
  const [filterWords] = useState(["python", "machine learning", "web development", "ai"]);
  const [blockedWords] = useState(["prank", "drama", "meme", "celebrity"]);

  const getVideoState = (video: (typeof DEMO_VIDEOS)[0]) => {
    const combined = (video.title + " " + video.channel).toLowerCase();
    const isBlocked = blockedWords.some((w) => combined.includes(w));
    const isMatch = filterWords.some((w) => combined.includes(w));

    if (isBlocked) return "blocked";
    if (!isMatch) return "hidden";
    return "visible";
  };

  return (
    <div className="bg-[#0a0a12] border border-white/7 rounded-2xl overflow-hidden">
      <div className="px-4 py-3 bg-[#1E1E2E] border-b border-white/7 flex items-center gap-3">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
        </div>
        <span className="text-[10px] text-gray-500 font-medium">
          youtube.com — FilterTube Active 🟢
        </span>
      </div>
      <div className="p-4 grid grid-cols-2 gap-2.5">
        {DEMO_VIDEOS.map((video) => {
          const state = getVideoState(video);
          return (
            <div
              key={video.title}
              className={`relative bg-[#1a1a2a] border rounded-xl p-2.5 transition-all duration-300 ${
                state === "visible"
                  ? "border-green-500/20 opacity-100"
                  : state === "blocked"
                  ? "border-red-500/20 opacity-30 scale-95"
                  : "border-white/5 opacity-20 scale-95"
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-12 h-8 bg-[#252535] rounded-md flex items-center justify-center text-lg flex-shrink-0">
                  {video.img}
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] text-gray-300 font-medium leading-snug line-clamp-2">
                    {video.title}
                  </p>
                </div>
              </div>
              <p className="text-[9px] text-gray-500">{video.channel}</p>
              {state !== "visible" && (
                <div
                  className={`absolute inset-0 rounded-xl flex items-center justify-center ${
                    state === "blocked"
                      ? "bg-red-500/8"
                      : "bg-black/20"
                  }`}
                >
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      state === "blocked"
                        ? "bg-red-500/20 text-red-400 border border-red-500/30"
                        : "bg-black/30 text-gray-500 border border-white/10"
                    }`}
                  >
                    {state === "blocked" ? "🚫 Blocked" : "Hidden"}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="px-4 py-2.5 border-t border-white/5 flex items-center gap-4 text-[9px] font-medium">
        <span className="flex items-center gap-1.5 text-green-400">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full" /> Visible
        </span>
        <span className="flex items-center gap-1.5 text-red-400">
          <span className="w-1.5 h-1.5 bg-red-400 rounded-full" /> Blocked
        </span>
        <span className="flex items-center gap-1.5 text-gray-600">
          <span className="w-1.5 h-1.5 bg-gray-600 rounded-full" /> Hidden (no match)
        </span>
      </div>
    </div>
  );
}

// ─── Install Step ─────────────────────────────────────────────────────────────
function InstallStep({
  num,
  title,
  desc,
  code,
}: {
  num: number;
  title: string;
  desc: string;
  code?: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-sm font-bold text-red-400">
        {num}
      </div>
      <div className="flex-1 pb-5 border-b border-white/5 last:border-0">
        <h4 className="text-sm font-semibold text-gray-100 mb-1">{title}</h4>
        <p className="text-xs text-gray-500 mb-2">{desc}</p>
        {code && (
          <code className="block bg-[#0f0f1a] border border-white/8 rounded-lg px-3 py-2 text-[11px] text-green-400 font-mono">
            {code}
          </code>
        )}
      </div>
    </div>
  );
}

// ─── Code File Viewer ─────────────────────────────────────────────────────────
const CODE_SNIPPETS: Record<string, string> = {
  manifest: `{
  "manifest_version": 3,
  "name": "FilterTube",
  "version": "1.0.0",
  "description": "Take control of your YouTube experience.",
  "action": {
    "default_popup": "popup/popup.html"
  },
  "background": {
    "service_worker": "background/background.js",
    "type": "module"
  },
  "content_scripts": [{
    "matches": ["*://www.youtube.com/*"],
    "js": ["content/content.js"],
    "css": ["content/content.css"],
    "run_at": "document_idle"
  }],
  "permissions": ["storage", "activeTab"],
  "host_permissions": ["*://www.youtube.com/*"]
}`,

  filter: `// Core Filter Decision Engine
function shouldShowVideo(title, channel, settings) {
  const { filterKeywords, blockedKeywords,
          whitelistedChannels, filterEnabled } = settings;

  if (!filterEnabled) return true;

  const normChannel = normalize(channel);
  const combinedText = normalize(title) + ' ' + normChannel;

  // Rule 1: Whitelisted channel → always show
  if (whitelistedChannels.length > 0) {
    const whitelisted = whitelistedChannels.some(wc =>
      normChannel.includes(normalize(wc))
    );
    if (whitelisted) return true;
  }

  // Rule 2: Blocked keyword → always hide
  if (containsAny(combinedText, blockedKeywords)) return false;

  // Rule 3: Filter keywords → hide if no match
  if (filterKeywords.length > 0
      && !containsAny(combinedText, filterKeywords)) {
    return false;
  }

  return true; // Default: show
}`,

  observer: `// MutationObserver – Watch for Dynamic Content
const observer = new MutationObserver((mutations) => {
  const hasAddedNodes = mutations.some(m => m.addedNodes.length > 0);
  if (hasAddedNodes) debouncedFilter();
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

// Re-filter on YouTube SPA navigation
document.addEventListener('yt-navigate-finish', () => {
  setTimeout(runFilter, 500);
  setTimeout(runFilter, 1500);
});`,

  storage: `// Chrome Storage API Integration
async function loadSettings() {
  return new Promise((resolve) => {
    const defaults = {
      filterKeywords: [],
      blockedKeywords: [],
      whitelistedChannels: [],
      hideShorts: false,
      focusMode: false,
      filterEnabled: true,
    };
    chrome.storage.sync.get(defaults, resolve);
  });
}

// Live settings sync across all YouTube tabs
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'sync') return;
  Object.keys(changes).forEach(key => {
    currentSettings[key] = changes[key].newValue;
  });
  runFilter(); // Re-run immediately
});`,
};

function CodeViewer() {
  const [activeFile, setActiveFile] = useState<string>("manifest");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(CODE_SNIPPETS[activeFile] || "").then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const fileKeys = Object.keys(CODE_SNIPPETS);
  const fileLabels: Record<string, string> = {
    manifest: "manifest.json",
    filter: "utils/filter.js",
    observer: "MutationObserver",
    storage: "Chrome Storage",
  };

  return (
    <div className="bg-[#0f0f1a] border border-white/8 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#1a1a2a] border-b border-white/8">
        <div className="flex gap-1 overflow-x-auto">
          {fileKeys.map((key) => (
            <button
              key={key}
              onClick={() => setActiveFile(key)}
              className={`px-3 py-1 rounded-md text-[10px] font-medium whitespace-nowrap transition-all duration-150 ${
                activeFile === key
                  ? "bg-red-500/15 text-red-400 border border-red-500/30"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {fileLabels[key]}
            </button>
          ))}
        </div>
        <button
          onClick={handleCopy}
          className={`text-[10px] font-medium px-2.5 py-1 rounded-lg border transition-all duration-150 ${
            copied
              ? "text-green-400 border-green-500/30 bg-green-500/10"
              : "text-gray-500 border-white/10 hover:text-gray-300 hover:border-white/20"
          }`}
        >
          {copied ? "✓ Copied!" : "Copy"}
        </button>
      </div>
      <pre className="p-4 text-[11px] text-gray-300 font-mono leading-relaxed overflow-x-auto max-h-72 overflow-y-auto">
        <code>{CODE_SNIPPETS[activeFile]}</code>
      </pre>
    </div>
  );
}

// ─── File Tree ────────────────────────────────────────────────────────────────
function FileTree() {
  const items = [
    { indent: 0, icon: "📁", name: "youtube-content-filter/", type: "dir" },
    { indent: 1, icon: "📄", name: "manifest.json", type: "file" },
    { indent: 1, icon: "📁", name: "popup/", type: "dir" },
    { indent: 2, icon: "📄", name: "popup.html", type: "file" },
    { indent: 2, icon: "📄", name: "popup.css", type: "file" },
    { indent: 2, icon: "📄", name: "popup.js", type: "file" },
    { indent: 1, icon: "📁", name: "content/", type: "dir" },
    { indent: 2, icon: "📄", name: "content.js", type: "file" },
    { indent: 2, icon: "📄", name: "content.css", type: "file" },
    { indent: 1, icon: "📁", name: "background/", type: "dir" },
    { indent: 2, icon: "📄", name: "background.js", type: "file" },
    { indent: 1, icon: "📁", name: "storage/", type: "dir" },
    { indent: 2, icon: "📄", name: "settings.js", type: "file" },
    { indent: 1, icon: "📁", name: "utils/", type: "dir" },
    { indent: 2, icon: "📄", name: "filter.js", type: "file" },
    { indent: 2, icon: "📄", name: "youtubeHelpers.js", type: "file" },
    { indent: 1, icon: "📁", name: "assets/", type: "dir" },
    { indent: 2, icon: "🖼", name: "icon16.png", type: "file" },
    { indent: 2, icon: "🖼", name: "icon48.png", type: "file" },
    { indent: 2, icon: "🖼", name: "icon128.png", type: "file" },
    { indent: 1, icon: "📄", name: "README.md", type: "file" },
  ];

  return (
    <div className="bg-[#0f0f1a] border border-white/8 rounded-2xl p-4 font-mono">
      {items.map((item, i) => (
        <div
          key={i}
          className="flex items-center text-[11px] py-0.5"
          style={{ paddingLeft: item.indent * 16 }}
        >
          <span className="mr-2 text-xs">{item.icon}</span>
          <span
            className={
              item.type === "dir"
                ? "text-yellow-400/80 font-medium"
                : "text-gray-400"
            }
          >
            {item.name}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [activeMainTab, setActiveMainTab] = useState<TabId>("filters");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const mainTabs: { id: TabId; label: string; icon: string }[] = [
    { id: "filters", label: "Live Demo", icon: "▶" },
    { id: "code", label: "Source Code", icon: "</>" },
    { id: "install", label: "Installation", icon: "⚡" },
  ];

  return (
    <div className="min-h-screen bg-[#121212] text-gray-100" style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* ─── Animated background ─── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute w-[600px] h-[600px] rounded-full opacity-[0.03]"
          style={{
            background: "radial-gradient(circle, #FF0000 0%, transparent 70%)",
            top: "-200px",
            right: "-200px",
          }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full opacity-[0.02]"
          style={{
            background: "radial-gradient(circle, #FF0000 0%, transparent 70%)",
            bottom: "100px",
            left: "-100px",
          }}
        />
      </div>

      {/* ─── Navbar ─── */}
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#121212]/95 backdrop-blur-xl border-b border-white/8 shadow-2xl"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="text-red-500 text-xl"
              style={{ textShadow: "0 0 12px rgba(255,0,0,0.7)" }}
            >
              ▶
            </span>
            <span className="text-lg font-bold tracking-tight">
              Filter<span className="text-red-500">Tube</span>
            </span>
            <span className="text-[10px] font-bold bg-red-500/10 border border-red-500/25 text-red-400 px-2 py-0.5 rounded-full tracking-wider">
              v1.0
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-gray-500 font-medium uppercase tracking-widest hidden sm:block">
              Chrome Extension · Manifest V3
            </span>
            <button
              onClick={() => window.open("https://github.com/ShoaibKhanJ/FilterTube/tree/main", "_blank")}
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all duration-150 hover:shadow-lg hover:shadow-red-500/30"
            >
              Install
            </button>
          </div>
        </div>
      </nav>

      {/* ─── Hero Section ─── */}
      <section className="relative max-w-6xl mx-auto px-6 pt-16 pb-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left: Copy */}
          <div>
            <div className="inline-flex items-center gap-2 bg-red-500/8 border border-red-500/20 rounded-full px-4 py-1.5 mb-6">
              <span
                className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"
                style={{ boxShadow: "0 0 6px #22c55e" }}
              />
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                Production Ready · Chrome Extension
              </span>
            </div>

            <h1 className="text-5xl font-black leading-[1.05] mb-4 tracking-tight">
              Take Control of
              <br />
              <span className="text-red-500" style={{ textShadow: "0 0 40px rgba(255,0,0,0.3)" }}>
                Your YouTube
              </span>
            </h1>
            <p className="text-base text-gray-400 leading-relaxed mb-8 max-w-lg">
              FilterTube is a powerful Chrome Extension that filters keywords,
              blocks distracting content, hides Shorts, enables Focus Mode, and
              whitelists your favorite channels — all in real-time.
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                  onClick={() => window.open("https://github.com/ShoaibKhanJ/FilterTube/tree/main", "_blank")}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all duration-150 hover:shadow-xl hover:shadow-red-500/30 hover:-translate-y-0.5"
              >
                <span>▶</span> Try Live Demo
              </button>
              <button
                  onClick={() => setActiveMainTab("install")}
                className="flex items-center gap-2 bg-[#1E1E2E] hover:bg-[#252535] border border-white/10 hover:border-white/20 text-gray-200 font-semibold px-6 py-3 rounded-xl text-sm transition-all duration-150 hover:-translate-y-0.5"
              >
                <a
              href="#install"
              onClick={() => setActiveMainTab("install")}
              
            >
                ⚡ How to Install</a>
              </button>
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2 mt-6">
              {[
                "🎯 Keyword Filter",
                "🚫 Block Content",
                "⚡ Hide Shorts",
                "⭐ Whitelist Channels",
                "🎯 Focus Mode",
                "🔄 Real-time",
              ].map((pill) => (
                <span
                  key={pill}
                  className="text-[11px] font-medium text-gray-400 bg-[#1E1E2E] border border-white/7 px-3 py-1 rounded-full"
                >
                  {pill}
                </span>
              ))}
            </div>
          </div>

          {/* Right: Popup Preview */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <div
                className="absolute inset-0 rounded-2xl opacity-20 blur-3xl"
                style={{ background: "radial-gradient(circle, #FF0000 0%, transparent 70%)" }}
              />
              <PopupPreview />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features Grid ─── */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-100 mb-2">
            Everything you need
          </h2>
          <p className="text-sm text-gray-500">
            Five powerful features to transform your YouTube experience
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <FeatureCard
            icon="🎯"
            title="Keyword Filter"
            description="Enter keywords you want to see. Only videos matching your interests will appear — everything else fades away."
            badge="Core"
          />
          <FeatureCard
            icon="🚫"
            title="Blocked Keywords"
            description="Permanently block content you never want to see. Videos with blocked keywords disappear instantly."
          />
          <FeatureCard
            icon="⚡"
            title="Hide YouTube Shorts"
            description="Remove Shorts shelves, recommendations, and navigation items from every YouTube page with a single toggle."
          />
          <FeatureCard
            icon="⭐"
            title="Channel Whitelist"
            description="Whitelisted channels always appear, regardless of filter rules. Protect access to your favorite creators."
            badge="Smart"
          />
          <FeatureCard
            icon="🧠"
            title="Focus Mode"
            description="Hide the sidebar, trending sections, and distracting recommendations. Stay in the zone."
          />
          <FeatureCard
            icon="🔄"
            title="Real-time Filtering"
            description="MutationObserver watches YouTube's dynamic DOM. New videos are filtered instantly as they load."
          />
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-100 mb-2">
            How FilterTube Works
          </h2>
          <p className="text-sm text-gray-500">
            Intelligent real-time filtering powered by MutationObserver
          </p>
        </div>
        <div className="relative">
          {/* Connector line */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[calc(100%-200px)] h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent hidden lg:block" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { step: "01", icon: "👁️", title: "DOM Observer", desc: "MutationObserver watches YouTube's dynamic DOM for any newly loaded video elements" },
              { step: "02", icon: "🔍", title: "Extract Data", desc: "Reads title, channel name, and video type from each video card in the feed" },
              { step: "03", icon: "⚖️", title: "Apply Rules", desc: "Checks whitelist → blocked keywords → filter keywords in priority order" },
              { step: "04", icon: "✨", title: "Show or Hide", desc: "Videos are shown or smoothly faded out with CSS transitions in milliseconds" },
            ].map((item) => (
              <div key={item.step} className="relative bg-[#1E1E2E] border border-white/7 rounded-2xl p-5 text-center hover:border-red-500/20 transition-all duration-200">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold text-red-500 bg-[#1E1E2E] border border-red-500/30 px-2 py-0.5 rounded-full">
                  {item.step}
                </div>
                <div className="text-3xl mb-3 mt-1">{item.icon}</div>
                <h3 className="text-sm font-bold text-gray-100 mb-1.5">{item.title}</h3>
                <p className="text-[11px] text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Main Tabbed Section ─── */}
      <section id="install" className="max-w-6xl mx-auto px-6 py-12">
        {/* Tab nav */}
        <div className="flex gap-1 bg-[#1E1E2E] border border-white/7 p-1 rounded-xl w-fit mx-auto mb-8">
          {mainTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveMainTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 ${
                activeMainTab === tab.id
                  ? "bg-red-600 text-white shadow-lg shadow-red-500/20"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <span className="text-xs">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* DEMO TAB */}
        {activeMainTab === "filters" && (
          <div className="animate-fadeIn">
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-gray-100 mb-2">
                Live Filtering Demo
              </h2>
              <p className="text-sm text-gray-500">
                See how FilterTube processes YouTube videos in real-time
              </p>
            </div>
            <div className="grid lg:grid-cols-2 gap-8 items-start">
              <div>
                <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full" />
                  Active Filter Rules
                </h3>
                <div className="space-y-3 mb-6">
                  <div className="bg-[#1E1E2E] border border-white/7 rounded-xl p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-2">
                      🎯 Filter Keywords (show only matching)
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {["python", "machine learning", "web development", "ai"].map(
                        (k) => (
                          <span
                            key={k}
                            className="text-[11px] px-2.5 py-1 rounded-full bg-red-500/8 border border-red-500/20 text-red-300"
                          >
                            {k}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                  <div className="bg-[#1E1E2E] border border-white/7 rounded-xl p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-2">
                      🚫 Blocked Keywords (always hide)
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {["prank", "drama", "meme", "celebrity"].map((k) => (
                        <span
                          key={k}
                          className="text-[11px] px-2.5 py-1 rounded-full bg-orange-900/30 border border-orange-500/20 text-orange-300"
                        >
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="bg-[#1a1a2a] border border-white/7 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-300 mb-3">
                    Priority Rules
                  </p>
                  <div className="space-y-2">
                    {[
                      {
                        num: 1,
                        rule: "Whitelisted channel",
                        action: "Always show",
                        color: "text-green-400",
                      },
                      {
                        num: 2,
                        rule: "Contains blocked keyword",
                        action: "Always hide",
                        color: "text-red-400",
                      },
                      {
                        num: 3,
                        rule: "No filter match",
                        action: "Hidden",
                        color: "text-gray-500",
                      },
                      {
                        num: 4,
                        rule: "Default",
                        action: "Show",
                        color: "text-green-400",
                      },
                    ].map((r) => (
                      <div
                        key={r.num}
                        className="flex items-center justify-between text-[11px]"
                      >
                        <span className="text-gray-500">
                          <span className="text-gray-400 font-medium mr-2">
                            #{r.num}
                          </span>
                          {r.rule}
                        </span>
                        <span className={`font-semibold ${r.color}`}>
                          {r.action}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full" />
                  YouTube Feed (Filtered)
                </h3>
                <FilterDemo />
              </div>
            </div>
          </div>
        )}

        {/* CODE TAB */}
        {activeMainTab === "code" && (
          <div className="animate-fadeIn">
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-gray-100 mb-2">
                Source Code
              </h2>
              <p className="text-sm text-gray-500">
                Clean, modular, well-commented Vanilla JS
              </p>
            </div>
            <div className="grid lg:grid-cols-3 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-300 mb-3">
                  📁 Project Structure
                </h3>
                <FileTree />
                <div className="mt-4 space-y-2">
                  {[
                    {
                      label: "Manifest V3",
                      desc: "Service worker + permissions",
                    },
                    { label: "Content Script", desc: "DOM filtering + observer" },
                    {
                      label: "Background SW",
                      desc: "Message relay + tab sync",
                    },
                    { label: "Storage API", desc: "Persistent sync settings" },
                    { label: "Popup UI", desc: "Vanilla HTML/CSS/JS" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-2 text-[11px]"
                    >
                      <span className="w-1.5 h-1.5 bg-red-500/60 rounded-full flex-shrink-0" />
                      <span className="text-gray-300 font-medium">
                        {item.label}:
                      </span>
                      <span className="text-gray-500">{item.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-2">
                <h3 className="text-sm font-semibold text-gray-300 mb-3">
                  🔍 Key Code Snippets
                </h3>
                <CodeViewer />
              </div>
            </div>
          </div>
        )}

        {/* INSTALL TAB */}
        {activeMainTab === "install" && (
          <div className="animate-fadeIn">
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-gray-100 mb-2">
                Installation Guide
              </h2>
              <p className="text-sm text-gray-500">
                Load FilterTube as an unpacked extension in Chrome
              </p>
            </div>
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-[#1E1E2E] border border-white/7 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-gray-100 mb-5 flex items-center gap-2">
                  <span className="w-6 h-6 bg-red-500/15 border border-red-500/30 rounded-md flex items-center justify-center text-xs text-red-400">
                    ⚡
                  </span>
                  Step-by-step Installation
                </h3>
                <div className="space-y-1">
                  <InstallStep
                    num={1}
                    title="Download Extension Files"
                    desc="Download or clone all the extension files from the source."
                    code="git clone https://github.com/you/filtertube"
                  />
                  <InstallStep
                    num={2}
                    title="Open Chrome Extensions"
                    desc="Navigate to the Chrome extensions management page."
                    code="chrome://extensions/"
                  />
                  <InstallStep
                    num={3}
                    title="Enable Developer Mode"
                    desc="Toggle the Developer Mode switch in the top-right corner of the extensions page."
                  />
                  <InstallStep
                    num={4}
                    title="Load Unpacked"
                    desc="Click 'Load unpacked' and select the youtube-content-filter/ folder."
                  />
                  <InstallStep
                    num={5}
                    title="Pin & Use"
                    desc="Click the puzzle piece icon in your toolbar, find FilterTube, and pin it for easy access."
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-[#1E1E2E] border border-white/7 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-gray-100 mb-4">
                    🔒 Privacy & Permissions
                  </h3>
                  <div className="space-y-2.5">
                    {[
                      {
                        icon: "✅",
                        text: "Runs 100% locally in your browser",
                      },
                      { icon: "✅", text: "Never collects your data" },
                      { icon: "✅", text: "Never sends data to external servers" },
                      {
                        icon: "✅",
                        text: "Only requests storage + activeTab permissions",
                      },
                      { icon: "✅", text: "Only activates on youtube.com" },
                    ].map((item) => (
                      <div
                        key={item.text}
                        className="flex items-center gap-2.5 text-xs text-gray-400"
                      >
                        <span>{item.icon}</span>
                        {item.text}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-[#1E1E2E] border border-white/7 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-gray-100 mb-4">
                    ⚙️ Tech Stack
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Manifest V3", icon: "📋" },
                      { label: "Vanilla JS", icon: "🟨" },
                      { label: "Chrome Storage", icon: "💾" },
                      { label: "MutationObserver", icon: "👁" },
                      { label: "Service Worker", icon: "⚙️" },
                      { label: "Content Scripts", icon: "💉" },
                    ].map((tech) => (
                      <div
                        key={tech.label}
                        className="flex items-center gap-2 bg-[#1a1a2a] border border-white/5 rounded-lg px-3 py-2 text-xs text-gray-400"
                      >
                        <span>{tech.icon}</span>
                        {tech.label}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-[#1E1E2E] border border-white/7 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-gray-100 mb-3">
                    🗺️ V2 Roadmap
                  </h3>
                  <div className="space-y-1.5">
                    {[
                      "Import/Export settings as JSON",
                      "Regex support for advanced filtering",
                      "Filter statistics dashboard",
                      "Per-domain filter profiles",
                      "Minimum view count filter",
                    ].map((item) => (
                      <div
                        key={item}
                        className="flex items-center gap-2 text-[11px] text-gray-500"
                      >
                        <span className="w-1 h-1 bg-gray-600 rounded-full flex-shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-white/7 mt-12">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-red-500">▶</span>
            <span className="text-sm font-bold">
              Filter<span className="text-red-500">Tube</span>
            </span>
            <span className="text-xs text-gray-600">— v1.0.0</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-gray-600">
            <span>Built with Vanilla JS</span>
            <span>·</span>
            <span>Chrome Extension Manifest V3</span>
            <span>·</span>
            <span>MIT License</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
