import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma.ts';
import { Role } from '../../generated/client/client.ts';

/**
 * Get all todos (USER: own todos only, ADMIN: all todos)
 * GET /api/todos
 */
export async function getTodos(req: Request, res: Response, next: NextFunction) {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }

        const todos = await prisma.todo.findMany({
            where: req.user.role === Role.ADMIN ? {} : { ownerId: req.user.id },
            include: {
                owner: {
                    select: {
                        id: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        res.json({
            success: true,
            data: { todos },
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Create new todo
 * POST /api/todos
 */
export async function createTodo(req: Request, res: Response, next: NextFunction) {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }

        const { title, description } = req.body;

        const todo = await prisma.todo.create({
            data: {
                title,
                description,
                ownerId: req.user.id,
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        email: true,
                    },
                },
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

/**
 * Update todo
 * PUT /api/todos/:id
 */
export async function updateTodo(req: Request, res: Response, next: NextFunction) {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }

        const { id } = req.params;
        const { title, description, completed } = req.body;

        // Find todo
        const existingTodo = await prisma.todo.findUnique({
            where: { id },
        });

        if (!existingTodo) {
            res.status(404).json({
                success: false,
                message: 'Todo not found',
            });
            return;
        }

        // Authorization check: USER can only update own todos
        if (req.user.role === Role.USER && existingTodo.ownerId !== req.user.id) {
            res.status(403).json({
                success: false,
                message: 'You can only update your own todos',
            });
            return;
        }

        // Update todo
        const updatedTodo = await prisma.todo.update({
            where: { id },
            data: {
                ...(title !== undefined && { title }),
                ...(description !== undefined && { description }),
                ...(completed !== undefined && { completed }),
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        email: true,
                    },
                },
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

/**
 * Delete todo
 * DELETE /api/todos/:id
 */
export async function deleteTodo(req: Request, res: Response, next: NextFunction) {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }

        const { id } = req.params;

        // Find todo
        const existingTodo = await prisma.todo.findUnique({
            where: { id },
        });

        if (!existingTodo) {
            res.status(404).json({
                success: false,
                message: 'Todo not found',
            });
            return;
        }

        // Authorization check: USER can only delete own todos
        if (req.user.role === Role.USER && existingTodo.ownerId !== req.user.id) {
            res.status(403).json({
                success: false,
                message: 'You can only delete your own todos',
            });
            return;
        }

        // Delete todo
        await prisma.todo.delete({
            where: { id },
        });

        res.json({
            success: true,
            message: 'Todo deleted successfully',
        });
    } catch (error) {
        next(error);
    }
}