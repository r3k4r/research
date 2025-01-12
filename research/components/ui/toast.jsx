import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from "@/lib/utils"

export function Toast({ message, type, onClose }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const showTimer = setTimeout(() => setIsVisible(true), 100)
    const hideTimer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300)
    }, 5000)

    return () => {
      clearTimeout(showTimer)
      clearTimeout(hideTimer)
    }
  }, [onClose])

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
    setToast({ message, type })
  }

  const hideToast = () => {
    setToast(null)
  }

  const ToastComponent = toast ? (
    <Toast message={toast.message} type={toast.type} onClose={hideToast} />
  ) : null

  return { showToast, ToastComponent }
}

