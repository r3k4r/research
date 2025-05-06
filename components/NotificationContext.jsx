"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  const fetchNotifications = async () => {
    if (!session?.user?.role === 'PROVIDER') return
    
    try {
      const timestamp = Date.now();
      const response = await fetch(`/api/provider/notifications?t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        
        if (data.notifications) {
          const oneDayAgo = new Date()
          oneDayAgo.setDate(oneDayAgo.getDate() - 1)
          
          const recentNotifications = data.notifications.filter(
            notification => new Date(notification.createdAt) > oneDayAgo
          )
          
          setNotifications(recentNotifications)
          setUnreadCount(recentNotifications.filter(n => !n.viewed).length)
          setLastUpdated(new Date())
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

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

  const markAllAsViewed = async () => {
    try {
      const response = await fetch('/api/provider/notifications/view-all', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark notifications as viewed');
      }
      
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, viewed: true }))
      );
      
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as viewed:', error);
    }
  }

  useEffect(() => {
    if (session?.user?.role === 'PROVIDER') {
      fetchNotifications()
      
      const interval = setInterval(() => {
        fetchNotifications()
      }, 10000)
      
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
        markAllAsViewed,
        lastUpdated
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
