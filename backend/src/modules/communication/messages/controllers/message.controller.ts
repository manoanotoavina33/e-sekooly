import { Request, Response } from "express";
import { asyncHandler } from "../../../../core/utils/asyncHandler";
import { messageService } from "../services/message.service";
import { SendMessageInput } from "../validations/message.validation";

export const messageController = {
  send: asyncHandler(async (req: Request<unknown, unknown, SendMessageInput>, res: Response) => {
    const message = await messageService.send(req.body, req.auth!.userId);
    res.status(201).json({ success: true, data: message });
  }),

  inbox: asyncHandler(async (req: Request, res: Response) => {
    const messages = await messageService.inbox(req.auth!.userId);
    res.json({ success: true, data: messages });
  }),

  sent: asyncHandler(async (req: Request, res: Response) => {
    const messages = await messageService.sent(req.auth!.userId);
    res.json({ success: true, data: messages });
  }),

  markRead: asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
    await messageService.markRead(req.params.id, req.auth!.userId);
    res.json({ success: true });
  }),
};
