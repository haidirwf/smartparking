import * as React from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ROUTES } from '@/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const forgotPasswordSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const ForgotPassword: React.FC = () => {
    const [submitting, setSubmitting] = React.useState(false);
    const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: '',
        },
    });

    const onSubmit = async (data: ForgotPasswordFormValues) => {
        setSuccessMessage(null);
        setSubmitting(true);
        try {
            // In development, mock success state
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setSuccessMessage('If the email matches an active account, we have sent instructions.');
        } catch (err: any) {
            // handle error
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-white px-8 py-8 border border-border-custom rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            {successMessage ? (
                <div className="space-y-4">
                    <div className="rounded-xl bg-success-custom/10 p-3 text-xs font-semibold text-success-custom border border-success-custom/25">
                        {successMessage}
                    </div>
                    <Link to={ROUTES.LOGIN} className="block w-full">
                        <Button variant="outline" className="w-full h-11">
                            Back to Sign In
                        </Button>
                    </Link>
                </div>
            ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <p className="text-xs text-text-secondary leading-relaxed">
                        Enter your account email address and we will send a password reset link.
                    </p>
                    
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

                    <Button
                        type="submit"
                        className="w-full h-11"
                        disabled={submitting}
                    >
                        {submitting ? 'Sending link...' : 'Send Reset Link'}
                    </Button>
                </form>
            )}

            <div className="mt-6 text-center text-xs">
                <Link
                    to={ROUTES.LOGIN}
                    className="font-semibold text-primary hover:text-primary-hover"
                >
                    Back to Sign In
                </Link>
            </div>
        </div>
    );
};
