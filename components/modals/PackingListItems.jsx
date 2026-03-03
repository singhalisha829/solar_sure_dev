import FormModal from "../shared/FormModal";
import Table from "../SortableTable";
import { dateFormat } from "@/utils/formatter";

const PackingListItems = ({ details }) => {
  const tableHeader = [
    {
      name: "Item Code",
      sortable: true,
      key: "project_bom_item_code",
      width: "8rem",
    },
    {
      name: "Item Name",
      sortable: true,
      key: "project_bom_item_name",
      width: "11rem",
    },
    {
      name: "Quantity",
      sortable: true,
      type: "packing_list_quantity",
      width: "5rem",
    },
    {
      name: "Remark",
      sortable: true,
      key: "remark",
    },
  ];

  return (
    <FormModal
      id={"packing-list-items"}
      heading={"Packing List Items"}
      cancelButtonText={"Close"}
    >
      <div className="grid gap-2 grid-cols-2">
        <span>
          <strong>Company: </strong>
          {details?.project_company_name}
        </span>
        <span>
          <strong>Packing List No: </strong>
          {details?.packing_list_no}
        </span>
        <span>
          <strong>Date: </strong>
          {dateFormat(details?.date)}
        </span>
        <span>
          <strong>Dispatch From: </strong>
          {details?.vendor_name}
        </span>
        <span>
          <strong>Status: </strong>
          {details?.status}
        </span>
        <span className="col-span-2">
          <strong>Remark: </strong>
          {details?.remark}
        </span>
      </div>
      <div className="overflow-auto mb-2">
        <Table
          columns={tableHeader}
          rows={details?.packing_list_items}
          showSerialNumber={true}
        />
      </div>
    </FormModal>
  );
};

export default PackingListItems;
