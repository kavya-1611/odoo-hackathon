const express=require("express");
const cors=require("cors");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const Database=require("better-sqlite3");
const path=require("path");

const app=express();
app.use(cors());
app.use(express.json());

const db=new Database(path.join(__dirname,"dayflow.db"));
db.pragma("foreign_keys = ON");
db.exec(`
CREATE TABLE IF NOT EXISTS users(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 employee_id TEXT UNIQUE NOT NULL,
 name TEXT NOT NULL,
 email TEXT UNIQUE NOT NULL,
 password_hash TEXT NOT NULL,
 role TEXT NOT NULL DEFAULT 'EMPLOYEE',
 email_verified INTEGER DEFAULT 1,
 created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS employees(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 user_id INTEGER UNIQUE NOT NULL,
 employee_id TEXT UNIQUE NOT NULL,
 name TEXT NOT NULL,
 phone TEXT DEFAULT '',
 address TEXT DEFAULT '',
 department TEXT DEFAULT 'General',
 designation TEXT DEFAULT 'Employee',
 joining_date TEXT DEFAULT CURRENT_DATE,
 FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS attendance(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 employee_id INTEGER NOT NULL,
 date TEXT NOT NULL,
 check_in TEXT,
 check_out TEXT,
 status TEXT DEFAULT 'PRESENT',
 working_hours REAL DEFAULT 0,
 UNIQUE(employee_id,date),
 FOREIGN KEY(employee_id) REFERENCES employees(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS leaves(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 employee_id INTEGER NOT NULL,
 leave_type TEXT NOT NULL,
 start_date TEXT NOT NULL,
 end_date TEXT NOT NULL,
 reason TEXT NOT NULL,
 status TEXT DEFAULT 'PENDING',
 admin_comment TEXT DEFAULT '',
 created_at TEXT DEFAULT CURRENT_TIMESTAMP,
 approved_at TEXT,
 FOREIGN KEY(employee_id) REFERENCES employees(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS payroll(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 employee_id INTEGER UNIQUE NOT NULL,
 basic_salary REAL DEFAULT 0,
 allowances REAL DEFAULT 0,
 deductions REAL DEFAULT 0,
 net_salary REAL DEFAULT 0,
 pay_period TEXT DEFAULT 'August 2026',
 payment_date TEXT,
 FOREIGN KEY(employee_id) REFERENCES employees(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS notifications(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 user_id INTEGER NOT NULL,
 title TEXT NOT NULL,
 message TEXT NOT NULL,
 is_read INTEGER DEFAULT 0,
 created_at TEXT DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
`);

function seed(){
 const count=db.prepare("SELECT COUNT(*) c FROM users").get().c;
 if(count) return;
 const insUser=db.prepare("INSERT INTO users(employee_id,name,email,password_hash,role) VALUES(?,?,?,?,?)");
 const insEmp=db.prepare("INSERT INTO employees(user_id,employee_id,name,phone,address,department,designation,joining_date) VALUES(?,?,?,?,?,?,?,?)");
 const insPay=db.prepare("INSERT INTO payroll(employee_id,basic_salary,allowances,deductions,net_salary,pay_period) VALUES(?,?,?,?,?,?)");
 const admin=insUser.run("ADM001","Dayflow Admin","admin@dayflow.com",bcrypt.hashSync("Admin@123",10),"ADMIN");
 insEmp.run(admin.lastInsertRowid,"ADM001","Dayflow Admin","9000000000","HQ","Human Resources","HR Administrator","2025-01-01");
 const hr=insUser.run("HR001","HR Officer","hr@dayflow.com",bcrypt.hashSync("Hr@12345",10),"HR");
 insEmp.run(hr.lastInsertRowid,"HR001","HR Officer","9000000001","HQ","Human Resources","HR Officer","2025-02-01");
 const names=[["EMP001","Harini Kumar","harini@dayflow.com","AI & ML","Software Engineer"],["EMP002","Rahul Kumar","rahul@dayflow.com","Engineering","Frontend Developer"],["EMP003","Priya Sharma","priya@dayflow.com","Finance","Accountant"],["EMP004","Arun Raj","arun@dayflow.com","Engineering","Backend Developer"],["EMP005","Meena S","meena@dayflow.com","Operations","Operations Executive"]];
 for(const [eid,name,email,dept,des] of names){
   const u=insUser.run(eid,name,email,bcrypt.hashSync("Employee@123",10),"EMPLOYEE");
   const e=insEmp.run(u.lastInsertRowid,eid,name,"9876543210","Coimbatore",""+dept,des,"2026-01-10");
   insPay.run(e.lastInsertRowid,30000,5000,2000,33000,"August 2026");
 }
 const employees=db.prepare("SELECT id,user_id FROM employees WHERE employee_id LIKE 'EMP%'").all();
 const today=new Date();
 for(const e of employees){
   for(let i=1;i<=12;i++){
     const d=new Date(today); d.setDate(today.getDate()-i);
     const date=d.toISOString().slice(0,10);
     db.prepare("INSERT OR IGNORE INTO attendance(employee_id,date,check_in,check_out,status,working_hours) VALUES(?,?,?,?,?,?)")
       .run(e.id,date,"09:0"+(i%5),"17:3"+(i%5),"PRESENT",8.5);
   }
 }
 const emp1=employees[0].id, emp2=employees[1].id;
 db.prepare("INSERT INTO leaves(employee_id,leave_type,start_date,end_date,reason,status,admin_comment) VALUES(?,?,?,?,?,?,?)").run(emp1,"SICK","2026-08-25","2026-08-27","Medical appointment","PENDING","");
 db.prepare("INSERT INTO leaves(employee_id,leave_type,start_date,end_date,reason,status,admin_comment) VALUES(?,?,?,?,?,?,?)").run(emp2,"PAID","2026-08-29","2026-08-30","Personal work","APPROVED","Approved by HR");
}
seed();

