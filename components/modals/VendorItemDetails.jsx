import { useState, useEffect } from "react";
import { getPackingList, getLedger } from "@/services/api";
import { requestHandler } from "@/services/ApiHandler";
import { toast } from "sonner";
import { useModal } from "@/contexts/modal";
import FormModal from "../shared/FormModal";
import ExpandableTable from "../project-components/ExpandableTable";

const VendorItemDetailsModal = ({ selectedItem }) => {
  const { closeModal } = useModal();
  const [stockInItemDetails, setStockInItemDetails] = useState([]);
  const [stockOutItemDetails, setStockOutItemDetails] = useState([]);
  const [activeTab, setActiveTab] = useState("Stock In");
  const [invoiceDetails, setInvoiceDetails] = useState({});
  const [packingListDetails, setPackingListDetails] = useState({});

  const tabs = ["Stock In", "Direct Dispatch to Site"];

  const stockInTableHeader = [
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
  ];

  const stockOutTableHeader = [
    {
      name: "Company Name",
      sortable: true,
      key: "project_company_name",
      width: "11rem",
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
      name: "Remark",
      sortable: true,
      key: "remark",
      width: "15rem",
    },
    {
      name: "PO Number",
      sortable: true,
      key: "po_number",
      width: "9rem",
    },
  ];

  const invoiceItemHeader = [
    {
      name: "Product Code",
      key: "product_code",
      width: "20%",
    },
    { name: "Name", key: "product_name", width: "30%" },
    {
      name: "Quantity",
      key: "quantity",
      width: "10%",
      type: "quantity_object",
    },

    {
      name: "Unit Price (₹)",
      key: "unit_price",
    },
  ];

  const packingListHeader = [
    {
      name: "Item Code",
      sortable: true,
      key: "project_bom_item_code",
      width: "13rem",
    },
    {
      name: "Item Name",
      sortable: true,
      key: "project_bom_item_name",
      width: "20rem",
    },
    {
      name: "Quantity",
      sortable: true,
      type: "packing_list_quantity",
      width: "10rem",
    },
    {
      name: "Remark",
      sortable: true,
      key: "remark",
    },
  ];

  useEffect(() => {
    if (selectedItem?.vendor?.id) {
      fetchStockInDetails();
      fetchStockOutDetails();
    }
  }, [selectedItem?.vendor?.id]);

  const fetchStockInDetails = async () => {
    await requestHandler(
      async () => await getLedger({ vendor: selectedItem?.vendor?.id }),
      null,
      (data) => setStockInItemDetails(data.data.output),
      toast.error
    );
  };

  const fetchStockOutDetails = async () => {
    await requestHandler(
      async () => await getPackingList({ vendor: selectedItem?.vendor?.id }),
      null,
      (data) => setStockOutItemDetails(data.data.output),
      toast.error
    );
  };

  const handleOnClose = () => {
    setActiveTab("Stock In");
    closeModal("show-inventory-details");
  };

  return (
    <FormModal
      id={"show-vendor-item-details"}
      width="w-[70%]"
      cancelButtonText={"Close"}
      onClose={handleOnClose}
      heading={`Vendor - ${selectedItem?.vendor?.name}`}
    >
      <span className="flex relative">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab(tab);
            }}
            className={`mr-4 flex px-4 py-1  ${activeTab === tab
              ? "border-b-2 border-b-primary text-primary  "
              : "border-transparent"
              } focus:outline-none`}
          >
            {tab}
          </button>
        ))}
      </span>
      {activeTab === "Stock In" && (
        <div className="overflow-x-auto">
          <ExpandableTable
            columns={stockInTableHeader}
            rows={stockInItemDetails}
            childrenColumns={invoiceItemHeader}
            childrenRows={invoiceDetails?.ledger_items ?? []}
            onRowClick={(row) => setInvoiceDetails(row)}
          />
        </div>
      )}

      {activeTab === "Direct Dispatch to Site" && (
        <div className="overflow-x-auto">
          <ExpandableTable
            columns={stockOutTableHeader}
            rows={stockOutItemDetails}
            childrenColumns={packingListHeader}
            childrenRows={packingListDetails?.packing_list_items ?? []}
            onRowClick={(row) => setPackingListDetails(row)}
          />
        </div>
      )}
    </FormModal>
  );
};

export default VendorItemDetailsModal;
