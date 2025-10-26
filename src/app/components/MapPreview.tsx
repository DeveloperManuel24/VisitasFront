'use client'

import { useMemo } from 'react'
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api'

type MapPreviewProps = {
  lat: number | null | undefined
  lng: number | null | undefined
  label?: string
}

export function MapPreview({ lat, lng, label }: MapPreviewProps) {
  // Si no hay coords válidas, mostramos fallback bonito
  const hasCoords =
    typeof lat === 'number' &&
    !Number.isNaN(lat) &&
    typeof lng === 'number' &&
    !Number.isNaN(lng)

  const center = useMemo(() => {
    if (hasCoords) {
      return { lat: lat as number, lng: lng as number }
    }
    // centro neutro (Guatemala por ejemplo o algún default)
    return { lat: 14.6349, lng: -90.5069 }
  }, [hasCoords, lat, lng])

  // Cargamos script de Google Maps JS usando la API key pública para front
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'gmaps-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
  })

  if (!isLoaded) {
    return (
      <div className="flex h-64 w-full items-center justify-center rounded-lg bg-gray-100 text-xs/5 text-gray-500 ring-1 ring-black/10">
        Cargando mapa…
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="flex h-64 w-full items-center justify-center rounded-lg bg-red-50 text-xs/5 text-red-600 ring-1 ring-red-200">
        Error cargando mapa
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg ring-1 ring-black/10 shadow-sm">
      <GoogleMap
        center={center}
        zoom={hasCoords ? 16 : 6}
        mapContainerClassName="h-64 w-full"
        options={{
          disableDefaultUI: false,
          gestureHandling: 'greedy',
        }}
      >
        {hasCoords && (
          <Marker
            position={{ lat: lat as number, lng: lng as number }}
            label={label ?? undefined}
          />
        )}
      </GoogleMap>

      {/* footer con link Waze / Google Maps */}
      {hasCoords ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-black/5 bg-white px-3 py-2 text-[11px]/5 text-gray-600">
          <span>
            Destino:{' '}
            <b className="text-gray-900">
              {label ?? 'Ubicación del cliente'}
            </b>
          </span>

          <div className="flex gap-2">
            <a
              className="rounded-md bg-blue-600 px-2 py-1 font-medium text-white text-[11px]/5 shadow-sm ring-1 ring-blue-500/20 hover:bg-blue-700 hover:ring-blue-600/30"
              target="_blank"
              rel="noopener noreferrer"
              href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
            >
              Google Maps
            </a>

            <a
              className="rounded-md bg-indigo-600 px-2 py-1 font-medium text-white text-[11px]/5 shadow-sm ring-1 ring-indigo-500/20 hover:bg-indigo-700 hover:ring-indigo-600/30"
              target="_blank"
              rel="noopener noreferrer"
              href={`https://waze.com/ul?ll=${lat},${lng}&navigate=yes`}
            >
              Waze
            </a>
          </div>
        </div>
      ) : (
        <div className="border-t border-black/5 bg-white px-3 py-2 text-[11px]/5 text-gray-600">
          Sin coordenadas del cliente.
        </div>
      )}
    </div>
  )
}
