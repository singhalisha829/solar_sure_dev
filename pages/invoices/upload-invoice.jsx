import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { LocalStorageService } from "@/services/LocalStorageHandler";
import Button from "@/components/shared/Button";
import Input from "@/components/formPage/Input";
import {
  getPackingList,
  uploadPackingListInvoice,
  getInvoices,
  getTransporterList,
} from "@/services/api";
import { requestHandler } from "@/services/ApiHandler";
import { toast } from "sonner";
import { MdArrowForwardIos } from "react-icons/md";
import ProjectItemTable from "@/components/project-components/ProjectItemTable";
import { handleFileUpload } from "@/utils/documentUploadHandler";
import { FaEye } from "react-icons/fa";
import { checkSpecificKeys } from "@/utils/formValidationHandler";
import Table from "@/components/SortableTable";
import { useModal } from "@/contexts/modal";
import dynamic from "next/dynamic";
import { useVendors } from "@/contexts/vendors";
import { SelectForObjects } from "@/components/formPage/MultiSelectDropdown/MultiSelectDropdown";

const InvoiceItemList = dynamic(
  () => import("@/components/modals/InvoiceItemList")
);
const AddTransportationDetails = dynamic(
  () => import("@/components/modals/AddTransportation")
);
const UploadInvoice = () => {
  const router = useRouter();
  const { vendors } = useVendors();
  const { openModal } = useModal();
  const [breadcrumbsText, setBreadcrumbsText] = useState(null);
  const [packingListDetails, setPackingListDetails] = useState(null);
  const [errorRows, setErrorRows] = useState([]);
  const [invoiceList, setInvoiceList] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [invoiceId, setInvoiceId] = useState(null);
  const [transporterList, setTransporterList] = useState([]);
  const [isSuccessUpload, setIsSuccessUpload] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    invoice_no: "",
    invoice_amount_without_gst: "",
    invoice_amount_with_gst: "",
    invoice_date: "",
    invoice_doc: "",
    remark: "",
    vendor: "",
    invoice_type: "Ornate Invoice",
  });

  const invoiceTypeList = [
    { name: "Ornate Invoice" },
    { name: "Delivery Challan" },
    { name: "Vendor Invoice" },
    { name: "SG Invoice" },
    { name: "SG Delivery Challan" },
  ];

  const tableHeader = [
    {
      name: "Item Code",
      key: "project_bom_item_code",
      width: "130px",
    },
    {
      name: "Item Name",
      key: "project_bom_item_name",
      width: "180px",
    },
    {
      name: "BOM Quantity",
      key: "booked_quantity",
      key2: "unit_symbol",
      type: "upload_invoice_quantity",
      width: "120px",
    },
    {
      name: "Left Quantity",
      key: "left_quantity",
      key2: "unit_symbol",
      width: "120px",
    },
    {
      name: "Quantity",
      key: "quantity",
      type: "number",
      width: "100px",
    },
    {
      name: "Unit Price",
      key: "unit_price",
      type: "number",
      width: "100px",
    },
    {
      name: "Taxable Amount",
      key: "taxable_amount",
      width: "140px",
    },
    {
      name: "Tax Rate(%)",
      key: "tax_rate",
      type: "number",
      width: "130px",
    },
    {
      name: "Tax Amount",
      key: "tax_amount",
      width: "110px",
    },
    {
      name: "Total Amount",
      key: "total_amount",
      width: "130px",
    },
    {
      name: "Remark",
      key: "remark",
      width: "200px",
    },
  ];

  const tableHeaderForInvoices = [
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
    },
    {
      name: "Invoice No.",
      key: "invoice_no",
      type: "document",
      document_key: "invoice_doc",
      width: "10rem",
    },
    {
      name: "Date",
      type: "date",
      sortable: true,
      key: "invoice_date",
      width: "8rem",
    },
    {
      name: "Dispatch From",
      sortable: true,
      key: "vendor_name",
      width: "13rem",
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
      name: "Remark",
      sortable: true,
      key: "remark",
      width: "15rem",
    },
  ];

  useEffect(() => {
    const details = LocalStorageService.get("upload-packing-list-invoice");
    if (details) {
      setFormData({ ...formData, vendor: details.vendor });
      fetchPackingListDetails({ id: details.id });
      fetchPackingListInvoice({ packing_list: details.id });
      fetchTransporterList();
      //   setFormData({project:details.project,packing_list_no:det})
    }
  }, []);

  const fetchTransporterList = async () => {
    await requestHandler(
      async () => await getTransporterList(),
      null,
      (data) => setTransporterList(data.data.output),
      toast.error
    );
  };

  const fetchPackingListDetails = async (queryParams = {}) => {
    await requestHandler(
      async () => await getPackingList(queryParams),
      null,
      async (data) => {
        let item_list = [];
        data.data.output[0].packing_list_items.map((item) => {
          item.booked_quantity = item.quantity;
          item.quantity = item.left_quantity;
          if (item.left_quantity != 0) {
            item_list.push(item);
          }
        });
        setPackingListDetails({
          ...data.data.output[0],
          packing_list_items: item_list,
        });
        setBreadcrumbsText(data.data.output[0].packing_list_no);
      },
      toast.error
    );
  };

  const fetchPackingListInvoice = async (queryParams = {}) => {
    await requestHandler(
      async () => await getInvoices(queryParams),
      null,
      async (data) => {
        if (data.data.output.length > 0) {
          setInvoiceList(data.data.output);
        }
      },
      toast.error
    );
  };

  const valueHandler = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const tableValueHandler = (key, value, index) => {
    const updatedItemList = [...packingListDetails.packing_list_items];

    // Update the selected item in both lists
    let selectedItem = {};
    let taxable_amount = 0,
      tax_amount = 0,
      total_amount = 0;
    if (
      key[0] === "quantity" &&
      Number(value) > packingListDetails.packing_list_items[index].left_quantity
    ) {
      selectedItem = { ...updatedItemList[index], [key]: 0 };
    } else {
      selectedItem = { ...updatedItemList[index], [key]: value };
      // Calculate the amounts
      taxable_amount =
        Number(selectedItem.quantity || 0) *
        Number(selectedItem.unit_price || 0) || 0;
      tax_amount =
        (taxable_amount * Number(selectedItem.tax_rate || 0)) / 100 || 0;
      total_amount = taxable_amount + tax_amount;

      // Update the selected item with the calculated amounts
      selectedItem.taxable_amount = taxable_amount.toFixed(2);
      selectedItem.tax_amount = tax_amount.toFixed(2);
      selectedItem.total_amount = total_amount.toFixed(2);

      // Update the item in the item list
      updatedItemList[index] = selectedItem;
    }
    // Update the state
    setPackingListDetails({
      ...packingListDetails,
      packing_list_items: updatedItemList,
    });
  };

  const handleFile = async (e) => {
    const response = await handleFileUpload(e.target.files[0]);
    if (response.type === "success") {
      setFormData({ ...formData, invoice_doc: response.data });
    } else {
      toast.error(response.error || "Oops! Something went wrong");
    }
  };

  const handleFormValidation = (isAddTransportationDetails = false) => {
    const keysToCheck = {
      invoice_no: "Invoice No.",
      invoice_date: "Invoice Date",
      invoice_amount_without_gst: "Invoice Amount (Without Tax)",
      invoice_amount_with_gst: "Invoice Amount (With Tax)",
    };

    const validationResult = checkSpecificKeys(formData, keysToCheck);

    if (validationResult.isValid === false) {
      toast.error(validationResult.message);
      return;
    }

    // validate all fields in table
    let invalid_items = [],
      valid_items = [];
    packingListDetails.packing_list_items.map((product, index) => {
      if (
        (product.unit_price ?? "") === "" &&
        (product.tax_rate ?? "") === ""
      ) {
        return;
      } else if (
        !product.unit_price ||
        !product.tax_rate ||
        !product.quantity
      ) {
        invalid_items.push(product);
      } else {
        valid_items.push(product);
      }
    });

    if (invalid_items.length > 0) {
      setErrorRows(invalid_items);
      toast.error("Please provide complete details for the highlighted items!");
      return;
    }

    if (valid_items.length === 0) {
      toast.error("Please enter details for at least one Item!");
      return;
    }
    setErrorRows([]);
    uploadInvoiceDetails(valid_items, isAddTransportationDetails);
  };

  const uploadInvoiceDetails = async (
    packing_list_items,
    isAddTransportationDetails = false
  ) => {
    let list = [];
    packing_list_items.map((item) => {
      const obj = { ...item, packing_list_item: item.id };
      delete obj.id;
      list.push(obj);
    });
    let apiData = {
      project: packingListDetails.project,
      packing_list_no: packingListDetails.id,
      transaction_type: "CREDIT",
      vendor: formData.vendor,
      remark: formData.remark,
      invoice_items: list,
    };

    if (formData.invoice_type === "Ornate Invoice") {
      apiData = {
        ...apiData,
        invoice_no: formData.invoice_no,
        invoice_amount_without_gst: formData.invoice_amount_without_gst,
        invoice_amount_with_gst: formData.invoice_amount_with_gst,
        invoice_date: formData.invoice_date,
        invoice_doc: formData.invoice_doc,
      };
    } else if (formData.invoice_type === "Delivery Challan") {
      apiData = {
        ...apiData,
        delivery_challan_no: formData.invoice_no,
        delivery_challan_amount_without_gst:
          formData.invoice_amount_without_gst,
        delivery_challan_amount_with_gst: formData.invoice_amount_with_gst,
        delivery_challan_date: formData.invoice_date,
        delivery_challan_doc: formData.invoice_doc,
      };
    } else if (formData.invoice_type === "Vendor Invoice") {
      apiData = {
        ...apiData,
        vendor_invoice_no: formData.invoice_no,
        vendor_invoice_amount_without_gst: formData.invoice_amount_without_gst,
        vendor_invoice_amount_with_gst: formData.invoice_amount_with_gst,
        vendor_invoice_date: formData.invoice_date,
        vendor_invoice_doc: formData.invoice_doc,
      };
    } else if (formData.invoice_type === "SG Invoice") {
      apiData = {
        ...apiData,
        sg_invoice_no: formData.invoice_no,
        sg_invoice_amount_without_gst: formData.invoice_amount_without_gst,
        sg_invoice_amount_with_gst: formData.invoice_amount_with_gst,
        sg_invoice_date: formData.invoice_date,
        sg_invoice_doc: formData.invoice_doc,
      };
    } else if (formData.invoice_type === "SG Delivery Challan") {
      apiData = {
        ...apiData,
        sg_delivery_challan_no: formData.invoice_no,
        sg_delivery_challan_amount_without_gst:
          formData.invoice_amount_without_gst,
        sg_delivery_challan_amount_with_gst: formData.invoice_amount_with_gst,
        sg_delivery_challan_date: formData.invoice_date,
        sg_delivery_challan_doc: formData.invoice_doc,
      };
    }

    await requestHandler(
      async () => await uploadPackingListInvoice(apiData),
      setIsProcessing,
      async (data) => {
        toast.success("Invoice Uploaded Successfully!");
        setIsSuccessUpload(true);
        if (isAddTransportationDetails) {
          setInvoiceId(data.status.last_id);
          openModal("add-transportation-details");
        } else {
          router.back();
        }
      },
      toast.error
    );
  };

  return (
    <div className="overflow-y-auto">
      <div className="flex justify-between items-center gap-4 mb-4">
        <h2 className=" flex text-xl font-bold tracking-tight">
          <span
            className="text-primary hover:underline underline-offset-4 cursor-pointer"
            onClick={() => router.back()}
          >
            {breadcrumbsText}
          </span>
          <MdArrowForwardIos className="mt-1 text-primary" />
          Upload Invoice
        </h2>
      </div>
      {packingListDetails?.packing_list_items.length > 0 && (
        <div className=" bg-white rounded overflow-y-scroll p-5">
          <div className="relative flex flex-col gap-4 p-5 border border-zinc-100  overflow-scroll rounded-md grow h-full">
            <div className="grid grid-cols-2 gap-4">
              <SelectForObjects
                margin={"0px"}
                mandatory
                height={"36px"}
                disabled={true}
                setselected={(name, id) => {
                  const selectedOption = vendors.find(
                    (option) => option.name === name
                  );
                  setFormData((prev) => ({
                    ...prev,
                    vendor: Number(selectedOption?.id),
                  }));
                }}
                selected={
                  vendors.find((vendor) => vendor.id == formData.vendor)?.name
                }
                options={vendors}
                optionName={"name"}
                placeholder="Select.."
                dropdownLabel="Dispatch From"
              />
              <SelectForObjects
                margin={"0px"}
                mandatory
                height={"36px"}
                setselected={(name) =>
                  setFormData((prev) => ({
                    ...prev,
                    invoice_type: name,
                  }))
                }
                selected={formData.invoice_type}
                options={invoiceTypeList}
                optionName={"name"}
                placeholder="Select.."
                dropdownLabel="Invoice Type"
              />
              <Input
                type="text"
                value={formData.invoice_no}
                onChange={valueHandler}
                label={`${formData.invoice_type} No.`}
                mandatory={true}
                name="invoice_no"
              />
              <Input
                type="date"
                value={formData.invoice_date}
                onChange={valueHandler}
                label={`${formData.invoice_type} Date`}
                mandatory={true}
                name="invoice_date"
              />
              <Input
                type="number"
                value={formData.invoice_amount_without_gst}
                onChange={valueHandler}
                label={`${formData.invoice_type} Amount (Without tax)`}
                name="invoice_amount_without_gst"
                mandatory={true}
              />
              <Input
                type="number"
                value={formData.invoice_amount_with_gst}
                onChange={valueHandler}
                mandatory={true}
                label={`${formData.invoice_type} Amount (With tax)`}
                name="invoice_amount_with_gst"
              />
              <span className="w-full flex gap-2 items-end">
                <Input
                  type="file"
                  onChange={handleFile}
                  label={`${formData.invoice_type} Doc`}
                />
                {formData.invoice_doc && formData.invoice_doc !== "" && (
                  <FaEye
                    size={15}
                    className="cursor-pointer mb-3"
                    onClick={() => window.open(formData.invoice_doc, "__blank")}
                  />
                )}
              </span>
              <Input
                type="textarea"
                value={formData.remark}
                onChange={valueHandler}
                label={"Remark"}
                outerClass="col-span-2"
                name="remark"
              />
            </div>
            {packingListDetails && (
              <div className="overflow-x-auto">
                {" "}
                <ProjectItemTable
                  columns={tableHeader}
                  rows={packingListDetails?.packing_list_items}
                  isEditMode={true}
                  valueHandler={tableValueHandler}
                  errorRows={errorRows}
                  errorRowIdName={"id"}
                  showSerialNumber={true}
                />
              </div>
            )}

            <div className=" w-full flex justify-end gap-2.5">
              <Button
                variant="inverted"
                className=" w-[5rem] mr-2 border bg-white border-dark-bluish-green px-2 text-xs"
                customText={true}
              >
                Clear
              </Button>
              {!isSuccessUpload &&
                <Button
                  disabled={isProcessing}
                  className=" h-[2rem] px-4"
                  onClick={() => handleFormValidation(false)}
                >
                  Submit
                </Button>}
              <Button
                disabled={isProcessing}
                className=" h-[2rem] px-4"
                onClick={() => isSuccessUpload ? openModal("add-transportation-details") : handleFormValidation(true)}
              >
                Add Transportation Details
              </Button>
            </div>
          </div>
        </div>
      )}

      {invoiceList.length > 0 && (
        <div className=" bg-white rounded  overflow-scroll p-5 mt-4">
          <h4 className="text-lg font-semibold mb-2">Invoice List</h4>
          <div className="overflow-x-auto h-full">
            <Table
              columns={tableHeaderForInvoices}
              rows={invoiceList}
              isEditMode={true}
              onRowClick={(row) => {
                setSelectedRow(row);
                openModal("display-invoice-items");
              }}
            />
          </div>
        </div>
      )}
      {selectedRow && <InvoiceItemList details={selectedRow} />}
      <AddTransportationDetails
        modalId={"add-transportation-details"}
        invoiceDetails={{ id: invoiceId }}
        transporterList={transporterList}
        onSuccessfullSubmit={() => router.back()}
      />
    </div>
  );
};

export default UploadInvoice;
