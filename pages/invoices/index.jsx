import { useState, useEffect } from "react";
import Button from "@/components/shared/Button";
import Loading from "@/components/Loading";
import {
  getInvoices,
  getTransporterList,
  getInvoiceTransportationDetailsList,
  deletePackingListInvoice,
} from "@/services/api";
import { requestHandler } from "@/services/ApiHandler";
import { toast } from "sonner";
import Table from "@/components/Table";
import { useModal } from "@/contexts/modal";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import Search from "@/components/shared/SearchComponent";
import { FaFilter } from "react-icons/fa";
import { useVendors } from "@/contexts/vendors";
import { dateFormatInYYYYMMDD } from "@/utils/formatter";
import { LocalStorageService } from "@/services/LocalStorageHandler";
import CustomPagination from "@/components/shared/Pagination";
import { TABLE_SIZE } from "@/utils/constants";

const InvoiceItemList = dynamic(
  () => import("@/components/modals/InvoiceItemList")
);
const AddTransportationDetails = dynamic(
  () => import("@/components/modals/AddTransportation")
);
const ViewTransportationDetails = dynamic(
  () => import("@/components/modals/ViewTransportationDetails")
);
const Filter = dynamic(() => import("@/components/modals/Filter"));
const WarningModal = dynamic(() => import("@/components/modals/WarningModal"));

