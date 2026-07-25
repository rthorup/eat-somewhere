// Calls Claude API to extract named restaurant/place names from episode descriptions.
// Reads Map_data.csv, writes scripts/extracted-places.json.
// Run once before csv-to-seed.mjs: node scripts/extract-places.mjs

import { writeFileSync } from 'fs'

const MAP_DATA_URL = 'https://raw.githubusercontent.com/underthecurve/bourdain-travel-places/master/Map_data.csv'
const MODEL        = 'claude-haiku-4-5-20251001'

const SHOW_MAP = { 'No Reservations': 'no_reservations' }

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEY is not set.')
  console.error('Get your key at console.anthropic.com → API Keys, then run:')
  console.error('  ANTHROPIC_API_KEY=sk-ant-... node scripts/extract-places.mjs')
  process.exit(1)
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

async function extractPlaces(description, city) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: `From this Anthony Bourdain episode description set in ${city}, extract all specifically named restaurants, bars, cafes, food stalls, markets, and eating/drinking establishments. Return ONLY a valid JSON array of name strings. Only include places with proper names. Exclude vague references like "a dive bar" or "a local restaurant". If no specifically named establishments appear, return [].

Description: ${description}`,
      }],
    }),
  })

  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`)
  const data = await res.json()
  const text = (data.content?.[0]?.text ?? '').trim()

  // Parse JSON from the response (sometimes wrapped in markdown)
  const match = text.match(/\[[\s\S]*?\]/)
  if (!match) return []
  try {
    const parsed = JSON.parse(match[0])
    return Array.isArray(parsed) ? parsed.filter(s => typeof s === 'string' && s.length > 1) : []
  } catch {
    return []
  }
}

const res  = await fetch(MAP_DATA_URL)
const rows = parseCSV(await res.text())

// Only process rows with actual descriptions in shows we track
const toProcess = rows.filter(r => {
  const show = SHOW_MAP[r.Show]
  const desc = (r.Description ?? '').trim()
  return show && desc && parseInt(r.Season) > 0
})

console.log(`Processing ${toProcess.length} descriptions…\n`)

const output = {}  // key: "show|season|city_lower" → [place names]
let hits = 0, empty = 0

// Process in small batches to avoid rate limits
const BATCH = 5
for (let i = 0; i < toProcess.length; i += BATCH) {
  const batch = toProcess.slice(i, i + BATCH)
  const results = await Promise.all(batch.map(r => extractPlaces(r.Description, r.City)))

  for (let j = 0; j < batch.length; j++) {
    const r     = batch[j]
    const show  = SHOW_MAP[r.Show]
    const season = parseInt(r.Season)
    const city  = (r.City ?? '').trim().toLowerCase()
    const places = results[j]
    const key   = `${show}|${season}|${city}`

    if (places.length > 0) {
      // Merge if key already exists (same city appeared in multiple Map_data rows)
      output[key] = [...new Set([...(output[key] ?? []), ...places])]
      hits++
      console.log(`  ✓ ${r.City} S${season} → ${places.join(', ')}`)
    } else {
      empty++
      process.stdout.write(`  - ${r.City} S${season}\n`)
    }
  }

  // Brief pause between batches
  if (i + BATCH < toProcess.length) await new Promise(r => setTimeout(r, 400))
}

console.log(`\n${hits} with places, ${empty} empty`)
console.log(`${Object.keys(output).length} unique city+season keys`)

writeFileSync('./scripts/extracted-places.json', JSON.stringify(output, null, 2))
console.log('Wrote scripts/extracted-places.json')
