import type { ClassValue } from 'clsx';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function km(m: number) {
	return `${m / 1000} KM`;
}

//TODO: Change schema so we can use number here
export function hr(m: string | null) {
	if (!m) return '';
	return (parseInt(m) / 60).toFixed(0) + ' Min';
}

export function dt(d: Date) {
	return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
}
