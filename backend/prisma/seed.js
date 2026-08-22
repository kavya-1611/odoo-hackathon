// Seeds the database with a demo admin, demo employees, attendance history,
// leave requests, and payroll records so the app (and the AI features) have
// realistic data to work with immediately after setup.

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const passwordHash = await bcrypt.hash("Password123!", 10);

  // --- Admin ---
  const admin = await prisma.user.upsert({
    where: { email: "admin@pulsehr.com" },
    update: {},
    create: {
      employeeId: "EMP-0001",
      email: "admin@pulsehr.com",
      passwordHash,
      role: "ADMIN",
      profile: {
        create: {
          fullName: "Asha Menon",
          department: "Human Resources",
          designation: "HR Manager",
          phone: "+91 90000 00001",
          joiningDate: new Date("2021-01-10"),
        },
      },
      payroll: {
        create: { basicSalary: 90000, allowances: 15000, deductions: 8000, netPay: 97000 },
      },
    },
  });

  // --- Employees ---
  const employeeSeed = [
    { id: "EMP-1002", name: "Ravi Kumar", dept: "Engineering", role: "Backend Developer", base: 65000 },
    { id: "EMP-1003", name: "Priya Sharma", dept: "Engineering", role: "Frontend Developer", base: 62000 },
    { id: "EMP-1004", name: "John Mathew", dept: "Sales", role: "Sales Executive", base: 45000 },
    { id: "EMP-1005", name: "Divya Nair", dept: "Design", role: "UI/UX Designer", base: 55000 },
  ];

  const employees = [];
  for (const e of employeeSeed) {
    const user = await prisma.user.upsert({
      where: { email: `${e.id.toLowerCase()}@pulsehr.com` },
      update: {},
      create: {
        employeeId: e.id,
        email: `${e.id.toLowerCase()}@pulsehr.com`,
        passwordHash,
        role: "EMPLOYEE",
        profile: {
          create: {
            fullName: e.name,
            department: e.dept,
            designation: e.role,
            phone: "+91 90000 00000",
            joiningDate: new Date("2022-06-01"),
          },
        },
        payroll: {
          create: {
            basicSalary: e.base,
            allowances: e.base * 0.15,
            deductions: e.base * 0.08,
            netPay: e.base + e.base * 0.15 - e.base * 0.08,
          },
        },
      },
    });
    employees.push(user);
  }

  // --- Attendance for the last 10 working days ---
  const statuses = ["PRESENT", "PRESENT", "PRESENT", "PRESENT", "HALF_DAY", "ABSENT"];
  for (const user of employees) {
    for (let i = 0; i < 10; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      await prisma.attendance.create({
        data: {
          userId: user.id,
          date,
          status,
          checkIn: status !== "ABSENT" ? new Date(date.setHours(9, Math.floor(Math.random() * 30))) : null,
          checkOut: status === "PRESENT" ? new Date(date.setHours(18, Math.floor(Math.random() * 30))) : null,
        },
      });
    }
  }

  // --- A couple of demo leave requests ---
  await prisma.leaveRequest.create({
    data: {
      userId: employees[0].id,
      leaveType: "SICK",
      startDate: new Date(Date.now() + 2 * 86400000),
      endDate: new Date(Date.now() + 3 * 86400000),
      remarks: "Fever, need rest for 2 days.",
      status: "PENDING",
    },
  });

  await prisma.leaveRequest.create({
    data: {
      userId: employees[1].id,
      leaveType: "PAID",
      startDate: new Date(Date.now() + 7 * 86400000),
      endDate: new Date(Date.now() + 9 * 86400000),
      remarks: "Family function out of town.",
      status: "PENDING",
    },
  });

  console.log("Seed complete.");
  console.log("Admin login:    admin@pulsehr.com / Password123!");
  console.log("Employee login: emp-1002@pulsehr.com / Password123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
