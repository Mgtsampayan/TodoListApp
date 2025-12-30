import type { UserRole } from '@/types';
import { Shield, User as UserIcon } from 'lucide-react';
import { getInitials, getRoleBadgeColor } from '@/lib/utils';

interface UserBadgeProps {
    email: string;
    role: UserRole;
    showInitials?: boolean;
}

export function UserBadge({ email, role, showInitials = true }: UserBadgeProps) {
    const badgeColor = getRoleBadgeColor(role);
    const initials = getInitials(email);

    return (
        <div className="flex items-center gap-3">
            {showInitials && (
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                    {initials}
                </div>
            )}
            <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">{email}</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${badgeColor}`}>
                        {role === 'ADMIN' ? (
                            <Shield className="w-3 h-3" />
                        ) : (
                            <UserIcon className="w-3 h-3" />
                        )}
                        {role}
                    </span>
                </div>
            </div>
        </div>
    );
}