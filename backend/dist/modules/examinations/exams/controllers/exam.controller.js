"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.examController = void 0;
const asyncHandler_1 = require("../../../../core/utils/asyncHandler");
const exam_service_1 = require("../services/exam.service");
exports.examController = {
    listSessions: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const sessions = await exam_service_1.examService.listSessions(req.query);
        res.json({ success: true, data: sessions });
    }),
    getSessionById: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const session = await exam_service_1.examService.getSessionById(req.params.id);
        res.json({ success: true, data: session });
    }),
    createSession: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const session = await exam_service_1.examService.createSession(req.body);
        res.status(201).json({ success: true, data: session });
    }),
    validateDeliberation: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const session = await exam_service_1.examService.validateDeliberation(req.params.id, req.body.status);
        res.json({ success: true, data: session });
    }),
    listExams: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const exams = await exam_service_1.examService.listExams(req.query);
        res.json({ success: true, data: exams });
    }),
    getExamById: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const exam = await exam_service_1.examService.getExamById(req.params.id);
        res.json({ success: true, data: exam });
    }),
    createExam: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const exam = await exam_service_1.examService.createExam(req.body);
        res.status(201).json({ success: true, data: exam });
    }),
};
//# sourceMappingURL=exam.controller.js.map