import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Table from "@/components/SortableTable";
import { requestHandler } from "@/services/ApiHandler";
import { toast } from "sonner";
import { fetchProjectReports } from "@/services/api";
import Loading from "@/components/Loading";
import { useModal } from "@/contexts/modal";
import dynamic from "next/dynamic";
import CustomPagination from "@/components/shared/Pagination";
import { usePagination } from "@/hooks/usePagination";

const WarningModal = dynamic(() => import("@/components/modals/WarningModal"));

const ProjectReport = () => {
  const router = useRouter();
  const { openModal, closeModal } = useModal();
  const { pagination, resetToPageOne, handlePageChange } = usePagination({
    defaultPage: 1,
    defaultLimit: 25
  });
  const [reportList, setReportList] = useState([]);
  const [reportListCount, setReportListCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRow, setSelectedRow] = useState(null);
  const [appliedFilters, setAppliedFilters] = useState({});
  const [filters, setFilters] = useState({
    start_date: null,
    end_date: null,
  });

  const tableHeader = [
    {
      name: "Project",
      key: "name",
      sortable: true,
      width: "190px",
    },
    {
      name: "Project Site",
      key: "project_site_name",
      sortable: true,
      width: "170px",
    },
    {
      name: "Company",
      key: "company_name",
      sortable: true,
      width: "220px",
    },
    {
      name: "Project Capacity(KW)",
      key: "project_capacity",
      sortable: true,
      displayType: "price",
      width: "170px",
    },
    {
      name: "PO Amount Without GST",
      key: "po_value_without_gst",
      sortable: true,
      displayType: "price",
      width: "170px",
    },
    {
      name: "PO Without GST per watt",
      key: "per_watt_po_amount_without_gst",
      sortable: true,
      displayType: "price",
      width: "170px",
    },
    {
      name: "Apprvoed BBU Amount",
      key: "approved_bbu_amount",
      displayType: "price",
      sortable: true,
      width: "170px",
    },
    {
      name: "Approved BBU per watt",
      key: "per_watt_approved_bbu_amount",
      displayType: "price",
      sortable: true,
      width: "150px",
    },
    {
      name: "Expected Profit",
      displayType: "price",
      sortable: true,
      key: "expected_profit",
      width: "170px",
    },
    {
      name: "Contingency Amount",
      displayType: "price",
      key: "contingecy_value",
      sortable: true,
      width: "170px",
    },
    {
      name: "Contingency(%)",
      key: "contingecy_percentage",
      sortable: true,
      width: "130px",
    },
    {
      name: "Contingency per watt",
      key: "contingecy_per_watt",
      displayType: "price",
      sortable: true,
      width: "170px",
    },
    {
      name: "New BBU Amount",
      key: "new_bbu_amount",
      displayType: "price",
      sortable: true,
      width: "170px",
    },
    {
      name: "New BBU per watt",
      sortable: true,
      displayType: "price",
      key: "new_bbu_per_watt",
      width: "170px",
    },
    {
      name: "Consumed Amount",
      key: "consumed_amount",
      type: "project_consumed_amount",
      sortable: true,
      width: "170px",
      onClick: (row) => {
        router.push({
          pathname: `/reports/project-report/${row.id}`,
          query: { name: row.name },
        });
      },
    },
    {
      name: "New Net Profit",
      sortable: true,
      displayType: "price",
      key: "new_net_profit",
      width: "170px",
    },
    {
      name: "Amount Received Till Date",
      key: "amount_received_till_date",
      displayType: "price",
      sortable: true,
      width: "170px",
    },
    {
      name: "Start Date",
      sortable: true,
      type: "date",
      key: "start_date",
      width: "150px",
    },
    {
      name: "Deadline Date",
      sortable: true,
      type: "date",
      key: "deadline_date",
      width: "150px",
    },
    {
      name: "Project Closing Date",
      sortable: true,
      displayType: "date",
      key: "project_closing_date",
      width: "170px",
    },
    {
      name: "Status",
      key: "status",
      sortable: true,
      width: "130px",
    },
    {
      name: "Additional PO",
      key: "is_additional_po_added",
      sortable: true,
      width: "170px",
    },
  ];

  useEffect(() => {
    getProjectReport();
  }, [pagination.page, pagination.limit]);

  const getProjectReport = async () => {
    await requestHandler(
      async () => await fetchProjectReports({
        page: pagination.page,
        limit: pagination.limit,
      }),
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
    const filteredObj = Object.fromEntries(
      Object.entries(pageFilters).filter(
        ([key, value]) => value !== null && value !== ""
      )
    );
    await getPaymentTrackingList(filteredObj);
    closeModal("apply-filter");
  };


  return (
    <>
      <div className="flex justify-between items-center gap-4">
        <h2 className="text-primary text-xl font-bold tracking-tight">
          Project Report
        </h2>
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

export default ProjectReport;
