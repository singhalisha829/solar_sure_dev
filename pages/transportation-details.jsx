import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Loading from "@/components/Loading";
import Button from "@/components/shared/Button";
import Table from "@/components/SortableTable";
import Search from "@/components/shared/SearchComponent";
import { FaFilter } from "react-icons/fa";
import { useModal } from "@/contexts/modal";
import { requestHandler } from "@/services/ApiHandler";
import { toast } from "sonner";
import {
  getDispatchDetailsList,
  getTransporterList,
  getInvoiceTransportationDetailsList,
  getInvoices,
  getPackingList,
  deleteTransportationDetails,
} from "@/services/api";
import { useProject } from "@/contexts/project";
import { dateFormatInYYYYMMDD } from "@/utils/formatter";
import dynamic from "next/dynamic";
import { addCommasToNumber } from "@/utils/numberHandler";
import { LocalStorageService } from "@/services/LocalStorageHandler";
import CustomPagination from "@/components/shared/Pagination";
import { usePagination } from "@/hooks/usePagination";

const Filter = dynamic(() => import("@/components/modals/Filter"));
const ViewTransportationDetails = dynamic(
  () => import("@/components/modals/ViewTransportationDetails")
);
const InvoiceItemList = dynamic(
  () => import("@/components/modals/InvoiceItemList")
);
const PackingListItems = dynamic(
  () => import("@/components/modals/PackingListItems")
);
const WarningModal = dynamic(() => import("@/components/modals/WarningModal"));
const EditTransportationDetails = dynamic(
  () => import("@/components/modals/AddTransportation")
);

