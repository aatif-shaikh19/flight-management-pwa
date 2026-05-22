import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Calculate duration string from two ISO timestamps
// e.g. "2h 15m"
export function getFlightDuration(departsAt: string, arrivesAt: string): string {
  const diff = new Date(arrivesAt).getTime() - new Date(departsAt).getTime()
  const totalMinutes = Math.floor(diff / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours === 0) return `${minutes}m`
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${minutes}m`
}

// Format a timestamp to readable time: "06:30 AM"
export function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

// Format a timestamp to readable date: "Mon, 2 Jun"
export function formatDate(timestamp: string): string {
  return new Date(timestamp).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

// Format price in Indian Rupees: "₹4,500"
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

// IATA code to full airport/city name
export function getAirportName(code: string): string {
  const airports: Record<string, string> = {
    BOM: 'Mumbai',
    DEL: 'Delhi',
    BLR: 'Bangalore',
    MAA: 'Chennai',
  }
  return airports[code] ?? code
}

// Today's date formatted for the date input default value
export function getTodayString(): string {
  return new Date().toISOString().split('T')[0] ?? ''
}
