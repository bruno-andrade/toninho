export function formatPrice(price: string | number): string {
  return Number(price).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })
}

export function formatKm(km: number): string {
  return `${km.toLocaleString("pt-BR")} km`
}

const BODY_TYPE_LABEL: Record<string, string> = {
  hatch: "Hatch",
  sedan: "Sedã",
  suv: "SUV",
  pickup: "Picape",
  wagon: "Perua",
}

const TRANSMISSION_LABEL: Record<string, string> = {
  manual: "Manual",
  automatic: "Automático",
}

const FUEL_LABEL: Record<string, string> = {
  flex: "Flex",
  gasolina: "Gasolina",
  diesel: "Diesel",
  eletrico: "Elétrico",
  hibrido: "Híbrido",
}

const ORIGIN_LABEL: Record<string, string> = {
  particular: "Particular",
  leilao: "Leilão",
}

const INSPECTION_CATEGORY_LABEL: Record<string, string> = {
  motor_cambio: "Motor e câmbio",
  estrutura_lataria: "Estrutura/lataria",
  pintura: "Pintura",
  pneus_rodas: "Pneus e rodas",
  eletrica: "Itens elétricos",
  documentacao: "Documentação",
}

const INSPECTION_STATUS_LABEL: Record<string, string> = {
  aprovado: "Aprovado",
  reparo_leve: "Reparo leve",
  atencao: "Atenção",
}

export function bodyTypeLabel(value: string) {
  return BODY_TYPE_LABEL[value] ?? value
}
export function transmissionLabel(value: string) {
  return TRANSMISSION_LABEL[value] ?? value
}
export function fuelLabel(value: string) {
  return FUEL_LABEL[value] ?? value
}
export function originLabel(value: string) {
  return ORIGIN_LABEL[value] ?? value
}
export function inspectionCategoryLabel(value: string) {
  return INSPECTION_CATEGORY_LABEL[value] ?? value
}
export function inspectionStatusLabel(value: string) {
  return INSPECTION_STATUS_LABEL[value] ?? value
}
