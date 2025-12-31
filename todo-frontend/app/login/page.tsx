'use client';

import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-50 via-white to-blue-50 px-4 sm:px-6 lg:px-8">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-indigo-200/30 blur-3xl" />
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-blue-200/30 blur-3xl" />
            </div>

            <LoginForm />
        </div>
    );
}