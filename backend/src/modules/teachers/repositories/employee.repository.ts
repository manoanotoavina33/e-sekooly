import { Prisma } from "@prisma/client";
import { prisma } from "../../../config/prisma";
import { ListEmployeesQuery } from "../validations/employee.validation";

export const employeeRepository = {
  async list(query: ListEmployeesQuery) {
    const where: Prisma.EmployeeWhereInput = {
      schoolId: query.schoolId,
      department: query.department,
      ...(query.search
        ? {
            OR: [
              { position: { contains: query.search, mode: "insensitive" } },
              { employeeNo: { contains: query.search, mode: "insensitive" } },
              { user: { firstName: { contains: query.search, mode: "insensitive" } } },
              { user: { lastName: { contains: query.search, mode: "insensitive" } } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.employee.findMany({
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
      prisma.employee.count({ where }),
    ]);

    const adminUsers = await prisma.user.findMany({
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

  findById(id: string) {
    return prisma.employee.findUnique({
      where: { id },
      include: {
        user: { select: { firstName: true, lastName: true, email: true, phone: true, roles: { include: { role: true } } } },
        leaves: { orderBy: { createdAt: "desc" } },
        salaryPayments: { orderBy: { period: "desc" } },
        teacherSubjects: { include: { subject: true, classRoom: true } },
      },
    });
  },

  countBySchoolAndYear(schoolId: string, year: number) {
    return prisma.employee.count({
      where: { schoolId, employeeNo: { startsWith: `EMP-${year}-` } },
    });
  },

  countActiveTeachers(schoolId: string) {
    return prisma.employee.count({
      where: { schoolId, isActive: true, teacherSubjects: { some: {} } },
    });
  },

  create(data: Prisma.EmployeeCreateInput) {
    return prisma.employee.create({ data });
  },

  update(id: string, data: Prisma.EmployeeUpdateInput) {
    return prisma.employee.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.employee.delete({ where: { id } });
  },

  createLeave(employeeId: string, data: Omit<Prisma.LeaveRequestCreateInput, "employee">) {
    return prisma.leaveRequest.create({ data: { ...data, employee: { connect: { id: employeeId } } } });
  },

  decideLeave(leaveId: string, status: "APPROVED" | "REJECTED", decidedBy: string) {
    return prisma.leaveRequest.update({
      where: { id: leaveId },
      data: { status, decidedBy, decidedAt: new Date() },
    });
  },

  assignSubject(employeeId: string, subjectId: string, classRoomId?: string) {
    const cid = classRoomId ?? "";
    return prisma.teacherSubject.upsert({
      where: { employeeId_subjectId_classRoomId: { employeeId, subjectId, classRoomId: cid } },
      update: {},
      create: { employeeId, subjectId, classRoomId: classRoomId ?? null },
    });
  },

  recordSalaryPayment(
    employeeId: string,
    data: { period: string; baseAmount: number; bonuses: number; advances: number; deductions: number; netAmount: number }
  ) {
    return prisma.salaryPayment.upsert({
      where: { employeeId_period: { employeeId, period: data.period } },
      update: data,
      create: { ...data, employee: { connect: { id: employeeId } } },
    });
  },
};
