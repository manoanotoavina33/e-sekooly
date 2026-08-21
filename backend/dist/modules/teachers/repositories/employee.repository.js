"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.employeeRepository = void 0;
const prisma_1 = require("../../../config/prisma");
exports.employeeRepository = {
    async list(query) {
        const where = {
            schoolId: query.schoolId,
            department: query.department,
            ...(query.search
                ? {
                    OR: [
                        { position: { contains: query.search } },
                        { employeeNo: { contains: query.search } },
                        { user: { firstName: { contains: query.search } } },
                        { user: { lastName: { contains: query.search } } },
                    ],
                }
                : {}),
        };
        const [items, total] = await Promise.all([
            prisma_1.prisma.employee.findMany({
                where,
                include: {
                    user: {
                        select: {
                            firstName: true,
                            lastName: true,
                            email: true,
                            isActive: true,
                            createdAt: true,
                            updatedAt: true,
                        },
                    },
                },
                orderBy: { hireDate: "desc" },
                skip: (query.page - 1) * query.pageSize,
                take: query.pageSize,
            }),
            prisma_1.prisma.employee.count({ where }),
        ]);
        const adminUsers = await prisma_1.prisma.user.findMany({
            where: {
                schoolId: query.schoolId,
                employee: null,
                roles: {
                    some: {
                        role: {
                            name: {
                                in: ["ADMIN", "DIRECTOR", "SUPER_ADMIN"],
                            },
                        },
                    },
                },
            },
            include: {
                roles: { include: { role: true } },
            },
        });
        const adminEmployees = adminUsers.map((user) => ({
            id: `user-${user.id}`,
            userId: user.id,
            employeeNo: "N/A",
            position: user.roles.map((r) => r.role.label).join(", ") || "Membre du bureau",
            department: "Direction",
            hireDate: user.createdAt,
            degrees: null,
            isActive: user.isActive,
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
            },
            contracts: [],
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        }));
        const allItems = [...items, ...adminEmployees];
        return {
            items: allItems,
            total: total + adminEmployees.length,
            page: query.page,
            pageSize: query.pageSize,
        };
    },
    findById(id) {
        return prisma_1.prisma.employee.findUnique({
            where: { id },
            include: {
                user: { select: { firstName: true, lastName: true, email: true, phone: true, roles: { include: { role: true } } } },
                leaves: { orderBy: { createdAt: "desc" } },
                salaryPayments: { orderBy: { period: "desc" } },
                teacherSubjects: { include: { subject: true, classRoom: true } },
            },
        });
    },
    countBySchoolAndYear(schoolId, year) {
        return prisma_1.prisma.employee.count({
            where: { schoolId, employeeNo: { startsWith: `EMP-${year}-` } },
        });
    },
    countActiveTeachers(schoolId) {
        return prisma_1.prisma.employee.count({
            where: { schoolId, isActive: true, teacherSubjects: { some: {} } },
        });
    },
    create(data) {
        return prisma_1.prisma.employee.create({ data });
    },
    update(id, data) {
        return prisma_1.prisma.employee.update({ where: { id }, data });
    },
    delete(id) {
        return prisma_1.prisma.employee.delete({ where: { id } });
    },
    createLeave(employeeId, data) {
        return prisma_1.prisma.leaveRequest.create({ data: { ...data, employee: { connect: { id: employeeId } } } });
    },
    decideLeave(leaveId, status, decidedBy) {
        return prisma_1.prisma.leaveRequest.update({
            where: { id: leaveId },
            data: { status, decidedBy, decidedAt: new Date() },
        });
    },
    assignSubject(employeeId, subjectId, classRoomId) {
        const cid = classRoomId ?? "";
        return prisma_1.prisma.teacherSubject.upsert({
            where: { employeeId_subjectId_classRoomId: { employeeId, subjectId, classRoomId: cid } },
            update: {},
            create: { employeeId, subjectId, classRoomId: classRoomId ?? null },
        });
    },
    recordSalaryPayment(employeeId, data) {
        return prisma_1.prisma.salaryPayment.upsert({
            where: { employeeId_period: { employeeId, period: data.period } },
            update: data,
            create: { ...data, employee: { connect: { id: employeeId } } },
        });
    },
};
//# sourceMappingURL=employee.repository.js.map