import { useState, useEffect } from "react";
import { getPurchaseOrders } from "@/services/api";
import { requestHandler } from "@/services/ApiHandler";
import { toast } from "sonner";
import FormModal from "@/components/shared/FormModal";
import ExpandableTable from "@/components/project-components/ExpandableTable";

const ViewProcurementListItemDetails = ({ selectedItem, projectId }) => {
  const [procurementList, setProcurementList] = useState([]);
  const [procurementListItems, setProcurementListItems] = useState([]);

  const tableHeader = [
    {
      name: "Purchase Order No.",
      width: "12rem",
      key: "purchase_order_number",
    },
    {
      name: "Company",
      key: "company_name",
      width: "10rem",
    },
    {
      name: "Date",
      key: "purchase_order_date",
      type: "date",
      width: "8rem",
    },
    {
      name: "Revision Number",
      key: "revision_number",
      width: "10rem",
    },
    {
      name: "Project",
      key: "project_name",
      width: "8rem",
    },
    {
      name: "Project Site",
      key: "site_name",
      width: "10rem",
    },
    {
      name: "PO Amount",
      key: "total_po_amount",
      width: "8rem",
      displayType: "price",
    },
    {
      name: "Status",
      key: "status",
      width: "6rem",
    },
    {
      name: "Vendor",
      key: "vendor_name",
      width: "8rem",
    },
  ];

  const packingListItemHeader = [
    {
      name: "Product Code",
      key: "product_code",
      width: "15%",
    },
    {
      name: "Quantity",
      key: "quantity",
      width: "10%",
      key2: "unit_symbol",
    },
    {
      name: "Unit Price(₹)",
      key: "unit_price",
      width: "10%",
      displayType: "price",
    },
    {
      name: "Taxable Amount(₹)",
      key: "taxable_amount",
      width: "10%",
      displayType: "price",
    },
    {
      name: "Tax",
      key: "tax_rate",
      width: "5%",
    },
    {
      name: "Tax Amount(₹)",
      key: "tax_amount",
      width: "10%",
      displayType: "price",
    },
    {
      name: "Total Amount(₹)",
      key: "total_amount",
      width: "10%",
      displayType: "price",
    },
    {
      name: "Etd",
      key: "etd",
      width: "10%",
      type: "date",
    },
    { name: "Description", key: "description" },
  ];

  useEffect(() => {
    if (selectedItem?.item_id) {
      fetchProcurementListDetails();
    }
  }, [selectedItem]);

  const fetchProcurementListDetails = async () => {
    await requestHandler(
      async () =>
        await getPurchaseOrders({
          item_id: selectedItem?.item_id,
          project: projectId,
        }),
      null,
      (data) => {
        setProcurementList(data.data.output);
      },
      toast.error
    );
  };

  return (
    <FormModal
      id={"show-procurment-item-details"}
      width="w-[70%]"
      cancelButtonText={"Close"}
      heading={`Procurement Details - ${selectedItem?.product_code}(${selectedItem?.item__name})`}
    >
      <div className="space-y-4 mb-4 overflow-x-auto">
        <div className="overflow-x-auto max-h-[20rem]">
          <ExpandableTable
            columns={tableHeader}
            rows={procurementList}
            childrenColumns={packingListItemHeader}
            childrenRows={procurementListItems ?? []}
            onRowClick={(row) => {
              setProcurementListItems([...row.product_list]);
            }}
          />
        </div>
      </div>
    </FormModal>
  );
};

export default ViewProcurementListItemDetails;
