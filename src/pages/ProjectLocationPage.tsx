import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useProjects } from '../hooks/useProjects'
import { useProjectLocations } from '../hooks/useProjectLocations'
import { useProjectFiles } from '../hooks/useProjectFiles'
import { BackButton } from '../components/ui/BackButton'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export function ProjectLocationPage() {
  const { id } = useParams<{ id: string }>()
  const { data: projects } = useProjects()
  const { data: locations, upsertLocation } = useProjectLocations(id)
  const { data: files } = useProjectFiles(id)

  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [address, setAddress] = useState('')
  const [snapshotFileId, setSnapshotFileId] = useState('')

  const mapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const mapContainerRef = useRef<HTMLDivElement | null>(null)

  if (!id) return null

  const project = (projects ?? []).find((p) => p.id === id)
  const location = (locations ?? [])[0]

  useEffect(() => {
    if (location) {
      setLat(location.lat.toString())
      setLng(location.lng.toString())
      setAddress(location.address ?? '')
      setSnapshotFileId(location.snapshotFileId ?? '')
    }
  }, [location])

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    const initialLat = location?.lat ?? 24.7136
    const initialLng = location?.lng ?? 46.6753

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 13,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map)

    const icon = L.divIcon({
      className: 'project-location-pin',
      html: '<div class="pin-inner"></div>',
      iconSize: [24, 24],
      iconAnchor: [12, 24],
    })

    const marker = L.marker([initialLat, initialLng], {
      draggable: true,
      icon,
    }).addTo(map)

    const syncFromLatLng = (lt: number, ln: number) => {
      setLat(lt.toFixed(6))
      setLng(ln.toFixed(6))
    }

    marker.on('dragend', () => {
      const pos = marker.getLatLng()
      syncFromLatLng(pos.lat, pos.lng)
    })

    map.on('click', (e: any) => {
      marker.setLatLng(e.latlng)
      syncFromLatLng(e.latlng.lat, e.latlng.lng)
    })

    mapRef.current = map
    markerRef.current = marker

    return () => {
      map.remove()
      mapRef.current = null
      markerRef.current = null
    }
  }, [location])

  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return
    if (!lat || !lng) return

    const latNum = Number(lat)
    const lngNum = Number(lng)
    if (Number.isNaN(latNum) || Number.isNaN(lngNum)) return

    const latlng: [number, number] = [latNum, lngNum]
    markerRef.current.setLatLng(latlng)
    mapRef.current.setView(latlng)
  }, [lat, lng])

  const imageFiles = (files ?? []).filter((f) => f.mimeType.startsWith('image/'))

  const handleSave = async () => {
    if (!lat || !lng) return
    const latNum = Number(lat)
    const lngNum = Number(lng)
    if (Number.isNaN(latNum) || Number.isNaN(lngNum)) return

    await upsertLocation({
      id: location?.id,
      projectId: id,
      lat: latNum,
      lng: lngNum,
      address: address.trim() || undefined,
      snapshotFileId: snapshotFileId || undefined,
    } as any)
  }

  return (
    <div className="space-y-4 text-right">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-slate-900">موقع المشروع</h2>
          {project && <p className="text-xs text-slate-600">{project.title}</p>}
          <p className="text-[11px] text-slate-500 mt-1">
            يتم حفظ الإحداثيات والعنوان محليًا، ويمكن عرضها على خريطة تفاعلية (تحتاج إلى اتصال إنترنت لتحميل الخريطة)، كما يمكنك
            استخدام صورة من صفحة "الملفات والصور" كصورة للموقع.
          </p>
        </div>
        <BackButton fallbackPath={`/projects/${id}`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-3 text-xs">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-slate-600">خط العرض (Latitude)</label>
            <input
              className="border rounded-md px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              placeholder="مثال: 24.7136"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-slate-600">خط الطول (Longitude)</label>
            <input
              className="border rounded-md px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              placeholder="مثال: 46.6753"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-slate-600">عنوان الموقع (اختياري)</label>
            <textarea
              rows={3}
              className="border rounded-md px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="وصف مختصر لموقع المشروع أو أقرب معلم."
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-slate-600">اختيار صورة تمثيلية للموقع (اختياري)</label>
            <select
              className="border rounded-md px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={snapshotFileId}
              onChange={(e) => setSnapshotFileId(e.target.value)}
            >
              <option value="">بدون صورة</option>
              {imageFiles.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.fileName}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 rounded-md text-xs font-medium bg-primary-600 text-white hover:bg-primary-700"
            >
              حفظ الموقع
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4 text-xs space-y-3">
          <div
            ref={mapContainerRef}
            className="w-full h-64 rounded-lg border border-slate-200 overflow-hidden mb-3"
          ></div>
          <div className="text-sm font-semibold text-slate-900">عرض مبسط للموقع</div>
          {location ? (
            <div className="space-y-2">
              <div className="text-slate-700">
                الإحداثيات: {location.lat}, {location.lng}
              </div>
              {location.address && <div className="text-slate-600">العنوان: {location.address}</div>}
              {location.snapshotFileId && (
                <div className="text-slate-600">
                  الصورة المختارة من الملفات: {
                    imageFiles.find((f) => f.id === location.snapshotFileId)?.fileName ?? '—'
                  }
                </div>
              )}
              <div className="mt-2 p-3 rounded-md bg-slate-50 text-[11px] text-slate-500">
                يمكن استخدام هذه البيانات لاحقًا لفتح موقع المشروع في أي تطبيق خرائط أو لتوثيق موقع المشروع في التقارير.
              </div>
            </div>
          ) : (
            <div className="text-slate-500 text-xs">
              لم يتم حفظ موقع للمشروع بعد. قم بإدخال الإحداثيات والضغط على "حفظ الموقع".
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
