import { getCurrentEntity } from "./entitiyHelpers"; 
import { getDateRangeInMonths } from "../assets/utils/get-daterange";

export function populateTransactionData(transactions) {
  const activeEntity = getCurrentEntity();
  const dateRange = getDateRangeInMonths(
    new Date(activeEntity.start_date),
    new Date(activeEntity.end_date),
    "yyyy-MM-01"
  );
  transactions.forEach((tr) => {
    const index = dateRange.indexOf(tr.date);
    if (index !== -1) {
      dateRange.splice(index, 1);
    }
  });
  dateRange.forEach((_date) =>
    transactions.push({
      id: 0,
      coa: 0,
      value: 0,
      date: _date,
      memo: "",
    })
  );

  return transactions;
}
