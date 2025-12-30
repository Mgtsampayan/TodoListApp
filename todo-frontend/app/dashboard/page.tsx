import { getCurrentUserAction } from '@/actions/auth';
import { getTodosAction } from '@/actions/todos';
import { TodoForm } from '@/components/todo-form';
import { TodoList } from '@/components/todo-list';
import { LogoutButton } from '@/components/logout-button';
import { redirect } from 'next/navigation';
import { LayoutDashboard, CheckSquare } from 'lucide-react';

export default async function DashboardPage() {
    const user = await getCurrentUserAction();

    if (!user) {
        redirect('/login');
    }

    const { data: todos = [] } = await getTodosAction();

    const completedCount = todos.filter(t => t.completed).length;
    const totalCount = todos.length;
    const progress = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

    return (
        <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-blue-50 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-indigo-200/20 blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-blue-200/20 blur-[100px]" />
            </div>

            {/* Navigation Bar */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-indigo-100 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-3">
                            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-500/30">
                                <LayoutDashboard className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-bold text-xl text-gray-900 tracking-tight">TodoMaster</span>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="hidden sm:flex flex-col items-end mr-2">
                                <span className="text-sm font-semibold text-gray-900">{user.email}</span>
                                <span className="text-xs text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded-full">{user.role}</span>
                            </div>
                            <div className="h-8 w-[1px] bg-gray-200 hidden sm:block"></div>
                            <LogoutButton variant="ghost" className="text-gray-600 hover:text-red-600 hover:bg-red-50" />
                        </div>
                    </div>
                </div>
            </nav>

            <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="grid gap-8">
                    {/* Welcome Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
                                Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'},
                                <span className="text-indigo-600"> {user.email.split('@')[0]}</span>
                            </h1>
                            <p className="text-gray-500">Here's what you need to focus on today.</p>
                        </div>

                        {/* Progress Widget */}
                        <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 border border-white shadow-sm flex items-center gap-4 min-w-[240px]">
                            <div className="relative h-14 w-14 shrink-0">
                                <svg className="h-full w-full transform -rotate-90" viewBox="0 0 36 36">
                                    <path
                                        className="text-gray-200"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                    />
                                    <path
                                        className="text-indigo-600 transition-all duration-1000 ease-out"
                                        strokeDasharray={`${progress}, 100`}
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center font-bold text-sm text-indigo-700">
                                    {progress}%
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Tasks Completed</p>
                                <p className="text-lg font-bold text-gray-900">{completedCount} <span className="text-gray-400 font-normal">/ {totalCount}</span></p>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="grid lg:grid-cols-[350px,1fr] gap-8 items-start">
                        {/* Sidebar / Form */}
                        <div className="lg:sticky lg:top-24">
                            <TodoForm />
                        </div>

                        {/* List */}
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <CheckSquare className="w-5 h-5 text-indigo-500" />
                                    Your Tasks
                                </h2>
                            </div>
                            <TodoList todos={todos} />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
