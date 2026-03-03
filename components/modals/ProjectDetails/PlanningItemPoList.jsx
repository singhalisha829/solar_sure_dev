import { useState } from "react";
import { getItemPoList } from "@/services/api";
import { requestHandler } from "@/services/ApiHandler";
import { toast } from "sonner";
import FormModal from "@/components/shared/FormModal";
import ExpandableTable from "@/components/project-components/ExpandableTable";

const PlanningItemPoList = ({ poList }) => {
  const [itemList, setItemList] = useState([]);

  const tableHeader = [
    {
      name: "Purchase Order No.",
      width: "12rem",
      key: "purchase_order_number",
    },
    {
      name: "Project",
      key: "project_name",
      width: "10rem",
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
      displayType: "price",
      width: "7rem",
    },
    {
      name: "Taxable Amount(₹)",
      key: "taxable_amount",
      displayType: "price",
      width: "10rem",
    },
    {
      name: "Tax(%)",
      key: "tax_rate",
      width: "5rem",
    },
    {
      name: "Tax Amount(₹)",
      key: "tax_amount",
      width: "8rem",
      displayType: "price",
    },
    {
      name: "Total Amount(₹)",
      key: "total_amount",
      width: "10rem",
      displayType: "price",
    },
    {
      name: "Description",
      key: "description",
      width: "15rem",
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
      width: "5%",
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
      width: "15%",
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
      width: "15%",
      displayType: "price",
    },
    { name: "Description", key: "description" },
  ];

  const fetchPoItems = async (id, itemId) => {
    await requestHandler(
      async () =>
        await getItemPoList({
          purchase_order_id: id,
          item_id: itemId,
        }),
      null,
      (data) => {
        setItemList(data.data.output[0].other_po_items);
      },
      toast.error
    );
  };

  return (
    <FormModal
      id={"show-planning-item-po-list"}
      width="w-[70%]"
      cancelButtonText={"Close"}
      heading={`Purchase Orders for ${poList.length > 0 ? poList[0].product_code : ""}`}
    >
      <div className="space-y-4 mb-4 overflow-x-auto">
        <div className="overflow-x-auto max-h-[20rem]">
          <ExpandableTable
            columns={tableHeader}
            rows={poList}
            childrenColumns={packingListItemHeader}
            childrenRows={itemList ?? []}
            hideEmptyChildRows={true}
            onRowClick={(row) => {
              fetchPoItems(row.vendor_purchase_order_id, row.item_id);
            }}
          />
        </div>
      </div>
    </FormModal>
  );
};

export default PlanningItemPoList;
