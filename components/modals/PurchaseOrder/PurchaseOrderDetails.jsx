import { useRef, useState, useEffect } from "react";
import FormModal from "../../shared/FormModal";
import { dateFormat } from "@/utils/formatter";
import { formatPrice } from "@/utils/numberHandler";
import Table from "../../SortableTable";

const PurchaseOrderItems = ({ data }) => {
  const [showEntireOtherTerms, setShowEntireOtherTerms] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [showExtraCharges, setShowExtraCharges] = useState(false);
  const otherTermsRef = useRef(null);

  const tableHeader = [
    {
      name: "Item Code",
      key: "product_code",
      width: "150px",
    },
    {
      name: "Quantity",
      key: "quantity",
      key2: "unit",
      width: "100px",
    },
    {
      name: (
        <>
          Ex Works <br />
          Unit Price(₹)
        </>
      ),
      key: "ex_works_unit_price",
      displayType: "price",
      width: "130px",
    },
    {
      name: "Charges",
      key: "charges",
      width: "130px",
    },
    {
      name: "Charges Cost(₹)",
      key: "charges_cost",
      displayType: "price",
      width: "130px",
    },
    {
      name: "Unit Price(₹)",
      key: "unit_price",
      displayType: "price",
      width: "130px",
    },
    {
      name: "Taxable Amount(₹)",
      key: "taxable_amount",
      displayType: "price",
      width: "150px",
    },
    {
      name: "Tax(%)",
      key: "tax_rate",
      displayType: "price",
      width: "80px",
    },
    {
      name: "Tax Amount(₹)",
      key: "tax_amount",
      displayType: "price",
      width: "150px",
    },
    {
      name: "Total Amount(₹)",
      key: "total_amount",
      displayType: "price",
      width: "150px",
    },
    {
      name: "ETD",
      key: "etd",
      type: "date",
      width: "100px",
    },
    {
      name: "Description",
      key: "description",
      width: "250px",
    },
  ];

  const tableHeaderForCharges = [
    {
      name: "Extra Charges",
      key: "charges__name",
      width: "140px",
    },
    {
      name: "Charges Amount",
      key: "amount",
      width: "140px",
      displayType: "price",
    },
    {
      name: "Tax(%)",
      key: "tax_rate",
      width: "80px",
      displayType: "price",
    },
    {
      name: "Tax Amount(₹)",
      key: "tax_amount",
      width: "120px",
      displayType: "price",
    },
    {
      name: "Total Amount(₹)",
      key: "total_amount",
      width: "150px",
      displayType: "price",
    },
    {
      name: "Description",
      key: "description",
    },
  ];

  useEffect(() => {
    // Check if the content exceeds two lines (adjust as per your design)
    const element = otherTermsRef.current;
    if (element) {
      const isOverflowingText = element.scrollHeight > element.clientHeight;
      setIsOverflowing(isOverflowingText);
    }
  }, [data]);

  const onClose = () => {
    setShowExtraCharges(false);
    setShowEntireOtherTerms(false);
  };

  return (
    <FormModal
      id={"view-purchase-order-items"}
      heading={"Purchase Order Details"}
      width="w-3/4"
      onClose={onClose}
    >
      <div className="overflow-y-auto">
        <div className="grid grid-cols-2 gap-4 text-zinc-800 mb-4">
          <div>
            <strong>Purchase Order Number: </strong>
            {data?.purchase_order_number}
          </div>
          <div>
            <strong>Date: </strong>
            {dateFormat(data?.purchase_order_date)}
          </div>
          <div>
            <strong>Revision No.: </strong>
            {data?.revision_number}
          </div>
          <div>
            <strong>Vendor: </strong>
            {data?.vendor_name}
          </div>
          <div>
            <strong>Purchaser: </strong>
            {data?.purchaser_name}
          </div>
          <div>
            <strong>Purchaser Details: </strong>
            {data?.purchaser_address}, {data?.purchaser_city_name},{" "}
            {data?.purchaser_state_name}, {data?.purchaser_pincode}. GST -{" "}
            {data?.purchaser_gst}
          </div>
          <div>
            <strong>Status: </strong>
            {data?.status}
          </div>
          <div>
            <strong>Total Taxable Amount: </strong>₹
            {formatPrice(data?.total_po_taxable_amount)}
          </div>
          <div>
            <strong>Total Tax Amount: </strong>₹
            {formatPrice(data?.total_po_tax_amount)}
          </div>
          <div>
            <strong>Total Amount: </strong>₹{formatPrice(data?.total_po_amount)}
          </div>
          <div>
            <strong>Shipping Address: </strong>
            {data?.shipper_address}, {data?.shipper_city_name},{" "}
            {data?.shipper_state_name}, {data?.shipper_pincode}. GST -{" "}
            {data?.shipper_gst}{" "}
          </div>
          <div>
            <strong>Shipping Address POC: </strong>
            Name: {data?.shipper_contact_person_name}
            <br /> Email: {data?.shipper_email}
            <br />
            Contact: {data?.shipper_mobile_no}
          </div>

          <div>
            <strong>Payment Terms: </strong>
            {data?.payment_terms}
          </div>
          <div>
            <strong>Delivery Terms: </strong>
            {data?.delivery_terms}
          </div>
          <div className="col-span-2">
            <strong>Other Terms: </strong>
            <div
              ref={otherTermsRef}
              className={` ${showEntireOtherTerms ? "" : "other-terms"}`}
            >
              {data?.other_terms}
            </div>
            {isOverflowing && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setShowEntireOtherTerms(!showEntireOtherTerms);
                }}
                className="text-primary underline underline-offset-4 text-sm"
              >
                {showEntireOtherTerms ? "View less" : "View more"}
              </button>
            )}
          </div>
          <div className="col-span-2">
            <strong>Remark: </strong>
            {data?.remark}
          </div>
        </div>

        {data?.extra_charges?.length > 0 && !showExtraCharges && (
          <button
            onClick={(e) => {
              e.preventDefault();
              setShowExtraCharges(true);
            }}
            className="text-primary mb-4 underline underline-offset-4 text-sm"
          >
            View Extra Charges
          </button>
        )}

        {showExtraCharges && (
          <>
            <div className="flex gap-4">
              <strong>Extra Charges</strong>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setShowExtraCharges(false);
                }}
                className="text-primary mb-4 underline underline-offset-4 text-sm"
              >
                Hide Extra Charges
              </button>
            </div>
            <div className="overflow-x-auto mt-2">
              <Table
                columns={tableHeaderForCharges}
                rows={data?.extra_charges || []}
                showSerialNumber={true}
              />
            </div>
          </>
        )}
        <br />

        <strong>Purchase Order Items</strong>
        <div className="overflow-x-auto mt-2">
          <Table
            columns={tableHeader}
            rows={data?.product_list || []}
            showSerialNumber={true}
          />
        </div>
      </div>
    </FormModal>
  );
};

export default PurchaseOrderItems;
