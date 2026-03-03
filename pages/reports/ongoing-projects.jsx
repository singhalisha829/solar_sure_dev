import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Table from "@/components/SortableTable";
import { requestHandler } from "@/services/ApiHandler";
import { toast } from "sonner";
import { getReports } from "@/services/api";
import Search from "@/components/shared/SearchComponent";
import Button from "@/components/shared/Button";
import Loading from "@/components/Loading";
import dynamic from "next/dynamic";
import { useModal } from "@/contexts/modal";
import { FaFilter } from "react-icons/fa";
import { dateFormatInYYYYMMDD } from "@/utils/formatter";
import { LocalStorageService } from "@/services/LocalStorageHandler";
import CustomPagination from "@/components/shared/Pagination";
import { usePagination } from "@/hooks/usePagination";

const WarningModal = dynamic(() => import("@/components/modals/WarningModal"));
const Filter = dynamic(() => import("@/components/modals/Filter"));

const OngoingProjects = () => {
  const router = useRouter();
  const { openModal, closeModal } = useModal();
  const { pagination, resetToPageOne, handlePageChange } = usePagination({
    defaultPage: 1,
    defaultLimit: 25
  });
  const [reportList, setReportList] = useState([]);
  const [reportListCount, setReportListCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedRow, setSelectedRow] = useState(null);
  const [appliedFilters, setAppliedFilters] = useState({});
  const [filters, setFilters] = useState({
    start_date: null,
    end_date: null,
    company_type: null,
  });

  const companyAccessibility =
    LocalStorageService.get("user_accessibility")?.accessibility[0]
      ?.company_access.both_company ?? false;

  const companyTypeList = [
    { name: "Ornate", value: "ornate" },
    { name: "SG Ornate", value: "sg" },
  ];

  const filterList = [
    ...(companyAccessibility
      ? [
        {
          name: "Company Type",
          type: "dropdown",
          options: companyTypeList,
          optionName: "name",
          optionId: "value",
          key: "company_type",
        },
      ]
      : []),
    {
      name: "Date Range",
      type: "date",
      key: "start_date",
      key2: "end_date",
    },
  ];

  const tableHeader = [
    ...(companyAccessibility
      ? [
        {
          name: "Company Type",
          key: "is_ornate_project",
          type: "company_type",
          width: "10rem",
          sortable: true,
        },
      ]
      : []),
    {
      name: "Project",
      key: "project_name",
      sortable: true,
      width: "170px",
    },
    {
      name: "Company",
      key: "company_name",
      sortable: true,
      width: "190px",
    },
    {
      name: "Project Capacity(KW)",
      key: "project_capacity",
      sortable: true,
      displayType: "price",
      width: "190px",
    },
    {
      name: "Installer",
      key: "project_installer",
      sortable: true,
      width: "150px",
    },
    {
      name: "PO Date",
      key: "po_date",
      type: "date",
      sortable: true,
      width: "110px",
    },
    {
      name: "Po Value(₹)",
      key: "po_value",
      displayType: "price",
      sortable: true,
      width: "130px",
    },
    {
      name: "Budget(₹)",
      displayType: "price",
      sortable: true,
      key: "budget",
      width: "100px",
    },
    {
      name: "Amount Recieved Till Date(₹)",
      displayType: "price",
      key: "amount_received_till_date",
      sortable: true,
      width: "240px",
    },
    {
      name: "Total Ornate Invoice Amount(₹)",
      type: "gst-amount",
      key: "total_invoice_amount_till_date_with_gst",
      key2: "total_invoice_amount_till_date_without_gst",
      sortable: true,
      width: "250px",
    },
    {
      name: "Start Date",
      key: "start_date",
      sortable: true,
      type: "date",
      width: "120px",
    },
    {
      name: "End Date",
      key: "deadline_date",
      sortable: true,
      type: "date",
      width: "120px",
    },
    {
      name: "Project Head",
      sortable: true,
      key: "project_head",
      width: "150px",
    },
    {
      name: "Last Ornate Invoice Amount(₹)",
      type: "gst-amount",
      key: "last_invoice_amount_with_gst",
      key2: "last_invoice_amount_without_gst",
      sortable: true,
      width: "240px",
    },
    {
      name: "Last Ornate Invoice Date",
      type: "date",
      key: "last_amount_invoice_date",
      sortable: true,
      width: "220px",
    },
    {
      name: "Last Amount Recieved(₹)",
      displayType: "price",
      key: "last_amount_received",
      sortable: true,
      width: "220px",
    },
    {
      name: "Last Amount Recieved Date",
      type: "date",
      key: "last_amount_received_date",
      sortable: true,
      width: "220px",
    },
  ];

  useEffect(() => {
    fetchReports();
  }, [pagination.page, pagination.limit]);

  const fetchReports = async (queryParams = {}) => {
    // Add pagination params
    queryParams = {
      ...queryParams,
      page: pagination.page,
      limit: pagination.limit
    };

    if (Object.keys(queryParams).length > 0) {
      // change date format before filtering
      Object.keys(queryParams).map((paramKey) => {
        if (paramKey === "start_date" || paramKey === "end_date") {
          queryParams[paramKey] = dateFormatInYYYYMMDD(queryParams[paramKey]);
        }
      });
    }
    await requestHandler(
      async () => await getReports(queryParams),
      setIsLoading,
      (data) => {
        setReportList(data.data.output);
        setReportListCount(data.data.length);
      },
      toast.error
    );
  };

  const handleFilters = (filterObjects) => {
    setFilters(filterObjects);
    const filteredObj = Object.fromEntries(
      Object.entries(filterObjects).filter(
        ([key, value]) => value !== null && value !== ""
      )
    );
    setAppliedFilters(filteredObj);
  };

  const filterProjects = async (pageFilters) => {
    // Reset to page 1 when filtering
    resetToPageOne();

    const filteredObj = Object.fromEntries(
      Object.entries(pageFilters).filter(
        ([key, value]) => value !== null && value !== ""
      )
    );
    await fetchReports({ ...filteredObj, page: 1, limit: pagination.limit });
    closeModal("apply-filter");
  };

  return (
    <>
      <div className="flex justify-between items-center gap-4">
        <h2 className="text-primary text-xl font-bold tracking-tight">
          Ongoing Projects
        </h2>

        <div className="flex gap-2 items-center">
          {(Object.keys(appliedFilters).length > 0 || search !== "") && (
            <Button
              onClick={() => {
                setSearch("");
                setAppliedFilters({});
                setFilters({
                  start_date: null,
                  end_date: null,
                  company_type: null,
                });
                resetToPageOne();
                fetchReports({ page: 1, limit: pagination.limit });
              }}
              className={"px-2"}
            >
              Clear Filters
            </Button>
          )}
          <Search
            searchText={(data) => {
              setSearch(data);
              resetToPageOne();
              fetchReports({ search: data, page: 1, limit: pagination.limit });
            }}
            searchPlaceholder="Search.."
            value={search}
          />
          <Filter
            setFilters={handleFilters}
            filterData={filters}
            filterList={filterList}
            onSubmit={() => filterProjects({ ...filters, search: [search] })}
          />
          <button
            onClick={() => openModal("apply-filter")}
            className={`flex items-center px-4 py-2 bg-neutral-400/10 text-neutral-400 rounded
              ${Object.keys(appliedFilters).length > 0 ? "text-primary" : ""}`}
          >
            <FaFilter />
            {Object.keys(appliedFilters).length > 0 &&
              `(${Object.keys(appliedFilters).includes("start_date") ? Object.keys(appliedFilters).length - 1 : Object.keys(appliedFilters).length})`}
          </button>
        </div>
      </div>
      <div className="min-h-[85vh] overflow-hidden bg-white p-5">
        {isLoading ? (
          <Loading />
        ) : (
          <>
            <div className="overflow-x-auto h-[94%] mb-2">
              <Table
                rows={reportList}
                columns={tableHeader}
                onRowClick={(row) => {
                  if (
                    row.total_invoice_amount_till_date_with_gst == 0 ||
                    row.total_invoice_amount_till_date_without_gst == 0 ||
                    row.amount_received_till_date == 0
                  ) {
                    setSelectedRow(row);
                    openModal("payment-warning");
                  } else {
                    router.push(`payments/${row.id}`);
                  }
                }}
                prevPageRows={(pagination.page - 1) * pagination.limit}
                showSerialNumber={true}
              />
            </div>
            <div className="relative">
              <CustomPagination
                currentPage={pagination.page}
                totalRows={reportListCount}
                rowsPerPage={pagination.limit}
                onPageChange={handlePageChange}
              />
              <span className="absolute right-0 top-1">
                <strong>Total Count: </strong>
                {reportListCount}
              </span>
            </div>
          </>
        )}
      </div>

      <WarningModal
        modalId={"payment-warning"}
        hideCtaButton={true}
        modalContent={
          <>
            No payment has been done for the Project -{" "}
            <strong>
              {selectedRow?.project_name}({selectedRow?.company_name})
            </strong>
            .
          </>
        }
      />
    </>
  );
};

export default OngoingProjects;
