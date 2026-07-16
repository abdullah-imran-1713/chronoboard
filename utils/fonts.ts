export interface FontDefinition {
  label: string
  family: string
  googleFamily?: string
  weights?: number[]
}

const DEFAULT_WEIGHTS = [300, 400, 600, 700, 800]

export const CLOCK_FONTS: FontDefinition[] = [
  { label: 'System Default', family: 'system-ui, sans-serif' },
  { label: 'Roboto', family: '\'Roboto\', sans-serif', googleFamily: 'Roboto', weights: DEFAULT_WEIGHTS },
  { label: 'Open Sans', family: '\'Open Sans\', sans-serif', googleFamily: 'Open Sans', weights: DEFAULT_WEIGHTS },
  { label: 'Lato', family: '\'Lato\', sans-serif', googleFamily: 'Lato', weights: DEFAULT_WEIGHTS },
  { label: 'Montserrat', family: '\'Montserrat\', sans-serif', googleFamily: 'Montserrat', weights: DEFAULT_WEIGHTS },
  { label: 'Oswald', family: '\'Oswald\', sans-serif', googleFamily: 'Oswald', weights: DEFAULT_WEIGHTS },
  { label: 'Raleway', family: '\'Raleway\', sans-serif', googleFamily: 'Raleway', weights: DEFAULT_WEIGHTS },
  { label: 'Poppins', family: '\'Poppins\', sans-serif', googleFamily: 'Poppins', weights: DEFAULT_WEIGHTS },
  { label: 'Ubuntu', family: '\'Ubuntu\', sans-serif', googleFamily: 'Ubuntu', weights: DEFAULT_WEIGHTS },
  { label: 'Nunito', family: '\'Nunito\', sans-serif', googleFamily: 'Nunito', weights: DEFAULT_WEIGHTS },
  { label: 'Playfair Display', family: '\'Playfair Display\', serif', googleFamily: 'Playfair Display', weights: DEFAULT_WEIGHTS },
  { label: 'Merriweather', family: '\'Merriweather\', serif', googleFamily: 'Merriweather', weights: DEFAULT_WEIGHTS },
  { label: 'PT Sans', family: '\'PT Sans\', sans-serif', googleFamily: 'PT Sans', weights: DEFAULT_WEIGHTS },
  { label: 'Noto Sans', family: '\'Noto Sans\', sans-serif', googleFamily: 'Noto Sans', weights: DEFAULT_WEIGHTS },
  { label: 'Source Sans Pro', family: '\'Source Sans 3\', sans-serif', googleFamily: 'Source Sans 3', weights: DEFAULT_WEIGHTS },
  { label: 'Cabin', family: '\'Cabin\', sans-serif', googleFamily: 'Cabin', weights: DEFAULT_WEIGHTS },
  { label: 'Josefin Sans', family: '\'Josefin Sans\', sans-serif', googleFamily: 'Josefin Sans', weights: DEFAULT_WEIGHTS },
  { label: 'Quicksand', family: '\'Quicksand\', sans-serif', googleFamily: 'Quicksand', weights: DEFAULT_WEIGHTS },
  { label: 'Mulish', family: '\'Mulish\', sans-serif', googleFamily: 'Mulish', weights: DEFAULT_WEIGHTS },
  { label: 'Barlow', family: '\'Barlow\', sans-serif', googleFamily: 'Barlow', weights: DEFAULT_WEIGHTS },
  { label: 'Exo 2', family: '\'Exo 2\', sans-serif', googleFamily: 'Exo 2', weights: DEFAULT_WEIGHTS },
  { label: 'Rajdhani', family: '\'Rajdhani\', sans-serif', googleFamily: 'Rajdhani', weights: DEFAULT_WEIGHTS },
  { label: 'Oxanium', family: '\'Oxanium\', sans-serif', googleFamily: 'Oxanium', weights: DEFAULT_WEIGHTS },
  { label: 'Audiowide', family: '\'Audiowide\', sans-serif', googleFamily: 'Audiowide' },
  { label: 'Orbitron', family: '\'Orbitron\', sans-serif', googleFamily: 'Orbitron', weights: DEFAULT_WEIGHTS },
  { label: 'Bebas Neue', family: '\'Bebas Neue\', sans-serif', googleFamily: 'Bebas Neue' },
  { label: 'Righteous', family: '\'Righteous\', sans-serif', googleFamily: 'Righteous' },
  { label: 'Russo One', family: '\'Russo One\', sans-serif', googleFamily: 'Russo One' },
  { label: 'Teko', family: '\'Teko\', sans-serif', googleFamily: 'Teko', weights: DEFAULT_WEIGHTS },
  { label: 'Saira', family: '\'Saira\', sans-serif', googleFamily: 'Saira', weights: DEFAULT_WEIGHTS },
  { label: 'Yanone Kaffeesatz', family: '\'Yanone Kaffeesatz\', sans-serif', googleFamily: 'Yanone Kaffeesatz', weights: DEFAULT_WEIGHTS },
  { label: 'Comfortaa', family: '\'Comfortaa\', sans-serif', googleFamily: 'Comfortaa', weights: DEFAULT_WEIGHTS },
  { label: 'Fredoka', family: '\'Fredoka\', sans-serif', googleFamily: 'Fredoka', weights: DEFAULT_WEIGHTS },
  { label: 'Pacifico', family: '\'Pacifico\', cursive', googleFamily: 'Pacifico' },
  { label: 'Lobster', family: '\'Lobster\', cursive', googleFamily: 'Lobster' },
  { label: 'Abril Fatface', family: '\'Abril Fatface\', serif', googleFamily: 'Abril Fatface' },
  { label: 'Black Han Sans', family: '\'Black Han Sans\', sans-serif', googleFamily: 'Black Han Sans' },
  { label: 'Staatliches', family: '\'Staatliches\', sans-serif', googleFamily: 'Staatliches' },
  { label: 'Big Shoulders Display', family: '\'Big Shoulders Display\', sans-serif', googleFamily: 'Big Shoulders Display', weights: DEFAULT_WEIGHTS },
  { label: 'Bai Jamjuree', family: '\'Bai Jamjuree\', sans-serif', googleFamily: 'Bai Jamjuree', weights: DEFAULT_WEIGHTS },
  { label: 'Changa', family: '\'Changa\', sans-serif', googleFamily: 'Changa', weights: DEFAULT_WEIGHTS },
  { label: 'Bowlby One', family: '\'Bowlby One\', sans-serif', googleFamily: 'Bowlby One' },
  { label: 'Space Grotesk', family: '\'Space Grotesk\', sans-serif', googleFamily: 'Space Grotesk', weights: DEFAULT_WEIGHTS },
  { label: 'DM Sans', family: '\'DM Sans\', sans-serif', googleFamily: 'DM Sans', weights: DEFAULT_WEIGHTS },
  { label: 'Plus Jakarta Sans', family: '\'Plus Jakarta Sans\', sans-serif', googleFamily: 'Plus Jakarta Sans', weights: DEFAULT_WEIGHTS },
  { label: 'Outfit', family: '\'Outfit\', sans-serif', googleFamily: 'Outfit', weights: DEFAULT_WEIGHTS },
  { label: 'Figtree', family: '\'Figtree\', sans-serif', googleFamily: 'Figtree', weights: DEFAULT_WEIGHTS },
  { label: 'Inter', family: '\'Inter\', sans-serif', googleFamily: 'Inter', weights: DEFAULT_WEIGHTS },
  { label: 'Syne', family: '\'Syne\', sans-serif', googleFamily: 'Syne', weights: DEFAULT_WEIGHTS },
  { label: 'Lexend', family: '\'Lexend\', sans-serif', googleFamily: 'Lexend', weights: DEFAULT_WEIGHTS },
  { label: 'Readex Pro', family: '\'Readex Pro\', sans-serif', googleFamily: 'Readex Pro', weights: DEFAULT_WEIGHTS },
  { label: 'Albert Sans', family: '\'Albert Sans\', sans-serif', googleFamily: 'Albert Sans', weights: DEFAULT_WEIGHTS },
  { label: 'JetBrains Mono', family: '\'JetBrains Mono\', monospace', googleFamily: 'JetBrains Mono', weights: DEFAULT_WEIGHTS },
  { label: 'Fira Code', family: '\'Fira Code\', monospace', googleFamily: 'Fira Code', weights: DEFAULT_WEIGHTS },
  { label: 'IBM Plex Mono', family: '\'IBM Plex Mono\', monospace', googleFamily: 'IBM Plex Mono', weights: DEFAULT_WEIGHTS },
  { label: 'Space Mono', family: '\'Space Mono\', monospace', googleFamily: 'Space Mono', weights: DEFAULT_WEIGHTS },
  { label: 'Roboto Mono', family: '\'Roboto Mono\', monospace', googleFamily: 'Roboto Mono', weights: DEFAULT_WEIGHTS },
  { label: 'Source Code Pro', family: '\'Source Code Pro\', monospace', googleFamily: 'Source Code Pro', weights: DEFAULT_WEIGHTS },
  { label: 'Ubuntu Mono', family: '\'Ubuntu Mono\', monospace', googleFamily: 'Ubuntu Mono', weights: DEFAULT_WEIGHTS },
  { label: 'Courier Prime', family: '\'Courier Prime\', monospace', googleFamily: 'Courier Prime', weights: DEFAULT_WEIGHTS },
  { label: 'Inconsolata', family: '\'Inconsolata\', monospace', googleFamily: 'Inconsolata', weights: DEFAULT_WEIGHTS },
  { label: 'Anonymous Pro', family: '\'Anonymous Pro\', monospace', googleFamily: 'Anonymous Pro', weights: DEFAULT_WEIGHTS },
  { label: 'Overpass Mono', family: '\'Overpass Mono\', monospace', googleFamily: 'Overpass Mono', weights: DEFAULT_WEIGHTS },
  { label: 'Share Tech Mono', family: '\'Share Tech Mono\', monospace', googleFamily: 'Share Tech Mono' },
]

