import { Router } from "express";
import { authenticate } from "../../../core/middlewares/authenticate";
import { authorize } from "../../../core/middlewares/authorize";
import { validateBody, validateQuery } from "../../../core/middlewares/validate";
import { employeeController } from "../controllers/employee.controller";
import {
  assignSubjectSchema,
  createContractSchema,
  createEmployeeSchema,
  createLeaveSchema,
  createSalaryPaymentSchema,
  decideLeaveSchema,
  listEmployeesQuerySchema,
  updateEmployeeSchema,
} from "../validations/employee.validation";

export const employeeRouter = Router();

employeeRouter.use(authenticate);

employeeRouter.get("/", authorize("hr.read"), validateQuery(listEmployeesQuerySchema), employeeController.list);
employeeRouter.get("/count/active", authorize("hr.read"), employeeController.countActive);
employeeRouter.get("/:id", authorize("hr.read"), employeeController.getById);
employeeRouter.post("/", authorize("hr.manage"), validateBody(createEmployeeSchema), employeeController.create);
employeeRouter.patch("/:id", authorize("hr.manage"), validateBody(updateEmployeeSchema), employeeController.update);
employeeRouter.delete("/:id", authorize("hr.manage"), employeeController.delete);

employeeRouter.post(
  "/:id/contracts",
  authorize("hr.manage"),
  validateBody(createContractSchema),
  employeeController.addContract
);

employeeRouter.post(
  "/:id/leaves",
  authorize("hr.read"), // un employé peut demander un congé sur son propre dossier
  validateBody(createLeaveSchema),
  employeeController.requestLeave
);
employeeRouter.patch(
  "/:id/leaves/:leaveId",
  authorize("hr.manage"),
  validateBody(decideLeaveSchema),
  employeeController.decideLeave
);

employeeRouter.post(
  "/:id/subjects",
  authorize("hr.manage"),
  validateBody(assignSubjectSchema),
  employeeController.assignSubject
);

employeeRouter.post(
  "/:id/salary-payments",
  authorize("finance.manage"),
  validateBody(createSalaryPaymentSchema),
  employeeController.recordSalaryPayment
);
