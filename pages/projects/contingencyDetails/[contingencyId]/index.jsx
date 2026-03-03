import { FaEye } from "react-icons/fa";
import { Badge } from "@/components/shared/Badge";
import { useState, useEffect } from "react";
import Table from "@/components/SortableTable";
import { formatPrice } from "@/utils/numberHandler";
import { useRouter } from "next/router";
import { requestHandler } from "@/services/ApiHandler";
import { toast } from "sonner";
import { getBOMContigency } from "@/services/api";
import { downloadContingencyDoc } from "@/services/contingencyService";
import Button from "@/components/shared/Button";
import { LuDownload } from "react-icons/lu";

const ContingencyDetails = () => {
  const router = useRouter();
  const { contingencyId } = router.query;
  const [modalActiveTab, setModalActiveTab] = useState("Items");
  const [selectedContingency, setSelectedContingency] = useState({});
  const [modalTabs, setModalTabs] = useState([]);

  useEffect(() => {
    if (contingencyId) {
      fetchParticularContigencyDetails(contingencyId);
    }
  }, [contingencyId]);

  const fetchParticularContigencyDetails = async (id) => {
    await requestHandler(
      async () => await getBOMContigency({ id: id }),
      null,
      (data) => {
        let item_list = [],
          other_item_list = [],
          tabs = [];
        data.data.output[0].item_list.map((item) => {
          if (
            ["Installation", "Freight", "Other"].includes(item.bom_head_name)
          ) {
            other_item_list.push(item);
          } else {
            item_list.push(item);
          }
        });
        if (item_list.length > 0) {
          tabs.push("Items");
        }
        if (other_item_list.length > 0) {
          tabs.push("Others");
        }
        setSelectedContingency({
          ...data.data.output[0],
          item_list: item_list,
          other_item_list: other_item_list,
        });
        setModalTabs(tabs);
      },
      toast.error
    );
  };

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
    { name: "Bom Category", width: "9rem", key: "bom_head_name" },
    { name: "Contingency Type", width: "10rem", key: "contingency_type" },
    { name: "Item Code", width: "15rem", key: "product_code" },
    { name: "Item Name", width: "15rem", key: "item_name" },
    {
      name: "Make",
      width: "8rem",
      key: "make_name",
    },
    {
      name: "Quantity",
      width: "5rem",
      key: "quantity",
      key2: "unit_symbol",
    },
    {
      name: "Unit Price(₹)",
      width: "8rem",
      key: "unit_price",
      displayType: "price",
    },
    {
      name: "Total Amount(₹)",
      width: "10rem",
      key: "total_amount",
      displayType: "price",
    },
    { name: "Status", width: "8rem", key: "status" },
    { name: "Remark", width: "15rem", key: "remarks" },
    { name: "Approver Remark", width: "15rem", key: "approver_remark" },
  ];

  const tableHeaderForModalOthers = [
    {
      name: "Category",
      key: "bom_head_name",
      width: "8rem",
    },
    {
      name: "Name",
      key: "installation_freight_budget_name",
      minWidth: "12rem",
    },
    {
      name: "Amount",
      key: "unit_price",
      type: "price",
      width: "8rem",
    },
    { name: "Status", width: "8rem", key: "status" },
    {
      name: "Description",
      key: "remarks",
      width: "15rem",
    },
    { name: "Approver Remark", key: "approver_remark" },
  ];

  return (
    <>
      <div className="flex justify-between items-center gap-4">
        <h2 className="text-orange-500 text-xl font-bold tracking-tight">
          Contingency Details
        </h2>
        <Button
          className="px-3 absolute right-9"
          onClick={() => downloadContingencyDoc(selectedContingency)}
        >
          <LuDownload size={14} />
          Download
        </Button>
      </div>
      <div className="min-h-[85vh] overflow-hidden bg-white p-5">
        <div className="grid grid-cols-2 gap-2 mb-4">
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
            <strong>Total Amount: </strong>₹
            {formatPrice(selectedContingency?.total_amount)}
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
        <strong className="text-lg font-bold">Contingency Items</strong>
        {modalTabs.length > 1 && (
          <span className="flex gap-3 text-lg font-semibold">
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
            <div className="overflow-x-auto my-2">
              <Table rows={itemList ?? []} columns={tableHeaderForModalItems} />
            </div>
          )}

        {replacedItemList?.length > 0 &&
          (modalActiveTab === "Items" || modalTabs.length == 1) && (
            <>
              <strong>Replaced Items</strong>
              <div className="overflow-x-auto">
                <Table
                  rows={replacedItemList ?? []}
                  columns={tableHeaderForModalItems}
                />
              </div>
            </>
          )}
        {otherItemList?.length > 0 &&
          (modalActiveTab === "Others" || modalTabs.length == 1) && (
            <div className="overflow-x-auto my-2">
              <Table
                rows={otherItemList ?? []}
                columns={tableHeaderForModalOthers}
              />
            </div>
          )}
        {replacedOtherItemList?.length > 0 &&
          (modalActiveTab === "Others" || modalTabs.length == 1) && (
            <>
              <strong>Replaced Items</strong>
              <div className="overflow-x-auto">
                <Table
                  rows={replacedOtherItemList ?? []}
                  columns={tableHeaderForModalOthers}
                />
              </div>
            </>
          )}
      </div>
    </>
  );
};

export default ContingencyDetails;
