import {
  format,
  differenceInDays,
  differenceInMonths,
  addDays,
  addMonths,
} from "date-fns";

export const getDateRange = (startDate, endDate) => {
  const days = differenceInDays(endDate, startDate);

  return [...Array(days + 1).keys()].map((i) =>
    format(addDays(startDate, i), "MM/dd/yyyy")
  );
};

export const parseDate = (date) => {
  const parts = date.split("-"); // Split the string into parts
  // Note: Months are 0-indexed in JavaScript: 0 for January, 11 for December
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Adjust month to be 0-indexed
  // const day = parseInt(parts[2], 10);
  return new Date(year, month, 1);
};

export const formatDate = (date, dateFormat) => {
  return format(date, dateFormat);
};

export const getDateRangeInMonths = (
  startDate,
  endDate,
  dateFormat
) => {
  const months = differenceInMonths(endDate, startDate);
  if (months >= 0) {
    return [...Array(months + 1).keys()].map((i) => {
      return format(addMonths(startDate, i), dateFormat);
    });
  } else {
    return [];
  }
};

export const convertToUTCDate = (dateString) => {
  return dateString + "T00:00:00.000";
};
