import * as React from 'react';
import { AlertCircle, Inbox, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from './button';

// 1. Skeleton Loading component
export function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn('animate-pulse rounded-xl bg-gray-200/80', className)}
            {...props}
        />
    );
}

// 2. Empty State component
interface EmptyStateProps {
    title?: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
    icon?: React.ReactNode;
    className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    title = 'No records found',
    description = 'There is no data to display right now.',
    actionLabel,
    onAction,
    icon = <Inbox className="h-10 w-10 text-text-secondary" />,
    className,
}) => {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center text-center p-8 border border-dashed border-border-custom bg-white rounded-2xl min-h-[300px]',
                className
            )}
        >
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 border border-border-custom mb-4">
                {icon}
            </div>
            <h3 className="text-base font-semibold text-text-custom mb-1">{title}</h3>
            <p className="text-sm text-text-secondary max-w-sm mb-6 leading-relaxed">
                {description}
            </p>
            {actionLabel && onAction && (
                <Button onClick={onAction} variant="primary" size="sm">
                    {actionLabel}
                </Button>
            )}
        </div>
    );
};

// 3. Error State component
interface ErrorStateProps {
    title?: string;
    description?: string;
    retryLabel?: string;
    onRetry?: () => void;
    className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
    title = 'Something went wrong',
    description = 'We encountered an error loading this data. Please try again.',
    retryLabel = 'Try Again',
    onRetry,
    className,
}) => {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center text-center p-8 border border-border-custom bg-white rounded-2xl min-h-[250px]',
                className
            )}
        >
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-danger-custom/10 border border-danger-custom/25 mb-4">
                <AlertCircle className="h-6 w-6 text-danger-custom" />
            </div>
            <h3 className="text-base font-semibold text-text-custom mb-1">{title}</h3>
            <p className="text-sm text-text-secondary max-w-sm mb-6 leading-relaxed">
                {description}
            </p>
            {onRetry && (
                <Button onClick={onRetry} variant="outline" size="sm">
                    {retryLabel}
                </Button>
            )}
        </div>
    );
};
