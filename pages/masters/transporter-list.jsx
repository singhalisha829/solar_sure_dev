import { useState, useEffect } from "react";
import Loading from "@/components/Loading";
import Table from "@/components/Table";
import { getSunlightTransporters } from "@/services/api";
import { requestHandler } from "@/services/ApiHandler";
import { toast } from "sonner";
import CustomPagination from "@/components/shared/Pagination";
import Search from "@/components/shared/SearchComponent";
import Button from "@/components/shared/Button";
import { TABLE_SIZE } from "@/utils/constants";

const TransportationList = () => {
  const [isLoading, setIsLoading] = useState([]);
  const [transportations, setTransportation] = useState([]);
  const [search, setSearch] = useState("");
  const [totalRowCount, setTotalRowCount] = useState(0);
  const [sortConfig, setSortConfig] = useState({
    key: "",
    direction: "",
  });
  const [filters, setFilters] = useState({
    page: 1,
    limit: TABLE_SIZE,
  });

  useEffect(() => {
    fetchTransportations({ page: 1, limit: TABLE_SIZE });
  }, []);

  const fetchTransportations = async (queryParams = {}) => {
    await requestHandler(
      async () => await getSunlightTransporters(queryParams),
      setIsLoading,
      (data) => {
        setTotalRowCount(data.data.total_records);
        setTransportation(data.data.output);
      },
      toast.error
    );
  };

  const tableHeader = [
    {
      name: "Name",
      sortable: true,
      width: "15rem",
      key: "transporter_name",
    },
    {
      name: "Transporter Poc",
      width: "15rem",
      sortable: true,
      key: "transporter_poc_contact_person_name",
    },
    {
      name: "POC Email",
      width: "10rem",
      sortable: true,
      key: "transporter_poc_contact_person_email",
    },
    {
      name: "POC Contact",
      width: "10rem",
      sortable: true,
      key: "transporter_poc_contact_person_phone",
    },
    {
      name: "GST",
      width: "8rem",
      sortable: true,
      key: "gstn",
    },
    {
      name: "Created By",
      width: "10rem",
      sortable: true,
      key: "created_by_name",
    },
    {
      name: "Created At",
      type: "unix_timestamp",
      width: "10rem",
      sortable: true,
      key: "created_at",
    },
  ];

  const handlePageChange = (page) => {
    fetchTransportations({ ...filters, search: [search], page: page });
    setFilters({ ...filters, page: page });
  };

  const handleTableSort = (column, direction) => {
    const pageFilters = {
      page: 1,
      limit: TABLE_SIZE,
      ...(direction !== "none" && {
        sort_by: direction === "ascending" ? column : `-${column}`,
      }),
      ...(search !== "" && {
        search: [search],
      }),
    };
    fetchTransportations(pageFilters);
    setFilters({ ...filters, page: 1, limit: TABLE_SIZE });
    setSortConfig({ key: column, direction: direction });
  };

  const clearFilters = () => {
    setSearch("");
    setFilters({
      page: 1,
      limit: TABLE_SIZE,
    });
    setSortConfig({
      key: "",
      direction: "",
    });
    fetchTransportations({ limit: TABLE_SIZE, page: 1 });
  };

  return (
    <>
      <div className="flex justify-between items-center gap-4">
        <h2 className="text-primary text-xl font-bold tracking-tight">
          Transporters
        </h2>
        <div className="flex items-center gap-2">
          {search !== "" && (
            <Button onClick={clearFilters} className={"px-2"}>
              Clear Filters
            </Button>
          )}
          <Search
            searchText={(data) => {
              setSearch(data);
              fetchTransportations({
                page: 1,
                limit: TABLE_SIZE,
                search: data,
              });
              setFilters({ ...filters, page: 1 });
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
              rows={transportations}
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
    </>
  );
};

export default TransportationList;
