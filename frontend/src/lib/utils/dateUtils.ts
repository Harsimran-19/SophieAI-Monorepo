export const parseAndFormatDate = (dateStr: string): string | null => {
  if (!dateStr) return null

  // Handle "Month, Year" format (e.g., "Dec, 2024")
  const monthYearMatch = dateStr.match(/([A-Za-z]+),\s*(\d{4})/)
  if (monthYearMatch) {
    const [_, month, year] = monthYearMatch
    const date = new Date(`${month} 1, ${year}`)
    return date.toISOString().split("T")[0] || null // Returns YYYY-MM-DD
  }

  // Handle "YYYY-MM" format
  const yearMonthMatch = dateStr.match(/^(\d{4})-(\d{2})$/)
  if (yearMonthMatch) {
    const [_, year, month] = yearMonthMatch
    return `${year}-${month}-01`
  }

  // Handle full date format
  const date = new Date(dateStr)
  if (!isNaN(date.getTime())) {
    return date.toISOString().split("T")[0] || null
  }

  return null
}
