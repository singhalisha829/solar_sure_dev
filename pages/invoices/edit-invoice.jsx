import { useEffect, useState } from "react";
import { MdArrowForwardIos } from "react-icons/md";
import { LocalStorageService } from "@/services/LocalStorageHandler";
import Table from "@/components/SortableTable";
import {
  getInvoices,
  getPackingList,
  editPackingListInvoice,
  deletePackingListInvoice,
} from "@/services/api";
import { requestHandler } from "@/services/ApiHandler";
import { toast } from "sonner";
import Button from "@/components/shared/Button";
import { FaPlusCircle, FaEye } from "react-icons/fa";
import { useModal } from "@/contexts/modal";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import Input from "@/components/formPage/Input";
import { SelectForObjects } from "@/components/formPage/MultiSelectDropdown/MultiSelectDropdown";
import { useVendors } from "@/contexts/vendors";
import { handleFileUpload } from "@/utils/documentUploadHandler";

const AddInvoiceItem = dynamic(
  () => import("@/components/modals/AddInvoiceItemsModal")
);
const WarningModal = dynamic(() => import("@/components/modals/WarningModal"));

const EditInvoice = () => {
  const router = useRouter();
  const { openModal, modals, closeModal } = useModal();
  const { vendors } = useVendors();
  const [packingListDetails, setPackingListDetails] = useState(null);
  const [editData, setEditData] = useState({});
  const [formData, setFormData] = useState({});

  const accessibilityInfo =
    LocalStorageService.get("user_accessibility").accessibility[0].packing_list
      .pages.ornate_invoices ?? {};

  const tableHeader = [
    {
      name: "Item Code",
      key: "project_bom_item_code",
      width: "8rem",
    },
    {
      name: "Quantity",
      key: "quantity",
      key2: "unit_symbol",
      width: "6rem",
    },
    {
      name: "Unit Price(₹)",
      key: "unit_price",
      width: "8rem",
    },
    {
      name: "Taxable Amount(₹)",
      width: "11rem",
      key: "taxable_amount",
    },
    {
      name: "Tax Rate(%)",
      key: "tax_rate",
      type: "number",
      width: "8rem",
    },
    {
      name: "Tax Amount(₹)",
      key: "tax_amount",
      width: "130px",
    },
    {
      name: "Total Amount(₹)",
      key: "total_amount",
      width: "130px",
    },
    {
      name: "Remark",
      key: "description",
      width: "200px",
    },
    {
      name: "Action",
      type: "actions-column",
      actionType: "delete",
      onClickDelete: (row) => {
        deleteItem(row.id);
      },
    },
  ];

  useEffect(() => {
    const details = LocalStorageService.get("edit-invoice");
    if (details) {
      setFormData(details);
      fetchPackingListDetails({ id: details.packing_list_id });
    }
  }, []);

  const fetchInvoiceDetails = async (queryParams = {}) => {
    await requestHandler(
      async () => await getInvoices(queryParams),
      null,
      (data) => {
        setFormData(data.data.output[0]);
        LocalStorageService.set("edit-invoice", data.data.output[0]);
      },
      toast.error
    );
  };

  const deleteItem = async (id) => {
    let apiData = {
      invoice_items: [{ transaction_type: "DEBIT", invoice_item_id: id }],
    };
    await requestHandler(
      async () => await editPackingListInvoice(formData.id, apiData),
      null,
      async (data) => {
        toast.success("Invoice Item Removed Successfully!");
        fetchInvoiceDetails({ id: formData.id });
        fetchPackingListDetails({ id: formData.packing_list_id });
      },
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
      },
      toast.error
    );
  };

  const valueHandler = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setEditData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFile = async (e, key) => {
    const response = await handleFileUpload(e.target.files[0]);
    if (response.type === "success") {
      setFormData({ ...formData, [key]: response.data });
      setEditData({ ...editData, [key]: response.data });
    } else {
      toast.error(response.error || "Oops! Something went wrong");
    }
  };

  const handleAddNewItems = async (items) => {
    items.map((item) => {
      item.transaction_type = "CREDIT";
      item.packing_list_item = item.id;
    });
    let apiData = {
      invoice_items: items,
    };

    await requestHandler(
      async () => await editPackingListInvoice(formData.id, apiData),
      null,
      async (data) => {
        closeModal("add-packing-list-item");
        toast.success("Items Added Successfully!");
        fetchPackingListDetails({ id: packingListDetails.id });
        fetchInvoiceDetails({ id: formData.id });
      },
      toast.error
    );
  };

  const handleEditInvoice = async () => {
    await requestHandler(
      async () => await editPackingListInvoice(formData.id, editData),
      null,
      async (data) => {
        toast.success("Invoice Saved Successfully!");
        router.push("/invoices/");
      },
      toast.error
    );
  };

  const handleDeleteInvoice = async () => {
    await requestHandler(
      async () => await deletePackingListInvoice(formData?.id),
      null,
      async (data) => {
        toast.success("Invoice Deleted Successfully!");
        closeModal("delete-invoice");
        router.back();
      },
      toast.error
    );
  };

  return (
    <>
      <div className="flex justify-between items-center gap-4">
        <h2 className=" flex text-xl font-bold tracking-tight">
          <span
            className="text-primary hover:underline underline-offset-4 cursor-pointer"
            onClick={() => router.back()}
          >
            Back
          </span>{" "}
          <MdArrowForwardIos className="mt-1 text-primary" />
          Edit Invoice
        </h2>
        {formData?.invoice_items?.length === 0 &&
          accessibilityInfo?.delete_invoice && (
            <Button
              onClick={() => openModal("delete-invoice")}
              variant={"inverted"}
              size={"small"}
              customText={"#F47920"}
              className="bg-red-400/10 text-red-500 px-2 hover:bg-red-600/10 "
            >
              Delete
            </Button>
          )}
      </div>
      <div className=" bg-white rounded  overflow-scroll p-5">
        <div className="relative flex flex-col gap-4 p-5 border border-zinc-100  overflow-scroll rounded-md grow h-full">
          {formData && (
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
                dropdownLabel="Vendor"
              />

              {/* display ornate invoice details */}
              <strong className="col-span-2">Ornate Invoice Details</strong>
              <Input
                type="text"
                value={formData.invoice_no}
                onChange={valueHandler}
                label={"Invoice No."}
                mandatory={true}
                name="invoice_no"
              />
              <Input
                type="date"
                value={formData.invoice_date}
                onChange={valueHandler}
                label={"Invoice Date"}
                mandatory={true}
                name="invoice_date"
              />
              <Input
                type="number"
                value={formData.invoice_amount_without_gst}
                onChange={valueHandler}
                label={"Invoice Amount (Without tax)"}
                name="invoice_amount_without_gst"
                mandatory={true}
              />
              <Input
                type="number"
                value={formData.invoice_amount_with_gst}
                onChange={valueHandler}
                label={"Invoice Amount (With tax)"}
                name="invoice_amount_with_gst"
                mandatory={true}
              />
              <span className="w-full flex gap-2 items-end">
                <Input
                  type="file"
                  onChange={(e) => handleFile(e, "invoice_doc")}
                  label={"Invoice Doc"}
                />
                {formData.invoice_doc && formData.invoice_doc !== "" && (
                  <FaEye
                    size={15}
                    className="cursor-pointer mb-3"
                    onClick={() => window.open(formData.invoice_doc, "__blank")}
                  />
                )}
              </span>

              {/* display delivery challan details */}
              <strong className="col-span-2">Delivery Challan Details</strong>
              <Input
                type="text"
                value={formData.delivery_challan_no}
                onChange={valueHandler}
                label={"Invoice No."}
                mandatory={true}
                name="delivery_challan_no"
              />
              <Input
                type="date"
                value={formData.delivery_challan_date}
                onChange={valueHandler}
                label={"Invoice Date"}
                mandatory={true}
                name="delivery_challan_date"
              />
              <Input
                type="number"
                value={formData.delivery_challan_amount_without_gst}
                onChange={valueHandler}
                label={"Invoice Amount (Without tax)"}
                name="delivery_challan_amount_without_gst"
                mandatory={true}
              />
              <Input
                type="number"
                value={formData.delivery_challan_amount_with_gst}
                onChange={valueHandler}
                label={"Invoice Amount (With tax)"}
                name="delivery_challan_amount_with_gst"
                mandatory={true}
              />
              <span className="w-full flex gap-2 items-end">
                <Input
                  type="file"
                  onChange={(e) => handleFile(e, "delivery_challan_doc")}
                  label={"Invoice Doc"}
                />
                {formData.delivery_challan_doc &&
                  formData.delivery_challan_doc !== "" && (
                    <FaEye
                      size={15}
                      className="cursor-pointer mb-3"
                      onClick={() =>
                        window.open(formData.delivery_challan_doc, "__blank")
                      }
                    />
                  )}
              </span>

              {/* display vendor invoice details */}
              <strong className="col-span-2">Vendor Invoice Details</strong>
              <Input
                type="text"
                value={formData.vendor_invoice_no}
                onChange={valueHandler}
                label={"Invoice No."}
                mandatory={true}
                name="vendor_invoice_no"
              />
              <Input
                type="date"
                value={formData.vendor_invoice_date}
                onChange={valueHandler}
                label={"Invoice Date"}
                mandatory={true}
                name="vendor_invoice_date"
              />
              <Input
                type="number"
                value={formData.vendor_invoice_amount_without_gst}
                onChange={valueHandler}
                label={"Invoice Amount (Without tax)"}
                name="vendor_invoice_amount_without_gst"
                mandatory={true}
              />
              <Input
                type="number"
                value={formData.vendor_invoice_amount_with_gst}
                onChange={valueHandler}
                label={"Invoice Amount (With tax)"}
                name="vendor_invoice_amount_with_gst"
                mandatory={true}
              />
              <span className="w-full flex gap-2 items-end">
                <Input
                  type="file"
                  onChange={(e) => handleFile(e, "vendor_invoice_doc")}
                  label={"Invoice Doc"}
                />
                {formData.vendor_invoice_doc &&
                  formData.vendor_invoice_doc !== "" && (
                    <FaEye
                      size={15}
                      className="cursor-pointer mb-3"
                      onClick={() =>
                        window.open(formData.vendor_invoice_doc, "__blank")
                      }
                    />
                  )}
              </span>

              {/* display sg invoice details */}
              <strong className="col-span-2">SG Invoice Details</strong>
              <Input
                type="text"
                value={formData.sg_invoice_no}
                onChange={valueHandler}
                label={"Invoice No."}
                mandatory={true}
                name="sg_invoice_no"
              />
              <Input
                type="date"
                value={formData.sg_invoice_date}
                onChange={valueHandler}
                label={"Invoice Date"}
                mandatory={true}
                name="sg_invoice_date"
              />
              <Input
                type="number"
                value={formData.sg_invoice_amount_without_gst}
                onChange={valueHandler}
                label={"Invoice Amount (Without tax)"}
                name="sg_invoice_amount_without_gst"
                mandatory={true}
              />
              <Input
                type="number"
                value={formData.sg_invoice_amount_with_gst}
                onChange={valueHandler}
                label={"Invoice Amount (With tax)"}
                name="sg_invoice_amount_with_gst"
                mandatory={true}
              />
              <span className="w-full flex gap-2 items-end">
                <Input
                  type="file"
                  onChange={(e) => handleFile(e, "sg_invoice_doc")}
                  label={"Invoice Doc"}
                />
                {formData.sg_invoice_doc && formData.sg_invoice_doc !== "" && (
                  <FaEye
                    size={15}
                    className="cursor-pointer mb-3"
                    onClick={() =>
                      window.open(formData.sg_invoice_doc, "__blank")
                    }
                  />
                )}
              </span>

              {/* display sg delivery challan details */}
              <strong className="col-span-2">
                SG Delivery Challan Details
              </strong>
              <Input
                type="text"
                value={formData.sg_delivery_challan_no}
                onChange={valueHandler}
                label={"Invoice No."}
                mandatory={true}
                name="sg_delivery_challan_no"
              />
              <Input
                type="date"
                value={formData.sg_delivery_challan_date}
                onChange={valueHandler}
                label={"Invoice Date"}
                mandatory={true}
                name="sg_delivery_challan_date"
              />
              <Input
                type="number"
                value={formData.sg_delivery_challan_amount_without_gst}
                onChange={valueHandler}
                label={"Invoice Amount (Without tax)"}
                name="sg_delivery_challan_amount_without_gst"
                mandatory={true}
              />
              <Input
                type="number"
                value={formData.sg_delivery_challan_amount_with_gst}
                onChange={valueHandler}
                label={"Invoice Amount (With tax)"}
                name="sg_delivery_challan_amount_with_gst"
                mandatory={true}
              />
              <span className="w-full flex gap-2 items-end">
                <Input
                  type="file"
                  onChange={(e) => handleFile(e, "sg_delivery_challan_doc")}
                  label={"Invoice Doc"}
                />
                {formData.sg_delivery_challan_doc &&
                  formData.sg_delivery_challan_doc !== "" && (
                    <FaEye
                      size={15}
                      className="cursor-pointer mb-3"
                      onClick={() =>
                        window.open(formData.sg_delivery_challan_doc, "__blank")
                      }
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
          )}
          <div className="flex flex-col gap-2">
            {packingListDetails?.packing_list_items.length > 0 && (
              <Button
                onClick={() => openModal("add-packing-list-item")}
                variant={"inverted"}
                customText={"#F47920"}
                className="bg-orange-400/10 self-end text-primary px-2 hover:bg-orange-600/10 "
              >
                <FaPlusCircle />
                Add Item
              </Button>
            )}
            {formData.invoice_items && (
              <div className="overflow-x-auto">
                <Table
                  columns={tableHeader}
                  rows={formData.invoice_items}
                  showSerialNumber={true}
                />
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button
                className={"h-[2rem] my-auto w-[5rem]"}
                onClick={handleEditInvoice}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>
      {modals["add-packing-list-item"] && (
        <AddInvoiceItem
          modalId="add-packing-list-item"
          itemList={packingListDetails?.packing_list_items ?? []}
          onSubmit={handleAddNewItems}
        />
      )}

      <WarningModal
        modalId={"delete-invoice"}
        modalContent={
          <>
            Are you sure that you want to delete invoice-
            <strong>
              {formData?.invoice_no}(
              {formData?.packing_list_no__packing_list_no})
            </strong>
            ?
          </>
        }
        onSubmit={handleDeleteInvoice}
      />
    </>
  );
};

export default EditInvoice;
