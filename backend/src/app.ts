import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./core/middlewares/errorHandler";
import { authRouter } from "./modules/auth/routes/auth.routes";
import { studentRouter } from "./modules/students/routes/student.routes";
import { employeeRouter } from "./modules/teachers/routes/employee.routes";
import { classRoomRouter } from "./modules/academics/classrooms/routes/classroom.routes";
import { subjectRouter } from "./modules/academics/subjects/routes/subject.routes";
import { timetableRouter } from "./modules/academics/timetable/routes/timetable.routes";
import { studentAttendanceRouter } from "./modules/attendance/students/routes/studentAttendance.routes";
import { staffAttendanceRouter } from "./modules/attendance/staff/routes/staffAttendance.routes";
import { examRouter } from "./modules/examinations/exams/routes/exam.routes";
import { gradeRouter } from "./modules/examinations/grades/routes/grade.routes";
import { reportCardRouter } from "./modules/examinations/reportcards/routes/reportcard.routes";
import { disciplineRouter } from "./modules/discipline/routes/discipline.routes";
import { messageRouter } from "./modules/communication/messages/routes/message.routes";
import { announcementRouter } from "./modules/communication/announcements/routes/announcement.routes";
import { notificationRouter } from "./modules/communication/notifications/routes/notification.routes";
import { feeCategoryRouter } from "./modules/finance/categories/routes/feeCategory.routes";
import { financialAidRouter } from "./modules/finance/financialaid/routes/financialAid.routes";
import { invoiceRouter } from "./modules/finance/invoices/routes/invoice.routes";
import { paymentRouter } from "./modules/finance/payments/routes/payment.routes";
import { cashRegisterRouter } from "./modules/cashier/registers/routes/cashRegister.routes";
import { cashSessionRouter } from "./modules/cashier/sessions/routes/cashSession.routes";
import { cashTransactionRouter } from "./modules/cashier/transactions/routes/cashTransaction.routes";

import { reportRouter } from "./modules/reports/routes/report.routes";
import { schoolRouter } from "./modules/settings/school/routes/school.routes";
import { backupRouter } from "./modules/backup/routes/backup.routes";
import { syncRouter } from "./modules/sync/routes/sync.routes";
import { userRouter } from "./modules/users/routes/user.routes";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({
    origin: (origin, callback) => {
      const allowed = [env.corsOrigin, "http://localhost:5173", "http://localhost:4000", "file://"];
      if (!origin || origin === "null" || allowed.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Origin not allowed by CORS"));
      }
    },
    credentials: true,
  }));
  app.use(express.json({ limit: "20mb" }));
  app.use(cookieParser());
  app.use(morgan(env.nodeEnv === "development" ? "dev" : "combined"));

  app.get("/api/health", (_req, res) => {
    res.json({ success: true, service: "e-sekooly-backend", status: "ok" });
  });

  // Module 1 : Authentification. Les modules suivants (élèves, enseignants,
  // classes, finances, ...) monteront leurs routeurs ici de la même façon :
  // app.use("/api/students", studentsRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/students", studentRouter);
  app.use("/api/employees", employeeRouter);
  app.use("/api/classrooms", classRoomRouter);
  app.use("/api/subjects", subjectRouter);
  app.use("/api/timetable", timetableRouter);
  app.use("/api/attendance/students", studentAttendanceRouter);
  app.use("/api/attendance/staff", staffAttendanceRouter);
  app.use("/api/exams", examRouter);
  app.use("/api/grades", gradeRouter);
  app.use("/api/report-cards", reportCardRouter);
  app.use("/api/discipline", disciplineRouter);
  app.use("/api/messages", messageRouter);
  app.use("/api/announcements", announcementRouter);
  app.use("/api/notifications", notificationRouter);
  app.use("/api/finance/categories", feeCategoryRouter);
  app.use("/api/finance/financial-aid", financialAidRouter);
  app.use("/api/finance/invoices", invoiceRouter);
  app.use("/api/finance/payments", paymentRouter);
  app.use("/api/cashier/registers", cashRegisterRouter);
  app.use("/api/cashier/sessions", cashSessionRouter);
  app.use("/api/cashier/transactions", cashTransactionRouter);

  app.use("/api/reports", reportRouter);
  app.use("/api/schools", schoolRouter);
  app.use("/api/backups", backupRouter);
  app.use("/api/sync", syncRouter);
  app.use("/api/users", userRouter);

  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
