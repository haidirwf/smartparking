import * as React from 'react';
import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const buttonVariants = cva(
    'inline-flex items-center justify-center whitespace-nowrap text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 rounded-xl',
    {
        variants: {
            variant: {
                primary: 'bg-primary text-white hover:bg-primary-hover active:scale-[0.98]',
                secondary: 'bg-[#E5E7EB] text-[#111827] hover:bg-gray-200 active:scale-[0.98]',
                outline: 'border border-[#E5E7EB] bg-white text-[#111827] hover:bg-gray-50 active:scale-[0.98]',
                danger: 'bg-danger-custom text-white hover:bg-red-600 active:scale-[0.98]',
                ghost: 'hover:bg-gray-100 hover:text-gray-900 active:scale-[0.98]',
            },
            size: {
                default: 'h-11 px-6 py-2.5',
                sm: 'h-9 px-4 py-1.5 text-xs',
                lg: 'h-12 px-8 py-3 text-base',
                icon: 'h-10 w-10',
            },
        },
        defaultVariants: {
            variant: 'primary',
            size: 'default',
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, ...props }, ref) => {
        return (
            <motion.button
                whileTap={{ scale: 0.98 }}
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...(props as any)}
            />
        );
    }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
