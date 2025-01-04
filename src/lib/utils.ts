import type { ClassValue } from 'clsx';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function km(m: number) {
	return `${(m / 1000).toFixed(2)} KM`;
}

export function m_sign(m: number) {
	return `${Math.round(m)} m`;
}

export function percent(p: number) {
	return `${(p * 100).toFixed(1)} %`;
}

//TODO: Change schema so we can use number here
export function hr(m: string | null) {
	if (!m) return '';
	return (parseInt(m) / 60).toFixed(0) + ' Min';
}

export function dt(d: Date) {
	return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
}

export function d(d: Date) {
	return `${d.toLocaleDateString()}`;
}

export function t(d: Date) {
	return `${d.toLocaleTimeString()}`;
}

// Function to assign color based on gradient
export function getColorFromGradient(gradient: number): string {
	if (gradient >= 22) return '#1a1a1a';
	if (gradient >= 18) return '#730920';
	if (gradient >= 15) return '#e11d48';
	if (gradient >= 10) return '#ffa724';
	if (gradient >= 5) return '#fef08a';
	return '#bbf7d0';
}
