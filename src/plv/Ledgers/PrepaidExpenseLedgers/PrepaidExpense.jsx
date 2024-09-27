import React, { useEffect, useState } from "react";
import Header from "../../../layouts/Header";
import { useDispatch, useSelector } from "react-redux";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import { CopyAllOutlined } from "@mui/icons-material";
import {
  fetchPrepaidExpenseData,
  deletePrepaidExpenseData,
} from "../../../store/plv2/prepaidExpenses";
import { fetchPrepaidExpenseTransactionData } from "../../../store/plv2/prepaidExpenseTransactions";
import Toolbar from "./components/toolbar";
import CRUDPrepaidExpense from "./components/createPrepaidExpense";
import PrepaidExpenseLedgerView from "./components/transactions";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useRouter } from "next/router";

export default function PrepaidExpenseLedger() {
  const monthOptions = Array.from({ length: 12 }, (_, index) => index + 1);

  const [rows, setRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortColumn, setSortColumn] = useState("purchase_date");
  const [sort, setSort] = useState("desc");
  const [pageSize, setPageSize] = useState(10);

  const [searchValue, setSearchValue] = useState("");
  const [coaOptions, setCoaOptions] = useState([]);
  const [coaFilterOptions, setCoaFilterOptions] = useState([]);
  const [monthsCoveredFilterOptions, setMonthsCoveredFilterOptions] = useState(
    []
  );

  const [openForm, setOpenForm] = useState(false);
  const [openFormMode, setOpenFormMode] = useState(null);
  const [openLedgerView, setOpenLedgerView] = useState(false);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [selectedRecord, setselectedRecord] = useState();
  const [ledgerviewLoading, setLedgerviewLoading] = useState(false);

  const initialDialogState = {
    open: false,
    id: 0,
    title: "",
    coa: 0,
    purchase_amount: 0,
    purchase_date: new Date(),
    months_covered: 1,
    monthly_expense: 0,
    memo: "",
    sort: sort,
    search: searchValue,
    column: sortColumn,
    page: currentPage,
  };

  const [newRecord, setNewRecord] = useState(initialDialogState);
    const router = useRouter();

  const prepaidExpenseStore = useSelector((state) => state.prepaidExpenses);

  const prepaidExpensesTransactionsStore = useSelector(
    (state) => state.prepaidExpenseTransaction
  );

  const chartOfAccountsData = useSelector((state) => state.coa);
  const dispatch = useDispatch();

  const fetchData = () => {
    try {
      const response = dispatch(
        fetchPrepaidExpenseData({
          sort: sort,
          search: searchValue,
          column: sortColumn,
          page: currentPage,
          page_size: pageSize,
        })
      );
      if (response?.error?.message === 401) {
        //   logout();
      } else {
        console.log(response, "ressssssssssssssss");
      }
    } finally {
    }
  };
  useEffect(() => {
    fetchData();
  }, [dispatch, sort, sortColumn, pageSize, currentPage, router.query.slug]);

  useEffect(() => {
    const coaOptionsList = [];
    const coaFilterOptionsList = [];
    chartOfAccountsData.data &&
      chartOfAccountsData.data.map((coaCategory) => {
        coaCategory.coas.map((coa) => {
          coaOptionsList.push({ id: coa.id, name: coa.name });
          coaFilterOptionsList.push({ value: coa.id, label: coa.name });
        });
      });
    setCoaOptions(coaOptionsList);
    setCoaFilterOptions(coaFilterOptionsList);

    const monthsCoveredFilterOptionsList = [];
    monthOptions.map((month) => {
      monthsCoveredFilterOptionsList.push({
        value: month,
        label: month > 1 ? `${month} Months` : `${month} Month`,
      });
    });
    setMonthsCoveredFilterOptions(monthsCoveredFilterOptionsList);
  }, [chartOfAccountsData]);

  useEffect(() => {
    if (prepaidExpenseStore.data) {
      setRows(prepaidExpenseStore.data);
      setTotal(prepaidExpenseStore.recordsTotal);
    }
  }, [prepaidExpenseStore]);

  useEffect(() => {}, [newRecord]);

  const columns = [
    {
      field: "id",
      headerName: "ID",
      width: 100,
      hide: true,
    },
    {
      field: "title",
      headerName: "Title",
      width: 175,
      disableColumnMenu: true,
      sortable: true, // Enable sorting
      renderCell: (params) => (
        <span title={params.value}>{params.value}</span> // Tooltip for truncated text
      ),
    },
    {
      field: "coa",
      headerName: "Expense Type",
      width: 200,
      sortable: true,
      filterable: true, // Enable filtering
      renderCell: (params) => {
        return getCoaName(params.value);
      },
      type: "singleSelect",
      valueOptions: coaFilterOptions,
    },
    {
      field: "purchase_amount",
      headerName: "Purchase Amount",
      width: 180,
      align: "right", // Right-align for numbers
      sortable: true,
      valueFormatter: (params) =>
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        }).format(params.value),
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
      field: "purchase_date",
      headerName: "Purchase Date",
      width: 150,
      sortable: true,
      type: "date",
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
      field: "months_covered",
      headerName: "Months Covered",
      width: 150,
      align: "right",
      sortable: true,
      type: "singleSelect",
      valueOptions: monthsCoveredFilterOptions,
      valueFormatter: (params) =>
        `${params.value} ${params.value === 1 ? "Month" : "Months"}`,
      renderCell: (params) => (
        <span title={params.value}>
          {`${params.value} ${params.value === 1 ? "Month" : "Months"}`}
        </span>
      ),
    },
    {
      field: "monthly_expense",
      headerName: "Monthly Expense",
      width: 180,
      align: "right",
      sortable: true,
      valueFormatter: (params) =>
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        }).format(params.value),
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
      field: "memo",
      headerName: "Memo",
      width: 150,
      sortable: false, // If you don't want this column to be sortable
      renderCell: (params) => <span title={params.value}>{params.value}</span>,
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 100,
      renderCell: (params) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          key={"edit_" + params.id}
          label="Edit"
          className="textPrimary"
          onClick={() => {
            const selectedRow = rows.find((row) => row.id === params.id);
            if (selectedRow) setNewRecord(selectedRow);
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
              setNewRecord({
                ...selectedRow,
                id: 0, // Reset the ID to 0 for cloning
              });
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
          onClick={() => handleDeleteRecord(params.row)}
          color="inherit"
        />,
      ],
    },
  ];

  function getCoaName(id) {
    const result = coaOptions.find((item) => item.id === id);
    return result ? result.name : null;
  }

  const handleSearch = (q) => {
    setCurrentPage(0);
    dispatch(
      fetchPrepaidExpenseData({
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
        fetchPrepaidExpenseData({
          sort: newModel[0].sort,
          search: searchValue,
          column: newModel[0].field,
          page_size: pageSize,
        })
      );
    } else {
      setSort("asc");
      setSortColumn("purchase_date");
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
        deletePrepaidExpenseData({
          id: selectedRecord.id,
          sort: sort,
          search: searchValue,
          column: sortColumn,
          page: currentPage,
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
            <h4 className="main-title mb-0">Prepaid Expense Ledger</h4>
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
            dispatch(fetchPrepaidExpenseTransactionData())
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

        <DataGrid
          pagination
          rows={rows}
          columns={columns}
          disableColumnMenu
          pageSize={pageSize}
          rowCount={total}
          sortingMode="server"
          paginationMode="server"
          pageSizeOptions={[10, 25, 50]}
          onSortModelChange={handleSortModel}
          loading={prepaidExpenseStore.isLoading}
          onPaginationModelChange={(paginationModel) => {
            const { page, pageSize } = paginationModel;
            setCurrentPage(page + 1);
            setPageSize(pageSize);
          }}
          autoPageSize
        />

        {/* Create / Edit / Clone form component */}
        <CRUDPrepaidExpense
          show={openForm}
          mode={openFormMode}
          search={searchValue}
          column={sortColumn}
          sort={sort}
          pageSize={pageSize}
          expenseData={newRecord}
          coaOptions={coaOptions}
          handleOnCancel={(event) => {
            event.preventDefault();
            setOpenForm(false);
          }}
          handleOnClose={(event) => {
            event.preventDefault();
            setOpenForm(false);
          }}
          handleOnSave={(event) => {
            event.preventDefault();
            setOpenForm(false);
          }}
        />

        {/* Delete Dialog */}
        <Dialog
          open={deleteConfirmationOpen}
          onClose={handleCloseDeleteConfirmation}
        >
          <DialogTitle>Confirmation</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this expense?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteConfirmation}>Cancel</Button>
            <Button onClick={handleDeleteConfirmation} color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Ledger View component*/}
        <PrepaidExpenseLedgerView
          show={openLedgerView}
          ledgerData={prepaidExpensesTransactionsStore.data}
          handleOnCancel={(event) => {
            event.preventDefault();
            setOpenLedgerView(false);
          }}
          handleOnClose={(event) => {
            event.preventDefault();
            setOpenLedgerView(false);
          }}
        />
      </div>
    </React.Fragment>
  );
}
