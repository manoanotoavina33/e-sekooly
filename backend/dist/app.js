"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
const env_1 = require("./config/env");
const errorHandler_1 = require("./core/middlewares/errorHandler");
const auth_routes_1 = require("./modules/auth/routes/auth.routes");
const student_routes_1 = require("./modules/students/routes/student.routes");
const employee_routes_1 = require("./modules/teachers/routes/employee.routes");
const classroom_routes_1 = require("./modules/academics/classrooms/routes/classroom.routes");
const subject_routes_1 = require("./modules/academics/subjects/routes/subject.routes");
const timetable_routes_1 = require("./modules/academics/timetable/routes/timetable.routes");
const studentAttendance_routes_1 = require("./modules/attendance/students/routes/studentAttendance.routes");
const staffAttendance_routes_1 = require("./modules/attendance/staff/routes/staffAttendance.routes");
const exam_routes_1 = require("./modules/examinations/exams/routes/exam.routes");
const grade_routes_1 = require("./modules/examinations/grades/routes/grade.routes");
const reportcard_routes_1 = require("./modules/examinations/reportcards/routes/reportcard.routes");
const discipline_routes_1 = require("./modules/discipline/routes/discipline.routes");
const message_routes_1 = require("./modules/communication/messages/routes/message.routes");
const announcement_routes_1 = require("./modules/communication/announcements/routes/announcement.routes");
const notification_routes_1 = require("./modules/communication/notifications/routes/notification.routes");
const feeCategory_routes_1 = require("./modules/finance/categories/routes/feeCategory.routes");
const financialAid_routes_1 = require("./modules/finance/financialaid/routes/financialAid.routes");
const invoice_routes_1 = require("./modules/finance/invoices/routes/invoice.routes");
const payment_routes_1 = require("./modules/finance/payments/routes/payment.routes");
const cashRegister_routes_1 = require("./modules/cashier/registers/routes/cashRegister.routes");
const cashSession_routes_1 = require("./modules/cashier/sessions/routes/cashSession.routes");
const cashTransaction_routes_1 = require("./modules/cashier/transactions/routes/cashTransaction.routes");
const report_routes_1 = require("./modules/reports/routes/report.routes");
const school_routes_1 = require("./modules/settings/school/routes/school.routes");
const backup_routes_1 = require("./modules/backup/routes/backup.routes");
const sync_routes_1 = require("./modules/sync/routes/sync.routes");
const user_routes_1 = require("./modules/users/routes/user.routes");
function createApp() {
    const app = (0, express_1.default)();
    app.use((0, helmet_1.default)());
    app.use((0, cors_1.default)({
        origin: (origin, callback) => {
            const allowed = [env_1.env.corsOrigin, "http://localhost:5173", "http://localhost:4000", "file://"];
            if (!origin || origin === "null" || allowed.includes(origin)) {
                callback(null, true);
            }
            else {
                callback(new Error("Origin not allowed by CORS"));
            }
        },
        credentials: true,
    }));
    app.use(express_1.default.json({ limit: "20mb" }));
    app.use((0, cookie_parser_1.default)());
    app.use((0, morgan_1.default)(env_1.env.nodeEnv === "development" ? "dev" : "combined"));
    app.get("/api/health", (_req, res) => {
        res.json({ success: true, service: "e-sekooly-backend", status: "ok" });
    });
    // Module 1 : Authentification. Les modules suivants (élèves, enseignants,
    // classes, finances, ...) monteront leurs routeurs ici de la même façon :
    // app.use("/api/students", studentsRouter);
    app.use("/api/auth", auth_routes_1.authRouter);
    app.use("/api/students", student_routes_1.studentRouter);
    app.use("/api/employees", employee_routes_1.employeeRouter);
    app.use("/api/classrooms", classroom_routes_1.classRoomRouter);
    app.use("/api/subjects", subject_routes_1.subjectRouter);
    app.use("/api/timetable", timetable_routes_1.timetableRouter);
    app.use("/api/attendance/students", studentAttendance_routes_1.studentAttendanceRouter);
    app.use("/api/attendance/staff", staffAttendance_routes_1.staffAttendanceRouter);
    app.use("/api/exams", exam_routes_1.examRouter);
    app.use("/api/grades", grade_routes_1.gradeRouter);
    app.use("/api/report-cards", reportcard_routes_1.reportCardRouter);
    app.use("/api/discipline", discipline_routes_1.disciplineRouter);
    app.use("/api/messages", message_routes_1.messageRouter);
    app.use("/api/announcements", announcement_routes_1.announcementRouter);
    app.use("/api/notifications", notification_routes_1.notificationRouter);
    app.use("/api/finance/categories", feeCategory_routes_1.feeCategoryRouter);
    app.use("/api/finance/financial-aid", financialAid_routes_1.financialAidRouter);
    app.use("/api/finance/invoices", invoice_routes_1.invoiceRouter);
    app.use("/api/finance/payments", payment_routes_1.paymentRouter);
    app.use("/api/cashier/registers", cashRegister_routes_1.cashRegisterRouter);
    app.use("/api/cashier/sessions", cashSession_routes_1.cashSessionRouter);
    app.use("/api/cashier/transactions", cashTransaction_routes_1.cashTransactionRouter);
    app.use("/api/reports", report_routes_1.reportRouter);
    app.use("/api/schools", school_routes_1.schoolRouter);
    app.use("/api/backups", backup_routes_1.backupRouter);
    app.use("/api/sync", sync_routes_1.syncRouter);
    app.use("/api/users", user_routes_1.userRouter);
    app.use("/uploads", express_1.default.static(path_1.default.join(process.cwd(), "uploads")));
    // En mode "offline" (Electron), le backend sert aussi le frontend compilé
    // depuis la même origine (http://localhost:4000). Cela évite le problème de
    // cookie `Secure` non transmis entre une origine `file://` et le backend en
    // HTTP, et conserve le modèle de cookie httpOnly/sécurisé.
    if (env_1.env.serveFrontend && env_1.env.frontendDist) {
        const distDir = env_1.env.frontendDist;
        app.use(express_1.default.static(distDir));
        app.use((req, res, next) => {
            if (req.method === "GET" && !req.path.startsWith("/api") && !req.path.startsWith("/uploads")) {
                return res.sendFile(path_1.default.join(distDir, "index.html"));
            }
            next();
        });
    }
    app.use(errorHandler_1.notFoundHandler);
    app.use(errorHandler_1.errorHandler);
    return app;
}
//# sourceMappingURL=app.js.map