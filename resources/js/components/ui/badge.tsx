import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const badgeVariants = cva(
    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
    {
        variants: {
            variant: {
                default: 'bg-primary/10 text-primary border border-primary/20',
                secondary: 'bg-text-secondary/10 text-text-secondary border border-text-secondary/20',
                success: 'bg-success-custom/10 text-success-custom border border-success-custom/20',
                warning: 'bg-warning-custom/10 text-warning-custom border border-warning-custom/20',
                danger: 'bg-danger-custom/10 text-danger-custom border border-danger-custom/20',
                outline: 'text-text-custom border border-border-custom',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    );
}

export { Badge, badgeVariants };