export function filterFonts(query: string): FontDefinition[] {
  const q = query.trim().toLowerCase()
  if (!q) return CLOCK_FONTS

  const exact: FontDefinition[] = []
  const starts: FontDefinition[] = []
  const includes: FontDefinition[] = []

  for (const font of CLOCK_FONTS) {
    const label = font.label.toLowerCase()
    if (label === q) {
      exact.push(font)
    } else if (label.startsWith(q)) {
      starts.push(font)
    } else if (label.includes(q)) {
      includes.push(font)
    }
  }

  return [...exact, ...starts, ...includes]
}

export function getFontLabel(family: string): string {
  return CLOCK_FONTS.find(f => f.family === family)?.label ?? family
}

export function pickRandomFontFamily(excludeFamily?: string): string {
  const pool = excludeFamily
    ? CLOCK_FONTS.filter(f => f.family !== excludeFamily)
    : CLOCK_FONTS
  const list = pool.length > 0 ? pool : CLOCK_FONTS
  const index = Math.floor(Math.random() * list.length)
  return list[index]!.family
}

function encodeGoogleFamily(name: string): string {
  return name.replace(/ /g, '+')
}

export function getFontByFamily(family: string): FontDefinition | undefined {
  return CLOCK_FONTS.find(f => f.family === family)
}

