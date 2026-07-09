import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import { User } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton, ErrorState } from '@/components/ui/feedback';

export const Users: React.FC = () => {
    const queryClient = useQueryClient();

    // Fetch Users
    const { data: users, isLoading, error, refetch } = useQuery<User[]>({
        queryKey: ['adminUsers'],
        queryFn: async () => {
            const res = await api.get<User[]>('/api/admin/users');
            return res.data;
        }
    });

    // Update User Role Mutation
    const roleMutation = useMutation({
        mutationFn: async ({ userId, roleSlug }: { userId: number; roleSlug: string }) => {
            const res = await api.post(`/api/admin/users/${userId}/role`, { role_slug: roleSlug });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
        }
    });

    const handleRoleChange = (userId: number, roleSlug: string) => {
        roleMutation.mutate({ userId, roleSlug });
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-10 w-1/4" />
                <Skeleton className="h-[300px] w-full" />
            </div>
        );
    }

    if (error) {
        return <ErrorState onRetry={refetch} />;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-text-custom">User Management</h1>
                <p className="text-sm text-text-secondary">View user accounts, verify verification status, and manage roles.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>System Accounts</CardTitle>
                    <CardDescription>A list of all users registered in the parking management platform.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Verified Status</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users?.map((user) => {
                                const currentRoleSlug = user.roles?.[0]?.slug || 'customer';
                                return (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-semibold">{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            {user.email_verified_at ? (
                                                <Badge variant="success">Verified</Badge>
                                            ) : (
                                                <Badge variant="secondary">Pending</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <span className="capitalize font-semibold text-xs text-text-secondary">
                                                {currentRoleSlug}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <select
                                                className="h-9 rounded-xl border border-border-custom bg-white px-2.5 text-xs text-text-custom focus:outline-none focus:ring-2 focus:ring-primary"
                                                value={currentRoleSlug}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                            >
                                                <option value="customer">Customer</option>
                                                <option value="staff">Staff</option>
                                                <option value="admin">Administrator</option>
                                            </select>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};
