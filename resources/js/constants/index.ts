export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    DASHBOARD: '/dashboard',
    BOOKING_NEW: '/bookings/new',
    BOOKINGS: '/bookings',
    VEHICLES: '/vehicles',
    STAFF_PORTAL: '/staff',
    ADMIN_DASHBOARD: '/admin',
    ADMIN_SLOTS: '/admin/slots',
    ADMIN_USERS: '/admin/users',
    ADMIN_VEHICLES: '/admin/vehicles',
    ADMIN_BOOKINGS: '/admin/bookings',
    ADMIN_REPORTS: '/admin/reports',
};

export const API_ENDPOINTS = {
    AUTH_USER: '/api/user',
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    SLOTS: '/api/slots',
    AREAS: '/api/areas',
    VEHICLES: '/api/vehicles',
    BOOKINGS: '/api/bookings',
    SESSIONS: '/api/sessions',
    NOTIFICATIONS: '/api/notifications',
    STAFF_CHECKIN: '/api/staff/check-in',
    STAFF_CHECKOUT: '/api/staff/check-out',
    ADMIN_STATS: '/api/admin/stats',
    ADMIN_USERS: '/api/admin/users',
    ADMIN_REPORTS: '/api/admin/reports',
};

export const SLOT_STATUS = {
    AVAILABLE: 'available',
    RESERVED: 'reserved',
    OCCUPIED: 'occupied',
    MAINTENANCE: 'maintenance',
} as const;

export const SLOT_TYPE = {
    CAR: 'car',
    MOTORCYCLE: 'motorcycle',
    HANDICAP: 'handicap',
} as const;

export const BOOKING_STATUS = {
    PENDING: 'pending',
    ACTIVE: 'active',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    EXPIRED: 'expired',
} as const;
