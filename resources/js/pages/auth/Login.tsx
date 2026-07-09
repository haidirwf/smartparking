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

const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
    const navigate = useNavigate();
    const setUser = useAuthStore((state) => state.setUser);
    const [authError, setAuthError] = React.useState<string | null>(null);
    const [submitting, setSubmitting] = React.useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = async (data: LoginFormValues) => {
        setAuthError(null);
        setSubmitting(true);
        try {
            await ensureCsrfToken();
            const response = await api.post(API_ENDPOINTS.LOGIN, data);
            
            // Re-fetch current authenticated user to store in Zustand
            const userResponse = await api.get(API_ENDPOINTS.AUTH_USER);
            setUser(userResponse.data);
            navigate(ROUTES.DASHBOARD);
        } catch (err: any) {
            setAuthError(
                err.response?.data?.message || 'Invalid email or password. Please try again.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-white px-8 py-8 border border-border-custom rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {authError && (
                    <div className="rounded-xl bg-danger-custom/10 p-3 text-xs font-semibold text-danger-custom border border-danger-custom/25">
                        {authError}
                    </div>
                )}

                <div className="space-y-2">
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

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Link
                            to={ROUTES.FORGOT_PASSWORD}
                            className="text-xs font-semibold text-primary hover:text-primary-hover"
                        >
                            Forgot password?
                        </Link>
                    </div>
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

                <Button
                    type="submit"
                    className="w-full h-11"
                    disabled={submitting}
                >
                    {submitting ? 'Signing in...' : 'Sign In'}
                </Button>
            </form>

            <div className="mt-6 text-center text-xs">
                <span className="text-text-secondary">Don't have an account? </span>
                <Link
                    to={ROUTES.REGISTER}
                    className="font-semibold text-primary hover:text-primary-hover"
                >
                    Sign up for free
                </Link>
            </div>
        </div>
    );
};
