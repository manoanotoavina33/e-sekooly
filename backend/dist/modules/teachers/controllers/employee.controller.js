"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.employeeController = void 0;
const asyncHandler_1 = require("../../../core/utils/asyncHandler");
const employee_service_1 = require("../services/employee.service");
exports.employeeController = {
    list: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const result = await employee_service_1.employeeService.list(req.query);
        res.json({ success: true, data: result.items, meta: { total: result.total, page: result.page, pageSize: result.pageSize } });
    }),
    getById: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const employee = await employee_service_1.employeeService.getById(req.params.id);
        res.json({ success: true, data: employee });
    }),
    countActive: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { schoolId } = req.query;
        if (!schoolId) {
            res.status(400).json({ success: false, message: "schoolId est requis" });
            return;
        }
        const count = await employee_service_1.employeeService.countActiveTeachers(schoolId);
        res.json({ success: true, data: { count } });
    }),
    create: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const employee = await employee_service_1.employeeService.create(req.body);
        res.status(201).json({ success: true, data: employee });
    }),
    update: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const employee = await employee_service_1.employeeService.update(req.params.id, req.body);
        res.json({ success: true, data: employee });
    }),
    delete: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        await employee_service_1.employeeService.delete(req.params.id);
        res.json({ success: true });
    }),
    addContract: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const contract = await employee_service_1.employeeService.addContract(req.params.id, req.body);
        res.status(201).json({ success: true, data: contract });
    }),
    requestLeave: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const leave = await employee_service_1.employeeService.requestLeave(req.params.id, req.body);
        res.status(201).json({ success: true, data: leave });
    }),
    decideLeave: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const leave = await employee_service_1.employeeService.decideLeave(req.params.leaveId, req.body.status, req.auth.userId);
        res.json({ success: true, data: leave });
    }),
    assignSubject: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const assignment = await employee_service_1.employeeService.assignSubject(req.params.id, req.body.subjectId, req.body.classRoomId);
        res.status(201).json({ success: true, data: assignment });
    }),
    recordSalaryPayment: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const payment = await employee_service_1.employeeService.recordSalaryPayment(req.params.id, req.body);
        res.status(201).json({ success: true, data: payment });
    }),
};
//# sourceMappingURL=employee.controller.js.map