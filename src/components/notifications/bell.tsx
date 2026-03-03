"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  actionUrl: string | null;
  read: boolean;
  createdAt: string;
}

export default function NotificationBell({ userId }: { userId: string | null }) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userId) return;

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const fetchNotifications = async () => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/notifications?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {
      // Ignore polling errors
    }
  };

  const handleClick = async (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      await fetch(`/api/notifications/${notification.id}/read`, { method: "POST" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    setOpen(false);

    // Navigate to action URL
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  const timeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return "Ahora";
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => userId && setOpen(!open)}
        className="relative p-2 text-white/40 hover:text-white transition-colors cursor-pointer"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-[#12263a] border border-[#1a3350] rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="p-3 border-b border-[#1a3350]">
            <h3 className="text-sm font-semibold text-white">Notificaciones</h3>
          </div>

          {notifications.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-sm text-white/40">Sin notificaciones</p>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {notifications.slice(0, 5).map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`w-full text-left p-3 hover:bg-white/5 transition-colors border-b border-[#1a3350] last:border-0 ${
                    !n.read ? "bg-[#356EA6]/10" : ""
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!n.read && (
                      <span className="w-2 h-2 bg-[#356EA6] rounded-full mt-1.5 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{n.title}</p>
                      <p className="text-xs text-white/40 line-clamp-2 mt-0.5">{n.message}</p>
                      <p className="text-xs text-white/30 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
