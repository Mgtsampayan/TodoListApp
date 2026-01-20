import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma.ts';
import { Role } from '../../generated/client/client.ts';

export async function getTodos(req: Request, res: Response, next: NextFunction) {
    try {
        const user = req.user!;

        const todos = await prisma.todo.findMany({
            where: user.role === Role.ADMIN ? {} : { ownerId: user.id },
            include: {
                owner: {
                    select: { id: true, email: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json({
            success: true,
            data: { todos },
        });
    } catch (error) {
        next(error);
    }
}

export async function createTodo(req: Request, res: Response, next: NextFunction) {
    try {
        const user = req.user!;
        const { title, description } = req.body;

        const todo = await prisma.todo.create({
            data: {
                title,
                description,
                ownerId: user.id,
            },
            include: {
                owner: { select: { id: true, email: true } },
            },
        });

        res.status(201).json({
            success: true,
            message: 'Todo created successfully',
            data: { todo },
        });
    } catch (error) {
        next(error);
    }
}

export async function updateTodo(req: Request, res: Response, next: NextFunction) {
    try {
        const user = req.user!;
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Todo ID is required',
            });
        }

        const { title, description, completed } = req.body;

        const existingTodo = await prisma.todo.findUnique({
            where: { id },
        });

        if (!existingTodo) {
            return res.status(404).json({
                success: false,
                message: 'Todo not found',
            });
        }

        if (user.role === Role.USER && existingTodo.ownerId !== user.id) {
            return res.status(403).json({
                success: false,
                message: 'You can only update your own todos',
            });
        }

        const updatedTodo = await prisma.todo.update({
            where: { id },
            data: {
                ...(title !== undefined && { title }),
                ...(description !== undefined && { description }),
                ...(completed !== undefined && { completed }),
            },
            include: {
                owner: { select: { id: true, email: true } },
            },
        });

        res.json({
            success: true,
            message: 'Todo updated successfully',
            data: { todo: updatedTodo },
        });
    } catch (error) {
        next(error);
    }
}

export async function deleteTodo(req: Request, res: Response, next: NextFunction) {
    try {
        const user = req.user!;
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Todo ID is required',
            });
        }

        const existingTodo = await prisma.todo.findUnique({
            where: { id },
        });

        if (!existingTodo) {
            return res.status(404).json({
                success: false,
                message: 'Todo not found',
            });
        }

        if (user.role === Role.USER && existingTodo.ownerId !== user.id) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own todos',
            });
        }

        await prisma.todo.delete({ where: { id } });

        res.json({
            success: true,
            message: 'Todo deleted successfully',
        });
    } catch (error) {
        next(error);
    }
}