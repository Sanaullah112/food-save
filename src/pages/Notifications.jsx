import { useEffect, useState } from 'react'
import API from '../utils/api'
import Navbar from '../components/Navbar'
import toast from 'react-hot-toast'
import { Bell, CheckCheck } from 'lucide-react'

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchNotifications = async () => {
    try {
      const { data } = await API.get('/notifications')
      setNotifications(data)
    } catch {
      toast.error('Failed to load notifications')
    }
    setLoading(false)
  }

  const markRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`)
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      )
    } catch {
      toast.error('Failed to mark as read')
    }
  }

  const markAllRead = async () => {
    try {
      await Promise.all(
        notifications.filter(n => !n.isRead).map(n => API.put(`/notifications/${n._id}/read`))
      )
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      toast.success('All marked as read')
    } catch {
      toast.error('Failed to update')
    }
  }

  useEffect(() => { fetchNotifications() }, [])

  const typeColor = (type) => {
    if (type === 'success') return 'border-l-green-500 bg-green-50'
    if (type === 'warning') return 'border-l-yellow-500 bg-yellow-50'
    if (type === 'alert') return 'border-l-red-500 bg-red-50'
    return 'border-l-blue-500 bg-blue-50'
  }

  const typeIcon = (type) => {
    if (type === 'success') return '✅'
    if (type === 'warning') return '⚠️'
    if (type === 'alert') return '🔴'
    return '🔔'
  }

  const unread = notifications.filter(n => !n.isRead).length

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Bell size={24} /> Notifications
              {unread > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{unread}</span>
              )}
            </h1>
            <p className="text-gray-500 text-sm mt-1">{unread} unread notifications</p>
          </div>
          {unread > 0 && (
            <button onClick={markAllRead}
              className="flex items-center gap-2 text-sm text-green-700 hover:bg-green-50 px-4 py-2 rounded-lg transition font-medium">
              <CheckCheck size={16} /> Mark all read
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20">
            <Bell size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map(n => (
              <div key={n._id}
                className={`border-l-4 rounded-xl p-4 flex items-start justify-between gap-4 transition ${typeColor(n.type)} ${!n.isRead ? 'shadow-sm' : 'opacity-60'}`}>
                <div className="flex items-start gap-3">
                  <span className="text-xl">{typeIcon(n.type)}</span>
                  <div>
                    <p className="text-gray-800 text-sm font-medium">{n.message}</p>
                    <p className="text-gray-500 text-xs mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                {!n.isRead && (
                  <button onClick={() => markRead(n._id)}
                    className="shrink-0 text-xs text-blue-600 hover:underline">
                    Mark read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}