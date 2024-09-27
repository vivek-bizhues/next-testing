import * as React from "react";
import { useEffect, useState, ChangeEvent, MouseEvent } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  fetchFixedAssetStraightLinePoolData,
  deleteFixedAssetStraightLinePoolData,
} from "../../../store/plv2/fixedAssetStraightLinePool";

import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import EditIcon from "@mui/icons-material/Edit";
import PoolDetailViewIcon from "@mui/icons-material/ViewComfyOutlined";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import { CopyAllOutlined } from "@mui/icons-material";
import { GridActionsCellItem } from "@mui/x-data-grid";
// import FixedAssetStraightLineBalancePoolsTotalLedgerView from "./components/transactionsTotal";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import Header from "../../../layouts/Header";
import CRUDStraightLineFixedAssets from "./components/createStraightFixedAsset";
import { formatDate, parseDate } from "../../../utils/get-daterange";
import Toolbar from "./components/toolbar";
import FixedAssetStraightLinePoolsLedgerView from "./components/transactions";
import FixedAssetStraightLineBalancePoolsTotalLedgerView from "./components/transactionsTotal";
// import FixedAssetStraightLineBalancePoolsTotalLedgerView from "./components/transactionsTotal";
// import FixedAssetStraightLinePoolsLedgerView from "./components/transactions";