const TransporterDetails = () => {
  const router = useRouter();
  const { projects, getProjectsHandler } = useProject();
  const { openModal, closeModal } = useModal();
  const { pagination, resetToPageOne, handlePageChange } = usePagination({
    defaultPage: 1,
    defaultLimit: 25
  });
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [transporterList, setTransporterList] = useState([]);
  const [invoiceTransporterList, setInvoiceTransporterList] = useState([]);
  const [totalTransporterListCount, setTotalTransporterListCount] = useState(0)
  const [invoiceTransportationDetails, setInvoiceTransportationDetails] =
    useState(null);
  const [invoiceDetails, setInvoiceDetails] = useState(null);
  const [packingListDetails, setPackingListDetails] = useState(null);
  const [totalTransportationCost, setTotalTransportationCost] = useState(0);
  const [selectedRow, setSelectedRow] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "",
    direction: "",
  });

  // Single source of truth for all filters
  const [filters, setFilters] = useState({
    transporter: null,
    project: null,
    start_date: null,
    end_date: null,
    search: "",
  });

  const accessibilityInfo =
    LocalStorageService.get("user_accessibility").accessibility[0].packing_list
      .pages.dispatch_details ?? {};

  const allowedActions =
    (accessibilityInfo?.edit_dispatch ? "edit-" : "") +
    (accessibilityInfo?.delete_dispatch ? "delete" : "");

  const tableHeader = [
    {
      name: "Company",
      sortable: true,
      key: "company_name",
      width: "9rem",
    },
    {
      name: "Project",
      sortable: true,
      key: "project_name",
      width: "9rem",
    },
    {
      name: "Site Address",
      sortable: true,
      key: "site_address",
      width: "15rem",
    },
    {
      name: "PO Number",
      sortable: true,
      key: "po_number",
      width: "9rem",
    },
    {
      name: "Packing List No.",
      sortable: true,
      key: "packing_list_no",
      width: "11rem",
      type: "clickable-data",
      onClickCell: (row) => {
        fetchPackingListDetails(row.packing_list_id);
      },
    },
    {
      name: "Packing List Date",
      sortable: true,
      width: "12rem",
      type: "date",
      key: "packing_list_date",
    },
    {
      name: "Packing List Reamrk",
      sortable: true,
      key: "packing_list_remark",
      width: "18rem",
    },
    {
      name: "Invoice No.",
      sortable: true,
      key: "invoice_no",
      width: "9rem",
      type: "clickable-data",
      onClickCell: (row) => {
        fetchInvoiceDetails(row.invoice_id);
      },
    },
    {
      name: "Invoice Amount(₹)",
      sortable: true,
      width: "12rem",
      displayType: "price",
      key: "invoice_amount",
    },
    {
      name: "Invoice Date",
      sortable: true,
      width: "10rem",
      type: "date",
      key: "invoice_date",
    },
    {
      name: "Invoice Doc",
      sortable: true,
      key: "invoice_no",
      type: "document",
      document_key: "invoice_doc",
      width: "10rem",
    },
    {
      name: "Vendor",
      sortable: true,
      width: "12rem",
      key: "vendor_name",
    },
    {
      name: "Transporter",
      sortable: true,
      key: "transporter_name",
      width: "15rem",
      type: "clickable-data",
      onClickCell: (row) => {
        fetchTransporationDetails(row.invoice_id);
      },
    },
    {
      name: "Dispatch Date",
      sortable: true,
      width: "10rem",
      type: "date",
      key: "dispatch_date",
    },
    {
      name: "Transportation Cost (₹ with GST)",
      sortable: true,
      width: "12rem",
      displayType: "price",
      key: "transportation_cost",
    },
    {
      name: "Vehicle/Docket No.",
      sortable: true,
      width: "12rem",
      key: "vehicle_or_docket_no",
    },
    {
      name: "Vehicle Size",
      sortable: true,
      width: "10rem",
      key: "vehicle_size",
    },
    {
      name: "LR No.",
      sortable: true,
      key: "lr_no",
      type: "document",
      document_key: "lr_doc",
      width: "8rem",
    },
    {
      name: "Eway Bill",
      sortable: true,
      key: "eway_bill_no",
      document_key: "eway_bill_doc",
      type: "document",
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
      name: "Reamrk",
      sortable: true,
      key: "remark",
      width: "18rem",
    },
    {
      name: "Action",
      type: "actions-column",
      actionType: allowedActions,
      onClickEdit: (row) => {
        setSelectedRow(row);
        openModal("edit-transportation-details");
      },
      onClickDelete: (row) => {
        setSelectedRow(row);
        openModal("delete-dispatch");
      },
    },
  ];

  const filterList = [
    {
      name: "Transporter",
      type: "dropdown",
      options: transporterList,
      optionName: "transporter_name",
      optionId: "id",
      key: "transporter",
    },
    {
      name: "Project",
      type: "dropdown",
      options: projects,
      optionName: "name",
      optionId: "id",
      key: "project",
    },
    {
      name: "Date Range",
      type: "date",
      key: "start_date",
      key2: "end_date",
    },
  ];

  // Load saved filters on component mount
  useEffect(() => {
    fetchTransporterList();
    getProjectsHandler();

    const savedFilters = LocalStorageService.get("dispatch_details_filters");

    if (savedFilters) {
      // Update search state if it exists in saved filters
      if (savedFilters.search) {
        setSearch(savedFilters.search);
      }

      // Update filters state with saved filters
      setFilters((prev) => ({
        ...prev,
        ...savedFilters,
      }));

      // Fetch data with saved filters
      fetchInvoiceTransportation(savedFilters);
    } else {
      // Fetch with default filters
      fetchInvoiceTransportation();
    }
  }, [pagination.page, pagination.limit]);

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

  const fetchInvoiceDetails = async (id) => {
    await requestHandler(
      async () => await getInvoices({ id: id }),
      setIsLoading,
      (data) => {
        setInvoiceDetails(data.data.output[0]);
        openModal("display-invoice-items");
      },
      toast.error
    );
  };

  const fetchPackingListDetails = async (id) => {
    await requestHandler(
      async () => await getPackingList({ id: id }),
      null,
      async (data) => {
        setPackingListDetails(data.data.output[0]);
        openModal("packing-list-items");
      },
      toast.error
    );
  };

  const fetchInvoiceTransportation = async (filterParams = {}) => {
    setIsLoading(true);
    const queryParams = {
      ...prepareFilterParams(filterParams),
      page: pagination.page,
      limit: pagination.limit,
    };

    await requestHandler(
      async () => await getDispatchDetailsList(queryParams),
      null,
      (data) => {
        setInvoiceTransporterList(data.data.output);
        setTotalTransporterListCount(data.data.length);
        let total_cost = 0;
        data.data.output.map((dispatch) => {
          total_cost += Number(dispatch.transportation_cost || 0);
        });
        setTotalTransportationCost(total_cost);
        setIsLoading(false);
      },
      (error) => {
        toast.error(error);
        setIsLoading(false);
      }
    );

    // Save filters to local storage
    LocalStorageService.set("dispatch_details_filters", filterParams);
  };

  const fetchTransporterList = async () => {
    await requestHandler(
      async () => await getTransporterList(),
      null,
      (data) => setTransporterList(data.data.output),
      toast.error
    );
  };

  // Handler for updating filters
  const updateFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  // Handler for applying filters
  const applyFilters = () => {
    // Reset to page 1 when applying filters
    resetToPageOne();

    // Apply current filters including search
    const currentFilters = {
      ...filters,
      search: search || "",
    };

    // Fetch with new filters
    fetchInvoiceTransportation(currentFilters);
    closeModal("apply-filter");
  };

  // Handle search changes
  const handleSearch = (searchTerm) => {
    // Reset to page 1 when searching
    resetToPageOne();

    setSearch(searchTerm);

    const updatedFilters = {
      ...filters,
      search: searchTerm,
    };

    setFilters(updatedFilters);
    fetchInvoiceTransportation(updatedFilters);
  };

  // Handle table sorting
  const handleTableSort = (column, direction) => {
    setSortConfig({ key: column, direction });

    const updatedFilters = {
      ...filters,
      ...(direction !== "none" && {
        sort_by: direction === "ascending" ? column : `-${column}`,
      }),
    };

    setFilters(updatedFilters);
    fetchInvoiceTransportation(updatedFilters);
  };

  // Clear all filters and reset to defaults
  const clearFilters = () => {
    // Reset to page 1 when clearing filters
    resetToPageOne(false);

    LocalStorageService.remove("dispatch_details_filters");
    setSearch("");
    setFilters({
      transporter: null,
      project: null,
      start_date: null,
      end_date: null,
      search: "",
    });
    setSortConfig({
      key: "",
      direction: "",
    });
    fetchInvoiceTransportation();
  };

  // Compute if any filters are applied (for UI indicators)
  const hasAppliedFilters = () => {
    return Object.entries(filters).some(
      ([_, value]) => value !== null && value !== ""
    );
  };

  // Count active filters for UI display
  const getActiveFilterCount = () => {
    let count = 0;
    const { search, start_date, end_date, ...otherFilters } = filters;

    // Count normal filters
    Object.values(otherFilters).forEach((value) => {
      if (value !== null && value !== "") count++;
    });

    // Count date range as one filter if either start or end date is set
    if (start_date || end_date) count++;

    return count;
  };

  const handleDeleteDispatch = async () => {
    await requestHandler(
      async () =>
        await deleteTransportationDetails(selectedRow?.transportation_id),
      null,
      async (data) => {
        toast.success("Dispatch Deleted Successfully!");
        closeModal("delete-dispatch");
        fetchInvoiceTransportation(filters);
      },
      toast.error
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center gap-4">
        <h2 className="text-orange-500 text-xl font-bold tracking-tight">
          Dispatch Details
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
      <h2 className="text-zinc-800 text-base font-bold tracking-tight">
        Total Transportation Cost: ₹{addCommasToNumber(totalTransportationCost)}
      </h2>

      {!isLoading && (
        <div className="min-h-[85vh] overflow-hidden bg-white p-5">
          <div className="overflow-auto h-[95%] mb-3">
            <Table
              columns={tableHeader}
              rows={invoiceTransporterList}
              sortConfig={sortConfig}
              onColumnSort={handleTableSort}
              prevPageRows={(pagination.page - 1) * pagination.limit}
              showSerialNumber={true}
            />
          </div>
          <div className="relative">
            <CustomPagination
              currentPage={pagination.page}
              totalRows={totalTransporterListCount}
              rowsPerPage={pagination.limit}
              onPageChange={handlePageChange}
            />
            <span className="absolute right-0 top-1">
              <strong>Total Count: </strong>
              {totalTransporterListCount}
            </span>
          </div>
        </div>
      )}
      {isLoading && <Loading />}
      {invoiceTransportationDetails && (
        <ViewTransportationDetails
          modalId={"view-transportation-details"}
          data={invoiceTransportationDetails}
        />
      )}

      {invoiceDetails && <InvoiceItemList details={invoiceDetails} />}
      {packingListDetails && <PackingListItems details={packingListDetails} />}
      <WarningModal
        modalId={"delete-dispatch"}
        modalContent={
          <>
            Are you sure that you want to delete dispatch-
            <strong>
              {selectedRow?.transporter}(Invoice - {selectedRow?.invoice_no},
              Packing List - {selectedRow?.packing_list_no})
            </strong>
            ?
          </>
        }
        onSubmit={handleDeleteDispatch}
      />
      <EditTransportationDetails
        modalId={"edit-transportation-details"}
        invoiceDetails={selectedRow}
        transporterList={transporterList}
        onSuccessfullSubmit={() => fetchInvoiceTransportation(filters)}
      />
    </div>
  );
};

export default TransporterDetails;
