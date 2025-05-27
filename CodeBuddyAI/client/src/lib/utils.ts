import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'online':
    case 'ready':
    case 'completed':
      return 'bg-green-500';
    case 'processing':
      return 'bg-blue-500 animate-pulse';
    case 'pending':
      return 'bg-slate-300';
    case 'failed':
      return 'bg-red-500';
    default:
      return 'bg-slate-300';
  }
}

export function getStatusText(status: string): string {
  switch (status) {
    case 'online':
      return 'Online';
    case 'ready':
      return 'Ready';
    case 'completed':
      return 'Complete';
    case 'processing':
      return 'Processing';
    case 'pending':
      return 'Pending';
    case 'failed':
      return 'Failed';
    default:
      return status;
  }
}

export function truncateText(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}
