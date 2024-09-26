export const emptyTextCell = { type: "text", text: "" };

const numberFormat = new Intl.NumberFormat("en", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
  style: "currency",
  currency: "USD",
});

export const textCell = (text, className = "", style) => ({
  type: "text",
  text,
  className,
  style,
});

export const dateCell = (date, className = "", style) => ({
  type: "date",
  date,
  format: Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }),
  className,
  style,
});

export const dropdownCell = (
  values,
  selectedValue,
  inputValue,
  isDisabled,
  isOpen,
  className = "",
  style
) => ({
  type: "dropdown",
  selectedValue,
  values,
  isDisabled,
  isOpen,
  inputValue,
  className,
  style,
});

export const numberCell = (value, className = "", style) => ({
  type: "number",
  value,
  className,
  style,
  format: numberFormat,
});

export const nonEditable = (cell) => ({
  ...cell,
  nonEditable: true,
});

export const hideZero = (cell) => ({
  ...cell,
  nanToZero: true,
  hideZero: true,
});

export const showZero = (cell) => ({
  ...cell,
  nanToZero: true,
  hideZero: false,
});

export const bottomLine = (cell) => ({
  ...cell,
  style: {
    ...cell.style,
    border: {
      ...cell.style?.border,
      bottom: {
        width: "1px",
        color: "#A6A6A6",
        style: "solid",
      },
    },
  },
});

export const noSideBorders = (cell) => ({
  ...cell,
  style: {
    ...cell.style,
    border: {
      ...cell.style?.border,
      left: {
        style: "none",
      },
      right: {
        style: "none",
      },
    },
  },
});

export function monthHeaderCell(month, additionalClassNames = "") {
  return nonEditable(
    textCell(month, `text-lg font-bold ${additionalClassNames}`, {
      background: "#9359fd",
      color: "white",
      border: {
        bottom: { style: "none" },
        left: { style: "none" },
        right: { style: "none" },
      },
    })
  );
}

export function groupHeaderCell(title, additionalClassNames = "") {
  return nonEditable(
    textCell(title, `text-lg font-bold ${additionalClassNames}`, {
      background: "#9359fd85",
      color: "black",
      border: {
        bottom: { style: "none" },
        left: { style: "none" },
        right: { style: "none" },
      },
    })
  );
}

export function groupFooterTextCell(title, additionalClassNames = "") {
  return nonEditable(
    textCell(title, `text-md font-bold ${additionalClassNames}`, {
      background: "#9359fd35",
      color: "black",
      border: {
        bottom: { style: "none" },
        left: { style: "none" },
        right: { style: "none" },
      },
    })
  );
}

export function groupFooterNumberCell(value, additionalClassNames = "") {
  return nonEditable(
    numberCell(value, `text-md font-bold ${additionalClassNames}`, {
      background: "#9359fd35",
      color: "black",
      border: {
        bottom: { style: "none" },
        left: { style: "none" },
        right: { style: "none" },
      },
    })
  );
}
