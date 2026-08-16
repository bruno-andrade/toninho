const DIACRITICS_RE = new RegExp("[\\u0300-\\u036f]", "g")

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(DIACRITICS_RE, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function buildCarSlug(brand: string, model: string, yearModel: number): string {
  const base = slugify(`${brand}-${model}-${yearModel}`)
  const suffix = crypto.randomUUID().slice(0, 8)
  return `${base}-${suffix}`
}
