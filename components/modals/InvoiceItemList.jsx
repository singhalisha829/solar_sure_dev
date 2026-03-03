import FormModal from "../shared/FormModal";
import { useState, useEffect } from "react";
import Table from "../SortableTable";
import { dateFormat } from "@/utils/formatter";
import { formatPrice } from "@/utils/numberHandler";

const InvoiceItemList = ({ details }) => {
  const [showDeliveryChallan, setShowDeliveryChallan] = useState(false);
  const [showVendorInvoice, setShowVendorInvoice] = useState(false);
  const [showSGInvoice, setShowSGInvoice] = useState(false);
  const [showSGDeliveryChallan, setShowSGDeliveryChallan] = useState(false);

  useEffect(() => {
    const invoiceTypes = details?.invoice_type_added || [];

    setShowDeliveryChallan(invoiceTypes.includes("Ornate Delivery Challan"));
    setShowSGInvoice(invoiceTypes.includes("SG Invoice"));
    setShowVendorInvoice(invoiceTypes.includes("Vendor Invoice"));
    setShowSGDeliveryChallan(invoiceTypes.includes("SG Delivery Challan"));
  }, [details?.invoice_type_added]);

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
      displayType: "price",
    },
    {
      name: "Taxable Amount(₹)",
      width: "11rem",
      key: "taxable_amount",
      displayType: "price",
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
      displayType: "price",
    },
    {
      name: "Total Amount(₹)",
      key: "total_amount",
      width: "130px",
      displayType: "price",
    },
    {
      name: "Remark",
      key: "description",
      width: "200px",
    },
  ];

  return (
    <FormModal
      id={"display-invoice-items"}
      heading={"Invoice Items"}
      cancelButtonText={"Close"}
    >
      <div className="grid gap-2 grid-cols-2">
        <span>
          <strong>Packing List No: </strong>
          {details?.packing_list_no__packing_list_no}
        </span>
        <span>
          <strong>Date: </strong>
          {dateFormat(details?.invoice_date)}
        </span>
        <span>
          <strong>Invoice No: </strong>
          {details?.invoice_no}
        </span>
        <span>
          <strong>Vendor: </strong>
          {details?.vendor_name}
        </span>
        <span>
          <strong>Invoice Amount(Without Tax): </strong>₹
          {formatPrice(details?.invoice_amount_without_gst)}
        </span>
        <span>
          <strong>Invoice Amount(With Tax): </strong>₹
          {formatPrice(details?.invoice_amount_with_gst)}
        </span>
        <span>
          <strong>Invoice Doc: </strong>
          {details?.invoice_doc !== "" ? (
            <span
              className="text-primary hover:underline underline-offset-4 cursor-pointer text-sm"
              onClick={() => window.open(details?.invoice_doc, "_blank")}
            >
              View Doc
            </span>
          ) : (
            "-"
          )}
        </span>
        <span className="col-span-2">
          <strong>Remark: </strong>
          {details?.remark}
        </span>
      </div>

      {/* display delivery challan details here */}
      <span className="col-span-2 mt-2">
        <strong>Delivery Challan Details </strong>
        <span
          className="text-primary hover:underline underline-offset-4 ml-2 cursor-pointer text-sm"
          onClick={() => setShowDeliveryChallan(!showDeliveryChallan)}
        >
          {showDeliveryChallan ? "Hide" : "View"}
        </span>
      </span>

      {showDeliveryChallan && (
        <div className="grid gap-2 grid-cols-2 p-2 bg-primary-light-5">
          <span>
            <strong>Delivery Challan No: </strong>
            {details?.delivery_challan_no}
          </span>
          <span>
            <strong>Delivery Challan Date: </strong>
            {dateFormat(details?.delivery_challan_date)}
          </span>
          <span>
            <strong>Delivery Challan Amount(Without Tax): </strong>₹
            {formatPrice(details?.delivery_challan_amount_without_gst)}
          </span>
          <span>
            <strong>Delivery Challan Amount(With Tax): </strong>₹
            {formatPrice(details?.delivery_challan_amount_with_gst)}
          </span>
          <span>
            <strong>Delivery Challan Doc: </strong>
            {details?.delivery_challan_doc !== "" ? (
              <span
                className="text-primary hover:underline underline-offset-4 text-sm"
                onClick={() =>
                  window.open(details?.delivery_challan_doc, "_blank")
                }
              >
                View Doc
              </span>
            ) : (
              "-"
            )}{" "}
          </span>
        </div>
      )}

      {/* display vendor invoice details here */}
      <span>
        <strong>Vendor Invoice Details </strong>
        <span
          className="text-primary hover:underline underline-offset-4 ml-2 cursor-pointer text-sm"
          onClick={() => setShowVendorInvoice(!showVendorInvoice)}
        >
          {showVendorInvoice ? "Hide" : "View"}
        </span>
      </span>

      {showVendorInvoice && (
        <div className="grid gap-2 grid-cols-2 p-2 bg-primary-light-5">
          <span>
            <strong>Vendor Invoice No: </strong>
            {details?.vendor_invoice_no}
          </span>

          <span>
            <strong>Vendor Invoice Date: </strong>
            {dateFormat(details?.vendor_invoice_date)}
          </span>
          <span>
            <strong>Vendor Invoice Amount(Without Tax): </strong>₹
            {formatPrice(details?.vendor_invoice_amount_without_gst)}
          </span>
          <span>
            <strong>Vendor Invoice Amount(With Tax): </strong>₹
            {formatPrice(details?.vendor_invoice_amount_with_gst)}
          </span>
          <span>
            <strong>Vendor Invoice Doc: </strong>
            {details?.vendor_invoice_doc !== "" ? (
              <span
                className="text-primary hover:underline underline-offset-4 text-sm"
                onClick={() =>
                  window.open(details?.vendor_invoice_doc, "_blank")
                }
              >
                View Doc
              </span>
            ) : (
              "-"
            )}{" "}
          </span>
        </div>
      )}

      {/* display sg invoice details here */}
      <span>
        <strong>SG Invoice Details </strong>
        <span
          className="text-primary hover:underline underline-offset-4 ml-2 cursor-pointer text-sm"
          onClick={() => setShowSGInvoice(!showSGInvoice)}
        >
          {showSGInvoice ? "Hide" : "View"}
        </span>
      </span>

      {showSGInvoice && (
        <div className="grid gap-2 grid-cols-2 p-2 bg-primary-light-5">
          <span>
            <strong>SG Invoice No: </strong>
            {details?.sg_invoice_no}
          </span>

          <span>
            <strong>SG Invoice Date: </strong>
            {dateFormat(details?.sg_invoice_date)}
          </span>
          <span>
            <strong>SG Invoice Amount(Without Tax): </strong>₹
            {formatPrice(details?.sg_invoice_amount_without_gst)}
          </span>
          <span>
            <strong>SG Invoice Amount(With Tax): </strong>₹
            {formatPrice(details?.sg_invoice_amount_with_gst)}
          </span>
          <span>
            <strong>SG Invoice Doc: </strong>
            {details?.sg_invoice_doc !== "" ? (
              <span
                className="text-primary hover:underline underline-offset-4 text-sm"
                onClick={() => window.open(details?.sg_invoice_doc, "_blank")}
              >
                View Doc
              </span>
            ) : (
              "-"
            )}{" "}
          </span>
        </div>
      )}

      {/* display sg delivery challan details here */}
      <span>
        <strong>SG Delivery Challan Details </strong>
        <span
          className="text-primary hover:underline underline-offset-4 ml-2 cursor-pointer text-sm"
          onClick={() => setShowSGDeliveryChallan(!showSGDeliveryChallan)}
        >
          {showSGDeliveryChallan ? "Hide" : "View"}
        </span>
      </span>

      {showSGDeliveryChallan && (
        <div className="grid gap-2 grid-cols-2 p-2 bg-primary-light-5">
          <span>
            <strong>SG Delivery Challan No: </strong>
            {details?.sg_delivery_challan_no}
          </span>

          <span>
            <strong>SG Delivery Challan Date: </strong>
            {dateFormat(details?.sg_delivery_challan_date)}
          </span>
          <span>
            <strong>SG Delivery Challan Amount(Without Tax): </strong>₹
            {formatPrice(details?.sg_delivery_challan_amount_without_gst)}
          </span>
          <span>
            <strong>SG Delivery Challan Amount(With Tax): </strong>₹
            {formatPrice(details?.sg_delivery_challan_amount_with_gst)}
          </span>
          <span>
            <strong>SG Delivery Challan Doc: </strong>
            {details?.sg_delivery_challan_doc !== "" ? (
              <span
                className="text-primary hover:underline underline-offset-4 text-sm"
                onClick={() =>
                  window.open(details?.sg_delivery_challan_doc, "_blank")
                }
              >
                View Doc
              </span>
            ) : (
              "-"
            )}{" "}
          </span>
        </div>
      )}
      <div className="overflow-x-auto mb-2">
        <Table
          columns={tableHeader}
          rows={details?.invoice_items}
          showSerialNumber={true}
        />
      </div>
    </FormModal>
  );
};

export default InvoiceItemList;
