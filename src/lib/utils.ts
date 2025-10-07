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

export function season(d: Date) {
	const month = d.getMonth() + 1;
	if (month >= 3 && month <= 5) return 'spring';
	if (month >= 6 && month <= 8) return 'summer';
	if (month >= 9 && month <= 11) return 'autumn';
	return 'winter';
}

export function seasonEmoji(d: Date) {
	const s = season(d);
	if (s === 'spring') return '🌸';
	if (s === 'summer') return '☀️';
	if (s === 'autumn') return '🍂';
	return '❄️';
}

export function dt(d: Date) {
	const day = d.getDate().toString().padStart(2, '0');
	const month = d.toLocaleString('de-CH', { month: 'short' });
	const year = d.getFullYear().toString().slice(-2);
	const time = d.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit', hour12: false });

	return `${day}. ${month} ${year} ${time}`;
}

export function d(d: Date) {
	const day = d.getDate().toString().padStart(2, '0');
	const month = d.toLocaleString('de-CH', { month: 'short' });
	const year = d.getFullYear().toString().slice(-2);

	return `${day}. ${month} ${year}`;
}

export function t(d: Date) {
	return d.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit', hour12: false });
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
