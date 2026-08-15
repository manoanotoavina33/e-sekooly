"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.employeeRouter = void 0;
const express_1 = require("express");
const authenticate_1 = require("../../../core/middlewares/authenticate");
const authorize_1 = require("../../../core/middlewares/authorize");
const validate_1 = require("../../../core/middlewares/validate");
const employee_controller_1 = require("../controllers/employee.controller");
const employee_validation_1 = require("../validations/employee.validation");
exports.employeeRouter = (0, express_1.Router)();
exports.employeeRouter.use(authenticate_1.authenticate);
exports.employeeRouter.get("/", (0, authorize_1.authorize)("hr.read"), (0, validate_1.validateQuery)(employee_validation_1.listEmployeesQuerySchema), employee_controller_1.employeeController.list);
exports.employeeRouter.get("/count/active", (0, authorize_1.authorize)("hr.read"), employee_controller_1.employeeController.countActive);
exports.employeeRouter.get("/:id", (0, authorize_1.authorize)("hr.read"), employee_controller_1.employeeController.getById);
exports.employeeRouter.post("/", (0, authorize_1.authorize)("hr.manage"), (0, validate_1.validateBody)(employee_validation_1.createEmployeeSchema), employee_controller_1.employeeController.create);
exports.employeeRouter.patch("/:id", (0, authorize_1.authorize)("hr.manage"), (0, validate_1.validateBody)(employee_validation_1.updateEmployeeSchema), employee_controller_1.employeeController.update);
exports.employeeRouter.delete("/:id", (0, authorize_1.authorize)("hr.manage"), employee_controller_1.employeeController.delete);
exports.employeeRouter.post("/:id/contracts", (0, authorize_1.authorize)("hr.manage"), (0, validate_1.validateBody)(employee_validation_1.createContractSchema), employee_controller_1.employeeController.addContract);
exports.employeeRouter.post("/:id/leaves", (0, authorize_1.authorize)("hr.read"), // un employé peut demander un congé sur son propre dossier
(0, validate_1.validateBody)(employee_validation_1.createLeaveSchema), employee_controller_1.employeeController.requestLeave);
exports.employeeRouter.patch("/:id/leaves/:leaveId", (0, authorize_1.authorize)("hr.manage"), (0, validate_1.validateBody)(employee_validation_1.decideLeaveSchema), employee_controller_1.employeeController.decideLeave);
exports.employeeRouter.post("/:id/subjects", (0, authorize_1.authorize)("hr.manage"), (0, validate_1.validateBody)(employee_validation_1.assignSubjectSchema), employee_controller_1.employeeController.assignSubject);
exports.employeeRouter.post("/:id/salary-payments", (0, authorize_1.authorize)("finance.manage"), (0, validate_1.validateBody)(employee_validation_1.createSalaryPaymentSchema), employee_controller_1.employeeController.recordSalaryPayment);
//# sourceMappingURL=employee.routes.js.map