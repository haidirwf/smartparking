import * as React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { ROUTES } from '@/constants';
import { ParkingCircle } from 'lucide-react';

export const AuthLayout: React.FC = () => {
    const { isAuthenticated, isLoading } = useAuthStore();

    if (isLoading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-[#FAFAFA]">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to={ROUTES.DASHBOARD} replace />;
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA] px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <div className="flex flex-col items-center justify-center text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary mb-4">
                        <ParkingCircle className="h-6 w-6 stroke-[2.5]" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-[#111827]">
                        Smart Parking
                    </h2>
                    <p className="mt-1 text-sm text-[#6B7280]">
                        Manage parking slots, bookings, and sessions in real time.
                    </p>
                </div>
                <Outlet />
            </div>
        </div>
    );
};
