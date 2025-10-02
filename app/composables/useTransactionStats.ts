import { ref } from 'vue'
import type { Period, Range } from '~/types'

type DataRecord = {
  date: Date
  amount: number
  [key: string]: Date | string | number
}

const data = ref<DataRecord[]>([])

export function useTransactionStats(
  period: Ref<Period>,
  range: Ref<Range>,
  dateField: Ref<'record_date' | 'due_date'>
) {
  const fetchData = async () => {
    const { data: response } = await useFetch<{ data: DataRecord[] }>(
      '/api/transactions/stats',
      {
        query: {
          period: period.value,
          start_date: range.value.start
            ? range.value.start.toISOString()
            : null,
          end_date: range.value.end ? range.value.end.toISOString() : null,
          date_field: dateField.value
        }
      }
    )

    data.value = response.value?.data || []
  }

  watchEffect(() => {
    if (period.value && range.value?.start && range.value?.end) {
      fetchData()
    }
  })

  return {
    data
  }
}