export default function StraightLineFixedAssets() {
  const monthOptions = Array.from({ length: 12 }, (_, index) => index + 1);
  const [rows, setRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortColumn, setSortColumn] = useState("id");
  const [sort, setSort] = useState("desc");
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);

  const [searchValue, setSearchValue] = useState("");
  const [openLedgerTotalView, setOpenLedgerTotalView] = useState(false);

  const [openForm, setOpenForm] = useState(false);
  const [openFormMode, setOpenFormMode] = useState(null);
  const [openLedgerView, setOpenLedgerView] = useState(false);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [selectedRecord, setselectedRecord] = useState();
  const [selectedPoolId, setSelectedPoolId] = useState(0);
  const [selectedPoolName, setselectedPoolName] = useState("");
  const [ledgerviewLoading, setLedgerviewLoading] = useState(false);

  const [poolStartDate, setPoolStartDate] = useState(new Date());
  const initialDialogState = {
    open: false,
    id: 0,
    name: "",
    purchase_amount: 0,
    purchase_date: "",
    economic_userful_life: 0,
    declining_balance_rate: 0,
    straight_line_amount: 0,
    declining_amount: 0,
    depreciation_type: 1, // Straight Line by default
    disposal_amount: 0,
    disposal_date: "",
    memo: "",
    sort: sort,
    search: searchValue,
    column: sortColumn,
    page: currentPage,
  };

  const columns = [
    { field: "id", headerName: "ID", hide: true },
    { field: "name", headerName: "Pool Desciption", flex: 1 },

    {
      field: "start_date",
      headerName: "Start Date",
      width: "150",
      // type: "date",
      renderCell: (params) => formatDate(parseDate(params.value), "MMM, yyyy"),
    },

    {
      field: "ob_remaining_cost",
      headerName: "ob remaining cost",
      headerAlign: "right",
      align: "right",
      flex: 1,
      renderCell: (params) =>
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        }).format(params.value),
    },

    {
      field: "months_pool",
      headerName: "months pool",
      headerAlign: "right",
      align: "right",
      flex: 1,
      renderCell: (params) =>
        `${params.value} ${params.value === 1 ? "Month" : "Months"}`,
    },
    {
      field: "ob_remaining_periods",
      headerName: "ob remaining periods",
      headerAlign: "right",
      align: "right",
      flex: 1,
      renderCell: (params) =>
        `${params.value} ${params.value === 1 ? "Month" : "Months"}`,
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      headerAlign: "center",
      cellClassName: "actions",
      flex: 1,
      renderCell: (params) => {
        return [
          <GridActionsCellItem
            icon={<PoolDetailViewIcon />}
            key={"show_pool__" + params.id}
            label="Show Pool Ledger"
            className="textPrimary"
            onClick={() => {
              const selectedRow = rows.find((row) => row.id === params.id);

              if (selectedRow) {
                setSelectedPoolId(Number(params.id));
                setPoolStartDate(selectedRow.start_date);
                setselectedPoolName(params.row.name);
              }
              setOpenLedgerView(true);
            }}
            color="inherit"
          />,
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

  const [newRecord, setNewRecord] = useState(initialDialogState);

  const fixedAssetStraightLinePoolStore = useSelector(
    (state) => state.fixedAssetStraightLinePool
  );

  const chartOfAccountsData = useSelector((state) => state.coa);
  const dispatch = useDispatch();
  //   const { logout } = useAuth();

  useEffect(() => {
    dispatch(
      fetchFixedAssetStraightLinePoolData({
        sort: sort,
        search: searchValue,
        column: sortColumn,
        page: currentPage,
        page_size: pageSize,
      })
    );
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await dispatch(
          fetchFixedAssetStraightLinePoolData({
            sort: sort,
            search: searchValue,
            column: sortColumn,
            page: currentPage,
            page_size: pageSize,
          })
        );
        if (response?.error?.message == 401) {
          //   logout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dispatch, sort, sortColumn, pageSize, currentPage]);

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

  useEffect(() => {
    if (fixedAssetStraightLinePoolStore.data) {
      setRows(fixedAssetStraightLinePoolStore.data);
      setTotal(fixedAssetStraightLinePoolStore.recordsTotal);
    }
  }, [fixedAssetStraightLinePoolStore]);

  useEffect(() => {}, [newRecord]);

  const handleSearch = (q) => {
    setCurrentPage(1);
    dispatch(
      fetchFixedAssetStraightLinePoolData({
        sort: sort,
        search: q,
        column: sortColumn,
        page_size: pageSize,
        page: currentPage,
      })
    );
  };

  const handleClose = () => {
    setSearchValue("");
    setCurrentPage(1);
    handleSearch("");
  };

  const handleSortModel = (newModel) => {
    if (newModel.length) {
      setSort(newModel[0].sort);
      setSortColumn(newModel[0].field);
      dispatch(
        fetchFixedAssetStraightLinePoolData({
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
        deleteFixedAssetStraightLinePoolData({
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
      <Header />

      <div className="main main-app p-3 p-lg-4">
        <div className="d-md-flex align-items-center justify-content-between mb-4">
          <div>
            <h4 className="main-title mb-0">Fixed Assets Ledger</h4>
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
            setOpenLedgerTotalView(true);
          }}
          openLedgerTotalView={openLedgerTotalView}
        />

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
          rowsPerPageOptions={[10, 25, 50, 100]}
          onSortModelChange={handleSortModel}
          filterMode="server"
          loading={fixedAssetStraightLinePoolStore.isLoading}
          onPageChange={(newPage) => {
            setCurrentPage(newPage + 1);
          }}
          onPageSizeChange={(newPageSize) => {
            setPageSize(newPageSize);
          }}
        />

        <CRUDStraightLineFixedAssets
          show={openForm}
          mode={openFormMode}
          search={searchValue}
          column={sortColumn}
          sort={sort}
          pageSize={pageSize}
          fixedAssetStraightLinePoolData={newRecord}
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

        <FixedAssetStraightLinePoolsLedgerView
          show={openLedgerView}
          poolId={selectedPoolId}
          title={selectedPoolName}
          poolStartDate={poolStartDate}
          handleOnCancel={(e) => {
            setOpenLedgerView(false);
            // console.log(e);
          }}
          handleOnClose={(e) => {
            setOpenLedgerView(false);
            // console.log(e);
          }}
        />

        <FixedAssetStraightLineBalancePoolsTotalLedgerView
          show={openLedgerTotalView}
          handleOnCancel={(e) => {
            setOpenLedgerTotalView(false);
            // console.log(e);
          }}
          handleOnClose={(e) => {
            setOpenLedgerTotalView(false);
            // console.log(e);
          }}
        />
      </div>
    </React.Fragment>
  );
}
