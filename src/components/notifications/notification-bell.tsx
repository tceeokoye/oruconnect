"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { io, Socket } from "socket.io-client"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import axios from "axios"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

let socket: Socket

export function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const user = useSelector((state: RootState) => state.auth.user)

  useEffect(() => {
    if (!user) return

    fetchNotifications()
    socketInit()

    return () => {
      if (socket) socket.disconnect()
    }
  }, [user])

  const socketInit = async () => {
    // ensure socket API route is called
    await fetch("/api/socket/io").catch(console.error)

    socket = io({
      path: "/api/socket/io",
    })

    socket.on("connect", () => {
      socket.emit("join-user", (user as any)?._id || (user as any)?.id)
    })

    socket.on("new-notification", (notification: any) => {
      setNotifications((prev) => [notification, ...prev])
      setUnreadCount((prev) => prev + 1)
      toast.success(notification.title, { description: notification.message })
    })
  }

  const fetchNotifications = async () => {
    if (!user) return
    try {
      const res = await axios.get("/api/notifications?limit=10")
      setNotifications(res.data.data)
      setUnreadCount(res.data.unreadCount)
    } catch (error: any) {
      if (error.response?.status !== 401) {
        console.error("Failed to load notifications", error)
      }
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await axios.put(`/api/notifications/${id}`, { isRead: true })
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error(error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await axios.post("/api/notifications/mark-all-read")
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-600 animate-pulse" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <p className="font-semibold text-sm">Notifications</p>
          {unreadCount > 0 && (
            <button 
              onClick={markAllAsRead}
              className="text-xs text-primary hover:underline font-medium"
            >
              Mark all read
            </button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No new notifications
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((n) => (
                <div 
                  key={n._id} 
                  className={cn(
                    "p-4 hover:bg-muted/50 transition-colors cursor-pointer",
                    !n.isRead && "bg-primary/5"
                  )}
                  onClick={() => !n.isRead && markAsRead(n._id)}
                >
                  <div className="flex gap-3">
                    <div className="flex-1 space-y-1">
                      <p className={cn("text-sm", !n.isRead && "font-semibold")}>
                        {n.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {n.message}
                      </p>
                      <p className="text-[10px] text-muted-foreground pt-1">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {!n.isRead && (
                      <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
