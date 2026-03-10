import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Table from "@/components/SortableTable";
import { requestHandler } from "@/services/ApiHandler";
import { toast } from "sonner";
import { fetchPaymentTracking } from "@/services/api";
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

const PaymentTracking = () => {
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
  });

  const filterList = [
    {
      name: "Date Range",
      type: "date",
      key: "start_date",
      key2: "end_date",
    },
  ];

  const tableHeader = [
    {
      name: "Client",
      key: "company_name",
      sortable: true,
      width: "190px",
    },
    {
      name: "Project",
      key: "project_name",
      sortable: true,
      width: "170px",
    },
    {
      name: "Site",
      key: "site_address",
      sortable: true,
      width: "220px",
    },
    {
      name: "Project Capacity(KW)",
      key: "project_capacity",
      sortable: true,
      displayType: "price",
      width: "190px",
    },
    {
      name: "PO Date",
      key: "po_date",
      sortable: true,
      type: "date",
      width: "120px",
    },
    {
      name: "Project Budget per WP",
      key: "project_budget_per_wp",
      sortable: true,
      displayType: "price",
      width: "200px",
    },
    {
      name: "PO Value (Without Gst)(₹)",
      key: "po_value_without_gst",
      displayType: "price",
      sortable: true,
      width: "170px",
    },
    {
      name: "GST (₹)",
      key: "po_gst",
      displayType: "price",
      sortable: true,
      width: "130px",
    },
    {
      name: "PO Value(with Gst)(₹)",
      displayType: "price",
      sortable: true,
      key: "po_value_with_gst",
      width: "150px",
    },
    {
      name: "Amount Recieved From Customer(₹)",
      displayType: "price",
      key: "amount_recived_from_customer",
      sortable: true,
      width: "240px",
    },
    {
      name: "Reciept(₹)",
      displayType: "price",
      key: "paid_percentage",
      sortable: true,
      width: "130px",
    },
    {
      name: "Amount Pending(₹)",
      key: "pending_amount",
      displayType: "price",
      sortable: true,
      width: "170px",
    },
    {
      name: "Pending Receipt(%)",
      key: "pending_receipt_percentage",
      displayType: "price",
      sortable: true,
      width: "170px",
    },
    {
      name: "Billing Amount Till Date(Without GST)",
      sortable: true,
      displayType: "price",
      key: "billing_till_date_without_gst",
      width: "220px",
    },
    {
      name: "Billing Amount Till Date(With GST)",
      sortable: true,
      displayType: "price",
      key: "billing_till_date_with_gst",
      width: "200px",
    },
    {
      name: "Billing(%)",
      key: "billing_percentage",
      sortable: true,
      displayType: "price",
      width: "130px",
    },
    {
      name: "Balance Billing(₹)",
      key: "balance_billing",
      displayType: "price",
      sortable: true,
      width: "170px",
    },
    {
      name: "Last Billing Date",
      key: "last_billing_date",
      sortable: true,
      width: "170px",
    },
    {
      name: "Salesperson",
      key: "sales_person",
      sortable: true,
      width: "220px",
    },
  ];

  useEffect(() => {
    getPaymentTrackingList();
  }, [pagination.page, pagination.limit]);

  const getPaymentTrackingList = async (queryParams = {}) => {
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
      async () => await fetchPaymentTracking(queryParams),
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
    await getPaymentTrackingList({ ...filteredObj, page: 1, limit: pagination.limit });
    closeModal("apply-filter");
  };

  return (
    <>
      <div className="flex justify-between items-center gap-4">
        <h2 className="text-primary text-xl font-bold tracking-tight">
          Payment Tracking
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
                });
                resetToPageOne();
                getPaymentTrackingList({ page: 1, limit: pagination.limit }); // Fetch immediately with reset params
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
              getPaymentTrackingList({ search: data, page: 1, limit: pagination.limit });
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

export default PaymentTracking;