export function buildGoogleFontUrl(font: FontDefinition): string | null {
  if (!font.googleFamily) return null

  const name = encodeGoogleFamily(font.googleFamily)
  if (font.weights?.length) {
    return `https://fonts.googleapis.com/css2?family=${name}:wght@${font.weights.join(';')}&display=swap`
  }
  return `https://fonts.googleapis.com/css2?family=${name}&display=swap`
}

const loadedGoogleFamilies = new Set<string>()
let preconnectAdded = false

function ensureGoogleFontsPreconnect() {
  if (!import.meta.client || preconnectAdded) return
  preconnectAdded = true

  for (const [href, crossOrigin] of [
    ['https://fonts.googleapis.com', false],
    ['https://fonts.gstatic.com', true],
  ] as const) {
    const link = document.createElement('link')
    link.rel = 'preconnect'
    link.href = href
    if (crossOrigin) link.crossOrigin = ''
    document.head.appendChild(link)
  }
}

export function loadGoogleFontForFamily(family: string) {
  if (!import.meta.client) return

  const font = getFontByFamily(family)
  if (!font?.googleFamily || loadedGoogleFamilies.has(font.googleFamily)) return

  const url = buildGoogleFontUrl(font)
  if (!url) return

  ensureGoogleFontsPreconnect()

  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = url
  document.head.appendChild(link)
  loadedGoogleFamilies.add(font.googleFamily)
}

export function buildGoogleFontsUrls(chunkSize = 20): string[] {
  const googleFonts = CLOCK_FONTS.filter(f => f.googleFamily)
  const chunks: FontDefinition[][] = []

  for (let i = 0; i < googleFonts.length; i += chunkSize) {
    chunks.push(googleFonts.slice(i, i + chunkSize))
  }

  return chunks.map((chunk) => {
    const params = chunk.map((font) => {
      const name = encodeGoogleFamily(font.googleFamily!)
      if (font.weights?.length) {
        return `family=${name}:wght@${font.weights.join(';')}`
      }
      return `family=${name}`
    }).join('&')

    return `https://fonts.googleapis.com/css2?${params}&display=swap`
  })
}
