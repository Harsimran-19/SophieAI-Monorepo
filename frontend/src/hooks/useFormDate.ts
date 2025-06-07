import { useState } from "react"

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

const years = Array.from(
  { length: 30 },
  (_, i) => new Date().getFullYear() - i
).reverse()

interface DateFields {
  start_date?: string
  end_date?: string
}

export const useFormDate = <T extends DateFields>(
  item: T,
  onUpdate: (updated: T) => void
) => {
  const [isCurrentRole, setIsCurrentRole] = useState(
    item.end_date === "Present"
  )

  const handleDateChange = (
    type: "start" | "end",
    field: "month" | "year",
    value: string
  ) => {
    const dateField = `${type}_date` as keyof T
    const currentDate = item[dateField] || ""
    const [currentMonth = "", currentYear = ""] =
      typeof currentDate === "string" ? currentDate.split(" ") : ["", ""]

    let newDate = ""
    if (field === "month") {
      newDate = `${value} ${currentYear}`.trim()
    } else {
      newDate = `${currentMonth} ${value}`.trim()
    }

    onUpdate({
      ...item,
      [dateField]: newDate,
    })
  }

  const handleCurrentRoleChange = (checked: boolean) => {
    setIsCurrentRole(checked)
    onUpdate({
      ...item,
      end_date: checked ? "Present" : "",
    })
  }

  const getDateParts = (date: string | undefined) => {
    if (!date || date === "Present") return ["", ""]
    return date.split(" ") || ["", ""]
  }

  return {
    months,
    years,
    isCurrentRole,
    handleDateChange,
    handleCurrentRoleChange,
    getDateParts,
  }
}
