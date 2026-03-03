import FormModal from "@/components/shared/FormModal";
import { FaEye } from "react-icons/fa";
import { Badge } from "@/components/shared/Badge";
import { useState } from "react";
import { formatPrice } from "@/utils/numberHandler";
import EditableTable from "@/components/project-components/EditableTable";
import { downloadContingencyDoc } from "@/services/contingencyService";
import Button from "@/components/shared/Button";
import { LuDownload } from "react-icons/lu";

const ContingencyDetailsModal = ({
  modalId,
  onSubmit,
  selectedContingency,
  modalTabs,
  onClose,
  width,
}) => {
  const [modalActiveTab, setModalActiveTab] = useState("Items");

  const replacedItemList = selectedContingency?.item_list?.filter(
    (item) => item.is_replaced == true
  );
  const itemList = selectedContingency?.item_list?.filter(
    (item) => item.is_replaced == false
  );
  const replacedOtherItemList = selectedContingency?.other_item_list?.filter(
    (item) => item.is_replaced == true
  );
  const otherItemList = selectedContingency?.other_item_list?.filter(
    (item) => item.is_replaced == false
  );
  const tableHeaderForModalItems = [
    { name: "Bom Category", minWidth: "9rem", key: "bom_head_name" },
    {
      name: "Contingency Type",
      minWidth: "10rem",
      key: "contingency_type",
      type: "contingency_type",
    },
    { name: "Item Code", minWidth: "15rem", key: "product_code" },
    { name: "Item Name", minWidth: "15rem", key: "item_name" },
    {
      name: "Make",
      minWidth: "8rem",
      key: "make_name",
    },
    {
      name: "Quantity",
      minWidth: "5rem",
      key: "quantity",
      key2: "unit_symbol",
    },
    {
      name: "Unit Price(₹)",
      minWidth: "8rem",
      key: "unit_price",
      displayType: "price",
    },
    {
      name: "Total Amount(₹)",
      minWidth: "10rem",
      key: "total_amount",
      displayType: "price",
      showTotalAmount: true,
    },
    {
      name: "Contingency Amount",
      key: "contingency_amount",
      minWidth: "10rem",
    },
    { name: "Status", minWidth: "8rem", key: "status" },
    { name: "Remark", minWidth: "15rem", key: "remarks" },
    { name: "Approver Remark", minWidth: "15rem", key: "approver_remark" },
  ];

  const tableHeaderForModalOthers = [
    {
      name: "Category",
      key: "bom_head_name",
      minWidth: "8rem",
    },
    {
      name: "Name",
      key: "installation_freight_budget_name",
      minWidth: "12rem",
    },
    {
      name: "Amount",
      key: "unit_price",
      displayType: "price",
      minWidth: "8rem",
      showTotalAmount: true,
    },
    { name: "Status", minWidth: "8rem", key: "status" },
    {
      name: "Description",
      key: "remarks",
      minWidth: "15rem",
    },
    { name: "Approver Remark", key: "approver_remark" },
  ];

  return (
    <FormModal
      id={modalId}
      onSubmit={onSubmit}
      width={width}
      onClose={onClose}
      heading={"Contingency Details"}
      cancelButtonText={"Close"}
    >
      <div className="text-sm relative">
        <Button
          className="px-3 absolute right-0"
          onClick={() => downloadContingencyDoc(selectedContingency)}
        >
          <LuDownload size={14} />
          Download
        </Button>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div>
            <strong>Contingency No.: </strong>
            {selectedContingency?.contingency_no}
          </div>
          <div className="flex gap-2 items-end">
            <strong>Status: </strong>
            <Badge variant={selectedContingency?.status?.toLowerCase()}>
              {selectedContingency?.status}
            </Badge>
          </div>
          <div>
            <strong>Created By: </strong>
            {selectedContingency?.created_by}
          </div>
          <div className="flex gap-2">
            <strong>Approval Doc: </strong>
            {selectedContingency?.approval_doc != "" ? (
              <FaEye
                title="View Approval Doc"
                className="text-stone-300 text-[18px] cursor-pointer hover:text-zinc-600"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(selectedContingency?.approval_doc, "__blank");
                }}
              />
            ) : (
              "-"
            )}
          </div>
          <div>
            <strong>Approved By: </strong>
            {selectedContingency?.approved_by}
          </div>
          <div>
            <strong>Contingency Amount: </strong>₹
            {formatPrice(selectedContingency?.contingency_amount)}
          </div>
          <div className="col-span-2">
            <strong>Remark: </strong>
            {selectedContingency?.remark}
          </div>
        </div>
        <strong>Contingency Items</strong>
        {modalTabs.length > 1 && (
          <span className="flex gap-3 font-semibold text-zinc-800 mt-2">
            {modalTabs.map((tab) => (
              <span
                key={tab}
                className={`cursor-pointer ${modalActiveTab === tab ? "border-b-2 border-primary" : ""}`}
                onClick={() => setModalActiveTab(tab)}
              >
                {tab}
              </span>
            ))}
          </span>
        )}
        {itemList?.length > 0 &&
          (modalActiveTab === "Items" || modalTabs.length == 1) && (
            <div className="overflow-x-auto mt-2">
              <EditableTable
                rows={itemList ?? []}
                columns={tableHeaderForModalItems}
                showFooterRow={true}
              />
            </div>
          )}

        {replacedItemList?.length > 0 &&
          (modalActiveTab === "Items" || modalTabs.length == 1) && (
            <>
              <br />
              <strong>Replaced Items</strong>
              <div className="overflow-x-auto mt-2">
                <EditableTable
                  rows={replacedItemList ?? []}
                  columns={tableHeaderForModalItems}
                  showFooterRow={true}
                />
              </div>
            </>
          )}
        {otherItemList?.length > 0 &&
          (modalActiveTab === "Others" || modalTabs.length == 1) && (
            <div className="overflow-x-auto mt-2">
              <EditableTable
                rows={otherItemList ?? []}
                columns={tableHeaderForModalOthers}
                showFooterRow={true}
              />
            </div>
          )}
        {replacedOtherItemList?.length > 0 &&
          (modalActiveTab === "Others" || modalTabs.length == 1) && (
            <>
              <br />
              <strong>Replaced Items</strong>
              <div className="overflow-x-auto mt-2">
                <EditableTable
                  rows={replacedOtherItemList ?? []}
                  columns={tableHeaderForModalOthers}
                  showFooterRow={true}
                />
              </div>
            </>
          )}
      </div>
    </FormModal>
  );
};

export default ContingencyDetailsModal;
