import { useState, useEffect } from "react";
import Loading from "@/components/Loading";
import { getLedger, deleteLedger } from "@/services/api";
import { requestHandler } from "@/services/ApiHandler";
import { toast } from "sonner";
import Table from "@/components/SortableTable";
import dynamic from "next/dynamic";
import { useModal } from "@/contexts/modal";
import { MdArrowForwardIos } from "react-icons/md";
import { useRouter } from "next/router";
import Search from "@/components/shared/SearchComponent";
import { FaFilter } from "react-icons/fa";
import { useVendors } from "@/contexts/vendors";
import Button from "@/components/shared/Button";
import { LocalStorageService } from "@/services/LocalStorageHandler";

const ProductDetails = dynamic(
  () => import("@/components/modals/LedgerItemDetails")
);
const Filter = dynamic(() => import("@/components/modals/Filter"));
const WarningModal = dynamic(() => import("@/components/modals/WarningModal"));

const Ledger = () => {
  const { openModal, closeModal } = useModal();
  const router = useRouter();
  const { vendors } = useVendors();
  const [ledger, setLedger] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRow, setSelectedRow] = useState(null);
  const [appliedFilters, setAppliedFilters] = useState({});
  const [search, setSearch] = useState("");
  const [selectedLedger, setSelectedLedger] = useState(null);

  const [filters, setFilters] = useState({
    vendor: "",
  });

  const filterList = [
    {
      name: "Vendor",
      type: "dropdown",
      options: vendors,
      optionName: "name",
      optionId: "id",
      key: "vendor",
    },
  ];

  const accessibilityInfo =
    LocalStorageService.get("user_accessibility")?.accessibility[0].inventory ??
    {};
  const allowedActions =
    "download-" +
    (accessibilityInfo?.ledger_edit ? "edit-" : "") +
    (accessibilityInfo?.ledger_delete ? "delete" : "");

  useEffect(() => {
    fetchLedgerDetails();
  }, []);

  const fetchLedgerDetails = async (queryParams = {}) => {
    await requestHandler(
      async () => await getLedger(queryParams),
      null,
      (data) => {
        setLedger(data.data.output);
        setIsLoading(false);
      },
      toast.error
    );
  };

  const handleDeleteLedger = async () => {
    await requestHandler(
      async () => await deleteLedger(selectedLedger.id),
      null,
      async (data) => {
        toast.success("Ledger Deleted Successfully...");
        closeModal("delete-ledger");
        fetchLedgerDetails();
      },
      toast.error
    );
  };

  const tableHeader = [
    {
      name: "Invoice Number",
      sortable: true,
      key: "document_id",
      width: "11rem",
    },
    {
      name: "Stock In Date",
      sortable: true,
      type: "date",
      key: "stock_in_date",
      width: "11rem",
    },
    { name: "Vendor", sortable: true, key: "vendor_name", width: "11rem" },
    {
      name: "Amount(₹)",
      sortable: true,
      key: "invoice_amount",
      displayType: "price",
      width: "8rem",
    },
    {
      name: "Invoice Date",
      sortable: true,
      type: "date",
      key: "invoice_date",
      width: "10rem",
    },
    { name: "Remark", sortable: true, key: "remark", width: "15rem" },
    { name: "PO Number", sortable: true, key: "po_no", width: "9rem" },
    {
      name: "Actions",
      type: "actions-column",
      actionType: allowedActions,
      width: "5rem",
      onClickDownload: (row) => {
        downloadDocument(row.id);
      },
      onClickEdit: (row) => {
        router.push(`/inventory/ledger/${row.id}/`);
      },
      onClickDelete: (row) => {
        setSelectedLedger(row);
        openModal("delete-ledger");
      },
    },
  ];

  const downloadDocument = (id) => {
    const selectedInvoiceDoc = ledger.filter((element) => element.id == id)[0]
      ?.invoice_doc;
    window.open(selectedInvoiceDoc, "_blank");
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
    await fetchLedgerDetails(filteredObj);
    closeModal("apply-filter");
  };

  const clearFilters = () => {
    setAppliedFilters({});
    setSearch("");
    setFilters({
      vendor: "",
    });
    fetchLedgerDetails();
  };

  return (
    <>
      <div className="flex justify-between items-center gap-4">
        <h2 className=" flex text-xl font-bold tracking-tight">
          <span
            className="flex text-orange-500 hover:underline underline-offset-4 cursor-pointer"
            onClick={() => router.push("/inventory")}
          >
            Inventory
          </span>
          <MdArrowForwardIos className="mt-1 text-orange-500" />
          Ledger
        </h2>

        <div className="flex items-center gap-2">
          {(Object.keys(appliedFilters).length > 0 || search !== "") && (
            <Button onClick={clearFilters} className={"px-2"}>
              Clear Filters
            </Button>
          )}
          <Search
            searchText={(data) => {
              setSearch(data);
              filterProjects({ ...filters, search: data });
            }}
            searchPlaceholder="Search.."
            value={search}
          />

          <Filter
            setFilters={handleFilters}
            filterData={filters}
            filterList={filterList}
            onSubmit={() =>
              filterProjects({ ...appliedFilters, search: search })
            }
          />
          <button
            onClick={() => openModal("apply-filter")}
            className={`flex items-center px-4 py-2 bg-neutral-400/10 text-neutral-400 rounded
              ${Object.keys(appliedFilters).length > 0 ? "text-primary" : ""}`}
          >
            <FaFilter />
            {Object.keys(appliedFilters).length > 0 &&
              `(${Object.keys(appliedFilters).length})`}
          </button>
        </div>
      </div>
      {!isLoading && (
        <div className="min-h-[85vh] overflow-hidden bg-white p-5">
          <div className="overflow-auto h-full">
            <Table
              columns={tableHeader}
              rows={ledger}
              onRowClick={(row) => {
                setSelectedRow(row);
                openModal("view-ledger-products");
              }}
              conditionallyDelete={true}
              conditionallyDeleteKey={"ledger_items"}
            />
          </div>
        </div>
      )}
      {isLoading && <Loading />}
      {selectedRow && (
        <ProductDetails data={selectedRow} modalId={"view-ledger-products"} />
      )}
      <WarningModal
        modalId={"delete-ledger"}
        modalContent={
          <>
            Are you sure that you want to delete ledger-
            <strong>{selectedLedger?.document_id}</strong>?
          </>
        }
        onSubmit={handleDeleteLedger}
      />
    </>
  );
};

export default Ledger;
