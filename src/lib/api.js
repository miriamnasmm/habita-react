// External API integrations (with API key).
// Keys are read from Vite environment variables (.env file). If missing, a
// free keyless fallback is used ONLY so the demo does not break.
const GEOAPIFY_KEY = import.meta.env.VITE_GEOAPIFY_KEY
const UNSPLASH_KEY = import.meta.env.VITE_UNSPLASH_KEY

export const hasGeoKey = !!GEOAPIFY_KEY
export const hasPhotoKey = !!UNSPLASH_KEY

// Geocoding: exact address → coordinates (Geoapify Autocomplete, free with key).
export async function geocode(q) {
  q = (q || '').trim()
  if (q.length < 4) return []
  try {
    if (GEOAPIFY_KEY) {
      const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(q)}&filter=countrycode:pe&bias=proximity:-77.04,-12.06&limit=6&lang=es&format=json&apiKey=${GEOAPIFY_KEY}`
      const r = await fetch(url)
      const d = await r.json()
      return (d.results || []).map((f) => ({ name: f.formatted || f.address_line1, lat: f.lat, lng: f.lon }))
    }
    // keyless fallback (Nominatim) for the demo
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=6&accept-language=es&countrycodes=pe&q=${encodeURIComponent(q + ', Lima, Perú')}`
    const r = await fetch(url, { headers: { Accept: 'application/json' } })
    const d = await r.json()
    return (d || []).map((x) => ({ name: x.display_name.split(',').slice(0, 3).join(', '), lat: +x.lat, lng: +x.lon }))
  } catch (_) { return [] }
}

// Zone photo via Wikipedia (Wikimedia API, FREE and without an API key).
// Searches for the district article on Spanish Wikipedia and uses its lead image.
export async function zonePhoto(name) {
  if (!name) return null
  try {
    const url = `https://es.wikipedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrsearch=${encodeURIComponent(name + ' Lima')}&gsrlimit=1&prop=pageimages&piprop=thumbnail&pithumbsize=640`
    const r = await fetch(url)
    const d = await r.json()
    const pages = d.query && d.query.pages
    if (!pages) return null
    const p = Object.values(pages)[0]
    if (p && p.thumbnail && p.thumbnail.source) return { url: p.thumbnail.source, alt: p.title, credit: 'Wikipedia' }
    return null
  } catch (_) { return null }
}
