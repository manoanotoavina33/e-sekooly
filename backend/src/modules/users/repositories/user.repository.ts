import { Prisma, RoleName } from "@prisma/client";
import { prisma } from "../../../config/prisma";
import bcrypt from "bcryptjs";
import { CreateUserInput, ListUsersQuery, UpdateUserInput } from "../validations/user.validation";

export const userRepository = {
  list(query: ListUsersQuery) {
    const where: Prisma.UserWhereInput = {};
    if (query.schoolId) where.schoolId = query.schoolId;
    if (query.role) {
      where.roles = { some: { role: { name: query.role as RoleName } } };
    }
    if (query.search) {
      const q = query.search.toLowerCase();
      where.OR = [
        { firstName: { contains: q, mode: "insensitive" } },
        { lastName: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
      ];
    }
    return prisma.user.findMany({
      where,
      include: { roles: { include: { role: true } } },
      orderBy: { createdAt: "desc" },
    });
  },

  findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: { roles: { include: { role: true } } },
    });
  },

  async create(data: CreateUserInput) {
    const passwordHash = await bcrypt.hash(data.password, 12);
    return prisma.user.create({
      data: {
        schoolId: data.schoolId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        passwordHash,
        isActive: data.isActive ?? true,
        roles: { create: data.roleIds.map((roleId) => ({ roleId })) },
      },
      include: { roles: { include: { role: true } } },
    });
  },

  async update(id: string, data: UpdateUserInput) {
    const updateData: Prisma.UserUpdateInput = {};
    if (data.firstName) updateData.firstName = data.firstName;
    if (data.lastName) updateData.lastName = data.lastName;
    if (data.email) updateData.email = data.email;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, 12);
    }
    if (data.roleIds) {
      updateData.roles = { deleteMany: {}, create: data.roleIds.map((roleId) => ({ roleId })) };
    }

    return prisma.user.update({
      where: { id },
      data: updateData,
      include: { roles: { include: { role: true } } },
    });
  },

  delete(id: string) {
    return prisma.user.delete({ where: { id } });
  },
};
