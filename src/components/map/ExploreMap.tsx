import { useCallback, useMemo, useState } from 'react'
import Map, { Source, Layer, type MapMouseEvent, type MapGeoJSONFeature, type LayerProps } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useAppStore } from '@/store'
import { useBourdainLocations } from '@/hooks/useBourdainLocations'
import LocationSidebar from './LocationSidebar'
import MapFilters from './MapFilters'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string

const circleLayer: LayerProps = {
  id: 'locations',
  type: 'circle',
  paint: {
    'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 4, 6, 7, 10, 10],
    'circle-color': [
      'match', ['get', 'show'],
      'no_reservations', '#c8651a',
      'parts_unknown',   '#e8a96b',
      'the_layover',     '#4a2c0a',
      '#c8651a',
    ],
    'circle-stroke-color': '#fdf6ee',
    'circle-stroke-width': 1,
    'circle-opacity': 0.85,
  },
}


export default function ExploreMap() {
  const { data: locations = [], isLoading } = useBourdainLocations()
  const { selectedLocationId, setSelectedLocation } = useAppStore()
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [viewState, setViewState] = useState({
    longitude: 15,
    latitude: 25,
    zoom: 1.8,
  })

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: locations.map((loc) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [loc.lng, loc.lat] },
      properties: {
        id: loc.id,
        location_name: loc.location_name,
        city: loc.city,
        country: loc.country,
        show: loc.show,
        episode_title: loc.episode_title,
        season: loc.season,
        episode: loc.episode,
        description: loc.description,
      },
    })),
  }), [locations])

  const hoverLayer: LayerProps = useMemo(() => ({
    id: 'locations-hover',
    type: 'circle',
    filter: ['==', ['get', 'id'], hoveredId ?? ''],
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 6, 6, 9, 10, 13],
      'circle-color': '#ffffff',
      'circle-opacity': 0.3,
    },
  }), [hoveredId])

  const onClick = useCallback((e: MapMouseEvent) => {
    const feature = e.features?.[0] as MapGeoJSONFeature | undefined
    if (feature?.properties?.id) {
      setSelectedLocation(feature.properties.id as string)
    } else {
      setSelectedLocation(null)
    }
  }, [setSelectedLocation])

  const onMouseMove = useCallback((e: MapMouseEvent) => {
    const feature = e.features?.[0] as MapGeoJSONFeature | undefined
    setHoveredId(feature?.properties?.id as string ?? null)
  }, [])

  const onMouseLeave = useCallback(() => setHoveredId(null), [])

  const selectedLocation = locations.find((l) => l.id === selectedLocationId) ?? null

  return (
    <div className="relative w-full h-full">
      <Map
        {...viewState}
        onMove={(e) => setViewState(e.viewState)}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        style={{ width: '100%', height: '100%' }}
        interactiveLayerIds={['locations']}
        onClick={onClick}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        cursor={hoveredId ? 'pointer' : 'grab'}
      >
        <Source id="locations" type="geojson" data={geojson}>
          <Layer {...circleLayer} />
          <Layer {...hoverLayer} />
        </Source>
      </Map>

      <MapFilters />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-brand-300 text-sm bg-brand-950/80 px-4 py-2 rounded-full">
            Loading locations…
          </span>
        </div>
      )}

      <LocationSidebar location={selectedLocation} onClose={() => setSelectedLocation(null)} />
    </div>
  )
}
