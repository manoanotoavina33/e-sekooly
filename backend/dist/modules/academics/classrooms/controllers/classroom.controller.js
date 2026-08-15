"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classRoomController = void 0;
const asyncHandler_1 = require("../../../../core/utils/asyncHandler");
const classroom_service_1 = require("../services/classroom.service");
exports.classRoomController = {
    list: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const classRooms = await classroom_service_1.classRoomService.list(req.query, req.auth);
        res.json({ success: true, data: classRooms });
    }),
    getById: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const classRoom = await classroom_service_1.classRoomService.getById(req.params.id, req.auth);
        res.json({ success: true, data: classRoom });
    }),
    create: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const classRoom = await classroom_service_1.classRoomService.create(req.body);
        res.status(201).json({ success: true, data: classRoom });
    }),
    update: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const classRoom = await classroom_service_1.classRoomService.update(req.params.id, req.body);
        res.json({ success: true, data: classRoom });
    }),
    remove: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        await classroom_service_1.classRoomService.remove(req.params.id);
        res.status(204).send();
    }),
};
//# sourceMappingURL=classroom.controller.js.map