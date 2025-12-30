'use client';

import { createTodoAction } from '@/actions/todos';
import { Plus, X, Loader2, Sparkles } from 'lucide-react';
import { useState, useRef } from 'react';

export function TodoForm() {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const formRef = useRef<HTMLFormElement>(null);

    const handleSubmit = async (formData: FormData) => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await createTodoAction(formData);

            if (result.success) {
                formRef.current?.reset();
                setIsOpen(false);
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError(err as string | null || 'An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="group w-full bg-white/50 hover:bg-white/80 backdrop-blur-sm border-2 border-dashed border-indigo-300 hover:border-indigo-500 rounded-2xl p-6 transition-all duration-300 flex flex-col items-center justify-center gap-2 hover:shadow-lg hover:scale-[1.01]"
            >
                <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center group-hover:bg-indigo-600 transition-colors duration-300">
                    <Plus className="w-6 h-6 text-indigo-600 group-hover:text-white transition-colors" />
                </div>
                <span className="font-medium text-indigo-900">Create New Task</span>
            </button>
        );
    }

    return (
        <div className="bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                        <Sparkles className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">New Task</h3>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
                    disabled={isLoading}
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50/50 border border-red-100 text-red-800 rounded-xl text-sm flex items-center gap-2 animate-in slide-in-from-top-2">
                    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                </div>
            )}

            <form ref={formRef} action={handleSubmit} className="space-y-5">
                <div className="space-y-1">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 ml-1">
                        Task Title <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="title"
                        name="title"
                        type="text"
                        required
                        maxLength={255}
                        placeholder="What do you need to accomplish?"
                        disabled={isLoading}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium placeholder:font-normal"
                        autoFocus
                    />
                </div>

                <div className="space-y-1">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 ml-1">
                        Details & Notes
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        rows={3}
                        maxLength={5000}
                        placeholder="Add any extra information..."
                        disabled={isLoading}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                    />
                </div>

                <div className="flex gap-3 pt-2">
                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        disabled={isLoading}
                        className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all font-medium disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30 active:scale-[0.98] transition-all font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin h-4 w-4" />
                                creating...
                            </>
                        ) : (
                            <>
                                <Plus className="w-4 h-4" />
                                Create Task
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}