import { Router } from 'express';
import { getTodos, createTodo, updateTodo, deleteTodo, } from '../controllers/todoController.ts';
import { validateRequest } from '../middleware/validateRequest.ts';
import { createTodoSchema, updateTodoSchema, deleteTodoSchema } from '../schemas/todoSchemas.ts';
import { verifyTokenMiddleware } from '../middleware/verifyToken.ts';

const router = Router();

// Apply authentication middleware to all routes
router.use(verifyTokenMiddleware);

/**
 * @route   GET /api/todos
 * @desc    Get all todos (USER: own only, ADMIN: all)
 * @access  Private
 */
router.get('/', getTodos);

/**
 * @route   POST /api/todos
 * @desc    Create new todo
 * @access  Private
 */
router.post('/', validateRequest(createTodoSchema), createTodo);

/**
 * @route   PUT /api/todos/:id
 * @desc    Update todo
 * @access  Private (Owner or Admin)
 */
router.put('/:id', validateRequest(updateTodoSchema), updateTodo);

/**
 * @route   DELETE /api/todos/:id
 * @desc    Delete todo
 * @access  Private (Owner or Admin)
 */
router.delete('/:id', validateRequest(deleteTodoSchema), deleteTodo);

export default router;