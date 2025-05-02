"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  // Fetch notifications (real order data)
  const fetchNotifications = async () => {
    if (!session?.user?.role === 'PROVIDER') return
    
    try {
      const response = await fetch('/api/provider/notifications', {
        cache: 'no-store'
      })
      
      if (response.ok) {
        const data = await response.json()
        
        // Filter out notifications older than 24 hours
        const oneDayAgo = new Date()
        oneDayAgo.setDate(oneDayAgo.getDate() - 1)
        const recentNotifications = data.filter(
          order => new Date(order.createdAt) > oneDayAgo
        )
        
        setNotifications(recentNotifications)
        // Count unread notifications
        setUnreadCount(recentNotifications.filter(n => !n.viewed).length)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  // Mark a notification as viewed (but don't delete it)
  const markAsViewed = async (id) => {
    try {
      await fetch(`/api/provider/notifications/${id}/view`, { 
        method: 'POST' 
      })
      
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, viewed: true } 
            : notification
        )
      )
      
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as viewed:', error)
    }
  }

  // Mark all notifications as viewed
  const markAllAsViewed = async () => {
    try {
      await fetch('/api/provider/notifications/view-all', { 
        method: 'POST' 
      })
      
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, viewed: true }))
      )
      
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all notifications as viewed:', error)
    }
  }

  // Fetch notifications on initial load and set up polling
  useEffect(() => {
    if (session?.user?.role === 'PROVIDER') {
      fetchNotifications()
      
      // Poll for new notifications every minute
      const interval = setInterval(() => {
        fetchNotifications()
      }, 60000)
      
      return () => clearInterval(interval)
    }
  }, [session])

  return (
    <NotificationContext.Provider 
      value={{ 
        notifications, 
        unreadCount, 
        fetchNotifications, 
        markAsViewed,
        markAllAsViewed
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  
  return context
}
