import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import { API_ENDPOINTS } from '@/constants';
import { Booking } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { QrCode, ArrowRightLeft, ShieldCheck, CheckCircle2, User, Car } from 'lucide-react';

export const QrScanner: React.FC = () => {
    const queryClient = useQueryClient();
    const [qrInput, setQrInput] = React.useState('');
    const [scanResult, setScanResult] = React.useState<{
        success: boolean;
        message: string;
        session?: any;
    } | null>(null);

    // Fetch all bookings to allow staff to "mock scan" with one click for testing
    const { data: bookings, isLoading } = useQuery<Booking[]>({
        queryKey: ['staffBookings'],
        queryFn: async () => {
            const res = await api.get<Booking[]>(API_ENDPOINTS.BOOKINGS); // Normally admin gets all, we mock with this user's list for simulation
            return res.data;
        }
    });

    // Check In Mutation
    const checkInMutation = useMutation({
        mutationFn: async (qr: string) => {
            const res = await api.post(API_ENDPOINTS.STAFF_CHECKIN, { qr_code: qr });
            return res.data;
        },
        onSuccess: (data) => {
            setScanResult({
                success: true,
                message: data.message,
                session: data.session
            });
            setQrInput('');
            queryClient.invalidateQueries({ queryKey: ['staffBookings'] });
        },
        onError: (err: any) => {
            setScanResult({
                success: false,
                message: err.response?.data?.message || 'Check-in failed. Please verify QR token validity.'
            });
        }
    });

    // Check Out Mutation
    const checkOutMutation = useMutation({
        mutationFn: async (qr: string) => {
            const res = await api.post(API_ENDPOINTS.STAFF_CHECKOUT, { qr_code: qr });
            return res.data;
        },
        onSuccess: (data) => {
            setScanResult({
                success: true,
                message: data.message,
                session: data.session
            });
            setQrInput('');
            queryClient.invalidateQueries({ queryKey: ['staffBookings'] });
        },
        onError: (err: any) => {
            setScanResult({
                success: false,
                message: err.response?.data?.message || 'Check-out failed. No active session found.'
            });
        }
    });

    const handleCheckIn = (qr: string) => {
        if (!qr.trim()) return;
        checkInMutation.mutate(qr.trim());
    };

    const handleCheckOut = (qr: string) => {
        if (!qr.trim()) return;
        checkOutMutation.mutate(qr.trim());
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-text-custom">Staff Gate Portal</h1>
                <p className="text-sm text-text-secondary">Scan or enter reservation QR codes to manage vehicle check-in and check-out.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Left Column: QR Simulator Input */}
                <div className="md:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <QrCode className="h-5 w-5 text-primary" />
                                QR Gate Terminal
                            </CardTitle>
                            <CardDescription>Enter the customer's QR token to validate.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="qr-token">QR Token Code</Label>
                                <Input 
                                    id="qr-token" 
                                    placeholder="e.g. QR-ABC123XYZ" 
                                    value={qrInput} 
                                    onChange={(e) => setQrInput(e.target.value)} 
                                />
                            </div>
                            <div className="flex gap-3">
                                <Button 
                                    className="flex-1 rounded-xl"
                                    onClick={() => handleCheckIn(qrInput)}
                                    disabled={checkInMutation.isPending || !qrInput}
                                >
                                    Check In
                                </Button>
                                <Button 
                                    className="flex-1 rounded-xl" 
                                    variant="secondary"
                                    onClick={() => handleCheckOut(qrInput)}
                                    disabled={checkOutMutation.isPending || !qrInput}
                                >
                                    Check Out
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Scan Status Feedback */}
                    {scanResult && (
                        <Card className={`border ${scanResult.success ? 'border-success-custom/20 bg-success-custom/5' : 'border-danger-custom/20 bg-danger-custom/5'}`}>
                            <CardContent className="pt-6 space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className={`p-2 rounded-xl border ${scanResult.success ? 'bg-success-custom/10 text-success-custom border-success-custom/25' : 'bg-danger-custom/10 text-danger-custom border-danger-custom/25'}`}>
                                        {scanResult.success ? <CheckCircle2 className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <h4 className="text-sm font-semibold text-text-custom">
                                            {scanResult.success ? 'Action Authorized' : 'Access Denied'}
                                        </h4>
                                        <p className="text-xs text-text-secondary">{scanResult.message}</p>
                                    </div>
                                </div>
                                
                                {scanResult.success && scanResult.session && (
                                    <div className="border-t border-border-custom/50 pt-3 space-y-2 text-xs">
                                        <div className="flex justify-between">
                                            <span className="text-text-secondary">Slot bay:</span>
                                            <span className="font-semibold">{scanResult.session.slot?.slot_number}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-text-secondary">Vehicle:</span>
                                            <span className="font-mono font-semibold">{scanResult.session.vehicle?.plate_number}</span>
                                        </div>
                                        {scanResult.session.duration_minutes !== null && (
                                            <div className="flex justify-between">
                                                <span className="text-text-secondary">Duration:</span>
                                                <span className="font-semibold text-primary">{scanResult.session.duration_minutes} minutes</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Right/Middle Column: Simulation List */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <ArrowRightLeft className="h-5 w-5 text-primary" />
                                Active Gate Booking Queue
                            </CardTitle>
                            <CardDescription>Click a card below to trigger gate check-in/out automatically.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="space-y-3">
                                    <div className="h-16 bg-gray-100 rounded-xl animate-pulse" />
                                    <div className="h-16 bg-gray-100 rounded-xl animate-pulse" />
                                </div>
                            ) : bookings && bookings.length > 0 ? (
                                <div className="space-y-3.5">
                                    {bookings.map((booking) => (
                                        <div 
                                            key={booking.id}
                                            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-border-custom rounded-xl bg-white hover:bg-gray-50 transition-colors gap-4"
                                        >
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-sm">{booking.slot?.slot_number}</span>
                                                    <Badge variant={booking.status === 'active' ? 'success' : booking.status === 'pending' ? 'warning' : 'secondary'}>
                                                        {booking.status}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-text-secondary">
                                                    <span className="flex items-center gap-1">
                                                        <User className="h-3.5 w-3.5" />
                                                        {booking.user?.name}
                                                    </span>
                                                    <span className="flex items-center gap-1 font-mono">
                                                        <Car className="h-3.5 w-3.5" />
                                                        {booking.vehicle?.plate_number}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                {booking.status === 'pending' && (
                                                    <Button 
                                                        size="sm" 
                                                        onClick={() => handleCheckIn(booking.qr_code)}
                                                    >
                                                        Scan Check-In
                                                    </Button>
                                                )}
                                                {booking.status === 'active' && (
                                                    <Button 
                                                        size="sm" 
                                                        variant="secondary"
                                                        onClick={() => handleCheckOut(booking.qr_code)}
                                                    >
                                                        Scan Check-Out
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center p-6 text-xs text-text-secondary">
                                    No active bookings found. Customers must reserve slots to check-in.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};
