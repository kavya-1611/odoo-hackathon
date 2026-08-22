// Simple localStorage-backed "database" so any number of people can
// sign up and log in for real (persists in the browser, no backend needed yet).

const KEYS = {
  users: "dayflow_users",
  employees: "dayflow_employees",
  attendance: "dayflow_attendance",
  leaves: "dayflow_leaves",
};

const seedUsers = [
  { empId: "EMP000", name: "HR Admin", email: "admin@dayflow.com", password: "admin123", role: "Admin" },
  { empId: "EMP001", name: "Aditi Rao", email: "aditi@dayflow.com", password: "emp123", role: "Employee" },
];

const seedEmployees = [
  { id: "EMP001", name: "Aditi Rao", email: "aditi@dayflow.com", designation: "UI Designer", dept: "Product", phone: "9876543210", address: "Coimbatore, TN", salary: 52000, joined: "2023-03-14" },
  { id: "EMP002", name: "Karthik Menon", email: "karthik@dayflow.com", designation: "Backend Dev", dept: "Engineering", phone: "9876501234", address: "Chennai, TN", salary: 68000, joined: "2022-11-02" },
  { id: "EMP003", name: "Priya Sharma", email: "priya@dayflow.com", designation: "HR Executive", dept: "People Ops", phone: "9876511111", address: "Bengaluru, KA", salary: 45000, joined: "2024-01-20" },
];

const seedAttendance = [
  { id: 1, empId: "EMP001", date: "2026-08-18", status: "Present", checkIn: "09:02", checkOut: "18:05" },
  { id: 2, empId: "EMP001", date: "2026-08-19", status: "Present", checkIn: "09:10", checkOut: "18:00" },
  { id: 3, empId: "EMP001", date: "2026-08-20", status: "Half-day", checkIn: "09:05", checkOut: "13:30" },
  { id: 4, empId: "EMP001", date: "2026-08-21", status: "Absent", checkIn: "-", checkOut: "-" },
  { id: 5, empId: "EMP002", date: "2026-08-21", status: "Present", checkIn: "09:00", checkOut: "18:10" },
  { id: 6, empId: "EMP003", date: "2026-08-21", status: "Leave", checkIn: "-", checkOut: "-" },
];

const seedLeaves = [
  { id: 1, empId: "EMP001", name: "Aditi Rao", type: "Sick", from: "2026-08-25", to: "2026-08-26", remarks: "Fever", status: "Pending" },
  { id: 2, empId: "EMP002", name: "Karthik Menon", type: "Paid", from: "2026-08-30", to: "2026-09-02", remarks: "Family trip", status: "Approved" },
  { id: 3, empId: "EMP003", name: "Priya Sharma", type: "Unpaid", from: "2026-09-05", to: "2026-09-05", remarks: "Personal work", status: "Rejected" },
];

function load(key, seed) {
  const raw = localStorage.getItem(key);
  if (raw) return JSON.parse(raw);
  localStorage.setItem(key, JSON.stringify(seed));
  return seed;
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export const store = {
  getUsers: () => load(KEYS.users, seedUsers),
  saveUsers: (v) => save(KEYS.users, v),

  getEmployees: () => load(KEYS.employees, seedEmployees),
  saveEmployees: (v) => save(KEYS.employees, v),

  getAttendance: () => load(KEYS.attendance, seedAttendance),
  saveAttendance: (v) => save(KEYS.attendance, v),

  getLeaves: () => load(KEYS.leaves, seedLeaves),
  saveLeaves: (v) => save(KEYS.leaves, v),
};

export const STATUS_COLOR = {
  Present: "bg-emerald-100 text-emerald-700",
  Approved: "bg-emerald-100 text-emerald-700",
  Absent: "bg-rose-100 text-rose-700",
  Rejected: "bg-rose-100 text-rose-700",
  "Half-day": "bg-amber-100 text-amber-700",
  Pending: "bg-amber-100 text-amber-700",
  Leave: "bg-sky-100 text-sky-700",
};