const Invoices = () => {
  const router = useRouter();
  const { openModal, closeModal } = useModal();
  const { vendors } = useVendors();

  const [invoices, setInvoices] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [transporterList, setTransporterList] = useState([]);
  const [totalRowCount, setTotalRowCount] = useState(0);
  const [invoiceTransportationDetails, setInvoiceTransportationDetails] =
    useState(null);
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
    LocalStorageService.get("user_accessibility").accessibility[0].packing_list
      .pages.ornate_invoices ?? {};

  const companyAccessibility =
    LocalStorageService.get("user_accessibility")?.accessibility[0]
      ?.company_access.both_company ?? false;

  const companyTypeList = [
    { name: "Ornate", value: "ornate" },
    { name: "SG Ornate", value: "sg" },
  ];

  const allowedActions =
    (accessibilityInfo?.edit_invoice ? "edit-" : "") +
    (accessibilityInfo?.delete_invoice ? "delete" : "");

  // Load saved filters on component mount
  useEffect(() => {
    const savedFilters = LocalStorageService.get("ornate_invoices_filters");

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

      // Fetch data with saved filters
      fetchInvoiceList(savedFilters);
    } else {
      // Fetch with default filters
      fetchInvoiceList({ page: 1, limit: TABLE_SIZE });
    }

    fetchTransporterList();
  }, []);

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
      name: "Packing List No.",
      sortable: true,
      key: "packing_list_no__packing_list_no",
      width: "11rem",
    },
    {
      name: "Invoice Types",
      type: "invoice_type_added",
      width: "10rem",
      sortable: true,
    },
    {
      name: "Invoice No.",
      key: "invoice_no",
      type: "document",
      document_key: "invoice_doc",
      width: "10rem",
      sortable: true,
    },
    {
      name: "Date",
      type: "date",
      sortable: true,
      key: "invoice_date",
      width: "8rem",
    },
    {
      name: "Vendor",
      sortable: true,
      key: "vendor_name",
      width: "9rem",
    },
    {
      name: "Invoice Amount (Without Tax)(₹)",
      sortable: true,
      key: "invoice_amount_without_gst",
      displayType: "price",
      width: "11rem",
    },
    {
      name: "Invoice Amount (With Tax)(₹)",
      sortable: true,
      key: "invoice_amount_with_gst",
      displayType: "price",
      width: "11rem",
    },
    {
      name: "Status",
      sortable: true,
      key: "status",
      width: "8rem",
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
      width: "20rem",
    },
    {
      name: "Transportation Details",
      type: "transportation_details",
      width: "200px",
      onAddDetails: (row) => {
        setSelectedRow(row);
        openModal("add-transportation-details");
      },
      onViewDetails: (row) => {
        fetchTransporationDetails(row.id);
      },
    },
    {
      name: "Action",
      type: "actions-column",
      actionType: allowedActions,
      onClickEdit: (row) => {
        LocalStorageService.set("edit-invoice", row);
        router.push("/invoices/edit-invoice/");
      },
      onClickDelete: (row) => {
        setSelectedRow(row);
        openModal("delete-invoice");
      },
    },
  ];

  // Prepare filters for API
  const prepareFilterParams = (currentFilters) => {
    // Create a clean copy to avoid modifying the original filters
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

  const fetchTransporationDetails = async (id) => {
    await requestHandler(
      async () => await getInvoiceTransportationDetailsList({ invoice: id }),
      null,
      (data) => {
        setInvoiceTransportationDetails(data.data.output[0]);
        openModal("view-transportation-details");
      },
      toast.error
    );
  };

  const fetchTransporterList = async () => {
    await requestHandler(
      async () => await getTransporterList(),
      null,
      (data) => setTransporterList(data.data.output),
      toast.error
    );
  };

  const fetchInvoiceList = async (filterParams = {}) => {
    setIsLoading(true);
    const queryParams = prepareFilterParams(filterParams);

    await requestHandler(
      async () => await getInvoices(queryParams),
      null,
      (data) => {
        setInvoices(data.data.output);
        setTotalRowCount(data.total_records);
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
    LocalStorageService.set("ornate_invoices_filters", filtersToSave);
  };

  const handleDeleteInvoice = async () => {
    await requestHandler(
      async () => await deletePackingListInvoice(selectedRow?.id),
      null,
      async () => {
        toast.success("Invoice Deleted Successfully!");
        closeModal("delete-invoice");
        fetchInvoiceList(filters);
      },
      toast.error
    );
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
    fetchInvoiceList(filtersWithPage);
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
    fetchInvoiceList(updatedFilters);
  };

  // Handle page changes
  const handlePageChange = (page) => {
    const updatedFilters = { ...filters, page };
    setFilters(updatedFilters);
    fetchInvoiceList(updatedFilters);
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
    fetchInvoiceList(updatedFilters);
  };

  // Clear all filters and reset to defaults
  const clearFilters = () => {
    LocalStorageService.remove("ornate_invoices_filters");
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
    fetchInvoiceList({ page: 1, limit: TABLE_SIZE });
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
          Ornate Invoices
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

          {/* <Button className="px-3" onClick={() => {}}>
            Upload Invoice
          </Button> */}
        </div>
      </div>
      {!isLoading && (
        <div className="min-h-[85vh] overflow-hidden bg-white p-5">
          <div className="overflow-auto h-[95%] mb-2">
            <Table
              columns={tableHeader}
              rows={invoices}
              isEditMode={true}
              conditionallyDelete={true}
              sortConfig={sortConfig}
              onColumnSort={handleTableSort}
              conditionallyDeleteKey={"invoice_items"}
              prevPageRows={(filters.page - 1) * filters.limit}
              onRowClick={
                accessibilityInfo?.view_details
                  ? (row) => {
                      setSelectedRow(row);
                      openModal("display-invoice-items");
                    }
                  : undefined
              }
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
      {selectedRow && <InvoiceItemList details={selectedRow} />}
      <AddTransportationDetails
        modalId={"add-transportation-details"}
        invoiceDetails={selectedRow}
        transporterList={transporterList}
        onSuccessfullSubmit={() => fetchInvoiceList(filters)}
      />
      {invoiceTransportationDetails && (
        <ViewTransportationDetails
          modalId={"view-transportation-details"}
          data={invoiceTransportationDetails}
        />
      )}

      <WarningModal
        modalId={"delete-invoice"}
        modalContent={
          <>
            Are you sure that you want to delete invoice-
            <strong>
              {selectedRow?.invoice_no}(
              {selectedRow?.packing_list_no__packing_list_no})
            </strong>
            ?
          </>
        }
        onSubmit={handleDeleteInvoice}
      />
    </>
  );
};

export default Invoices;
