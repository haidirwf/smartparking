import * as React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '@/store/auth';
import { ROUTES, API_ENDPOINTS } from '@/constants';
import api, { ensureCsrfToken } from '@/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    password_confirmation: z.string().min(6, 'Please confirm your password'),
}).refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export const Register: React.FC = () => {
    const navigate = useNavigate();
    const setUser = useAuthStore((state) => state.setUser);
    const [authError, setAuthError] = React.useState<string | null>(null);
    const [submitting, setSubmitting] = React.useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            password_confirmation: '',
        },
    });

    const onSubmit = async (data: RegisterFormValues) => {
        setAuthError(null);
        setSubmitting(true);
        try {
            await ensureCsrfToken();
            await api.post(API_ENDPOINTS.REGISTER, data);
            
            // Re-fetch current user session
            const userResponse = await api.get(API_ENDPOINTS.AUTH_USER);
            setUser(userResponse.data);
            navigate(ROUTES.DASHBOARD);
        } catch (err: any) {
            setAuthError(
                err.response?.data?.message || 'Something went wrong. Please check your inputs.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-white px-8 py-8 border border-border-custom rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {authError && (
                    <div className="rounded-xl bg-danger-custom/10 p-3 text-xs font-semibold text-danger-custom border border-danger-custom/25">
                        {authError}
                    </div>
                )}

                <div className="space-y-1">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                        id="name"
                        placeholder="John Doe"
                        {...register('name')}
                    />
                    {errors.name && (
                        <p className="text-xs text-danger-custom font-medium">{errors.name.message}</p>
                    )}
                </div>

                <div className="space-y-1">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        {...register('email')}
                    />
                    {errors.email && (
                        <p className="text-xs text-danger-custom font-medium">{errors.email.message}</p>
                    )}
                </div>

                <div className="space-y-1">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        {...register('password')}
                    />
                    {errors.password && (
                        <p className="text-xs text-danger-custom font-medium">{errors.password.message}</p>
                    )}
                </div>

                <div className="space-y-1">
                    <Label htmlFor="password_confirmation">Confirm Password</Label>
                    <Input
                        id="password_confirmation"
                        type="password"
                        placeholder="••••••••"
                        {...register('password_confirmation')}
                    />
                    {errors.password_confirmation && (
                        <p className="text-xs text-danger-custom font-medium">{errors.password_confirmation.message}</p>
                    )}
                </div>

                <Button
                    type="submit"
                    className="w-full h-11 mt-2"
                    disabled={submitting}
                >
                    {submitting ? 'Creating account...' : 'Create Account'}
                </Button>
            </form>

            <div className="mt-6 text-center text-xs">
                <span className="text-text-secondary">Already have an account? </span>
                <Link
                    to={ROUTES.LOGIN}
                    className="font-semibold text-primary hover:text-primary-hover"
                >
                    Sign in
                </Link>
            </div>
        </div>
    );
};
