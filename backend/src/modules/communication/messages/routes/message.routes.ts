import { Router } from "express";
import { authenticate } from "../../../../core/middlewares/authenticate";
import { validateBody } from "../../../../core/middlewares/validate";
import { messageController } from "../controllers/message.controller";
import { sendMessageSchema } from "../validations/message.validation";

export const messageRouter = Router();

messageRouter.use(authenticate);

messageRouter.get("/inbox", messageController.inbox);
messageRouter.get("/sent", messageController.sent);
messageRouter.post("/", validateBody(sendMessageSchema), messageController.send);
messageRouter.patch("/:id/read", messageController.markRead);
