"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schoolController = void 0;
const asyncHandler_1 = require("../../../../core/utils/asyncHandler");
const school_service_1 = require("../services/school.service");
exports.schoolController = {
    getById: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const school = await school_service_1.schoolService.getById(req.params.id);
        res.json({ success: true, data: school });
    }),
    update: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const school = await school_service_1.schoolService.update(req.params.id, req.body);
        res.json({ success: true, data: school });
    }),
    uploadLogo: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const school = await school_service_1.schoolService.uploadLogo(req.params.id, req.file);
        res.json({ success: true, data: school });
    }),
    createSchoolYear: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const year = await school_service_1.schoolService.createSchoolYear(req.body);
        res.status(201).json({ success: true, data: year });
    }),
    setCurrentSchoolYear: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        await school_service_1.schoolService.setCurrentSchoolYear(req.params.id, req.params.yearId);
        res.json({ success: true });
    }),
    createSemester: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const semester = await school_service_1.schoolService.createSemester(req.body);
        res.status(201).json({ success: true, data: semester });
    }),
    listSettings: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const settings = await school_service_1.schoolService.listSettings(req.params.id);
        res.json({ success: true, data: settings });
    }),
    listCategories: (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
        const categories = await school_service_1.schoolService.listCategories();
        res.json({ success: true, data: categories });
    }),
    upsertSetting: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const setting = await school_service_1.schoolService.upsertSetting(req.body.schoolId, req.body.key, req.body.value);
        res.json({ success: true, data: setting });
    }),
};
//# sourceMappingURL=school.controller.js.map