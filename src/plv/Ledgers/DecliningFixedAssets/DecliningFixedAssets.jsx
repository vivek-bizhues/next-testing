import * as React from "react";
import { useEffect, useState } from "react";
import Toolbar from "./components/toolbar";
import { DataGrid, GridRenderCellParams } from "@mui/x-data-grid";

import {
  fetchFixedAssetDecliningPoolData,
  deleteFixedAssetDecliningPoolData,
} from "../../../store/plv2/fixedAssetDecliningPool";

import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import EditIcon from "@mui/icons-material/Edit";
import PoolDetailViewIcon from "@mui/icons-material/ViewComfyOutlined";

import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import { CopyAllOutlined } from "@mui/icons-material";
import { GridActionsCellItem } from "@mui/x-data-grid";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { formatDate, parseDate } from "../../../utils/get-daterange";
import Header from "../../../layouts/Header";
import CRUDDecliningFixedAssets from "./components/createDecliningFixedAsset";
import FixedAssetDecliningBalancePoolsLedgerView from "./components/transactions";
import FixedAssetDecliningBalancePoolsTotalLedgerView from "./components/transactionsTotal";
// import FixedAssetDecliningBalancePoolsTotalLedgerView from "./components/transactionsTotal";
// import FixedAssetDecliningBalancePoolsLedgerView from "./components/transactions";
// import { useAuth } from "src/hooks/useAuth";
// import { useRouter } from "next/router";

export default function DecliningFixedAssets() {
  const monthOptions = Array.from({ length: 12 }, (_, index) => index + 1);
  const [rows, setRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortColumn, setSortColumn] = useState("id");
  const [sort, setSort] = useState("desc");
  const [pageSize, setPageSize] = useState(10);

  const [searchValue, setSearchValue] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [openFormMode, setOpenFormMode] = useState(null);
  const [openLedgerView, setOpenLedgerView] = useState(false);
  const [openLedgerTotalView, setOpenLedgerTotalView] = useState(false);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [selectedRecord, setselectedRecord] = useState();
  const [queryOptions, setQueryOptions] = React.useState({});
  const [selectedPoolId, setSelectedPoolId] = useState(0);
  const [selectedPoolName, setselectedPoolName] = useState("");
  const [poolStartDate, setPoolStartDate] = useState(new Date());
  const [loading, setLoading] = React.useState(true);

  const initialDialogState = {
    open: false,
    id: 0,
    name: "",
    ob_remaining_cost: 0,
    ob_nbv: 0,
    start_date: new Date(),
    declining_balance_rate: 0,
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
      width: 150,
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
      field: "declining_balance_rate",
      headerName: "Declining Balance Rate",
      width: 180,
      align: "right",
      renderCell: (params) => `${params.value}%`,
    },
    {
      field: "ob_nbv",
      headerName: "OB NBV",
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
      field: "memo",
      headerName: "memo",

      flex: 1,
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
            key={"edit__" + params.id}
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

  const fixedAssetDecliningPoolStore = useSelector(
    (state) => state.fixedAssetDecliningPool
  );

  const chartOfAccountsData = useSelector((state) => state.coa);
  const dispatch = useDispatch();
  // const router = useRouter();
  // const { logout } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await dispatch(
          fetchFixedAssetDecliningPoolData({
            sort: sort,
            search: searchValue,
            column: sortColumn,
            page: currentPage,
            page_size: pageSize,
          })
        );
        if (response?.error?.message == 401) {
          // logout();
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
    if (fixedAssetDecliningPoolStore.data) {
      setRows(fixedAssetDecliningPoolStore.data);
      setTotal(fixedAssetDecliningPoolStore.recordsTotal);
    }
  }, [fixedAssetDecliningPoolStore]);

  useEffect(() => {}, [newRecord]);

  const handleSearch = (q) => {
    setCurrentPage(1);
    dispatch(
      fetchFixedAssetDecliningPoolData({
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
        fetchFixedAssetDecliningPoolData({
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
    if (selectedRecord) {
      dispatch(
        deleteFixedAssetDecliningPoolData({
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
          checkboxSelection
          pageSize={pageSize}
          rowCount={total}
          sortingMode="server"
          paginationMode="server"
          rowsPerPageOptions={[10, 25, 50, 100]}
          onSortModelChange={handleSortModel}
          filterMode="server"
          // onFilterModelChange={onFilterChange}
          loading={fixedAssetDecliningPoolStore.isLoading}
          onPageChange={(newPage) => {
            setCurrentPage(newPage + 1);
          }}
          onPageSizeChange={(newPageSize) => {
            setPageSize(newPageSize);
          }}
        />

        <CRUDDecliningFixedAssets
          show={openForm}
          mode={openFormMode}
          search={searchValue}
          column={sortColumn}
          sort={sort}
          pageSize={pageSize}
          fixedAssetDecliningPoolData={newRecord}
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

        <FixedAssetDecliningBalancePoolsLedgerView
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

        <FixedAssetDecliningBalancePoolsTotalLedgerView
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
