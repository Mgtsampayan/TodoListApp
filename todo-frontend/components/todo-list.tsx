'use client';

import { updateTodoAction, deleteTodoAction } from '@/actions/todos';
import type { Todo } from '@/types';
import { Check, Trash2, User as UserIcon, Clock } from 'lucide-react';
import { formatRelativeTime, truncate } from '@/lib/utils';
import { useOptimistic, useTransition } from 'react';

interface TodoListProps {
    todos: Todo[];
    showOwner?: boolean;
}

export function TodoList({ todos, showOwner = false }: TodoListProps) {
    const [isPending, startTransition] = useTransition();

    const [optimisticTodos, updateOptimisticTodo] = useOptimistic(
        todos,
        (state: Todo[], update: { id: string; action: 'toggle' | 'delete' }) => {
            if (update.action === 'delete') {
                return state.filter(t => t.id !== update.id);
            }
            return state.map(t =>
                t.id === update.id ? { ...t, completed: !t.completed } : t
            );
        }
    );

    const handleToggleComplete = (todo: Todo) => {
        startTransition(async () => {
            updateOptimisticTodo({ id: todo.id, action: 'toggle' });
            await updateTodoAction(todo.id, { completed: !todo.completed });
        });
    };

    const handleDelete = (id: string) => {
        if (!confirm('Are you sure you want to delete this todo?')) return;

        startTransition(async () => {
            updateOptimisticTodo({ id, action: 'delete' });
            await deleteTodoAction(id);
        });
    };

    if (optimisticTodos.length === 0) {
        return (
            <div className="text-center py-16 bg-white/50 backdrop-blur-sm rounded-2xl border border-dashed border-gray-300">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-indigo-50/50">
                    <Check className="w-10 h-10 text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No tasks yet</h3>
                <p className="text-gray-500 max-w-sm mx-auto">
                    Your list is empty! Add a new task above to get started organizing your day.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {optimisticTodos.map((todo) => (
                <div
                    key={todo.id}
                    className={`group relative bg-white/80 backdrop-blur-md border rounded-2xl p-5 transition-all duration-300 hover:shadow-lg hover:scale-[1.01] ${todo.completed
                        ? 'border-gray-100 bg-gray-50/50 opacity-75'
                        : 'border-white hover:border-indigo-200'
                        }`}
                >
                    <div className="flex items-start gap-5">
                        <button
                            onClick={() => handleToggleComplete(todo)}
                            disabled={isPending}
                            className={`mt-1 shrink-0 w-6 h-6 rounded-lg border-2 transition-all duration-300 flex items-center justify-center ${todo.completed
                                ? 'bg-gradient-to-br from-green-400 to-emerald-500 border-transparent shadow-sm'
                                : 'border-gray-300 hover:border-indigo-400 bg-white'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {todo.completed && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                        </button>

                        <div className="flex-1 min-w-0 pt-0.5">
                            <h3
                                className={`font-semibold text-gray-900 text-lg mb-1.5 transition-all ${todo.completed ? 'line-through text-gray-400' : ''
                                    }`}
                            >
                                {todo.title}
                            </h3>

                            {todo.description && (
                                <p className={`text-sm mb-3 ${todo.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {truncate(todo.description, 200)}
                                </p>
                            )}

                            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-gray-500">
                                <span className="flex items-center gap-1.5 bg-gray-100/80 px-2.5 py-1 rounded-full">
                                    <Clock className="w-3.5 h-3.5" />
                                    {formatRelativeTime(todo.createdAt)}
                                </span>

                                {showOwner && (
                                    <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">
                                        <UserIcon className="w-3.5 h-3.5" />
                                        {todo.owner.email.split('@')[0]}
                                    </span>
                                )}

                                {todo.completed && (
                                    <span className="flex items-center gap-1.5 bg-green-50 text-green-700 px-2.5 py-1 rounded-full animate-in fade-in">
                                        <Check className="w-3 h-3" />
                                        Completed
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button
                                onClick={() => handleDelete(todo.id)}
                                disabled={isPending}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all disabled:opacity-50"
                                title="Delete task"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}