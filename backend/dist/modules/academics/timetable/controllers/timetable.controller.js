"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timetableController = void 0;
const asyncHandler_1 = require("../../../../core/utils/asyncHandler");
const timetable_service_1 = require("../services/timetable.service");
const timetablePdf_1 = require("../utils/timetablePdf");
exports.timetableController = {
    list: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const slots = await timetable_service_1.timetableService.list(req.query, req.auth);
        res.json({ success: true, data: slots });
    }),
    create: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const slot = await timetable_service_1.timetableService.create(req.body);
        res.status(201).json({ success: true, data: slot });
    }),
    update: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const slot = await timetable_service_1.timetableService.update(req.params.id, req.body);
        res.json({ success: true, data: slot });
    }),
    remove: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        await timetable_service_1.timetableService.remove(req.params.id);
        res.status(204).send();
    }),
    exportPdf: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const query = req.query;
        const slots = await timetable_service_1.timetableService.list(query, req.auth);
        const title = query.classRoomId
            ? `Emploi du temps — ${slots[0]?.classRoom.name ?? ""}`
            : query.teacherId
                ? `Emploi du temps — ${slots[0] ? slots[0].teacher.user.firstName + " " + slots[0].teacher.user.lastName : ""}`
                : "Emploi du temps général";
        (0, timetablePdf_1.streamTimetablePdf)(res, title, slots);
    }),
};
//# sourceMappingURL=timetable.controller.js.map