import { Router } from 'express';
import { getTodos, createTodo, updateTodo, deleteTodo, } from '../controllers/todoController.ts';
import { validateRequest } from '../middleware/validateRequest.ts';
import { createTodoSchema, updateTodoSchema, deleteTodoSchema } from '../schemas/todoSchemas.ts';
import { verifyTokenMiddleware } from '../middleware/verifyToken.ts';
import { conditionalCache } from '../middleware/conditionalCache.ts';

const router = Router();

router.use(verifyTokenMiddleware);

router.get('/', conditionalCache, getTodos);
router.post('/', validateRequest(createTodoSchema), createTodo);
router.put('/:id', validateRequest(updateTodoSchema), updateTodo);
router.delete('/:id', validateRequest(deleteTodoSchema), deleteTodo);

export default router;