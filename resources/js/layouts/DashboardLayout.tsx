import * as React from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { ROUTES } from '@/constants';
import { 
    LayoutDashboard, 
    CalendarRange, 
    Car, 
    QrCode, 
    Map, 
    Users, 
    FileBarChart, 
    LogOut, 
    Bell, 
    Menu, 
    X,
    ParkingCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const DashboardLayout: React.FC = () => {
    const { user, isAuthenticated, isLoading, logout } = useAuthStore();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-[#FAFAFA]">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return <Navigate to={ROUTES.LOGIN} replace />;
    }

    const roles = user.roles?.map(r => r.slug) || [];
    const isAdmin = roles.includes('admin');
    const isStaff = roles.includes('staff');
    const isCustomer = roles.includes('customer');

    // Generate menu items based on role
    const getMenuItems = () => {
        const items = [];

        // Common/Customer dashboard
        items.push({
            name: 'Dashboard',
            path: ROUTES.DASHBOARD,
            icon: LayoutDashboard,
        });

        if (isCustomer) {
            items.push({
                name: 'Book Slot',
                path: ROUTES.BOOKING_NEW,
                icon: Map,
            });
            items.push({
                name: 'My Bookings',
                path: ROUTES.BOOKINGS,
                icon: CalendarRange,
            });
            items.push({
                name: 'My Vehicles',
                path: ROUTES.VEHICLES,
                icon: Car,
            });
        }

        if (isStaff || isAdmin) {
            items.push({
                name: 'QR Scanner',
                path: ROUTES.STAFF_PORTAL,
                icon: QrCode,
            });
        }

        if (isAdmin) {
            items.push({
                name: 'Manage Slots',
                path: ROUTES.ADMIN_SLOTS,
                icon: Map,
            });
            items.push({
                name: 'Users',
                path: ROUTES.ADMIN_USERS,
                icon: Users,
            });
            items.push({
                name: 'Vehicles',
                path: ROUTES.ADMIN_VEHICLES,
                icon: Car,
            });
            items.push({
                name: 'All Bookings',
                path: ROUTES.ADMIN_BOOKINGS,
                icon: CalendarRange,
            });
            items.push({
                name: 'Reports',
                path: ROUTES.ADMIN_REPORTS,
                icon: FileBarChart,
            });
        }

        return items;
    };

    const menuItems = getMenuItems();

    return (
        <div className="flex h-screen overflow-hidden bg-[#FAFAFA]">
            {/* Sidebar Desktop */}
            <aside className="hidden md:flex md:w-64 md:flex-col border-r border-[#E5E7EB] bg-white">
                <div className="flex h-16 items-center px-6 border-b border-[#E5E7EB]">
                    <Link to={ROUTES.DASHBOARD} className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
                            <ParkingCircle className="h-5 w-5 stroke-[2.5]" />
                        </div>
                        <span className="text-base font-bold text-[#111827]">Smart Parking</span>
                    </Link>
                </div>
                <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-colors ${
                                    isActive
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-[#6B7280] hover:bg-gray-50 hover:text-[#111827]'
                                }`}
                            >
                                <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-primary' : 'text-[#6B7280]'}`} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-4 border-t border-[#E5E7EB]">
                    <div className="flex items-center justify-between gap-3 mb-4 px-2">
                        <div className="flex flex-col min-w-0">
                            <span className="text-xs font-semibold text-[#111827] truncate">{user.name}</span>
                            <span className="text-[10px] text-[#6B7280] capitalize truncate">{roles.join(', ')}</span>
                        </div>
                    </div>
                    <Button
                        onClick={() => logout()}
                        variant="ghost"
                        className="w-full justify-start text-danger-custom hover:bg-red-50 hover:text-red-600 rounded-xl"
                    >
                        <LogOut className="mr-2.5 h-4.5 w-4.5" />
                        Log out
                    </Button>
                </div>
            </aside>

            {/* Mobile Menu Backdrop */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 z-40 bg-[#111827]/30 backdrop-blur-sm md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Menu Drawer */}
            <aside 
                className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white border-r border-[#E5E7EB] transition-transform duration-200 md:hidden ${
                    isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex h-16 items-center justify-between px-6 border-b border-[#E5E7EB]">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
                            <ParkingCircle className="h-5 w-5 stroke-[2.5]" />
                        </div>
                        <span className="text-base font-bold text-[#111827]">Smart Parking</span>
                    </div>
                    <button 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="p-1 rounded-lg text-[#6B7280] hover:bg-gray-100"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-colors ${
                                    isActive
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-[#6B7280] hover:bg-gray-50 hover:text-[#111827]'
                                }`}
                            >
                                <Icon className="h-4.5 w-4.5" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-4 border-t border-[#E5E7EB]">
                    <div className="flex items-center justify-between gap-3 mb-4 px-2">
                        <div className="flex flex-col min-w-0">
                            <span className="text-xs font-semibold text-[#111827] truncate">{user.name}</span>
                            <span className="text-[10px] text-[#6B7280] capitalize truncate">{roles.join(', ')}</span>
                        </div>
                    </div>
                    <Button
                        onClick={() => logout()}
                        variant="ghost"
                        className="w-full justify-start text-danger-custom hover:bg-red-50 hover:text-red-600 rounded-xl"
                    >
                        <LogOut className="mr-2.5 h-4.5 w-4.5" />
                        Log out
                    </Button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Header */}
                <header className="flex h-16 items-center justify-between border-b border-[#E5E7EB] bg-white px-6 md:px-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="p-2 rounded-lg text-[#6B7280] hover:bg-gray-100 md:hidden"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="relative p-2 rounded-lg text-[#6B7280] hover:bg-gray-100 transition-colors">
                            <Bell className="h-4.5 w-4.5" />
                            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-danger-custom" />
                        </button>
                    </div>
                </header>

                {/* Dashboard Router Outlet */}
                <main className="flex-1 overflow-y-auto px-6 py-8 md:px-8 max-w-[1440px] w-full mx-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
