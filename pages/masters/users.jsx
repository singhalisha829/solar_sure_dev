import { useState, useEffect } from "react";
import Loading from "@/components/Loading";
import Table from "@/components/Table";
import { getUsers } from "@/services/api";
import { requestHandler } from "@/services/ApiHandler";
import { toast } from "sonner";
import CustomPagination from "@/components/shared/Pagination";
import Search from "@/components/shared/SearchComponent";
import Button from "@/components/shared/Button";
import { TABLE_SIZE } from "@/utils/constants";
import { useModal } from "@/contexts/modal";
import dynamic from "next/dynamic";

const AddUserModal = dynamic(() => import("@/components/modals/AddUserModal"));

const Users = () => {
  const { openModal } = useModal();
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [totalRowCount, setTotalRowCount] = useState(0);
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "" });
  const [filters, setFilters] = useState({ page: 1, limit: TABLE_SIZE });
  const [selectedUser, setSelectedUser] = useState(null);
  const [editModalId, setEditModalId] = useState(null);

  useEffect(() => {
    fetchUsers({ page: 1, limit: TABLE_SIZE });
  }, []);

  const fetchUsers = async (queryParams = {}) => {
    await requestHandler(
      async () => await getUsers(queryParams),
      setIsLoading,
      (data) => {
        setTotalRowCount(data.data.total_records ?? data.data.count ?? 0);
        setUsers(data.data.output ?? data.data.results ?? []);
      },
      toast.error
    );
  };

  const handleEditUser = (row) => {
    const modalId = `edit-user-${row.id}`;
    setSelectedUser(row);
    setEditModalId(modalId);
    openModal(modalId);
  };

  const tableHeader = [
    {
      name: "Name",
      sortable: true,
      width: "15rem",
      key: "name",
    },
    {
      name: "Email",
      sortable: true,
      width: "15rem",
      key: "email",
    },
    {
      name: "Phone",
      sortable: true,
      width: "12rem",
      key: "phone",
    },
    {
      name: "Role",
      sortable: true,
      width: "10rem",
      key: "role_name",
    },
    {
      name: "Status",
      sortable: true,
      width: "8rem",
      key: "status",
    },
    {
      name: "Actions",
      type: "actions-column",
      actionType: "edit",
      width: "6rem",
      key: "actions",
      onClickEdit: handleEditUser,
    },
  ];

  const handlePageChange = (page) => {
    fetchUsers({ ...filters, ...(search !== "" && { search }), page });
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleTableSort = (column, direction) => {
    const pageFilters = {
      page: 1,
      limit: TABLE_SIZE,
      ...(direction !== "none" && {
        sort_by: direction === "ascending" ? column : `-${column}`,
      }),
      ...(search !== "" && { search }),
    };
    fetchUsers(pageFilters);
    setFilters({ page: 1, limit: TABLE_SIZE });
    setSortConfig({ key: column, direction });
  };

  const clearFilters = () => {
    setSearch("");
    setFilters({ page: 1, limit: TABLE_SIZE });
    setSortConfig({ key: "", direction: "" });
    fetchUsers({ page: 1, limit: TABLE_SIZE });
  };

  return (
    <>
      <div className="flex justify-between items-center gap-4">
        <h2 className="text-primary text-xl font-bold tracking-tight">
          Users
        </h2>
        <div className="flex items-center gap-2">
          {search !== "" && (
            <Button onClick={clearFilters} className={"px-2"}>
              Clear Filters
            </Button>
          )}
          <Button className="px-3" onClick={() => openModal("add-user")}>
            Add User
          </Button>
          <Search
            searchText={(data) => {
              setSearch(data);
              fetchUsers({ page: 1, limit: TABLE_SIZE, search: data });
              setFilters((prev) => ({ ...prev, page: 1 }));
            }}
            searchPlaceholder="Search.."
            value={search}
          />
        </div>
      </div>
      {!isLoading && (
        <div className="min-h-[85vh] overflow-hidden bg-white p-5">
          <div className="overflow-auto h-[95%] mb-2">
            <Table
              columns={tableHeader}
              rows={users}
              prevPageRows={(filters.page - 1) * filters.limit}
              sortConfig={sortConfig}
              onColumnSort={handleTableSort}
            />
          </div>
          <div className="relative">
            <CustomPagination
              currentPage={filters.page}
              totalRows={totalRowCount}
              rowsPerPage={filters.limit}
              onPageChange={handlePageChange}
            />
            <span className="absolute right-0 top-1">
              <strong>Total Count: </strong>
              {totalRowCount}
            </span>
          </div>
        </div>
      )}
      {isLoading && <Loading />}
      <AddUserModal
        modalId="add-user"
        onSuccess={() => fetchUsers({ page: 1, limit: TABLE_SIZE })}
      />
      {editModalId && (
        <AddUserModal
          modalId={editModalId}
          itemDetails={selectedUser}
          onSuccess={() => fetchUsers({ ...filters, ...(search !== "" && { search }) })}
        />
      )}
    </>
  );
};

export default Users;
