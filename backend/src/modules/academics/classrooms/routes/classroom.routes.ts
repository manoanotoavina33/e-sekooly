import { Router } from "express";
import { authenticate } from "../../../../core/middlewares/authenticate";
import { authorize } from "../../../../core/middlewares/authorize";
import { validateBody, validateQuery } from "../../../../core/middlewares/validate";
import { classRoomController } from "../controllers/classroom.controller";
import {
  createClassRoomSchema,
  listClassRoomsQuerySchema,
  updateClassRoomSchema,
} from "../validations/classroom.validation";

export const classRoomRouter = Router();

classRoomRouter.use(authenticate);

classRoomRouter.get("/", authorize("academics.read"), validateQuery(listClassRoomsQuerySchema), classRoomController.list);
classRoomRouter.get("/:id", authorize("academics.read"), classRoomController.getById);
classRoomRouter.post("/", authorize("academics.manage"), validateBody(createClassRoomSchema), classRoomController.create);
classRoomRouter.patch("/:id", authorize("academics.manage"), validateBody(updateClassRoomSchema), classRoomController.update);
classRoomRouter.delete("/:id", authorize("academics.manage"), classRoomController.remove);
