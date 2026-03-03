import { useState, useEffect } from "react";
import { getPackingList } from "@/services/api";
import { requestHandler } from "@/services/ApiHandler";
import { toast } from "sonner";
import FormModal from "@/components/shared/FormModal";
import ExpandableTable from "@/components/project-components/ExpandableTable";

const ViewPackingListItemDetails = ({ selectedItem, projectId }) => {
  const [packingLists, setPackingLists] = useState([]);
  const [packingListItems, setPackingListItems] = useState([]);

  const tableHeader = [
    {
      name: "Packing List No.",
      width: "8rem",
      key: "packing_list_no",
    },
    {
      name: "Company",
      key: "project_company_name",
      width: "10rem",
    },
    {
      name: "Date",
      key: "date",
      type: "date",
      width: "8rem",
    },
    {
      name: "PO Number",
      key: "po_number",
      width: "8rem",
    },
    {
      name: "Project",
      key: "project_name",
      width: "8rem",
    },
    {
      name: "Project Capacity",
      key: "project_project_capacity",
      width: "10rem",
    },
    {
      name: "Project Site",
      key: "project_project_site_name",
      width: "15rem",
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
    {
      name: "Remark",
      key: "remark",
      width: "15rem",
    },
  ];

  const packingListItemHeader = [
    {
      name: "Product Code",
      key: "project_bom_item_code",
      width: "10%",
    },
    { name: "Name", key: "project_bom_item_name", width: "15%" },
    { name: "Section", key: "project_bom_item_section", width: "10%" },
    {
      name: "Quantity",
      key: "bom_quantity",
      width: "10%",
      type: "quantity_object",
    },
    {
      name: "Left Quantity",
      key: "left_quantity",
      width: "10%",
      key2: "unit_symbol",
    },
    {
      name: "Inventory Left Qty.",
      key: "inventory_left_quantity",
      width: "10%",
      type: "quantity_object",
    },
    {
      name: "Remark",
      key: "remark",
    },
  ];

  useEffect(() => {
    if (selectedItem?.id) {
      fetchPackingListDetails();
    }
  }, [selectedItem]);

  const fetchPackingListDetails = async () => {
    await requestHandler(
      async () =>
        await getPackingList({
          item_id: selectedItem?.item,
          project: projectId,
        }),
      null,
      (data) => {
        setPackingLists(data.data.output);
      },
      toast.error
    );
  };

  return (
    <FormModal
      id={"show-packing-list-item-details"}
      width="w-[70%]"
      cancelButtonText={"Close"}
      heading={`Packing List Details - ${selectedItem?.product_code}(${selectedItem?.item_name})`}
    >
      <div className="space-y-4 mb-4 overflow-x-auto">
        <div className="overflow-x-auto max-h-[20rem]">
          <ExpandableTable
            columns={tableHeader}
            rows={packingLists}
            childrenColumns={packingListItemHeader}
            childrenRows={packingListItems ?? []}
            onRowClick={(row) => {
              setPackingListItems([...row.packing_list_items]);
            }}
          />
        </div>
      </div>
    </FormModal>
  );
};

export default ViewPackingListItemDetails;
