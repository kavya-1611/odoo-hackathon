import { useState } from "react";
import { Logo, Card, Button, Input, Select } from "../components/UI";

function AuthLayout({ children, subtitle }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-grain relative overflow-hidden">
      {/* ambient coffee-ring decoration */}
      <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-coffee-200/40 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-coffee-300/30 blur-3xl" />

      <div className="w-full max-w-md relative">
        <div className="flex flex-col items-center mb-7">
          <Logo />
          <p className="text-coffee-500 text-sm mt-2.5">{subtitle}</p>
        </div>
        <Card className="p-7" pop={false}>{children}</Card>
      </div>
    </div>
  );
}

export function SignIn({ users, onLogin, goSignUp }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    const found = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password);
    if (found) {
      setError("");
      onLogin(found);
    } else {
      setError("Incorrect email or password.");
    }
  };

  return (
    <AuthLayout subtitle="Sign in to your workday">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-coffee-600">Email</label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@dayflow.com" required />
        </div>
        <div>
          <label className="text-xs font-semibold text-coffee-600">Password</label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
        </div>
        {error && <p className="text-rose-600 text-sm">{error}</p>}
        <Button type="submit" className="w-full">Sign In</Button>
        <div className="text-xs text-coffee-500 bg-coffee-50 rounded-xl p-3 leading-relaxed">
          Demo logins — Admin: admin@dayflow.com / admin123 &nbsp;|&nbsp; Employee: aditi@dayflow.com / emp123.
          Anyone can also sign up below to create their own account.
        </div>
        <p className="text-sm text-center text-coffee-500">
          Don't have an account?{" "}
          <button type="button" onClick={goSignUp} className="text-coffee-800 font-semibold">Sign Up</button>
        </p>
      </form>
    </AuthLayout>
  );
}

export function SignUp({ users, onRegister, goSignIn }) {
  const [empId, setEmpId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Employee");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
      setError("An account with this email already exists.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    onRegister({ empId: empId || `EMP${Date.now().toString().slice(-4)}`, name, email, password, role });
    setDone(true);
  };

  return (
    <AuthLayout subtitle="Create your account">
      {done ? (
        <div className="text-center py-4">
          <p className="text-emerald-600 font-semibold mb-2">Account created!</p>
          <p className="text-sm text-coffee-500 mb-4">You can now sign in with your email and password.</p>
          <Button onClick={goSignIn} className="w-full">Go to Sign In</Button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-coffee-600">Employee ID</label>
            <Input value={empId} onChange={(e) => setEmpId(e.target.value)} placeholder="EMP004" />
          </div>
          <div>
            <label className="text-xs font-semibold text-coffee-600">Full Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
          </div>
          <div>
            <label className="text-xs font-semibold text-coffee-600">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@dayflow.com" required />
          </div>
          <div>
            <label className="text-xs font-semibold text-coffee-600">Password</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 characters" required minLength={8} />
          </div>
          <div>
            <label className="text-xs font-semibold text-coffee-600">Role</label>
            <Select options={["Employee", "Admin"]} value={role} onChange={(e) => setRole(e.target.value)} />
          </div>
          {error && <p className="text-rose-600 text-sm">{error}</p>}
          <Button type="submit" className="w-full">Sign Up</Button>
          <p className="text-sm text-center text-coffee-500">
            Already have an account?{" "}
            <button type="button" onClick={goSignIn} className="text-coffee-800 font-semibold">Sign In</button>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}
