import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import { useParams, useNavigate } from 'react-router-dom'
import API from '../../utils/api'
import Navbar from '../../components/Navbar'
import toast from 'react-hot-toast'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Custom colored markers
const createIcon = (color) => new L.Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

const greenIcon = createIcon('green')
const redIcon = createIcon('red')
const blueIcon = createIcon('blue')

// Auto center map on driver location
function RecenterMap({ position }) {
  const map = useMap()
  useEffect(() => {
    if (position) map.setView(position, 15)
  }, [position])
  return null
}

export default function DriverMap() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [request, setRequest] = useState(null)
  const [driverPos, setDriverPos] = useState(null)
  const [pickupCoords, setPickupCoords] = useState(null)
  const [ngoCoords, setNgoCoords] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tracking, setTracking] = useState(false)
  const [status, setStatus] = useState('')
  const watchRef = useRef(null)

  // Geocode address to coordinates using Nominatim (free)
  const geocode = async (address) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      )
      const data = await res.json()
      if (data.length > 0) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)]
      }
    } catch {
      return null
    }
    return null
  }

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const { data } = await API.get('/pickup/driver')
        const req = data.find(r => r._id === id)
        if (!req) {
          toast.error('Request not found')
          navigate('/driver')
          return
        }
        setRequest(req)
        setStatus(req.status)

        // Geocode pickup address
        if (req.listing?.pickupAddress) {
          const coords = await geocode(req.listing.pickupAddress + ', Pakistan')
          if (coords) setPickupCoords(coords)
        }

        // Geocode NGO address
        if (req.ngo?.address) {
          const coords = await geocode(req.ngo.address + ', Pakistan')
          if (coords) setNgoCoords(coords)
        }

      } catch {
        toast.error('Failed to load request')
      }
      setLoading(false)
    }
    fetchRequest()
  }, [id])

  // Start live GPS tracking
  const startTracking = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported on this device')
      return
    }
    setTracking(true)
    toast.success('Live tracking started!')
    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setDriverPos([pos.coords.latitude, pos.coords.longitude])
      },
      (err) => {
        toast.error('Could not get location: ' + err.message)
        setTracking(false)
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    )
  }

  const stopTracking = () => {
    if (watchRef.current) {
      navigator.geolocation.clearWatch(watchRef.current)
      watchRef.current = null
    }
    setTracking(false)
    toast('Tracking stopped')
  }

  useEffect(() => {
    return () => {
      if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current)
    }
  }, [])

  const markCollected = async () => {
    try {
      await API.put(`/pickup/${id}`, { status: 'collected' })
      setStatus('collected')
      toast.success('Marked as collected! Now head to NGO.')
    } catch {
      toast.error('Failed to update')
    }
  }

  const markDelivered = async () => {
    try {
      await API.put(`/pickup/${id}`, { status: 'delivered' })
      setStatus('delivered')
      stopTracking()
      toast.success('Delivery completed!')
    } catch {
      toast.error('Failed to update')
    }
  }

  // Build route line: driver → pickup → NGO
  const routePoints = []
  if (driverPos) routePoints.push(driverPos)
  if (status === 'accepted' && pickupCoords) routePoints.push(pickupCoords)
  if (status === 'collected' && ngoCoords) routePoints.push(ngoCoords)
  if (status === 'accepted' && pickupCoords && ngoCoords) routePoints.push(ngoCoords)

  const defaultCenter = driverPos || pickupCoords || ngoCoords || [34.7717, 72.3600]

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="text-center py-20 text-gray-400">Loading map...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">🗺️ Live Delivery Map</h1>
            <p className="text-gray-500 text-sm mt-1">
              {request?.listing?.foodName} → {request?.ngo?.name}
            </p>
          </div>
          <button onClick={() => navigate('/driver')}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition">
            ← Back to Dashboard
          </button>
        </div>

        {/* Status Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Status:</span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold
              ${status === 'accepted' ? 'bg-yellow-100 text-yellow-700' :
                status === 'collected' ? 'bg-blue-100 text-blue-700' :
                status === 'delivered' ? 'bg-green-100 text-green-700' :
                'bg-gray-100 text-gray-700'}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>

          {driverPos && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Live: {driverPos[0].toFixed(4)}, {driverPos[1].toFixed(4)}
            </div>
          )}

          <div className="flex gap-2 ml-auto flex-wrap">
            {!tracking ? (
              <button onClick={startTracking}
                className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                📍 Start Live Tracking
              </button>
            ) : (
              <button onClick={stopTracking}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                ⏹ Stop Tracking
              </button>
            )}
            {status === 'accepted' && (
              <button onClick={markCollected}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                ✅ Mark Collected
              </button>
            )}
            {status === 'collected' && (
              <button onClick={markDelivered}
                className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                🎉 Mark Delivered
              </button>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="bg-white rounded-xl shadow-sm p-3 mb-4 flex flex-wrap gap-4 text-xs text-gray-600">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span> Your Location
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span> Pickup Point (Donor)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span> Delivery Point (NGO)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-6 h-1 bg-blue-500 inline-block rounded"></span> Your Route
          </span>
        </div>

        {/* Map */}
        <div className="rounded-2xl overflow-hidden shadow-lg" style={{ height: '500px' }}>
          <MapContainer
            center={defaultCenter}
            zoom={13}
            style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {driverPos && <RecenterMap position={driverPos} />}

            {/* Driver marker */}
            {driverPos && (
              <Marker position={driverPos} icon={blueIcon}>
                <Popup>
                  <div className="text-sm">
                    <p className="font-semibold">📍 Your Location</p>
                    <p className="text-gray-500">Live GPS position</p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Pickup marker */}
            {pickupCoords && (
              <Marker position={pickupCoords} icon={greenIcon}>
                <Popup>
                  <div className="text-sm">
                    <p className="font-semibold">🍱 Pickup Point</p>
                    <p className="text-gray-600">{request?.listing?.foodName}</p>
                    <p className="text-gray-500">{request?.listing?.pickupAddress}</p>
                    <p className="text-gray-500">Qty: {request?.listing?.quantity} {request?.listing?.unit}</p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* NGO delivery marker */}
            {ngoCoords && (
              <Marker position={ngoCoords} icon={redIcon}>
                <Popup>
                  <div className="text-sm">
                    <p className="font-semibold">🏢 Delivery Point</p>
                    <p className="text-gray-600">{request?.ngo?.name}</p>
                    <p className="text-gray-500">{request?.ngo?.address}</p>
                    <p className="text-gray-500">📞 {request?.ngo?.phone}</p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Route line */}
            {routePoints.length >= 2 && (
              <Polyline
                positions={routePoints}
                color="#3B82F6"
                weight={4}
                opacity={0.8}
                dashArray="8 4"
              />
            )}
          </MapContainer>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-xs font-semibold text-green-700 uppercase mb-2">🍱 Pickup From</p>
            <p className="font-medium text-gray-800">{request?.listing?.foodName}</p>
            <p className="text-sm text-gray-500 mt-1">{request?.listing?.pickupAddress}</p>
            <p className="text-sm text-gray-500">
              {request?.listing?.quantity} {request?.listing?.unit} — {request?.listing?.category}
            </p>
            <p className="text-sm text-gray-500">
              Expires: {new Date(request?.listing?.expiryDate).toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-xs font-semibold text-red-600 uppercase mb-2">🏢 Deliver To</p>
            <p className="font-medium text-gray-800">{request?.ngo?.name}</p>
            <p className="text-sm text-gray-500 mt-1">{request?.ngo?.address}</p>
            <p className="text-sm text-gray-500">📞 {request?.ngo?.phone}</p>
            <p className="text-sm text-gray-500">✉️ {request?.ngo?.email}</p>
          </div>
        </div>

      </div>
    </div>
  )
}