function auth(req,res,next){
 try{
  const h=req.headers.authorization||"";
  const token=h.startsWith("Bearer ")?h.slice(7):null;
  if(!token) return res.status(401).json({message:"Authentication required"});
  req.user=jwt.verify(token,process.env.JWT_SECRET||"dayflow-demo-secret");
  next();
 }catch(e){return res.status(401).json({message:"Invalid or expired session"})}
}
function role(...roles){return (req,res,next)=>roles.includes(req.user.role)?next():res.status(403).json({message:"Access denied"})}
function currentEmployee(req){return db.prepare("SELECT * FROM employees WHERE user_id=?").get(req.user.id)}

app.post("/api/auth/signup",(req,res)=>{
 const {employee_id,name,email,password,role:requestedRole}=req.body;
 if(!employee_id||!name||!email||!password) return res.status(400).json({message:"All required fields must be provided"});
 if(password.length<8) return res.status(400).json({message:"Password must be at least 8 characters"});
 const roleValue=requestedRole==="HR"?"HR":"EMPLOYEE";
 try{
  const hash=bcrypt.hashSync(password,10);
  const info=db.prepare("INSERT INTO users(employee_id,name,email,password_hash,role) VALUES(?,?,?,?,?)").run(employee_id,name,email.toLowerCase(),hash,roleValue);
  db.prepare("INSERT INTO employees(user_id,employee_id,name) VALUES(?,?,?)").run(info.lastInsertRowid,employee_id,name);
  const emp=db.prepare("SELECT id FROM employees WHERE user_id=?").get(info.lastInsertRowid);
  db.prepare("INSERT INTO payroll(employee_id,basic_salary,allowances,deductions,net_salary) VALUES(?,?,?,?,?)").run(emp.id,30000,5000,2000,33000);
  res.json({message:"Account created successfully"});
 }catch(e){res.status(400).json({message:"Email or Employee ID already exists"})}
});
app.post("/api/auth/login",(req,res)=>{
 const u=db.prepare("SELECT * FROM users WHERE email=?").get((req.body.email||"").toLowerCase());
 if(!u||!bcrypt.compareSync(req.body.password||"",u.password_hash)) return res.status(401).json({message:"Incorrect email or password"});
 const token=jwt.sign({id:u.id,email:u.email,role:u.role,name:u.name},process.env.JWT_SECRET||"dayflow-demo-secret",{expiresIn:"8h"});
 res.json({token,user:{id:u.id,name:u.name,email:u.email,role:u.role,employee_id:u.employee_id}});
});

app.get("/api/dashboard",auth,(req,res)=>{
 const emp=currentEmployee(req);
 if(req.user.role==="EMPLOYEE"){
  const today=new Date().toISOString().slice(0,10);
  const present=db.prepare("SELECT COUNT(*) c FROM attendance WHERE employee_id=? AND status='PRESENT'").get(emp.id).c;
  const hours=db.prepare("SELECT COALESCE(SUM(working_hours),0) h FROM attendance WHERE employee_id=?").get(emp.id).h;
  const pending=db.prepare("SELECT COUNT(*) c FROM leaves WHERE employee_id=? AND status='PENDING'").get(emp.id).c;
  const payroll=db.prepare("SELECT * FROM payroll WHERE employee_id=?").get(emp.id);
  const todayRow=db.prepare("SELECT * FROM attendance WHERE employee_id=? AND date=?").get(emp.id,today);
  const recentLeaves=db.prepare("SELECT * FROM leaves WHERE employee_id=? ORDER BY id DESC LIMIT 5").all(emp.id);
  return res.json({user:req.user,stats:{present,hours:Number(hours).toFixed(1),pendingLeaves:pending},payroll,recentLeaves,today:todayRow});
 }
 const employees=db.prepare("SELECT COUNT(*) c FROM employees WHERE employee_id NOT LIKE 'ADM%' AND employee_id NOT LIKE 'HR%'").get().c;
 const today=new Date().toISOString().slice(0,10);
 const presentToday=db.prepare("SELECT COUNT(*) c FROM attendance WHERE date=? AND status='PRESENT'").get(today).c;
 const onLeave=db.prepare("SELECT COUNT(*) c FROM leaves WHERE status='APPROVED' AND start_date<=? AND end_date>=?").get(today,today).c;
 const pendingLeaves=db.prepare("SELECT COUNT(*) c FROM leaves WHERE status='PENDING'").get().c;
 const recentLeaves=db.prepare("SELECT l.*,e.name employee_name FROM leaves l JOIN employees e ON e.id=l.employee_id ORDER BY l.id DESC LIMIT 6").all();
 res.json({user:req.user,stats:{employees,presentToday,onLeave,pendingLeaves},recentLeaves});
});

