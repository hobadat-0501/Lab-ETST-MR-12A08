'use client'
import { Check } from 'lucide-react'
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

const ToastContext = createContext(() => {})
export const useToast = () => useContext(ToastContext)

export function ToastProvider({ children }) {
  const [message, setMessage] = useState('')
  const timer = useRef()
  const notify = useCallback(text => {
    setMessage(text)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setMessage(''), 3000)
  }, [])
  useEffect(() => () => clearTimeout(timer.current), [])
  return <ToastContext.Provider value={notify}>
    {children}
    {message && <div className="toast" role="status"><Check size={16} />{message}</div>}
  </ToastContext.Provider>
}
