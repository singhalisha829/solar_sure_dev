import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getPurchaseOrders, getPurchaseOrderDetails } from "@/services/api";
import { requestHandler } from "@/services/ApiHandler";
import Table from "@/components/Table";
import Loading from "@/components/Loading";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { useModal } from "@/contexts/modal";
import Search from "@/components/shared/SearchComponent";
import Button from "@/components/shared/Button";
import { LocalStorageService } from "@/services/LocalStorageHandler";
import CustomPagination from "@/components/shared/Pagination";
import { TABLE_SIZE } from "@/utils/constants";

const PurchaseOrderItems = dynamic(
  () => import("@/components/modals/PurchaseOrder/PurchaseOrderDetails")
);

const PurchaseOrder = () => {
  const router = useRouter();
  const { openModal } = useModal();
  const [isLoading, setIsLoading] = useState(true);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [search, setSearch] = useState("");
  const [totalRowCount, setTotalRowCount] = useState(0);
  const [nopaPortalDetails, setNopaPortalDetails] = useState({
    baseUrl: "",
    token: "",
  });
  const [sortConfig, setSortConfig] = useState({
    key: "",
    direction: "",
  });
  const [filters, setFilters] = useState({
    page: 1,
    limit: TABLE_SIZE,
  });

  const accessibilityInfo =
    LocalStorageService.get("user_accessibility")?.accessibility[0]
      .purchase_order ?? {};

  const tableHeader = [
    {
      name: "Project",
      key: "project_name",
      sortable: true,
      width: "150px",
    },
    {
      name: "PO Number",
      key: "purchase_order_number",
      sortable: true,
      width: "150px",
    },
    {
      name: "Date",
      sortable: true,
      key: "purchase_order_date",
      type: "date",
      width: "100px",
    },
    {
      name: "Revision No",
      sortable: true,
      key: "revision_number",
      width: "130px",
    },
    {
      name: "Site",
      sortable: true,
      key: "site_name",
      width: "150px",
    },
    {
      name: "PO Amount(₹)",
      sortable: true,
      displayType: "price",
      key: "total_po_amount",
      width: "150px",
    },
    {
      name: "Vendor",
      sortable: true,
      key: "vendor_name",
      width: "TABLE_SIZE0px",
    },
    {
      name: "Status",
      sortable: true,
      key: "status",
      width: "10rem",
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
      type: "created_at",
      key: "created_at",
      width: "10rem",
    },
    {
      name: "Actions",
      type: "actions-column",
      actionType: accessibilityInfo?.edit_view ? "edit-download" : "download",
      onClickEdit: (row) => {
        router.push({
          pathname: `/purchase-order/${row.id}`,
          query: { project: row.project_id },
        });
      },
      onClickDownload: (row) => {
        handlePODownload(row.purchase_order_number);
      },
    },
  ];

  useEffect(() => {
    const poFilters = LocalStorageService.get("purchase_order_filters");
    if (poFilters) {
      setSearch(poFilters.search);
      getPurchaseOrderList({
        page: 1,
        limit: TABLE_SIZE,
        search: [poFilters.search],
      });
    } else {
      getPurchaseOrderList({ page: 1, limit: TABLE_SIZE });
    }
  }, []);

  const getPurchaseOrderList = async (queryParams = {}) => {
    await requestHandler(
      async () => await getPurchaseOrders(queryParams),
      null,
      (data) => {
        setPurchaseOrders(data.data.output);
        setNopaPortalDetails({
          baseUrl: data.download_base_url,
          token: data.NOPA_PORTAL_TOKEN,
        });
        setTotalRowCount(data.length);
        setIsLoading(false);
      },
      toast.error
    );
  };

  const handlePODownload = async (poNumber) => {
    try {
      const response = await fetch(
        `${nopaPortalDetails?.baseUrl}api/po/fetch-po-pdf/?po_no=${poNumber}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/pdf",
            Authorization: "Bearer " + nopaPortalDetails?.token,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch PDF");
      }

      const blob = await response.blob();

      // Create a URL for the PDF Blob
      const pdfUrl = URL.createObjectURL(blob);

      // Open PDF in a new tab
      window.open(pdfUrl, "_blank");
    } catch (error) {
      toast.error("Error fetching PDF:", error);
    }
  };

  const fetchPurchaseOrderItems = async (id) => {
    await requestHandler(
      async () => await getPurchaseOrderDetails({ id: id }),
      null,
      (data) => {
        setSelectedRow(data.data.output[0]);
        openModal("view-purchase-order-items");
      },
      toast.error
    );
  };

  const handlePageChange = (page) => {
    getPurchaseOrderList({ ...filters, search: [search], page: page });
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
    getPurchaseOrderList(pageFilters);
    setFilters({ ...filters, page: 1, limit: TABLE_SIZE });
    setSortConfig({ key: column, direction: direction });
  };

  const clearFilters = () => {
    LocalStorageService.remove("purchase_order_filters");
    setSearch("");
    setFilters({
      page: 1,
      limit: TABLE_SIZE,
    });
    getPurchaseOrderList({ limit: TABLE_SIZE, page: 1 });
    setSortConfig({
      key: "",
      direction: "",
    });
  };

  return (
    <>
      <div className="flex justify-between items-center gap-4">
        <h2 className="text-primary text-xl font-bold tracking-tight">
          Purchase Order
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
              getPurchaseOrderList({
                page: 1,
                limit: TABLE_SIZE,
                search: [data],
              });
              LocalStorageService.set("purchase_order_filters", {
                search: data,
              });
              setFilters({ ...filters, page: 1 });
            }}
            searchPlaceholder="Search.."
            value={search}
          />
        </div>
      </div>

      <div className="min-h-[85vh] overflow-hidden bg-white p-5">
        {!isLoading && (
          <div className="overflow-auto h-[95%] mb-2">
            <Table
              columns={tableHeader}
              rows={purchaseOrders}
              onRowClick={(row) => {
                fetchPurchaseOrderItems(row.id);
              }}
              prevPageRows={(filters.page - 1) * filters.limit}
              editPurchaseOrder={true}
              sortConfig={sortConfig}
              onColumnSort={handleTableSort}
            />
          </div>
        )}{" "}
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
        {isLoading && <Loading />}
        {selectedRow && <PurchaseOrderItems data={selectedRow} />}
      </div>
    </>
  );
};

export default PurchaseOrder;
