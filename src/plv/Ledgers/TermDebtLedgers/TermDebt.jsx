import * as React from "react";
import { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";

import { fetchCoaList } from "../../../store/plv2/coa";

import {
  fetchTermDebtData,
  deleteTermDebtData,
} from "../../../store/plv2/termDebts";

import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import { CopyAllOutlined } from "@mui/icons-material";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { fetchTermDebtTransactionData } from "../../../store/plv2/termDebtTransactions";
import { fetchtermDebtTransactionDataTotal } from "../../../store/plv2/termDebtTransactionsTotal";
// import { useAuth } from "src/hooks/useAuth";
import Header from "../../../layouts/Header";
import Toolbar from "./components/toolbar";
import CRUDTermDebt from "./components/createTermDebt";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import TermDebtLedgerView from "./components/transactions";
import { useRouter } from "next/router";

export default function TermDebtGrid() {
  const monthOptions = Array.from({ length: 12 }, (_, index) => index + 1);

  const [rows, setRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortColumn, setSortColumn] = useState("id");
  const [sort, setSort] = useState("desc");
  const [pageSize, setPageSize] = useState(10);
  const [ledgerviewLoading, setLedgerviewLoading] = useState(false);

  const [searchValue, setSearchValue] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [openFormMode, setOpenFormMode] = useState(null);
  const [openLedgerView, setOpenLedgerView] = useState(false);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [selectedRecord, setselectedRecord] = useState();
  const router = useRouter();

  const initialDialogState = {
    open: false,
    id: 0,
    desciption: "",
    term_debt_ledger_type: 0,
    principal_amount: 0,
    start_date: new Date(),
    terms_in_months: 1,
    interest_rate: 0,
    monthly_payment: 0,
    memo: "",
    sort: sort,
    search: searchValue,
    column: sortColumn,
    page: currentPage,
  };

  const paymentType = [
    { label: "Blended Payment", value: 1 },
    { label: "Linear Payment", value: 2 },
  ];

  const [newRecord, setNewRecord] = useState(initialDialogState);

  const termDebtStore = useSelector((state) => state.termDebts);

  const termDebtsTransactionsStore = useSelector(
    (state) => state.termDebtTransaction
  );

  const termDebtTransactionTotalStore = useSelector(
    (state) => state.termDebtTransactionTotal
  );

  const chartOfAccountsData = useSelector((state) => state.coa);
  const dispatch = useDispatch();
  // const { logout } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch chart of accounts list
        dispatch(fetchCoaList("tll"));

        // Fetch term debt data with pagination and sorting
        const response = await dispatch(
          fetchTermDebtData({
            sort,
            search: searchValue,
            column: sortColumn,
            page: currentPage,
            page_size: pageSize,
          })
        ).unwrap(); // Unwraps the asyncThunk result

        if (response?.error?.message === 401) {
        }
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };
    fetchData();
  }, [dispatch, sort, sortColumn, currentPage, pageSize, router.query.slug]);

  useEffect(() => {
    if (termDebtStore.data) {
      setRows(termDebtStore.data);
      setTotal(termDebtStore.recordsTotal);
    }
  }, [termDebtStore]);

  useEffect(() => {
    const coaOptionsList = [];
    const coaFilterOptionsList = [];
    chartOfAccountsData.data?.results &&
      chartOfAccountsData.data?.results.map((coaCategory) => {
        coaCategory.coas.map((coa) => {
          coaOptionsList.push({ id: coa.id, name: coa.name });
          coaFilterOptionsList.push({ value: coa.id, label: coa.name });
        });
      });
    const monthsCoveredFilterOptionsList = [];
    monthOptions.map((month) => {
      monthsCoveredFilterOptionsList.push({
        value: month,
        label: month > 1 ? `${month} Months` : `${month} Month`,
      });
    });
  }, [chartOfAccountsData]);

  const columns = [
    { field: "id", headerName: "ID", width: 100, hide: true },
    { field: "desciption", headerName: "Description", width: 175 },
    {
      field: "term_debt_ledger_type",
      headerName: "Type",
      width: 150,
      renderCell: (params) => {
        return getPaymentTypeName(params.value);
      },
      type: "singleSelect",
      valueOptions: paymentType,
    },

    {
      field: "principal_amount",
      headerName: "Principle Amount",
      width: 180,
      align: "right",
      valueFormatter: (params) => {
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        }).format(params.value);
      },
      renderCell: (params) => (
        <span title={params.value}>
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0,
          }).format(params.value)}
        </span>
      ),
    },

    {
      field: "start_date",
      headerName: "Start Date",
      width: 150,
      type: "date",
      align: "center",
      valueFormatter: (params) =>
        new Date(params.value).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
        }),
      renderCell: (params) => (
        <span
          title={new Date(params.value).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
          })}
        >
          {new Date(params.value).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
          })}
        </span>
      ),
    },

    {
      field: "terms_in_months",
      headerName: "Term (In Months)",
      width: 150,
      align: "center",
      valueFormatter: (params) =>
        `${params.value} ${params.value === 1 ? "Month" : "Months"}`,
      renderCell: (params) => (
        <span>{`${params.value} ${
          params.value === 1 ? "Month" : "Months"
        }`}</span>
      ),
    },
    {
      field: "interest_rate",
      headerName: "Interest Rate",
      width: 150,
      align: "right",
      valueFormatter: (params) => `${params.value}%`,
      renderCell: (params) => <span>{params.value}%</span>,
    },
    {
      field: "monthly_linear_payment",
      headerName: "Monthly Linear Principal Payment",
      width: 280,
      align: "right",
      renderCell: (params) => {
        const value =
          params.row.term_debt_ledger_type === 2
            ? Math.floor(
                params.row.principal_amount / params.row.terms_in_months
              )
            : 0;
        return value === 0
          ? "-"
          : new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              maximumFractionDigits: 0,
            }).format(value);
      },
    },

    {
      field: "monthly_blended_payment",
      headerName: "Monthly Blended Payment",
      width: 220,
      align: "right",
      renderCell: (params) => {
        const value =
          params.row.term_debt_ledger_type === 1
            ? Math.floor(params.row.monthly_payment)
            : 0;
        return value === 0
          ? "-"
          : new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              maximumFractionDigits: 0,
            }).format(value);
      },
    },

    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 100,
      cellClassName: "actions",
      renderCell: (params) => {
        return [
          <GridActionsCellItem
            icon={<EditIcon />}
            key={"edit_" + params.id}
            label="Edit"
            className="textPrimary"
            onClick={() => {
              const selectedRow = rows.find((row) => row.id === params.id);

              if (selectedRow) {
                setNewRecord(selectedRow);
              }
              setOpenFormMode("Edit");
              setOpenForm(true);
            }}
            color="inherit"
          />,
          <GridActionsCellItem
            icon={<CopyAllOutlined />}
            label="Clone"
            key={"clone_" + params.id}
            onClick={() => {
              const selectedRow = rows.find((row) => row.id === params.id);

              if (selectedRow) {
                setNewRecord(selectedRow);
                setNewRecord((prevState) => ({
                  ...prevState,
                  ["id"]: 0,
                }));
              }
              setOpenFormMode("Clone");
              setOpenForm(true);
            }}
            color="inherit"
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            key={"delete_" + params.id}
            onClick={() => {
              handleDeleteRecord(params.row);
            }}
            color="inherit"
          />,
        ];
      },
    },
  ];

  function getPaymentTypeName(id) {
    const result = paymentType.find((item) => item.value === id);
    return result ? result.label : null;
  }

  const handleSearch = (q) => {
    setCurrentPage(1);
    dispatch(
      fetchTermDebtData({
        sort: sort,
        search: q,
        column: sortColumn,
        page_size: pageSize,
        page: currentPage,
      })
    );
  };

  const handleSortModel = (newModel) => {
    if (newModel.length) {
      setSort(newModel[0].sort);
      setSortColumn(newModel[0].field);
      dispatch(
        fetchTermDebtData({
          sort: newModel[0].sort,
          search: searchValue,
          column: newModel[0].field,
        })
      );
    } else {
      setSort("desc");
      setSortColumn("id");
    }
  };

  const handleDeleteRecord = (record) => {
    setselectedRecord(record);
    setDeleteConfirmationOpen(true);
  };

  const handleDeleteConfirmation = () => {
    // Dispatch the delete action
    if (selectedRecord) {
      dispatch(
        deleteTermDebtData({
          id: selectedRecord.id,
          sort: sort,
          search: searchValue,
          column: sortColumn,
          page: currentPage,
          page_size: pageSize,
        })
      );
      setDeleteConfirmationOpen(false);
    }
  };

  const handleCloseDeleteConfirmation = () => {
    setDeleteConfirmationOpen(false);
  };

  return (
    <React.Fragment>
      <div className="main main-app p-3 p-lg-4">
        <div className="d-md-flex align-items-center justify-content-between mb-4">
          <div>
            <h4 className="main-title mb-0">Term Debt Ledger</h4>
          </div>
        </div>

        <Toolbar
          searchQuery={searchValue}
          onSearchChange={(e) => handleSearch(e.target.value)}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch(e.target.value);
            }
          }}
          clearSearch={() => {
            setSearchValue("");
            handleSearch("");
          }}
          onCreateNew={() => {
            setNewRecord(initialDialogState);
            setOpenFormMode("Create");
            setOpenForm(true);
          }}
          onShowLedgerView={(event) => {
            event.preventDefault();
            setLedgerviewLoading(true);

            dispatch(fetchTermDebtTransactionData())
              .then(() => {
                return dispatch(fetchtermDebtTransactionDataTotal());
              })
              .then(() => {
                setLedgerviewLoading(false);
                setOpenLedgerView(true);
              })
              .catch((error) => {
                setLedgerviewLoading(false);
                console.error("Error fetching data:", error);
              });
          }}
          ledgerviewLoading={ledgerviewLoading}
        />

        <div style={{ height: 800, width: "100%" }}>
          <DataGrid
            autoHeight
            pagination
            rows={rows}
            columns={columns}
            disableColumnMenu={true}
            pageSize={pageSize}
            rowCount={total}
            sortingMode="server"
            paginationMode="server"
            rowsPerPageOptions={[10, 25, 50]}
            onSortModelChange={handleSortModel}
            loading={termDebtStore.isLoading}
            onPageChange={(newPage) => {
              setCurrentPage(newPage + 1);
            }}
            onPageSizeChange={(newPageSize) => {
              setPageSize(newPageSize);
            }}
          />
        </div>

        <CRUDTermDebt
          show={openForm}
          mode={openFormMode}
          search={searchValue}
          column={sortColumn}
          sort={sort}
          pageSize={pageSize}
          termDebtData={newRecord}
          paymentType={paymentType}
          handleOnCancel={(e) => {
            e.preventDefault();
            setOpenForm(false);
          }}
          handleOnClose={(e) => {
            e.preventDefault();
            setOpenForm(false);
          }}
          handleOnSave={(e) => {
            e.preventDefault();
            setOpenForm(false);
          }}
        />

        <Dialog
          open={deleteConfirmationOpen}
          onClose={handleCloseDeleteConfirmation}
        >
          <DialogTitle>Confirmation</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this term debt?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteConfirmation}>Cancel</Button>
            <Button onClick={handleDeleteConfirmation} color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
        <TermDebtLedgerView
          show={openLedgerView}
          ledgerData={termDebtsTransactionsStore.data}
          ledgerDataTotals={termDebtTransactionTotalStore.data}
          handleOnCancel={(e) => {
            setOpenLedgerView(false);
          }}
          handleOnClose={(e) => {
            setOpenLedgerView(false);
          }}
        />
      </div>
    </React.Fragment>
  );
}
