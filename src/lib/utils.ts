import type { ClassValue } from 'clsx';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function km(m: number) {
	return `${m / 1000} KM`;
}

export function dt(d: Date) {
	return d.toLocaleDateString();
}
