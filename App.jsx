import React, {useEffect, useMemo, useState} from "react";
import {Routes, Route, Navigate, Link, useNavigate, useLocation} from "react-router-dom";
import {
  LayoutDashboard, Users, CalendarDays, ClipboardCheck, WalletCards,
  Bell, LogOut, UserCircle, Menu, X, CheckCircle2, Clock3, XCircle,
  Search, Plus, ShieldCheck, BriefcaseBusiness, TrendingUp, UserRound
} from "lucide-react";

const API = "http://localhost:5000/api";

async function api(path, options={}) {
  const token = localStorage.getItem("dayflow_token");
  const headers = {"Content-Type":"application/json", ...(options.headers||{})};
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(API + path, {...options, headers});
  const data = await res.json().catch(()=>({}));
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

function useAuth(){
  const [user,setUser]=useState(()=>JSON.parse(localStorage.getItem("dayflow_user")||"null"));
  const login=(data)=>{localStorage.setItem("dayflow_token",data.token);localStorage.setItem("dayflow_user",JSON.stringify(data.user));setUser(data.user)};
  const logout=()=>{localStorage.clear();setUser(null)};
  return {user,login,logout};
}

const AuthContext=React.createContext(null);
function useAuthContext(){return React.useContext(AuthContext)}

function Protected({children, roles}){
  const {user}=useAuthContext();
  if(!user) return <Navigate to="/login" replace/>;
  if(roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace/>;
  return children;
}

function App(){
  const auth=useAuth();
  return <AuthContext.Provider value={auth}>
    <Routes>
      <Route path="/login" element={<Login/>}/>
      <Route path="/signup" element={<Signup/>}/>
      <Route path="/*" element={<Protected><Shell/></Protected>}/>
    </Routes>
  </AuthContext.Provider>
}

function Login(){
  const {login}=useAuthContext(); const nav=useNavigate();
  const [email,setEmail]=useState("admin@dayflow.com"),[password,setPassword]=useState("Admin@123"),[error,setError]=useState(""),[loading,setLoading]=useState(false);
  async function submit(e){e.preventDefault();setError("");setLoading(true);try{const d=await api("/auth/login",{method:"POST",body:JSON.stringify({email,password})});login(d);nav("/dashboard")}catch(x){setError(x.message)}finally{setLoading(false)}}
  return <AuthLayout title="Welcome back" subtitle="Sign in to your Dayflow workspace.">
    <form onSubmit={submit} className="form">
      <Field label="Email" value={email} onChange={setEmail} type="email"/>
      <Field label="Password" value={password} onChange={setPassword} type="password"/>
      {error&&<div className="error">{error}</div>}
      <button className="primary" disabled={loading}>{loading?"Signing in...":"Sign In"}</button>
      <div className="hint">Demo admin: admin@dayflow.com / Admin@123</div>
      <div className="center">Don't have an account? <Link to="/signup">Create one</Link></div>
    </form>
  </AuthLayout>
}

function Signup(){
  const nav=useNavigate(); const [form,setForm]=useState({employee_id:"",name:"",email:"",password:"",role:"EMPLOYEE"});
  const [error,setError]=useState("");
  const update=(k,v)=>setForm({...form,[k]:v});
  async function submit(e){e.preventDefault();setError("");try{await api("/auth/signup",{method:"POST",body:JSON.stringify(form)});nav("/login")}catch(x){setError(x.message)}}
  return <AuthLayout title="Create your account" subtitle="Join your organization on Dayflow.">
    <form onSubmit={submit} className="form">
      <Field label="Employee ID" value={form.employee_id} onChange={v=>update("employee_id",v)}/>
      <Field label="Full name" value={form.name} onChange={v=>update("name",v)}/>
      <Field label="Email" value={form.email} onChange={v=>update("email",v)} type="email"/>
      <Field label="Password" value={form.password} onChange={v=>update("password",v)} type="password"/>
      <label className="field"><span>Role</span><select value={form.role} onChange={e=>update("role",e.target.value)}><option value="EMPLOYEE">Employee</option><option value="HR">HR Officer</option></select></label>
      {error&&<div className="error">{error}</div>}
      <button className="primary">Create Account</button>
      <div className="center">Already registered? <Link to="/login">Sign in</Link></div>
    </form>
  </AuthLayout>
}

function AuthLayout({title,subtitle,children}){
 return <div className="auth-page"><div className="auth-brand"><div className="brand-mark">D</div><div><b>Dayflow</b><small>Every workday, perfectly aligned.</small></div></div><div className="auth-card"><div className="eyebrow">DAYFLOW HRMS</div><h1>{title}</h1><p>{subtitle}</p>{children}</div></div>
}

function Field({label,value,onChange,type="text"}){return <label className="field"><span>{label}</span><input type={type} value={value} onChange={e=>onChange(e.target.value)} required/></label>}

function Shell(){
 const {user,logout}=useAuthContext(); const [open,setOpen]=useState(false);
 const nav=useNavigate();
 const links=user.role==="EMPLOYEE"
 ? [["/dashboard","Dashboard",LayoutDashboard],["/profile","Profile",UserCircle],["/attendance","Attendance",CalendarDays],["/leave","Leave",ClipboardCheck],["/payroll","Payroll",WalletCards]]
 : [["/dashboard","Dashboard",LayoutDashboard],["/employees","Employees",Users],["/attendance","Attendance",CalendarDays],["/leave-approvals","Leave Approvals",ClipboardCheck],["/payroll","Payroll",WalletCards],["/reports","Reports",TrendingUp]];
 return <div className="app-shell">
   <aside className={open?"sidebar open":"sidebar"}><div className="brand"><div className="brand-mark">D</div><div><b>Dayflow</b><small>HRMS</small></div><button className="icon mobile" onClick={()=>setOpen(false)}><X/></button></div>
   <nav>{links.map(([to,label,Icon])=><Link key={to} to={to} onClick={()=>setOpen(false)} className={({})=>location.pathname===to?"nav active":"nav"}><Icon/><span>{label}</span></Link>)}</nav>
   <div className="side-bottom"><div className="mini-user"><div className="avatar">{user.name?.[0]||"U"}</div><div><b>{user.name}</b><small>{user.role}</small></div></div><button className="logout" onClick={()=>{logout();nav("/login")}}><LogOut/> Logout</button></div>
   </aside>
   <main className="main"><header className="topbar"><button className="icon mobile" onClick={()=>setOpen(true)}><Menu/></button><div><span className="muted">Workspace</span><b> {user.role==="EMPLOYEE"?"Employee":"Admin & HR"} Portal</b></div><div className="top-actions"><button className="icon"><Bell/></button><div className="avatar">{user.name?.[0]||"U"}</div></div></header><div className="content"><Routes>
     <Route path="/dashboard" element={<Dashboard/>}/>
     <Route path="/profile" element={<Profile/>}/>
     <Route path="/attendance" element={<Attendance/>}/>
     <Route path="/leave" element={<Leave/>}/>
     <Route path="/payroll" element={<Payroll/>}/>
     <Route path="/employees" element={<Protected roles={["ADMIN","HR"]}><Employees/></Protected>}/>
     <Route path="/leave-approvals" element={<Protected roles={["ADMIN","HR"]}><LeaveApprovals/></Protected>}/>
     <Route path="/reports" element={<Protected roles={["ADMIN","HR"]}><Reports/></Protected>}/>
     <Route path="*" element={<Navigate to="/dashboard" replace/>}/>
   </Routes></div></main>
 </div>
}

function Dashboard(){
 const {user}=useAuthContext(); const [data,setData]=useState(null);
 useEffect(()=>{api("/dashboard").then(setData).catch(console.error)},[]);
 if(!data) return <Loading/>;
 if(user.role==="EMPLOYEE") return <EmployeeDashboard data={data}/>;
 return <AdminDashboard data={data}/>;
}

function EmployeeDashboard({data}){
 return <Page title={`Good morning, ${data.user.name.split(" ")[0]} 👋`} subtitle="Here's what's happening with your workday.">
   <div className="grid stats"><Stat icon={CheckCircle2} label="Present Days" value={data.stats.present}/><Stat icon={Clock3} label="Hours This Month" value={data.stats.hours}/><Stat icon={ClipboardCheck} label="Pending Leaves" value={data.stats.pendingLeaves}/><Stat icon={WalletCards} label="Net Salary" value={`₹${data.payroll.net_salary.toLocaleString()}`}/></div>
   <div className="grid two"><Card title="Today's attendance"><div className="attendance-big"><div><small>Check in</small><strong>{data.today?.check_in||"Not checked in"}</strong></div><div><small>Check out</small><strong>{data.today?.check_out||"—"}</strong></div></div><Link className="secondary-btn" to="/attendance">Manage attendance →</Link></Card><Card title="Recent leave requests"><LeaveMini items={data.recentLeaves}/><Link className="secondary-btn" to="/leave">View all leave →</Link></Card></div>
 </Page>
}

function AdminDashboard({data}){
 return <Page title="HR Command Center" subtitle="Real-time overview of your workforce.">
   <div className="grid stats"><Stat icon={Users} label="Employees" value={data.stats.employees}/><Stat icon={CheckCircle2} label="Present Today" value={data.stats.presentToday}/><Stat icon={ClipboardCheck} label="On Leave" value={data.stats.onLeave}/><Stat icon={Clock3} label="Pending Approvals" value={data.stats.pendingLeaves}/></div>
   <div className="grid two"><Card title="Attendance overview"><div className="bars">{[72,84,79,91,87,94,89].map((n,i)=><div key={i} className="bar-col"><div className="bar" style={{height:n+"%"}}></div><small>{["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i]}</small></div>)}</div></Card><Card title="Pending leave requests"><LeaveMini items={data.recentLeaves}/><Link className="secondary-btn" to="/leave-approvals">Review requests →</Link></Card></div>
 </Page>
}

function Stat({icon:Icon,label,value}){return <div className="stat"><div className="stat-icon"><Icon/></div><div><small>{label}</small><strong>{value}</strong></div></div>}
function Card({title,children}){return <section className="card"><div className="card-head"><h3>{title}</h3></div>{children}</section>}
function LeaveMini({items=[]}){return <div className="leave-mini">{items.length?items.slice(0,4).map(x=><div className="leave-row" key={x.id}><div><b>{x.leave_type}</b><small>{x.start_date} → {x.end_date}</small></div><Status value={x.status}/></div>):<div className="empty">No leave requests.</div>}</div>}
function Status({value}){return <span className={"status "+value.toLowerCase()}>{value}</span>}

function Profile(){
 const {user}=useAuthContext(); const [profile,setProfile]=useState(null); const [form,setForm]=useState({});
 useEffect(()=>{api("/profile").then(d=>{setProfile(d);setForm(d)})},[]);
 async function save(e){e.preventDefault();const d=await api("/profile",{method:"PUT",body:JSON.stringify({phone:form.phone,address:form.address})});setProfile(d);alert("Profile updated")}
 if(!profile)return <Loading/>;
 return <Page title="My Profile" subtitle="Manage your personal and employment information."><div className="grid two"><Card title="Personal details"><form className="form" onSubmit={save}><Field label="Full name" value={profile.name} onChange={()=>{}}/><Field label="Email" value={profile.email} onChange={()=>{}} type="email"/><Field label="Phone" value={form.phone||""} onChange={v=>setForm({...form,phone:v})}/><label className="field"><span>Address</span><textarea value={form.address||""} onChange={e=>setForm({...form,address:e.target.value})}/></label><button className="primary">Save changes</button></form></Card><Card title="Job & salary"><Info label="Employee ID" value={profile.employee_id}/><Info label="Department" value={profile.department}/><Info label="Designation" value={profile.designation}/><Info label="Joining date" value={profile.joining_date}/><Info label="Net salary" value={`₹${Number(profile.net_salary||0).toLocaleString()}`}/></Card></div></Page>
}

function Info({label,value}){return <div className="info"><span>{label}</span><b>{value||"—"}</b></div>}
function Loading(){return <div className="loading">Loading Dayflow…</div>}

function Attendance(){
 const {user}=useAuthContext(); const [items,setItems]=useState([]); const [today,setToday]=useState(null);
 async function load(){const d=await api("/attendance");setItems(d.items);setToday(d.today)}
 useEffect(()=>{load()},[]);
 async function checkIn(){await api("/attendance/checkin",{method:"POST"});load()}
 async function checkOut(){await api("/attendance/checkout",{method:"POST"});load()}
 return <Page title="Attendance" subtitle="Track daily and weekly working hours."><div className="card check-card"><div><small>Today's status</small><h2>{today?.status||"Not marked"}</h2><p>{today?.check_in?`Checked in at ${today.check_in}`:"Start your workday with a check-in."}</p></div>{user.role==="EMPLOYEE"&&<div className="actions">{!today?.check_in&&<button className="primary" onClick={checkIn}>Check In</button>}{today?.check_in&&!today?.check_out&&<button className="primary" onClick={checkOut}>Check Out</button>}{today?.check_out&&<span className="success-text">✓ Day completed</span>}</div>}</div><Card title="Attendance history"><Table headers={["Date","Employee","Check in","Check out","Hours","Status"]} rows={items.map(x=>[x.date,x.employee_name||"You",x.check_in||"—",x.check_out||"—",x.working_hours||"—",<Status value={x.status}/>])}/></Card></Page>
}

function Leave(){
 const [items,setItems]=useState([]); const [show,setShow]=useState(false); const [form,setForm]=useState({leave_type:"PAID",start_date:"",end_date:"",reason:""});
 async function load(){setItems((await api("/leaves")).items)} useEffect(()=>{load()},[]);
 async function submit(e){e.preventDefault();await api("/leaves",{method:"POST",body:JSON.stringify(form)});setShow(false);setForm({leave_type:"PAID",start_date:"",end_date:"",reason:""});load()}
 return <Page title="Leave & Time Off" subtitle="Apply for leave and track approval status."><div className="toolbar"><button className="primary" onClick={()=>setShow(true)}><Plus/> Apply for leave</button></div><Card title="My requests"><Table headers={["Type","From","To","Reason","Status","Comment"]} rows={items.map(x=>[x.leave_type,x.start_date,x.end_date,x.reason,<Status value={x.status}/>,x.admin_comment||"—"])}/></Card>{show&&<Modal title="Apply for leave" onClose={()=>setShow(false)}><form className="form" onSubmit={submit}><label className="field"><span>Leave type</span><select value={form.leave_type} onChange={e=>setForm({...form,leave_type:e.target.value})}><option>PAID</option><option>SICK</option><option>UNPAID</option></select></label><div className="grid two"><Field label="Start date" value={form.start_date} onChange={v=>setForm({...form,start_date:v})} type="date"/><Field label="End date" value={form.end_date} onChange={v=>setForm({...form,end_date:v})} type="date"/></div><label className="field"><span>Remarks</span><textarea value={form.reason} onChange={e=>setForm({...form,reason:e.target.value})} required/></label><button className="primary">Submit request</button></form></Modal>}</Page>
}

function LeaveApprovals(){
 const [items,setItems]=useState([]); const [comment,setComment]=useState("");
 async function load(){setItems((await api("/leaves/all")).items)} useEffect(()=>{load()},[]);
 async function action(id,status){await api(`/leaves/${id}`,{method:"PUT",body:JSON.stringify({status,admin_comment:comment})});setComment("");load()}
 return <Page title="Leave Approvals" subtitle="Review and act on employee time-off requests."><Card title="All requests"><Table headers={["Employee","Type","Dates","Reason","Status","Action"]} rows={items.map(x=>[x.employee_name,x.leave_type,`${x.start_date} → ${x.end_date}`,x.reason,<Status value={x.status}/>,x.status==="PENDING"?<div className="row-actions"><button className="small approve" onClick={()=>action(x.id,"APPROVED")}>Approve</button><button className="small reject" onClick={()=>action(x.id,"REJECTED")}>Reject</button></div>:"—"])}/></Card><div className="card"><h3>Approval comment</h3><textarea placeholder="Optional comment for the selected request…" value={comment} onChange={e=>setComment(e.target.value)}/><p className="muted">Enter a comment before clicking Approve or Reject.</p></div></Page>
}

function Employees(){
 const [items,setItems]=useState([]),[q,setQ]=useState("");
 useEffect(()=>{api("/employees").then(d=>setItems(d.items))},[]);
 const filtered=items.filter(x=>(x.name+x.employee_id+x.department).toLowerCase().includes(q.toLowerCase()));
 return <Page title="Employees" subtitle="Manage your organization's workforce."><div className="search"><Search/><input placeholder="Search employees…" value={q} onChange={e=>setQ(e.target.value)}/></div><Card title={`${filtered.length} employees`}><Table headers={["Employee ID","Name","Department","Designation","Phone","Status"]} rows={filtered.map(x=>[x.employee_id,x.name,x.department,x.designation,x.phone||"—",<span className="status approved">ACTIVE</span>])}/></Card></Page>
}

function Payroll(){
 const {user}=useAuthContext(); const [items,setItems]=useState([]); const [editing,setEditing]=useState(null);
 useEffect(()=>{api("/payroll").then(d=>setItems(d.items))},[]);
 async function save(){await api(`/payroll/${editing.id}`,{method:"PUT",body:JSON.stringify(editing)});setEditing(null);setItems((await api("/payroll")).items)}
 return <Page title="Payroll" subtitle={user.role==="EMPLOYEE"?"Your salary information is read-only.":"Manage employee salary structures."}><Card title="Salary records"><Table headers={["Employee","Basic","Allowances","Deductions","Net salary","Period",user.role!=="EMPLOYEE"?"Action":null].filter(Boolean)} rows={items.map(x=>[x.employee_name,`₹${x.basic_salary.toLocaleString()}`,`₹${x.allowances.toLocaleString()}`,`₹${x.deductions.toLocaleString()}`,<b>₹{x.net_salary.toLocaleString()}</b>,x.pay_period,user.role!=="EMPLOYEE"?<button className="small" onClick={()=>setEditing({...x})}>Edit</button>:null])}/></Card>{editing&&<Modal title={`Update salary — ${editing.employee_name}`} onClose={()=>setEditing(null)}><div className="form">{["basic_salary","allowances","deductions"].map(k=><Field key={k} label={k.replace("_"," ").replace(/\b\w/g,m=>m.toUpperCase())} value={editing[k]} onChange={v=>setEditing({...editing,[k]:Number(v)})} type="number"/>)}<button className="primary" onClick={save}>Save payroll</button></div></Modal>}</Page>
}

function Reports(){
 const [data,setData]=useState(null); useEffect(()=>{api("/reports").then(setData)},[]);
 if(!data)return <Loading/>;
 return <Page title="Reports & Analytics" subtitle="Workforce insights for better decisions."><div className="grid stats"><Stat icon={Users} label="Employees" value={data.employees}/><Stat icon={CheckCircle2} label="Attendance rate" value={`${data.attendanceRate}%`}/><Stat icon={ClipboardCheck} label="Approved leaves" value={data.approvedLeaves}/><Stat icon={WalletCards} label="Payroll total" value={`₹${data.payrollTotal.toLocaleString()}`}/></div><div className="grid two"><Card title="Department distribution"><Table headers={["Department","Employees"]} rows={data.departments.map(x=>[x.department,x.count])}/></Card><Card title="Leave distribution"><Table headers={["Status","Requests"]} rows={data.leaveStats.map(x=>[x.status,x.count])}/></Card></div></Page>
}

function Table({headers,rows}){return <div className="table-wrap"><table><thead><tr>{headers.map((h,i)=><th key={i}>{h}</th>)}</tr></thead><tbody>{rows.length?rows.map((r,i)=><tr key={i}>{r.map((c,j)=><td key={j}>{c}</td>)}</tr>):<tr><td colSpan={headers.length}><div className="empty">No records found.</div></td></tr>}</tbody></table></div>}
function Modal({title,onClose,children}){return <div className="modal-back"><div className="modal"><div className="modal-head"><h2>{title}</h2><button className="icon" onClick={onClose}><X/></button></div>{children}</div></div>}
function Page({title,subtitle,children}){return <section><div className="page-head"><div><h1>{title}</h1><p>{subtitle}</p></div></div>{children}</section>}
