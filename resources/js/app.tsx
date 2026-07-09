import * as React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import { ROUTES } from '@/constants';
import { AuthLayout } from '@/layouts/AuthLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Login } from '@/pages/auth/Login';
import { Register } from '@/pages/auth/Register';
import { ForgotPassword } from '@/pages/auth/ForgotPassword';
import { Dashboard } from '@/pages/Dashboard';
import { NewBooking } from '@/pages/bookings/NewBooking';
import { MyBookings } from '@/pages/bookings/MyBookings';
import { MyVehicles } from '@/pages/vehicles/MyVehicles';
import { QrScanner } from '@/pages/staff/QrScanner';
import { Slots as AdminSlots } from '@/pages/admin/Slots';
import { Users as AdminUsers } from '@/pages/admin/Users';
import { Vehicles as AdminVehicles } from '@/pages/admin/Vehicles';
import { Bookings as AdminBookings } from '@/pages/admin/Bookings';
import { Reports as AdminReports } from '@/pages/admin/Reports';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
});

export const App: React.FC = () => {
    const checkAuth = useAuthStore((state) => state.checkAuth);
    const isLoading = useAuthStore((state) => state.isLoading);

    React.useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    if (isLoading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-[#FAFAFA]">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
        );
    }

    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <Routes>
                    {/* Auth Routes */}
                    <Route element={<AuthLayout />}>
                        <Route path={ROUTES.LOGIN} element={<Login />} />
                        <Route path={ROUTES.REGISTER} element={<Register />} />
                        <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
                    </Route>

                    {/* Authenticated Dashboard Routes */}
                    <Route element={<DashboardLayout />}>
                        <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
                        
                        {/* Customer Only Routes */}
                        <Route path={ROUTES.BOOKING_NEW} element={<NewBooking />} />
                        <Route path={ROUTES.BOOKINGS} element={<MyBookings />} />
                        <Route path={ROUTES.VEHICLES} element={<MyVehicles />} />

                        {/* Staff and Admin Routes */}
                        <Route path={ROUTES.STAFF_PORTAL} element={<QrScanner />} />

                        {/* Admin Only Routes */}
                        <Route path={ROUTES.ADMIN_SLOTS} element={<AdminSlots />} />
                        <Route path={ROUTES.ADMIN_USERS} element={<AdminUsers />} />
                        <Route path={ROUTES.ADMIN_VEHICLES} element={<AdminVehicles />} />
                        <Route path={ROUTES.ADMIN_BOOKINGS} element={<AdminBookings />} />
                        <Route path={ROUTES.ADMIN_REPORTS} element={<AdminReports />} />
                    </Route>

                    {/* Redirect root to dashboard */}
                    <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.DASHBOARD} replace />} />
                    <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
                </Routes>
            </BrowserRouter>
        </QueryClientProvider>
    );
};

import { createRoot } from 'react-dom/client';
const rootElement = document.getElementById('root');
if (rootElement) {
    createRoot(rootElement).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
}

export default App;
