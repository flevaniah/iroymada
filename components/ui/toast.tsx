'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  title: string
  description?: string
  duration?: number
}

let toastId = 0

class ToastManager {
  private listeners: Set<(toast: Toast) => void> = new Set()
  private removeListeners: Set<(id: string) => void> = new Set()

  show(toast: Omit<Toast, 'id'>) {
    const id = (toastId++).toString()
    const fullToast: Toast = { id, ...toast }
    
    this.listeners.forEach(listener => listener(fullToast))
    
    // Auto remove after duration
    if (toast.duration !== 0) {
      setTimeout(() => {
        this.remove(id)
      }, toast.duration || 5000)
    }
    
    return id
  }

  remove(id: string) {
    this.removeListeners.forEach(listener => listener(id))
  }

  onShow(listener: (toast: Toast) => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  onRemove(listener: (id: string) => void) {
    this.removeListeners.add(listener)
    return () => this.removeListeners.delete(listener)
  }
}

export const toastManager = new ToastManager()

export const toast = {
  success: (title: string, description?: string, duration?: number) =>
    toastManager.show({ type: 'success', title, description, duration }),
  error: (title: string, description?: string, duration?: number) =>
    toastManager.show({ type: 'error', title, description, duration }),
  warning: (title: string, description?: string, duration?: number) =>
    toastManager.show({ type: 'warning', title, description, duration }),
  info: (title: string, description?: string, duration?: number) =>
    toastManager.show({ type: 'info', title, description, duration }),
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const unsubscribeShow = toastManager.onShow((toast) => {
      setToasts(prev => [...prev, toast])
    })

    const unsubscribeRemove = toastManager.onRemove((id) => {
      setToasts(prev => prev.filter(t => t.id !== id))
    })

    return () => {
      unsubscribeShow()
      unsubscribeRemove()
    }
  }, [])

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
      case 'info':
        return <Info className="h-5 w-5 text-blue-600" />
    }
  }

  const getStyles = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800'
    }
  }

  return (
    <>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              max-w-sm p-4 rounded-lg border shadow-lg transition-all duration-300
              ${getStyles(toast.type)}
            `}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {getIcon(toast.type)}
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium">
                  {toast.title}
                </h3>
                {toast.description && (
                  <p className="mt-1 text-sm opacity-80">
                    {toast.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => toastManager.remove(toast.id)}
                className="ml-4 flex-shrink-0 opacity-60 hover:opacity-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}