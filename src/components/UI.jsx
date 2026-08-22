import { STATUS_COLOR } from "../data/store";

export const Badge = ({ status }) => (
  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLOR[status] || "bg-coffee-100 text-coffee-700"}`}>
    {status}
  </span>
);

export const Card = ({ children, className = "", pop = true }) => (
  <div className={`bg-white rounded-2xl border border-coffee-100 shadow-pop ${pop ? "card-pop hover:shadow-popHover" : ""} ${className}`}>
    {children}
  </div>
);

export const Button = ({ children, onClick, variant = "primary", type = "button", className = "" }) => {
  const base = "btn-pop px-4 py-2.5 rounded-xl text-sm font-semibold";
  const styles = {
    primary: "bg-coffee-700 text-white shadow-inset3d hover:bg-coffee-800",
    ghost: "bg-transparent text-coffee-700 border border-coffee-300 hover:bg-coffee-50",
    danger: "bg-rose-600 text-white hover:bg-rose-700",
    success: "bg-emerald-600 text-white hover:bg-emerald-700",
    outlineCream: "bg-coffee-50 text-coffee-800 hover:bg-coffee-100",
  };
  return (
    <button type={type} onClick={onClick} className={`${base} ${styles[variant]} ${className}`}>
      {children}
    </button>
  );
};

export const Input = (props) => (
  <input
    {...props}
    className={`w-full border border-coffee-200 rounded-xl px-3 py-2.5 text-sm outline-none bg-white
      focus:ring-2 focus:ring-coffee-400/40 focus:border-coffee-500 transition ${props.className || ""}`}
  />
);

export const Select = ({ options, ...props }) => (
  <select
    {...props}
    className="w-full border border-coffee-200 rounded-xl px-3 py-2.5 text-sm outline-none bg-white
      focus:ring-2 focus:ring-coffee-400/40 focus:border-coffee-500 transition"
  >
    {options.map((o) => (
      <option key={o} value={o}>{o}</option>
    ))}
  </select>
);

export const Logo = ({ light = false }) => (
  <div className="flex items-center gap-2.5">
    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-coffee-500 to-coffee-800 shadow-inset3d flex items-center justify-center text-white font-display font-bold text-lg">
      D
    </div>
    <span className={`font-display font-bold text-xl ${light ? "text-white" : "text-coffee-800"}`}>Dayflow</span>
  </div>
);

export const SectionTitle = ({ title, desc }) => (
  <div className="mb-6">
    <h1 className="font-display text-2xl md:text-3xl font-bold text-coffee-900">{title}</h1>
    {desc && <p className="text-coffee-500 text-sm mt-1.5">{desc}</p>}
  </div>
);

export const Avatar = ({ name, size = 12 }) => {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2);
  return (
    <div
      style={{ width: size * 4, height: size * 4 }}
      className="rounded-full bg-gradient-to-br from-coffee-400 to-coffee-700 shadow-inset3d text-white flex items-center justify-center font-display font-bold"
    >
      {initials}
    </div>
  );
};