app.get("/api/profile",auth,(req,res)=>{
 const e=currentEmployee(req); const p=db.prepare("SELECT * FROM payroll WHERE employee_id=?").get(e.id);
 res.json({...e,email:req.user.email,net_salary:p?.net_salary||0});
});
app.put("/api/profile",auth,(req,res)=>{
 const e=currentEmployee(req); db.prepare("UPDATE employees SET phone=?,address=? WHERE id=?").run(req.body.phone||"",req.body.address||"",e.id);
 res.json({...e,...db.prepare("SELECT * FROM employees WHERE id=?").get(e.id),email:req.user.email});
});

app.get("/api/attendance",auth,(req,res)=>{
 const emp=currentEmployee(req);
 let items;
 if(req.user.role==="EMPLOYEE") items=db.prepare("SELECT a.*,e.name employee_name FROM attendance a JOIN employees e ON e.id=a.employee_id WHERE a.employee_id=? ORDER BY date DESC").all(emp.id);
 else items=db.prepare("SELECT a.*,e.name employee_name FROM attendance a JOIN employees e ON e.id=a.employee_id ORDER BY date DESC LIMIT 200").all();
 const today=new Date().toISOString().slice(0,10);
 const todayRow=req.user.role==="EMPLOYEE"?db.prepare("SELECT * FROM attendance WHERE employee_id=? AND date=?").get(emp.id,today):null;
 res.json({items,today:todayRow});
});
app.post("/api/attendance/checkin",auth,role("EMPLOYEE"),(req,res)=>{
 const e=currentEmployee(req), date=new Date().toISOString().slice(0,10), time=new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",hour12:false});
 try{db.prepare("INSERT INTO attendance(employee_id,date,check_in,status) VALUES(?,?,?,'PRESENT')").run(e.id,date,time);res.json({message:"Checked in",time})}catch(x){res.status(400).json({message:"Already checked in today"})}
});
app.post("/api/attendance/checkout",auth,role("EMPLOYEE"),(req,res)=>{
 const e=currentEmployee(req),date=new Date().toISOString().slice(0,10);
 const row=db.prepare("SELECT * FROM attendance WHERE employee_id=? AND date=?").get(e.id,date);
 if(!row||!row.check_in)return res.status(400).json({message:"Check in first"});
 const time=new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",hour12:false});
 const [h1,m1]=row.check_in.split(":").map(Number),[h2,m2]=time.split(":").map(Number);
 const hours=Math.max(0,((h2*60+m2)-(h1*60+m1))/60);
 db.prepare("UPDATE attendance SET check_out=?,working_hours=? WHERE id=?").run(time,Number(hours.toFixed(2)),row.id);
 res.json({message:"Checked out",time});
});

