import { writeFileSync, readFileSync, existsSync } from 'fs'

const PHILAZAR_URL = 'https://raw.githubusercontent.com/philazar/bourdain_data/master/data/bourdain_episodes_clean.csv'
const MAP_DATA_URL = 'https://raw.githubusercontent.com/underthecurve/bourdain-travel-places/master/Map_data.csv'

const SHOW_MAP = {
  'No Reservations': 'no_reservations',
  'Parts Unknown':   'parts_unknown',
  'The Layover':     'the_layover',
}
const MAP_SHOW_MAP = { 'No Reservations': 'no_reservations' }

function escape(str) {
  if (!str || str === 'NA' || str === '') return 'NULL'
  return `'${str.replace(/'/g, "''")}'`
}

function parseCSV(text) {
  const lines = text.trim().split('\n')
  const headers = lines[0].split(',')
  return lines.slice(1).map(line => {
    const fields = []
    let cur = '', inQ = false
    for (const ch of line) {
      if (ch === '"') { inQ = !inQ; continue }
      if (ch === ',' && !inQ) { fields.push(cur); cur = ''; continue }
      cur += ch
    }
    fields.push(cur)
    return Object.fromEntries(headers.map((h, i) => [h.trim(), (fields[i] ?? '').trim()]))
  })
}

function parseDate(str) {
  if (!str || str === 'NA') return null
  const mdy = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (mdy) return `${mdy[3]}-${mdy[1].padStart(2, '0')}-${mdy[2].padStart(2, '0')}`
  return str.match(/^(\d{4}-\d{2}-\d{2})/)?.[1] ?? null
}

// Fetch both remote CSVs
const [philazarRes, mapDataRes] = await Promise.all([fetch(PHILAZAR_URL), fetch(MAP_DATA_URL)])
const philazarRows = parseCSV(await philazarRes.text())
const mapDataRows  = parseCSV(await mapDataRes.text())

// Load extracted places if available
const extractedPath = './scripts/extracted-places.json'
const extracted = existsSync(extractedPath)
  ? JSON.parse(readFileSync(extractedPath, 'utf8'))
  : {}
const extractedCount = Object.values(extracted).flat().length
console.log(`  ${Object.keys(extracted).length} extraction keys (${extractedCount} named places)`)

// Map_data lookup: "show|season|city_lower" → {description, air_date}
const descLookup = new Map()
for (const r of mapDataRows) {
  const show = MAP_SHOW_MAP[r.Show]
  if (!show) continue
  const season = parseInt(r.Season)
  if (isNaN(season)) continue
  const city = (r.City ?? '').trim().toLowerCase()
  if (!city) continue
  descLookup.set(`${show}|${season}|${city}`, {
    description: (r.Description ?? '').trim() || null,
    air_date:    parseDate(r['Air Date'] || r.Airdate),
  })
}

const rows = []
let restaurantRows = 0, cityRows = 0

for (const r of philazarRows) {
  const show    = SHOW_MAP[r.show]
  const lat     = parseFloat(r.lat)
  const lng     = parseFloat(r.long)
  if (!show || isNaN(lat) || isNaN(lng)) continue

  const season  = parseInt(r.season) || null
  const episode = parseInt(r.ep)     || null
  const title   = escape(r.title)
  const rawName = (r.city_or_area && r.city_or_area !== 'NA') ? r.city_or_area : r.title
  const country = escape(r.country_clean || r.country)
  const cityName = rawName.split(',')[0].trim()

  // Description + air_date from Map_data
  const descKey = `${show}|${season}|${rawName.toLowerCase()}`
  const meta    = descLookup.get(descKey) ?? {}
  const description = escape(meta.description ?? '')
  const air_date    = meta.air_date ? `'${meta.air_date}'` : 'NULL'

  // Check for extracted restaurant names for this city+season
  const extractKey = `${show}|${season}|${cityName.toLowerCase()}`
  const places = extracted[extractKey] ?? []

  if (places.length > 0) {
    // One row per named restaurant — keeps the episode context
    for (const place of places) {
      rows.push(
        `  (${escape(show)}, ${season ?? 'NULL'}, ${episode ?? 'NULL'}, ${title}, ` +
        `${escape(place)}, ${escape(cityName)}, ${country}, ${lat}, ${lng}, ${description}, ${air_date})`
      )
      restaurantRows++
    }
  } else {
    // City-level fallback
    rows.push(
      `  (${escape(show)}, ${season ?? 'NULL'}, ${episode ?? 'NULL'}, ${title}, ` +
      `${escape(rawName)}, ${escape(cityName)}, ${country}, ${lat}, ${lng}, ${description}, ${air_date})`
    )
    cityRows++
  }
}

const sql = `-- Auto-generated (${rows.length} rows: ${restaurantRows} restaurant-level, ${cityRows} city-level)
-- Sources: philazar/bourdain_data + underthecurve/bourdain-travel-places + Claude extraction
-- Run in Supabase SQL Editor after migration

truncate bourdain_locations restart identity cascade;

insert into bourdain_locations
  (show, season, episode, episode_title, location_name, city, country, lat, lng, description, air_date)
values
${rows.join(',\n')};
`

writeFileSync('./supabase/seed.sql', sql)
console.log(`✓ Wrote ${rows.length} rows to supabase/seed.sql`)
console.log(`  ${restaurantRows} restaurant-level, ${cityRows} city-level fallbacks`)
