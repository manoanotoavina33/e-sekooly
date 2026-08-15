import { Router } from "express";
import { authenticate } from "../../../core/middlewares/authenticate";
import { authorize } from "../../../core/middlewares/authorize";
import { validateBody, validateQuery } from "../../../core/middlewares/validate";
import { userController } from "../controllers/user.controller";
import { createUserSchema, listUsersQuerySchema, updateUserSchema } from "../validations/user.validation";

export const userRouter = Router();

userRouter.use(authenticate);

userRouter.get("/", authorize("users.manage"), validateQuery(listUsersQuerySchema), userController.list);
userRouter.get("/roles", authorize("users.manage"), userController.roles);
userRouter.post("/", authorize("users.manage"), validateBody(createUserSchema), userController.create);
userRouter.patch("/:id", authorize("users.manage"), validateBody(updateUserSchema), userController.update);
userRouter.delete("/:id", authorize("users.manage"), userController.delete);
