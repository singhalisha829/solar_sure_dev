import { useState, useEffect } from "react";
import {
  stockOutProductDetails,
  stockInProductDetails,
  getLedger,
  getPackingList,
} from "@/services/api";
import { requestHandler } from "@/services/ApiHandler";
import { toast } from "sonner";
import { useModal } from "@/contexts/modal";
import FormModal from "../shared/FormModal";
import { addCommasToNumber } from "@/utils/numberHandler";
import { SelectForObjects } from "../formPage/MultiSelectDropdown/MultiSelectDropdown";
import ExpandableTable from "../project-components/ExpandableTable";

const InventoryDetailModal = ({ selectedItem }) => {
  const { closeModal } = useModal();
  const [stockInItemDetails, setStockInItemDetails] = useState([]);
  const [stockOutItemDetails, setStockOutItemDetails] = useState([]);
  const [invoiceDetails, setInvoiceDetails] = useState({});
  const [packingListDetails, setPackingListDetails] = useState({});
  const [totalStockInQuantity, setTotalStockInQuantity] = useState(0);
  const [totalStockOutQuantity, setTotalStockOutQuantity] = useState(0);
  const [dispatchFrom, setDispatchFrom] = useState("All");
  const [activeTab, setActiveTab] = useState("Stock In");

  const tabs = ["Stock In", "Stock Out"];
  const dispatchFromList = [
    { name: "All" },
    { name: "Inventory", value: true },
    { name: "Vendor", value: false },
  ];

  const stockInTableHeader = [
    {
      name: "Invoice No.",
      width: "8rem",
      key: "document_id",
    },
    {
      name: "Invoice Amount(₹)",
      key: "invoice_amount",
      width: "10rem",
      displayType: "price",
    },
    {
      name: "PO Number",
      key: "po_no",
      width: "8rem",
    },
    {
      name: "Date",
      key: "stock_in_date",
      width: "8rem",
      type: "date",
    },
    {
      name: "Vendor",
      key: "vendor_name",
      width: "10rem",
    },
    {
      name: "Quantity",
      type: "quantity_object",
      key: "quantity",
      width: "6rem",
    },
    {
      name: "Unit Price(₹)",
      key: "unit_price",
      width: "8rem",
      displayType: "price",
    },
  ];

  const stockOutTableHeader = [
    {
      name: "Project",
      width: "10rem",
      key: "project_name",
    },
    {
      name: "Project Site",
      key: "project_site_name",
      width: "12rem",
    },
    {
      name: "Company",
      key: "project_company_name",
      width: "12rem",
    },
    {
      name: "Project Capacity(KW)",
      key: "project_capacity",
      width: "12rem",
    },
    {
      name: "Packing List No.",
      key: "packing_list_no",
      width: "12rem",
    },
    {
      name: "Date",
      type: "date",
      key: "date",
      width: "8rem",
    },
    {
      name: "Dispatch From",
      key: "vendor_name",
      width: "13rem",
    },
    {
      name: "Quantity",
      key: "quantity",
      key2: "unit_symbol",
      width: "8rem",
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
    if (selectedItem?.id) {
      fetchStockInDetails();
      fetchStockOutDetails();
    }
  }, [selectedItem]);

  const fetchStockInDetails = async () => {
    await requestHandler(
      async () => await stockInProductDetails(selectedItem?.id),
      null,
      (data) => {
        if (data.data.output.length > 0) {
          let sum = 0;
          data.data.output.map(
            (element) => (sum += Number(element.quantity.quantity))
          );
          setTotalStockInQuantity(sum);
        } else {
          setTotalStockInQuantity(0);
        }
        setStockInItemDetails(data.data.output);
      },
      toast.error
    );
  };

  const fetchStockOutDetails = async (isInventory = undefined) => {
    await requestHandler(
      async () => await stockOutProductDetails(selectedItem?.id, isInventory),
      null,
      (data) => {
        if (data.data.output.length > 0) {
          let sum = 0;
          data.data.output.map((element) => (sum += Number(element.quantity)));
          setTotalStockOutQuantity(sum);
        } else {
          setTotalStockOutQuantity(0);
        }
        setStockOutItemDetails(data.data.output);
      },
      toast.error
    );
  };

  const fetchInvoiceItems = async (row) => {
    await requestHandler(
      async () => await getLedger({ id: row.inventory_ledger_id }),
      null,
      (data) => setInvoiceDetails(data.data.output[0]),
      toast.error
    );
  };

  const fetchPackingListDetails = async (row) => {
    await requestHandler(
      async () => await getPackingList({ id: row.project_packing_list_id }),
      null,
      (data) => setPackingListDetails(data.data.output[0]),
      toast.error
    );
  };

  const handleOnClose = () => {
    setActiveTab("Stock In");
    closeModal("show-inventory-details");
    setDispatchFrom("All");
    setInvoiceDetails({});
    setPackingListDetails({});
  };

  return (
    <FormModal
      id={"show-inventory-details"}
      width="w-[70%]"
      cancelButtonText={"Close"}
      onClose={handleOnClose}
      heading={`Inventory - ${selectedItem?.product_code}(${selectedItem?.name})`}
    >
      <span className="flex relative">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab(tab);
            }}
            className={`mr-4 flex px-4 py-1  ${
              activeTab === tab
                ? "border-b-2 border-b-primary text-primary  "
                : "border-transparent"
            } focus:outline-none`}
          >
            {tab}
          </button>
        ))}
        {activeTab === "Stock Out" && (
          <div className={"absolute right-2"}>
            <SelectForObjects
              margin={"0px"}
              width={"15rem"}
              height={"36px"}
              setselected={(value) => {
                const selectedOption = dispatchFromList.filter(
                  (element) => element.name === value
                )[0];
                setDispatchFrom(value);
                fetchStockOutDetails(selectedOption?.value);
              }}
              selected={dispatchFrom}
              options={dispatchFromList}
              optionName={"name"}
              placeholder="Select"
              dropdownLabel={"Dispatch From"}
            />
          </div>
        )}
      </span>
      {activeTab === "Stock In" && (
        <div className="space-y-4 mb-4 overflow-x-auto">
          <span>
            <strong>Total Quantity: </strong>
            {addCommasToNumber(totalStockInQuantity)}
          </span>
          <div className="overflow-x-auto max-h-[20rem]">
            <ExpandableTable
              columns={stockInTableHeader}
              rows={stockInItemDetails}
              childrenColumns={invoiceItemHeader}
              childrenRows={invoiceDetails?.ledger_items ?? []}
              onRowClick={fetchInvoiceItems}
            />
          </div>
        </div>
      )}

      {activeTab === "Stock Out" && (
        <div className="space-y-4 mb-4 overflow-x-auto">
          <span>
            <strong>Total Quantity: </strong>
            {addCommasToNumber(totalStockOutQuantity)}
          </span>
          <div className="overflow-x-auto max-h-[20rem]">
            <ExpandableTable
              columns={stockOutTableHeader}
              rows={stockOutItemDetails}
              childrenColumns={packingListHeader}
              childrenRows={packingListDetails?.packing_list_items ?? []}
              onRowClick={fetchPackingListDetails}
            />
          </div>
        </div>
      )}
    </FormModal>
  );
};

export default InventoryDetailModal;
