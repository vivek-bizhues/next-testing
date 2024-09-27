// import { Row } from "@silevis/reactgrid";

import { months } from "./helpers";
import {
  nonEditable,
  textCell,
  headerCell,
  numberCell,
  showZero,
  groupFooterNumberCell,
} from "../../../views/components/reactGrid/cells";


export const CASHBOXBANK_ROW_ID = "cashboxBank";
export const CREDITLINE_ROW_ID = "creditLine";
export const CREDITLINEOVERDRAFT_ROW_ID = "creditLineOverdraft";
export const HEADER_ROW_ID = "header";
export const LIQUIDFUNDS_ROW_ID = "liquidFunds";
export const MONTHSTOTAL_ROW_ID = "monthsTotal";
export const CUMULATIVE_ROW_ID = "cumulative";

const ROW_HEIGHT = 32;
const HEADING_ROW_HEIGHT = 40;

function getHeaderRow() {
  return {
    rowId: HEADER_ROW_ID,
    height: ROW_HEIGHT,
    cells: [
      nonEditable(headerCell("Account", "justify-content-center")),
      nonEditable(headerCell("Opening Balance", "justify-content-center")),
    ],
  };
}

export function getCreditLineRows(
  cumulativeTotals,
  yearlyInflowOuflowDiff,
  creditLine
){
  const yearlyOverdraft =
    -yearlyInflowOuflowDiff - (isNaN(creditLine) ? 0 : creditLine);
  return [
    {
      rowId: CREDITLINE_ROW_ID,
      height: ROW_HEIGHT,
      cells: [
        nonEditable(textCell("Credit line", "padding-left-lg")),
        ...months().map((_, idx) =>
          idx === 0
            ? numberCell(creditLine, "light-green-bg")
            : nonEditable(showZero(numberCell(creditLine, "disabled")))
        ),
        nonEditable(showZero(numberCell(creditLine, "font-bold disabled"))),
      ],
    },
    {
      rowId: CREDITLINEOVERDRAFT_ROW_ID,
      height: HEADING_ROW_HEIGHT,
      cells: [
        nonEditable(
          textCell("Credit line overdraft", "align-items-end text-lg font-bold")
        ),
        ...months().map((_, idx) => {
          const overdraft =
            -cumulativeTotals[idx] - (isNaN(creditLine) ? 0 : creditLine);
          return nonEditable(
            numberCell(
              overdraft > 0 ? overdraft : NaN,
              overdraft > 0
                ? "align-items-end disabled text-md text-red font-bold"
                : "disabled"
            )
          );
        }),
        nonEditable(
          numberCell(
            yearlyOverdraft > 0 ? yearlyOverdraft : NaN,
            "align-items-end disabled text-red text-lg font-bold"
          )
        ),
      ],
    },
  ];
}

export function createRows(coas) {
  return [
    getHeaderRow(),
    ...coas.map((coa) =>
      coa.type === "group_header"
        ? {
            rowId: coa.name,
            height: ROW_HEIGHT,
            cells: [
              headerCell(coa.name, "text-lg font-bold"),
              headerCell("", "padding-right-lg text-lg font-bold"),
            ],
          }
        : coa.type === "group_total"
        ? {
            rowId: coa.name,
            height: ROW_HEIGHT,
            cells: [
              headerCell(coa.name, ""),
              groupFooterNumberCell(coa.value, ""),
            ],
          }
        : {
            rowId: coa.id,
            cells: [
              nonEditable(textCell(coa.name, "padding-left-lg pl-2")),
              numberCell(coa.value, ""),
            ],
            height: ROW_HEIGHT,
          }
    ),
  ];
}
