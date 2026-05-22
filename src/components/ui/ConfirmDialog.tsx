'use client'

import { cn } from '@/lib/utils'
import { AlertTriangle, X } from 'lucide-react'

type ConfirmDialogProps = {
  isOpen:       boolean
  title:        string
  description:  string
  confirmLabel: string
  cancelLabel?: string
  variant?:     'danger' | 'warning'
  loading?:     boolean
  onConfirm:    () => void
  onCancel:     () => void
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Go Back',
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onCancel}
    >
      {/* Dialog card */}
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative animate-in fade-in slide-in-from-bottom-4 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className={cn(
          'w-12 h-12 rounded-full flex items-center justify-center mb-4',
          variant === 'danger'  ? 'bg-red-100'    : 'bg-amber-100'
        )}>
          <AlertTriangle className={cn(
            'w-6 h-6',
            variant === 'danger' ? 'text-red-500' : 'text-amber-500'
          )} />
        </div>

        <h2 className="text-lg font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">{description}</p>

        <div className="flex flex-col gap-2">
          <button
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              'w-full font-semibold py-3 rounded-xl text-sm text-white transition-colors',
              loading ? 'opacity-60 cursor-not-allowed' : '',
              variant === 'danger'
                ? 'bg-red-500 hover:bg-red-600 active:bg-red-700'
                : 'bg-amber-500 hover:bg-amber-600 active:bg-amber-700'
            )}
          >
            {loading ? 'Processing...' : confirmLabel}
          </button>
          <button
            onClick={onCancel}
            disabled={loading}
            className="w-full font-medium py-3 rounded-xl text-sm text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
