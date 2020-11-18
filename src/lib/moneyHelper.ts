import { formatMoney, formatNumber } from "accounting"

interface MoneyField {
  amount: number
  currencyCode: string
}

export const moneyFieldToUnit = (moneyField: MoneyField) => {
  // this currently only supports currencies with cents
  // and multiply the major value to 100 to get cent value
  return moneyField.amount * 100
}

// Min and Max are expected to be in major units.
export const displayMoneyRange = ({
  min,
  max,
  symbol,
}: {
  min?: number
  max?: number
  symbol: string
}) => {
  if (!min && !max) return ""

  const rangeMin = formatMoney(min, symbol, 0)

  if (min && max) {
    const rangeMax = formatNumber(max)
    return `${rangeMin} - ${rangeMax}`
  } else if (min && !max) {
    return `${rangeMin} and up`
  } else if (!min && max) {
    const rangeMax = formatMoney(max, symbol, 0)
    return `Under ${rangeMax}`
  }

  return ""
}
