import { ref } from 'vue'
import type { Period, Range } from '~/types'
import type { Category } from '~/types/api'

type DataRecord = {
  date: Date
  amount: number
  [key: string]: Date | string | number
}

const data = ref<DataRecord[]>([])

export function useTransactionSummary(
  period: Ref<Period>,
  range: Ref<Range>,
  dateField: Ref<'record_date' | 'due_date'>
) {
  const fetchData = async () => {
    const { data: response } = await useFetch<{ data: DataRecord[] }>(
      '/api/transactions/summary',
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

export function getCategoryColor(
  categoryName: string,
  categories: Category[]
): string {
  const category = categories.find((cat) => cat.name === categoryName)
  return category?.color ?? '#CBD5E1'
}

export function getCategorySuggestedPercentage(
  categoryName: string,
  categories: Category[]
): number | null {
  const category = categories.find((cat) => cat.name === categoryName)
  return category?.suggested_percentage ?? null
}

export function processCategories(
  data: {
    date: string
    income: number
    expense: number
    categories: {
      category: string
      expense: number
      expense_transactions: number
    }[]
  }[],
  categories: Category[]
) {
  const categoryMap = new Map<
    string,
    { expense: number; expense_transactions: number }
  >()
  let income = 0
  let expense = 0

  for (const item of data) {
    income += item.income
    expense += item.expense

    for (const cat of item.categories) {
      const current = categoryMap.get(cat.category) || {
        expense: 0,
        expense_transactions: 0
      }
      categoryMap.set(cat.category, {
        expense: current.expense + cat.expense,
        expense_transactions:
          current.expense_transactions + cat.expense_transactions
      })
    }
  }

  const result = []
  let totalExpense = 0
  let totalTransactions = 0

  for (const [category, values] of categoryMap.entries()) {
    const incomeImpact = income > 0 ? (values.expense / income) * 100 : 0
    const spendingShare = expense > 0 ? (values.expense / expense) * 100 : 0
    const suggestedPercentage =
      getCategorySuggestedPercentage(category, categories) || 0

    const suggestedExpense = (income * suggestedPercentage) / 100
    const remainingOrMissing = suggestedExpense - values.expense

    // Acumula para o total
    totalExpense += values.expense
    totalTransactions += values.expense_transactions

    result.push({
      category,
      expense: values.expense,
      expense_transactions: values.expense_transactions,
      spendingShare,
      incomeImpact,
      suggestedExpense,
      remainingOrMissing
    })
  }

  // Adiciona a categoria "Total" no final
  const totalIncomeImpact = income > 0 ? (totalExpense / income) * 100 : 0
  const totalSpendingShare = expense > 0 ? (totalExpense / expense) * 100 : 0

  result.push({
    category: 'Total',
    expense: totalExpense,
    expense_transactions: totalTransactions,
    spendingShare: totalSpendingShare,
    incomeImpact: totalIncomeImpact,
    suggestedExpense: 0,
    remainingOrMissing: 0 - totalExpense
  })

  return result.sort((a, b) => {
    // Mantém "Total" sempre no final
    if (a.category === 'Total') return 1
    if (b.category === 'Total') return -1
    return b.spendingShare - a.spendingShare
  })
}
