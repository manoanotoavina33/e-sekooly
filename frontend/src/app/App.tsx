import { DashboardLayout } from "@/components/layout/DashboardLayout";
import DashboardPage from "@/features/dashboard/DashboardPage";
import LoginPage from "@/features/auth/LoginPage";
import SettingsPage from "@/features/settings/SettingsPage";
import StudentsPage from "@/features/students/StudentsPage";
import TeachersPage from "@/features/teachers/TeachersPage";
import AcademicsPage from "@/features/academics/AcademicsPage";
import TimetablePage from "@/features/academics/timetable/TimetablePage";
import AttendancePage from "@/features/attendance/AttendancePage";
import ExaminationsPage from "@/features/examinations/ExaminationsPage";
import DisciplinePage from "@/features/discipline/DisciplinePage";
import CommunicationPage from "@/features/communication/CommunicationPage";
import FinancePage from "@/features/finance/FinancePage";
import CashierPage from "@/features/cashier/CashierPage";

import ReportsPage from "@/features/reports/ReportsPage";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { PermissionRoute } from "@/routes/PermissionRoute";
import { Navigate, HashRouter, BrowserRouter, Route, Routes } from "react-router-dom";
import { SyncStatus } from "@/components/SyncStatus";

const isPackaged = typeof window !== "undefined" && window.location.protocol === "file:";
const Router = isPackaged ? HashRouter : BrowserRouter;

export function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/students" element={<PermissionRoute permission="students.read"><StudentsPage /></PermissionRoute>} />
            <Route path="/teachers" element={<PermissionRoute permission="hr.read"><TeachersPage /></PermissionRoute>} />
            <Route path="/academics" element={<PermissionRoute permission="academics.read"><AcademicsPage /></PermissionRoute>} />
            <Route path="/timetable" element={<PermissionRoute permission="academics.read"><TimetablePage /></PermissionRoute>} />
            <Route path="/attendance" element={<PermissionRoute permission="attendance.read"><AttendancePage /></PermissionRoute>} />
            <Route path="/examinations" element={<PermissionRoute permission="exams.read"><ExaminationsPage /></PermissionRoute>} />
            <Route path="/discipline" element={<PermissionRoute permission="discipline.read"><DisciplinePage /></PermissionRoute>} />
            <Route path="/communication" element={<PermissionRoute permission="communication.manage"><CommunicationPage /></PermissionRoute>} />
            <Route path="/finance" element={<PermissionRoute permission="finance.read"><FinancePage /></PermissionRoute>} />
            <Route path="/cashier" element={<PermissionRoute permission="cashier.read"><CashierPage /></PermissionRoute>} />

            <Route path="/reports" element={<PermissionRoute permission="reports.read"><ReportsPage /></PermissionRoute>} />
            <Route path="/settings" element={<PermissionRoute permission="settings.read"><SettingsPage /></PermissionRoute>} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <SyncStatus />
    </Router>
  );
}
