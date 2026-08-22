import { Avatar } from "../components/UI";

export function Shell({ user, onLogout, active, setActive, tabs, children }) {
  return (
    <div className="min-h-screen flex bg-cream">
      <aside className="w-64 bg-gradient-to-b from-coffee-800 to-coffee-900 text-white flex flex-col shrink-0 shadow-popHover">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 shadow-inset3d flex items-center justify-center font-display font-bold text-lg">D</div>
            <span className="font-display font-bold text-xl">Dayflow</span>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1.5 mt-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              className={`btn-pop w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium ${
                active === t.key ? "bg-cream text-coffee-800 shadow-pop" : "text-white/75 hover:bg-white/10"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-2.5 px-2 py-2">
            <Avatar name={user.name} size={8} />
            <div className="leading-tight">
              <p className="text-sm font-semibold">{user.name}</p>
              <p className="text-xs text-white/50">{user.role}</p>
            </div>
          </div>
          <button onClick={onLogout} className="btn-pop w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium text-white/75 hover:bg-white/10 mt-1">
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto bg-grain">{children}</main>
    </div>
  );
}
