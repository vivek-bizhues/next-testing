import React, { useEffect, useState } from "react";
import Header from "../../layouts/Header";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteCoa,
  fetchCoaCategoryList,
  fetchCoaNew,
} from "../../store/plv2/coa";
import Toolbar from "./components/toolbar";
import CRUDCoA from "./components/createCoA";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useRouter } from "next/router";

export default function ChartOfAccounts() {
  const initialDialogState = {
    open: false,
    id: 0,
    name: "",
    category: 0,
    position: 0,
  };
  const [rows, setRows] = useState([]);
  const [newRecord, setNewRecord] = useState(initialDialogState);
  const coaStore = useSelector((state) => state?.coa);
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortColumn, setSortColumn] = useState("id");
  const [sort, setSort] = useState("desc");
  const [pageSize, setPageSize] = useState(10);
  const [coaCategory, setCoaCategory] = useState([]);
  const [openFormMode, setOpenFormMode] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [selectedRecord, setselectedRecord] = useState();
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const router = useRouter();

  // console.log(pageSize, "pageeeeesize");
  // console.log(currentPage, "pageeeeeno");

  React.useEffect(() => {
    setLoading(true);
    dispatch(
      fetchCoaNew({
        sort: sort,
        search: searchQuery,
        column: sortColumn,
        page_size: pageSize,
        page: currentPage,
      })
    )
      .then((res) => {
        setLoading(false);
        if (res?.error?.message === 401) {
          // logout();
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, [
    dispatch,
    router.query.slug,
    sort,
    sortColumn,
    pageSize,
    currentPage,
    searchQuery,
  ]);

  React.useEffect(() => {
    setLoading(true);
    dispatch(fetchCoaCategoryList())
      .then((res) => {
        setLoading(false);
        if (res?.error?.message === 401) {
          // logout();
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, [dispatch, router.query.slug, sort, sortColumn, pageSize, currentPage]);

  useEffect(() => {
    const _coa_category_list = [];
    const _coa_list = [];

    if (coaStore?.newData?.length > 0) {
      coaStore?.newData.forEach((d) => {
        const ct = {
          id: d.category_id,
          name: d.category_name,
        };
        _coa_category_list.push(ct);
        const coa = {
          id: d.id,
          name: d.name,
          category: ct,
          entity: d.entity,
        };
        _coa_list.push(coa);
      });

      setCoaCategory(coaStore.categories);

      setRows(_coa_list);
      setTotal(coaStore.recordsTotal);
    } else {
      setRows([]);
    }
  }, [coaStore]);

  const columns = [
    { field: "id", headerName: "ID", width: 100, hide: true },
    { field: "name", headerName: "Chart of Account", width: 250 },
    {
      field: "category",
      headerName: "Category",
      width: 250,
      renderCell: (params) => {
        return params.row.category.name;
      },
    },

    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 100,
      cellClassName: "actions",
      renderCell: (params) => {
        return (
          params.row.entity && [
            <GridActionsCellItem
              icon={<EditIcon />}
              key={"edit_" + params.id}
              label="Edit"
              className="textPrimary"
              onClick={() => {
                const selectedRow = rows.find((row) => row.id === params.id);
                if (selectedRow) {
                  setNewRecord({
                    open: false,
                    id: selectedRow.id,
                    name: selectedRow.name,
                    category: selectedRow.category.id,
                    position: selectedRow.position,
                  });
                }
                setOpenFormMode("Edit");
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
          ]
        );
      },
    },
  ];

  const handleSearchChange = (q) => {
    setCurrentPage(1);
    dispatch(
      fetchCoaNew({
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
      setCurrentPage(1); // Reset to page 1
      dispatch(
        fetchCoaNew({
          sort: newModel[0].sort,
          search: searchQuery,
          column: newModel[0].field,
          page_size: pageSize,
          page: 1, // Reset page
        })
      );
    }
  };

  const handleCloseDeleteConfirmation = () => {
    setDeleteConfirmationOpen(false);
  };

  const handleDeleteRecord = (record) => {
    setselectedRecord(record);
    setDeleteConfirmationOpen(true);
  };

  const handleDeleteConfirmation = () => {
    if (selectedRecord) {
      dispatch(deleteCoa(selectedRecord.id)).then(() => {
        dispatch(
          fetchCoaNew({
            sort,
            search: searchQuery,
            column: sortColumn,
            page_size: pageSize,
            page: currentPage,
          })
        );
      });
      setDeleteConfirmationOpen(false);
    }
  };

  let sortedCategories = coaCategory
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <React.Fragment>
      <Header />
      <div className="main main-app p-3 p-lg-4">
        <div className="d-md-flex align-items-center justify-content-between mb-4">
          <div>
            <h4 className="main-title mb-0">Chart of Accounts </h4>
          </div>
        </div>

        <Toolbar
          searchQuery={searchQuery}
          onSearchChange={(e) => handleSearchChange(e.target.value)}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearchChange(e.target.value);
            }
          }}
          clearSearch={() => {
            setSearchQuery("");
            handleSearchChange("");
          }}
          onCreateNew={() => {
            setNewRecord(initialDialogState);
            setOpenFormMode("Create");
            setOpenForm(true);
          }}
        />
        <DataGrid
          rows={rows}
          columns={columns}
          pagination
          disableColumnMenu={true}
          pageSize={pageSize}
          pageSizeOptions={[10, 25, 50]}
          onPaginationModelChange={(paginationModel) => {
            const { page, pageSize } = paginationModel;
            setCurrentPage(page + 1);
            setPageSize(pageSize);
          }}
          onSortModelChange={handleSortModel}
          paginationMode="server"
          sortingMode="server"
          loading={loading}
          rowCount={total}
          autoPageSize
        />
        <CRUDCoA
          show={openForm}
          mode={openFormMode}
          search={searchQuery}
          pageSize={pageSize}
          coa={newRecord}
          coaOptions={sortedCategories}
          handleOnCancel={(event) => {
            setOpenForm(false);
          }}
          handleOnClose={(event) => {
            setOpenForm(false);
          }}
          handleOnSave={(event) => {
            event.preventDefault();
            setOpenForm(false);
            dispatch(
              fetchCoaNew({
                sort,
                search: searchQuery,
                column: sortColumn,
                page_size: pageSize,
                page: currentPage,
              })
            );
          }}
        />

        <Dialog
          open={deleteConfirmationOpen}
          onClose={handleCloseDeleteConfirmation}
        >
          <DialogTitle>Confirmation</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this CoA?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteConfirmation}>Cancel</Button>
            <Button onClick={handleDeleteConfirmation} color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </React.Fragment>
  );
}
