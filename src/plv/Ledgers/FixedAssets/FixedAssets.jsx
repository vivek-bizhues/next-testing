import * as React from "react";
import { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { fetchCoaList } from "../../../store/plv2/coa";
import {
  fetchFixedAssetData,
  deleteFixedAssetData,
} from "../../../store/plv2/fixedAsset";

import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import { CopyAllOutlined } from "@mui/icons-material";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { fetchFixedAssetTransactionData } from "../../../store/plv2/fixedAssetTransactions";
import { fetchFixedAssetTransactionDataTotal } from "../../../store/plv2/fixedAssetTransactionsTotal";
import { parseDate } from "../../../utils/get-daterange";
import Header from "../../../layouts/Header";
import CRUDFixedAsset from "./components/createFixedAsset";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import FixedAssetsLedgerView from "./components/transactions";
import Toolbar from "./components/toolbar";

export default function FixedAssets() {
  const monthOptions = Array.from({ length: 12 }, (_, index) => index + 1);

  const [rows, setRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortColumn, setSortColumn] = useState("purchase_date");
  const [sort, setSort] = useState("desc");
  const [pageSize, setPageSize] = useState(10);

  const [searchValue, setSearchValue] = useState("");

  const [openForm, setOpenForm] = useState(false);
  const [openFormMode, setOpenFormMode] = useState(null);
  const [openLedgerView, setOpenLedgerView] = useState(false);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [selectedRecord, setselectedRecord] = useState();
  const [loading, setLoading] = useState(true);
  const [ledgerviewLoading, setLedgerviewLoading] = useState(false);

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

  const depreciationType = [
    { label: "Straight Line", value: 1 },
    { label: "Declining Balance", value: 2 },
  ];

  const columns = [
    { field: "id", headerName: "ID", width: 100, hide: true },
    { field: "name", headerName: "Desciption", width: 175 },
    {
      field: "depreciation_type",
      headerName: "Depr. Type",
      renderCell: (params) => {
        return getPaymentTypeName(params.value);
      },
      type: "singleSelect",
      valueOptions: depreciationType,
    },
    {
      field: "purchase_amount",
      headerName: "pur. amount",
      width: 160,
      align: "right",
      renderCell: (params) =>
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        }).format(params.value),
    },
    {
      field: "purchase_date",
      headerName: "Purchase Date",
      width: 150,
      //   type: "date",
      align: "center",
      renderCell: (params) =>
        new Date(params.value).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
        }),
    },
    {
      field: "economic_userful_life",
      headerName: "economic userful life",
      width: 150,
      align: "right",
      renderCell: (params) =>
        `${params.value} ${params.value === 1 ? "Month" : "Months"}`,
    },
    {
      field: "declining_balance_rate",
      headerName: "dec. bal. rate",
      width: 130,
      align: "right",
      renderCell: (params) => {
        const assetData = params.row;
        const isStraightLineDepreciation = assetData.depreciation_type === 1;
        if (isStraightLineDepreciation) {
          return "-";
        } else {
          return `${params.value}%`;
        }
      },
    },

    {
      field: "straight_line_amount",
      headerName: "straight_line_amount",
      width: 150,
      align: "right",
      renderCell: (params) => {
        const assetData = params.row;
        const isStraightLineDepreciation = assetData.depreciation_type === 1;
        if (isStraightLineDepreciation) {
          return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0,
          }).format(params.value);
        } else {
          return "-";
        }
      },
    },
    {
      field: "declining_amount",
      headerName: "declining_amount",
      width: 150,
      align: "right",
      renderCell: (params) => {
        const assetData = params.row;
        const isStraightLineDepreciation = assetData.depreciation_type === 1;
        if (isStraightLineDepreciation) {
          return "-";
        } else {
          return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0,
          }).format(params.value);
        }
      },
      valueFormatter: (params) =>
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        }).format(params.value),
    },
    {
      field: "disposal_amount",
      headerName: "disposal_amount",
      width: 150,
      align: "right",
      renderCell: (params) =>
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        }).format(params.value),
    },
    {
      field: "disposal_date",
      headerName: "Disposal Date",
      width: 130,
      // type: "date",
      renderCell: (params) => {
        if (params.value) {
          return new Date(parseDate(params.value)).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
          });
        } else {
          return "-";
        }
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
                // selectedRow.id = 0;
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

  const fixedAssetsStore = useSelector((state) => state.fixedAssets);

  const fixedAssetsTransactionsStore = useSelector(
    (state) => state.fixedAssetTransactions
  );

  const fixedAssetsTransactionTotalStore = useSelector(
    (state) => state.fixedAssetTransactionsTotal
  );

  const chartOfAccountsData = useSelector((state) => state.coa);
  const dispatch = useDispatch();
  //   const router = useRouter();
  //   const { logout } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await dispatch(fetchCoaList("tll"));
        const response = await dispatch(
          fetchFixedAssetData({
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
    if (fixedAssetsStore.data) {
      setRows(fixedAssetsStore.data);
      setTotal(fixedAssetsStore.recordsTotal);
    }
  }, [fixedAssetsStore]);

  useEffect(() => {}, [newRecord]);

  function getPaymentTypeName(id) {
    const result = depreciationType.find((item) => item.value === id);
    return result ? result.label : null;
  }

  const handleSearch = (q) => {
    setCurrentPage(1);
    dispatch(
      fetchFixedAssetData({
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
        fetchFixedAssetData({
          sort: newModel[0].sort,
          search: searchValue,
          column: newModel[0].field,
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
    if (selectedRecord) {
      dispatch(
        deleteFixedAssetData({
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
            setLedgerviewLoading(true);

            dispatch(fetchFixedAssetTransactionData())
              .then(() => {
                return dispatch(fetchFixedAssetTransactionDataTotal());
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

        <DataGrid
          pagination
          rows={rows}
          columns={columns}
          disableColumnMenu={true}
          pageSize={pageSize}
          rowCount={total}
          sortingMode="server"
          paginationMode="server"
          pageSizeOptions={[10, 25, 50, 100]}
          onSortModelChange={handleSortModel}
          filterMode="server"
          loading={fixedAssetsStore.isLoading}
          onPaginationModelChange={(paginationModel) => {
            const { page, pageSize } = paginationModel;
            setCurrentPage(page + 1);
            setPageSize(pageSize);
          }}
          autoPageSize
        />

        <CRUDFixedAsset
          show={openForm}
          mode={openFormMode}
          search={searchValue}
          column={sortColumn}
          sort={sort}
          pageSize={pageSize}
          fixedAssetsData={newRecord}
          depreciationType={depreciationType}
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

        <FixedAssetsLedgerView
          show={openLedgerView}
          ledgerData={fixedAssetsTransactionsStore.data}
          ledgerDataTotals={fixedAssetsTransactionTotalStore.data}
          handleOnCancel={(e) => {
            setOpenLedgerView(false);
            // console.log(e);
          }}
          handleOnClose={(e) => {
            setOpenLedgerView(false);
            // console.log(e);
          }}
        />
      </div>
    </React.Fragment>
  );
}
