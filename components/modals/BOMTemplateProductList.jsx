import FormModal from "../shared/FormModal";
import EditableTable from "../project-components/EditableTable";
import { dateFormat } from "@/utils/formatter";

const BOMTemplateProductList = ({ modalId, bomDetails }) => {
  const tableHeader = [
    {
      name: "Product Code",
      sortable: true,
      key: "product_code",
      minWidth: "40%",
    },
    { name: "Name", sortable: true, key: "item_name", minWidth: "60%" },
  ];
  return (
    <FormModal id={modalId} heading={"BOM Template"} cancelButtonText={"Close"}>
      <div className="grid grid-cols-2 gap-2">
        <span>
          <strong>Name: </strong>
          {bomDetails?.name}
        </span>
        <span>
          <strong>Project Type: </strong>
          {bomDetails?.project_type}
        </span>{" "}
        <span>
          <strong>Created By: </strong>
          {bomDetails?.created_by}
        </span>{" "}
        <span>
          <strong>Created At: </strong>
          {dateFormat(bomDetails?.created_at)}
        </span>
      </div>
      <span>
        <strong className="mb-4">Product List: </strong>
        {bomDetails?.product_list.length > 0 ? (
          <div className="max-h-[200px] overflow-scroll">
            <EditableTable
              columns={tableHeader}
              rows={bomDetails?.product_list}
            />
          </div>
        ) : (
          <p>No Products Added</p>
        )}
      </span>
    </FormModal>
  );
};

export default BOMTemplateProductList;
