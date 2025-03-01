import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from "@/lib/utils"

export function Toast({ message, type, onClose }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Show toast immediately - reduced delay from 100ms to 10ms
    const showTimer = setTimeout(() => setIsVisible(true), 10)
    
    // Increase display time from 5000ms to 6000ms for better visibility
    const hideTimer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300)
    }, 6000)

    return () => {
      clearTimeout(showTimer)
      clearTimeout(hideTimer)
    }
  }, [onClose, message]) // Added message dependency to reset timer when message changes

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 pointer-events-none transition-opacity duration-300", 
        isVisible ? "opacity-100" : "opacity-0"
      )}
    >
      <div
        className={cn(
          "max-w-md p-4 rounded-md shadow-lg transition-all duration-300 transform pointer-events-auto",
          isVisible 
            ? "translate-y-0 opacity-100 translate-x-0" 
            : "translate-y-2 translate-x-2 opacity-0",
          type === 'success' ? 'bg-green-500 text-white' : type === 'error' ? 'bg-red-500 text-white' : 'bg-yellow-400 text-black'
        )}
      >
        <div className="flex justify-between items-center">
          <p>{message}</p>
          <button onClick={() => setIsVisible(false)} className="ml-4 text-white hover:text-gray-200">
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

export function useToast() {
  const [toast, setToast] = useState(null)

  const showToast = (message, type) => {
    // First clear any existing toast to avoid conflicts
    setToast(null) 
    
    // Small delay to ensure clean slate before showing new toast
    setTimeout(() => {
      setToast({ message, type })
    }, 10)
  }

  const hideToast = () => {
    setToast(null)
  }

  const ToastComponent = toast ? (
    <Toast message={toast.message} type={toast.type} onClose={hideToast} />
  ) : null

  return { showToast, hideToast, ToastComponent }
}

