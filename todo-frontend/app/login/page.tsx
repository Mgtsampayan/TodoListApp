'use client';

import { useActionState } from 'react';
import { loginAction } from '@/actions/auth';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
    const router = useRouter();
    const [state, formAction, isPending] = useActionState(loginAction, null);

    // ✅ FIX: Handle redirect after successful login
    useEffect(() => {
        if (state?.success) {
            // Token is stored in httpOnly cookie via server action
            // Redirect to dashboard
            router.push('/dashboard');
        }
    }, [state, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-50 via-white to-blue-50 px-4 sm:px-6 lg:px-8">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-indigo-200/30 blur-3xl" />
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-blue-200/30 blur-3xl" />
            </div>

            <div className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-white/50 relative z-10 transition-all duration-300 hover:shadow-2xl">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 transform -rotate-3 hover:-rotate-6 transition-transform">
                        <svg
                            className="h-6 w-6 text-indigo-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                            />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                        Welcome Back
                    </h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Sign in to continue to TodoMaster
                    </p>
                </div>

                {state && !state.success && (
                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                        <svg
                            className="h-5 w-5 shrink-0 text-red-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <p className="text-sm font-medium">{state.message}</p>
                    </div>
                )}

                {/* ✅ ADD: Success message */}
                {state?.success && (
                    <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl flex items-center gap-3 animate-in fade-in">
                        <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <p className="text-sm font-medium">Login successful! Redirecting...</p>
                    </div>
                )}

                <form action={formAction} className="mt-8 space-y-6">
                    <div className="space-y-4">
                        <div className="group">
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700 mb-1 pl-1 transition-colors group-focus-within:text-indigo-600"
                            >
                                Email Address
                            </label>
                            <div className="relative">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="appearance-none relative block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 bg-gray-50/50 focus:bg-white"
                                    placeholder="you@example.com"
                                    disabled={isPending}
                                />
                            </div>
                            {state?.errors?.email && (
                                <p className="mt-1 text-xs text-red-600 pl-1 font-medium">
                                    {state.errors.email[0]}
                                </p>
                            )}
                        </div>

                        <div className="group">
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700 mb-1 pl-1 transition-colors group-focus-within:text-indigo-600"
                            >
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="appearance-none relative block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 bg-gray-50/50 focus:bg-white"
                                placeholder="••••••••"
                                disabled={isPending}
                            />
                            {state?.errors?.password && (
                                <p className="mt-1 text-xs text-red-600 pl-1 font-medium">
                                    {state.errors.password[0]}
                                </p>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100 transition-all duration-200"
                    >
                        {isPending ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="animate-spin h-4 w-4" />
                                Signing in...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                Sign In
                                <svg
                                    className="w-4 h-4 transition-transform group-hover:translate-x-1"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </span>
                        )}
                    </button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-3 bg-white text-gray-500 rounded-full text-xs">
                                Don&apos;t have an account?
                            </span>
                        </div>
                    </div>

                    <div className="text-center">
                        <Link
                            href="/register"
                            className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors p-2 rounded-lg hover:bg-indigo-50"
                        >
                            Create a new account
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}