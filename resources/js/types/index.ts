export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    roles?: Role[];
    created_at: string;
    updated_at: string;
}

export interface Role {
    id: number;
    name: string;
    slug: 'admin' | 'staff' | 'customer';
    description: string | null;
}

export interface Permission {
    id: number;
    name: string;
    slug: string;
    description: string | null;
}

export interface Vehicle {
    id: string;
    plate_number: string;
    vehicle_type: 'car' | 'motorcycle' | 'handicap' | string;
    owner_id: number;
    owner?: User;
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
}

export interface ParkingArea {
    id: string;
    name: string;
    code: string;
    description: string | null;
    status: 'active' | 'maintenance';
    floors?: ParkingFloor[];
    created_at: string;
    updated_at: string;
}

export interface ParkingFloor {
    id: string;
    parking_area_id: string;
    area?: ParkingArea;
    name: string;
    level: number;
    slots?: ParkingSlot[];
    created_at: string;
    updated_at: string;
}

export interface ParkingSlot {
    id: string;
    parking_floor_id: string;
    floor?: ParkingFloor;
    slot_number: string;
    slot_type: 'car' | 'motorcycle' | 'handicap';
    status: 'available' | 'reserved' | 'occupied' | 'maintenance';
    created_at: string;
    updated_at: string;
}

export interface Booking {
    id: string;
    user_id: number;
    user?: User;
    parking_slot_id: string;
    slot?: ParkingSlot;
    vehicle_id: string;
    vehicle?: Vehicle;
    arrival_time: string;
    expires_at: string;
    qr_code: string;
    status: 'pending' | 'active' | 'completed' | 'cancelled' | 'expired';
    session?: ParkingSession;
    created_at: string;
    updated_at: string;
}

export interface ParkingSession {
    id: string;
    booking_id: string | null;
    booking?: Booking;
    parking_slot_id: string;
    slot?: ParkingSlot;
    vehicle_id: string;
    vehicle?: Vehicle;
    entry_time: string;
    exit_time: string | null;
    duration_minutes: number | null;
    status: 'active' | 'completed';
    created_at: string;
    updated_at: string;
}

export interface Notification {
    id: string;
    user_id: number;
    title: string;
    message: string;
    type: 'booking_confirmed' | 'booking_reminder' | 'booking_expired' | 'vehicle_checked_in' | 'vehicle_checked_out' | 'warning';
    read_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface ActivityLog {
    id: number;
    user_id: number | null;
    user?: User;
    action: string;
    description: string;
    ip_address: string | null;
    user_agent: string | null;
    created_at: string;
    updated_at: string;
}

export interface DashboardStats {
    total_slots: number;
    available_slots: number;
    occupied_slots: number;
    reservations_today: number;
    active_sessions: number;
    registered_vehicles: number;
    registered_users: number;
    occupancy_rate: number;
    peak_hour: string | null;
}
