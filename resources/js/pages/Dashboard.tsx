import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/api/client';
import { API_ENDPOINTS, ROUTES } from '@/constants';
import { Booking, Notification, DashboardStats } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton, EmptyState } from '@/components/ui/feedback';
import { Calendar, Car, Clock, ShieldAlert, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
    // 1. Fetch Stats, Bookings and Notifications
    const { data: stats, isLoading: isLoadingStats } = useQuery<DashboardStats>({
        queryKey: ['dashboardStats'],
        queryFn: async () => {
            const res = await api.get<DashboardStats>(API_ENDPOINTS.ADMIN_STATS);
            return res.data;
        }
    });

    const { data: activeBooking, isLoading: isLoadingActive } = useQuery<Booking | null>({
        queryKey: ['activeBooking'],
        queryFn: async () => {
            const res = await api.get<Booking | null>(API_ENDPOINTS.BOOKINGS + '/active');
            return res.data;
        }
    });

    const { data: notifications, isLoading: isLoadingNotifications } = useQuery<Notification[]>({
        queryKey: ['notifications'],
        queryFn: async () => {
            const res = await api.get<Notification[]>(API_ENDPOINTS.NOTIFICATIONS);
            return res.data;
        },
        retry: false
    });

    if (isLoadingStats || isLoadingActive) {
        return (
            <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-4">
                    <Skeleton className="h-24 rounded-2xl" />
                    <Skeleton className="h-24 rounded-2xl" />
                    <Skeleton className="h-24 rounded-2xl" />
                    <Skeleton className="h-24 rounded-2xl" />
                </div>
                <Skeleton className="h-64 rounded-2xl" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Greeting & Subtitle */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-text-custom">Parking Overview</h1>
                <p className="text-sm text-text-secondary">Monitor active reservations and real-time slot occupancy.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-semibold text-text-secondary uppercase">Available Slots</span>
                            <div className="p-1 bg-success-custom/10 text-success-custom rounded-lg">
                                <Car className="h-4 w-4" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-text-custom mt-2">{stats?.available_slots ?? 0}</p>
                        <p className="text-[10px] text-text-secondary mt-1">Ready for occupancy</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-semibold text-text-secondary uppercase">Occupied Slots</span>
                            <div className="p-1 bg-danger-custom/10 text-danger-custom rounded-lg">
                                <Car className="h-4 w-4" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-text-custom mt-2">{stats?.occupied_slots ?? 0}</p>
                        <p className="text-[10px] text-text-secondary mt-1">Active vehicles parked</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-semibold text-text-secondary uppercase">Reserved Slots</span>
                            <div className="p-1 bg-primary/10 text-primary rounded-lg">
                                <Clock className="h-4 w-4" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-text-custom mt-2">{stats?.reserved_slots ?? 0}</p>
                        <p className="text-[10px] text-text-secondary mt-1">Awaiting customer arrival</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-semibold text-text-secondary uppercase">Occupancy Rate</span>
                            <div className="p-1 bg-warning-custom/10 text-warning-custom rounded-lg">
                                <ShieldAlert className="h-4 w-4" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-text-custom mt-2">{stats?.occupancy_rate ?? 0}%</p>
                        <p className="text-[10px] text-text-secondary mt-1">Overall capacity usage</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Active Session Card */}
                <div className="lg:col-span-2 space-y-6">
                    {activeBooking ? (
                        <Card className="border border-primary/20">
                            <CardHeader className="pb-3 flex flex-row justify-between items-start">
                                <div>
                                    <CardTitle>Active Parking Session</CardTitle>
                                    <CardDescription>Your verified reservation is currently active.</CardDescription>
                                </div>
                                <Badge variant={activeBooking.status === 'active' ? 'success' : 'warning'} className="capitalize">
                                    {activeBooking.status}
                                </Badge>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm border-t border-[#E5E7EB] pt-4">
                                    <div>
                                        <span className="text-[#6B7280] block text-xs uppercase font-semibold">Location</span>
                                        <span className="font-semibold text-text-custom mt-0.5 block">{activeBooking.slot?.floor?.area?.name}</span>
                                    </div>
                                    <div>
                                        <span className="text-[#6B7280] block text-xs uppercase font-semibold">Floor / Slot</span>
                                        <span className="font-semibold text-text-custom mt-0.5 block">
                                            {activeBooking.slot?.floor?.name} — <strong className="text-primary">{activeBooking.slot?.slot_number}</strong>
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-[#6B7280] block text-xs uppercase font-semibold">Vehicle Plate</span>
                                        <span className="font-mono font-semibold text-text-custom mt-0.5 block">{activeBooking.vehicle?.plate_number}</span>
                                    </div>
                                    <div>
                                        <span className="text-[#6B7280] block text-xs uppercase font-semibold">QR Code</span>
                                        <span className="font-mono text-xs font-semibold bg-gray-50 border px-2 py-0.5 rounded block w-fit mt-0.5">
                                            {activeBooking.qr_code}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <EmptyState
                            title="No Active Bookings"
                            description="Book a spot in advance before driving over to secure parking."
                            actionLabel="Book a Slot Now"
                            onAction={() => navigate(ROUTES.BOOKING_NEW)}
                        />
                    )}
                </div>

                {/* Notifications & System Updates */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Notifications</CardTitle>
                            <CardDescription>Latest alerts and status updates.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3.5">
                            {notifications && notifications.length > 0 ? (
                                notifications.slice(0, 4).map((n) => (
                                    <div key={n.id} className="p-3 border rounded-xl bg-gray-50/50 space-y-1">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold text-text-custom">{n.title}</span>
                                            <span className="text-[10px] text-text-secondary">{new Date(n.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                        </div>
                                        <p className="text-[11px] text-text-secondary leading-normal">{n.message}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-6 text-xs text-text-secondary">
                                    No new notifications.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};
