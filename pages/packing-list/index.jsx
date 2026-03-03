import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getPackingList } from "@/services/api";
import { requestHandler } from "@/services/ApiHandler";
import { toast } from "sonner";
import { useModal } from "@/contexts/modal";
import Table from "@/components/Table";
import Loading from "@/components/Loading";
import { axiosInstance } from "@/services/ApiHandler";
import { LocalStorageService } from "@/services/LocalStorageHandler";
import { FaTimes } from "react-icons/fa";
import Search from "@/components/shared/SearchComponent";
import { FaFilter } from "react-icons/fa";
import { useVendors } from "@/contexts/vendors";
import Button from "@/components/shared/Button";
import { dateFormatInYYYYMMDD } from "@/utils/formatter";
import dynamic from "next/dynamic";
import CustomPagination from "@/components/shared/Pagination";
import { TABLE_SIZE } from "@/utils/constants";

const Filter = dynamic(() => import("@/components/modals/Filter"));
const PackingListItems = dynamic(
  () => import("@/components/modals/PackingListItems")
);

const PackingList = () => {
  const router = useRouter();
  const { openModal, closeModal } = useModal();
  const { vendors } = useVendors();
  const [packingList, setPackingList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRow, setSelectedRow] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [search, setSearch] = useState("");
  const [totalRowCount, setTotalRowCount] = useState(0);
  const [sortConfig, setSortConfig] = useState({
    key: "",
    direction: "",
  });

  // Single source of truth for all filters
  const [filters, setFilters] = useState({
    page: 1,
    limit: TABLE_SIZE,
    vendor: "",
    start_date: null,
    end_date: null,
    company_type: null,
    search: "",
  });

  const accessibilityInfo =
    LocalStorageService.get("user_accessibility")?.accessibility[0].packing_list
      .pages.packing_list ?? {};

  const allowedActions =
    (accessibilityInfo?.download_packing_list ? "download-" : "") +
    (accessibilityInfo?.edit_view ? "edit-" : "") +
    (accessibilityInfo?.upload_invoice ? "upload" : "");

  const companyAccessibility =
    LocalStorageService.get("user_accessibility")?.accessibility[0]
      ?.company_access?.both_company ?? false;

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
      name: "Vendor",
      type: "dropdown",
      options: vendors,
      optionName: "name",
      optionId: "id",
      key: "vendor",
    },
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
      name: "Company Name",
      sortable: true,
      key: "project_company_name",
      width: "11rem",
    },
    {
      name: "Dispatch From",
      sortable: true,
      key: "vendor_name",
      width: "13rem",
    },
    {
      name: "Project",
      sortable: true,
      key: "project_name",
      width: "10rem",
    },
    {
      name: "Project Capacity",
      sortable: true,
      key: "project_project_capacity",
      width: "11rem",
    },
    {
      name: "Packing List No.",
      sortable: true,
      key: "packing_list_no",
      width: "11rem",
    },
    {
      name: "Date",
      sortable: true,
      key: "date",
      type: "date",
      width: "6rem",
    },
    {
      name: "Project Site",
      sortable: true,
      key: "project_project_site_name",
      width: "15rem",
    },
    {
      name: "Status",
      sortable: true,
      key: "status",
      width: "6rem",
    },
    {
      name: "PO Number",
      sortable: true,
      key: "po_number",
      width: "9rem",
    },
    {
      name: "Created By",
      sortable: true,
      key: "created_by_name",
      width: "10rem",
    },
    {
      name: "Created At",
      sortable: true,
      key: "created_at",
      type: "created_at",
      width: "10rem",
    },
    {
      name: "Remark",
      sortable: true,
      key: "remark",
      width: "15rem",
    },
    {
      name: "Actions",
      type: "actions-column-packing-list",
      actionType: allowedActions,
      width: "5rem",
      onClickDownload: (row) => {
        downloadDocument(row);
      },
      onClickEdit: (row) => {
        LocalStorageService.set("edit-packing-list-items", row);
        router.push("/packing-list/edit-packing-list/");
      },
      onClickUploadInvoice: (row) => {
        LocalStorageService.set("upload-packing-list-invoice", row);
        router.push("/invoices/upload-invoice/");
      },
    },
  ];

  // Load saved filters on component mount
  useEffect(() => {
    const error = LocalStorageService.get("packing-list-error");
    if (error) {
      setErrorMessage(error);
    }

    // Check for saved filters
    const savedFilters = LocalStorageService.get("packing_list_filters");

    if (savedFilters) {
      // Update search state if it exists in saved filters
      if (savedFilters.search) {
        setSearch(savedFilters.search);
      }

      // Update filters state with saved filters
      setFilters((prev) => ({
        ...prev,
        ...savedFilters,
        page: 1,
        limit: TABLE_SIZE,
      }));

      // Fetch with saved filters
      fetchPackingList(savedFilters);
    } else {
      // Fetch with default filters
      fetchPackingList({ limit: TABLE_SIZE, page: 1 });
    }
  }, []);

  const downloadDocument = async (row) => {
    try {
      const response = await axiosInstance.get(
        `/api/project/packing_list_doc/?packing_list_id=${row.id}`,
        { responseType: "blob" }
      );

      if (response.status === 200) {
        // Create URL for blob object
        const url = URL.createObjectURL(response.data);

        // Create a temporary anchor element
        const link = document.createElement("a");
        link.href = url;
        link.download = `${row.packing_list_no}(${row.project_company_name}).pdf`; // Specify the document name

        // Trigger the download by programmatically clicking the anchor element
        document.body.appendChild(link);
        link.click();

        // Clean up
        document.body.removeChild(link);
        URL.revokeObjectURL(url); // Release memory
      } else {
        toast.error("Something went wrong");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  // Prepare filters for API
  const prepareFilterParams = (currentFilters) => {
    const queryParams = { ...currentFilters };

    // Format dates if they exist
    if (queryParams.start_date) {
      queryParams.start_date = dateFormatInYYYYMMDD(
        new Date(queryParams.start_date)
      );
    }
    if (queryParams.end_date) {
      queryParams.end_date = dateFormatInYYYYMMDD(
        new Date(queryParams.end_date)
      );
    }

    // Return only non-empty filters
    return Object.fromEntries(
      Object.entries(queryParams).filter(
        ([_, value]) => value !== null && value !== ""
      )
    );
  };

  // Main function to fetch packing list data
  const fetchPackingList = async (filterParams = {}) => {
    setIsLoading(true);
    const queryParams = prepareFilterParams(filterParams);

    await requestHandler(
      async () => await getPackingList(queryParams),
      null,
      (data) => {
        setPackingList(data.data.output);
        setTotalRowCount(data.data.length);
        setIsLoading(false);
      },
      (error) => {
        toast.error(error);
        setIsLoading(false);
      }
    );

    // Save filters to local storage, excluding pagination
    const filtersToSave = { ...filterParams };
    delete filtersToSave.page;
    LocalStorageService.set("packing_list_filters", filtersToSave);
  };

  // Handler for updating filters
  const updateFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  // Handler for applying filters
  const applyFilters = () => {
    // Apply current filters including search
    const currentFilters = {
      ...filters,
      search: search || "",
    };

    // Reset to page 1 when applying new filters
    const filtersWithPage = { ...currentFilters, page: 1 };
    setFilters(filtersWithPage);

    // Fetch with new filters
    fetchPackingList(filtersWithPage);
    closeModal("apply-filter");
  };

  // Handle search changes
  const handleSearch = (searchTerm) => {
    setSearch(searchTerm);

    const updatedFilters = {
      ...filters,
      search: searchTerm,
      page: 1,
    };

    setFilters(updatedFilters);
    fetchPackingList(updatedFilters);
  };

  // Handle page changes
  const handlePageChange = (page) => {
    const updatedFilters = { ...filters, page };
    setFilters(updatedFilters);
    fetchPackingList(updatedFilters);
  };

  // Handle table sorting
  const handleTableSort = (column, direction) => {
    setSortConfig({ key: column, direction });

    const updatedFilters = {
      ...filters,
      page: 1,
      ...(direction !== "none" && {
        sort_by: direction === "ascending" ? column : `-${column}`,
      }),
    };

    setFilters(updatedFilters);
    fetchPackingList(updatedFilters);
  };

  // Clear all filters and reset to defaults
  const clearFilters = () => {
    LocalStorageService.remove("packing_list_filters");
    setSearch("");
    setFilters({
      page: 1,
      limit: TABLE_SIZE,
      vendor: "",
      start_date: null,
      end_date: null,
      company_type: null,
      search: "",
    });
    setSortConfig({
      key: "",
      direction: "",
    });
    fetchPackingList({ page: 1, limit: TABLE_SIZE });
  };

  // Compute if any filters are applied (for UI indicators)
  const hasAppliedFilters = () => {
    const { page, limit, ...actualFilters } = filters;

    return Object.entries(actualFilters).some(
      ([_, value]) => value !== null && value !== ""
    );
  };

  // Count active filters for UI display
  const getActiveFilterCount = () => {
    let count = 0;
    const { page, limit, search, start_date, end_date, ...otherFilters } =
      filters;

    // Count normal filters
    Object.values(otherFilters).forEach((value) => {
      if (value !== null && value !== "") count++;
    });

    // Count date range as one filter if either start or end date is set
    if (start_date || end_date) count++;

    return count;
  };

  return (
    <>
      <div className="flex justify-between items-center gap-4">
        <h2 className="text-orange-500 text-xl font-bold tracking-tight">
          Packing List
        </h2>

        <div className="flex items-center gap-2">
          {hasAppliedFilters() && (
            <Button onClick={clearFilters} className={"px-2"}>
              Clear Filters
            </Button>
          )}
          <Search
            searchText={handleSearch}
            searchPlaceholder="Search.."
            value={search}
          />

          <Filter
            setFilters={updateFilters}
            filterData={filters}
            filterList={filterList}
            onSubmit={applyFilters}
          />
          <button
            onClick={() => openModal("apply-filter")}
            className={`flex items-center px-4 py-2 bg-neutral-400/10 text-neutral-400 rounded
              ${hasAppliedFilters().length > 0 ? "text-primary" : ""}`}
          >
            <FaFilter />
            {hasAppliedFilters().length > 0 && `(${getActiveFilterCount()})`}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="border-1 relative text-red-500 border-red-500 rounded p-2 bg-red-50">
          <FaTimes
            className="absolute right-2 top-2 cursor-pointer"
            onClick={() => {
              LocalStorageService.set("packing-list-error", null);
              setErrorMessage(null);
            }}
          />
          <strong>Error!</strong>
          <br />
          {errorMessage.bom_item_quantity_error.length > 0 && (
            <>
              <span>
                BOM Items -{" "}
                <strong>
                  {errorMessage?.bom_item_quantity_error
                    .map((item) => item)
                    .join(", ")}{" "}
                </strong>
                have already been booked.
              </span>
              <br />
            </>
          )}
          {errorMessage.inventory_item_quantity_error.length > 0 && (
            <span>
              BOM Items -{" "}
              <strong>
                {errorMessage?.inventory_item_quantity_error
                  .map((item) => item)
                  .join(", ")}
              </strong>{" "}
              have less quantity available compared to the quantity being
              booked.
            </span>
          )}
        </div>
      )}

      <div className="min-h-[85vh] overflow-hidden bg-white p-5">
        <div className="overflow-auto h-[95%] mb-2">
          {isLoading ? (
            <Loading />
          ) : (
            <Table
              columns={tableHeader}
              rows={packingList}
              showSerialNumber={true}
              prevPageRows={(filters.page - 1) * filters.limit}
              sortConfig={sortConfig}
              onColumnSort={handleTableSort}
              onRowClick={(row) => {
                setSelectedRow(row);
                openModal("packing-list-items");
              }}
            />
          )}
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
      {selectedRow && <PackingListItems details={selectedRow} />}
    </>
  );
};

export default PackingList;
