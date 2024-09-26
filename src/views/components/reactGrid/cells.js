const emptyTextCell = { type: "text", text: "" };

const currencyFormat = new Intl.NumberFormat("en", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
  style: "currency",
  currency: "USD",
});

const numberFormat = new Intl.NumberFormat("en", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
  style: "decimal",
});

const percentFormat = new Intl.NumberFormat("en", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
  style: "percent",
});

const textCell = (text, className = "", style) => ({
  type: "text",
  text,
  className,
  style,
});

const headerCell = (text, className = "", colspan, rowspan, style) => ({
  type: "header",
  text,
  className,
  style,
  colspan,
  rowspan,
});

const headerChevronCell = (
  text,
  isExpanded,
  hasChildren,
  parentId,
  indent,
  className
) => ({
  type: "chevron",
  text,
  isExpanded,
  hasChildren,
  parentId,
  indent,
  className,
});

const numberCell = (value, className = "", style) => ({
  type: "number",
  value,
  className,
  style,
  format: numberFormat,
});

const percentCell = (value, className = "", style) => ({
  type: "number",
  value,
  className,
  style,
  format: percentFormat,
  validator: (val) => {
    return val >= 0 && val <= 100;
  },
});

const nonEditable = (cell) => ({
  ...cell,
  nonEditable: true,
});

const hideZero = (cell) => ({
  ...cell,
  hideZero: true,
});

const showZero = (cell) => ({
  ...cell,
  nanToZero: true,
  hideZero: false,
});

const bottomLine = (cell) => ({
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

const rightBorder = (cell) => ({
  ...cell,
  style: {
    ...cell.style,
    border: {
      ...cell.style?.border,
      right: {
        width: "5px",
        color: "rgb(232, 232, 232)",
        style: "solid",
      },
    },
  },
});

const noSideBorders = (cell) => ({
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

export const noBorders = (cell) => ({
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
      top: {
        style: "none",
      },
      bottom: {
        style: "none",
      },
    },
  },
});

function monthHeaderCell(month, additionalClassNames = "") {
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

function groupHeaderCell(title, additionalClassNames = "") {
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

function groupFooterTextCell(title, additionalClassNames = "") {
  return nonEditable(
    textCell(title, `text-md font-bold ${additionalClassNames}`, {
      background: "#8080801a",
      color: "black",
      border: {
        bottom: { style: "none" },
        left: { style: "none" },
        right: { style: "none" },
      },
    })
  );
}

function groupFooterNumberCell(value, additionalClassNames = "") {
  return nonEditable(
    numberCell(value, `text-md font-bold ${additionalClassNames}`, {
      background: "#8080801a",
      color: "black",
      border: {
        bottom: { style: "none" },
        left: { style: "none" },
        right: { style: "none" },
      },
    })
  );
}

export {
  emptyTextCell,
  currencyFormat,
  numberFormat,
  percentFormat,
  textCell,
  headerCell,
  headerChevronCell,
  numberCell,
  percentCell,
  nonEditable,
  hideZero,
  showZero,
  bottomLine,
  rightBorder,
  noSideBorders,
  monthHeaderCell,
  groupHeaderCell,
  groupFooterTextCell,
  groupFooterNumberCell,
};
