import { upperFirst } from 'scule'

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function randomFrom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]!
}

export function toSelectOptions<T extends { id: string; name: string }>(
  items: T[] | null | undefined = []
) {
  return (
    items?.map((item) => ({
      label: upperFirst(item.name),
      value: item.id
    })) ?? []
  )
}

export function formatDateUTC(dateString: string): string {
  const date = new Date(dateString)
  return `${String(date.getUTCDate()).padStart(2, '0')}/${String(
    date.getUTCMonth() + 1
  ).padStart(2, '0')}/${date.getUTCFullYear()}`
}
