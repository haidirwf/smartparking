import { clsx, type ClassValue } from 'clsx';
import { bgRGBA } from 'tailwind-merge'; // Let's use simple tailwind-merge standard
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