app.get("/api/leaves",auth,(req,res)=>{
 const e=currentEmployee(req);
 if(req.user.role==="EMPLOYEE") return res.json({items:db.prepare("SELECT * FROM leaves WHERE employee_id=? ORDER BY id DESC").all(e.id)});
 res.json({items:db.prepare("SELECT l.*,e.name employee_name FROM leaves l JOIN employees e ON e.id=l.employee_id ORDER BY l.id DESC").all()});
});
app.post("/api/leaves",auth,role("EMPLOYEE"),(req,res)=>{
 const e=currentEmployee(req),{leave_type,start_date,end_date,reason}=req.body;
 if(!leave_type||!start_date||!end_date||!reason)return res.status(400).json({message:"Complete the leave form"});
 const info=db.prepare("INSERT INTO leaves(employee_id,leave_type,start_date,end_date,reason) VALUES(?,?,?,?,?)").run(e.id,leave_type,start_date,end_date,reason);
 const admins=db.prepare("SELECT id FROM users WHERE role IN ('ADMIN','HR')").all();
 for(const a of admins)db.prepare("INSERT INTO notifications(user_id,title,message) VALUES(?,?,?)").run(a.id,"New leave request",`${e.name} submitted a ${leave_type} leave request.`);
 res.json({id:info.lastInsertRowid});
});
app.get("/api/leaves/all",auth,role("ADMIN","HR"),(req,res)=>res.json({items:db.prepare("SELECT l.*,e.name employee_name FROM leaves l JOIN employees e ON e.id=l.employee_id ORDER BY l.id DESC").all()}));
app.put("/api/leaves/:id",auth,role("ADMIN","HR"),(req,res)=>{
 const leave=db.prepare("SELECT l.*,e.name employee_name,e.user_id FROM leaves l JOIN employees e ON e.id=l.employee_id WHERE l.id=?").get(req.params.id);
 if(!leave)return res.status(404).json({message:"Leave not found"});
 db.prepare("UPDATE leaves SET status=?,admin_comment=?,approved_at=CURRENT_TIMESTAMP WHERE id=?").run(req.body.status,req.body.admin_comment||"",req.params.id);
 db.prepare("INSERT INTO notifications(user_id,title,message) VALUES(?,?,?)").run(leave.user_id,`Leave ${req.body.status.toLowerCase()}`,`Your ${leave.leave_type} leave request has been ${req.body.status.toLowerCase()}.`);
 if(req.body.status==="APPROVED"){
  let d=new Date(leave.start_date),end=new Date(leave.end_date);
  while(d<=end){const ds=d.toISOString().slice(0,10);db.prepare("INSERT OR IGNORE INTO attendance(employee_id,date,status) VALUES(?,?,'LEAVE')").run(leave.employee_id,ds);d.setDate(d.getDate()+1)}
 }
 res.json({message:"Leave updated"});
});

app.get("/api/employees",auth,role("ADMIN","HR"),(req,res)=>res.json({items:db.prepare("SELECT * FROM employees WHERE employee_id NOT LIKE 'ADM%' AND employee_id NOT LIKE 'HR%' ORDER BY name").all()}));

app.get("/api/payroll",auth,(req,res)=>{
 const e=currentEmployee(req);
 const items=req.user.role==="EMPLOYEE"
 ? db.prepare("SELECT p.*,e.name employee_name FROM payroll p JOIN employees e ON e.id=p.employee_id WHERE p.employee_id=?").all(e.id)
 : db.prepare("SELECT p.*,e.name employee_name FROM payroll p JOIN employees e ON e.id=p.employee_id ORDER BY e.name").all();
 res.json({items});
});
app.put("/api/payroll/:id",auth,role("ADMIN","HR"),(req,res)=>{
 const basic=Number(req.body.basic_salary)||0,allowances=Number(req.body.allowances)||0,deductions=Number(req.body.deductions)||0;
 db.prepare("UPDATE payroll SET basic_salary=?,allowances=?,deductions=?,net_salary=? WHERE id=?").run(basic,allowances,deductions,basic+allowances-deductions,req.params.id);
 res.json({message:"Payroll updated"});
});

app.get("/api/reports",auth,role("ADMIN","HR"),(req,res)=>{
 const employees=db.prepare("SELECT COUNT(*) c FROM employees WHERE employee_id LIKE 'EMP%'").get().c;
 const totalAttendance=db.prepare("SELECT COUNT(*) c FROM attendance").get().c;
 const present=db.prepare("SELECT COUNT(*) c FROM attendance WHERE status='PRESENT'").get().c;
 const approvedLeaves=db.prepare("SELECT COUNT(*) c FROM leaves WHERE status='APPROVED'").get().c;
 const payrollTotal=db.prepare("SELECT COALESCE(SUM(net_salary),0) s FROM payroll p JOIN employees e ON e.id=p.employee_id WHERE e.employee_id LIKE 'EMP%'").get().s;
 const departments=db.prepare("SELECT department,COUNT(*) count FROM employees WHERE employee_id LIKE 'EMP%' GROUP BY department ORDER BY count DESC").all();
 const leaveStats=db.prepare("SELECT status,COUNT(*) count FROM leaves GROUP BY status").all();
 res.json({employees,attendanceRate:totalAttendance?Number((present/totalAttendance*100).toFixed(1)):0,approvedLeaves,payrollTotal,departments,leaveStats});
});

app.get("/api/notifications",auth,(req,res)=>res.json({items:db.prepare("SELECT * FROM notifications WHERE user_id=? ORDER BY id DESC LIMIT 30").all(req.user.id)}));

app.use(express.static(path.join(__dirname,"../client/dist")));
app.get("*",(req,res)=>{if(req.path.startsWith("/api/"))return res.status(404).end();res.sendFile(path.join(__dirname,"../client/dist/index.html"))});

const port=process.env.PORT||5000;
app.listen(port,()=>console.log(`Dayflow running on http://localhost:${port}`));
