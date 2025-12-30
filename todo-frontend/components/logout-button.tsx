'use client';

import { logoutAction } from '@/actions/auth';
import { LogOut } from 'lucide-react';
import { useState } from 'react';

interface LogoutButtonProps {
    variant?: 'default' | 'ghost';
    className?: string;
}

export function LogoutButton({ variant = 'default', className = '' }: LogoutButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleLogout = async () => {
        setIsLoading(true);
        try {
            await logoutAction();
        } catch (error) {
            console.error('Logout error:', error);
            setIsLoading(false);
        }
    };

    const baseStyles = 'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200';

    const variantStyles = {
        default: 'bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow-md',
        ghost: 'text-gray-700 hover:bg-gray-100',
    };

    return (
        <button
            onClick={handleLogout}
            disabled={isLoading}
            className={`${baseStyles} ${variantStyles[variant]} disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        >
            <LogOut className="w-4 h-4" />
            <span>{isLoading ? 'Logging out...' : 'Logout'}</span>
        </button>
    );
}