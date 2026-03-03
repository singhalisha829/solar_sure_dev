import { useEffect, useState } from "react";
import { MdArrowForwardIos } from "react-icons/md";
import { LocalStorageService } from "@/services/LocalStorageHandler";
import Table from "@/components/SortableTable";
import { dateFormat } from "@/utils/formatter";
import {
  deletePackingListItem,
  addPackingListItem,
  getPackingList,
  fetchUnbookedPackingListItems,
} from "@/services/api";
import { requestHandler } from "@/services/ApiHandler";
import { toast } from "sonner";
import Button from "@/components/shared/Button";
import { FaPlusCircle, FaPen, FaTimes } from "react-icons/fa";
import { useModal } from "@/contexts/modal";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useProduct } from "@/contexts/product";

const AddPackingListItem = dynamic(
  () => import("@/components/modals/AddPackingListItemModal")
);
const WarningModal = dynamic(() => import("@/components/modals/WarningModal"));
const EditPackingListDetails = dynamic(
  () => import("@/components/modals/EditPackingListDetailsModal")
);

const EditPackingList = () => {
  const router = useRouter();
  const { openModal, modals, closeModal } = useModal();
  const { units } = useProduct();
  const [packingListDetails, setPackingListDetails] = useState(null);
  const [unpackedItems, setUnpackedItems] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const tableHeader = [
    {
      name: "Item Code",
      sortable: true,
      key: "project_bom_item_code",
      width: "20%",
    },
    {
      name: "Item Name",
      sortable: true,
      key: "project_bom_item_name",
      width: "20%",
    },
    {
      name: "Quantity",
      sortable: true,
      type: "packing_list_quantity",
      width: "20%",
    },
    {
      name: "Remark",
      sortable: true,
      key: "remark",
      width: "40%",
    },
    {
      name: "Action",
      type: "actions-column",
      actionType: "delete",
      onClickDelete: (row) => {
        setSelectedRow(row);
        openModal("delete-packing-list-item");
      },
    },
  ];

  useEffect(() => {
    const details = LocalStorageService.get("edit-packing-list-items");
    if (details) {
      fetchPackingListDetails({ id: details.id });
      fetchUnbookedItems(details.project, details.id);
    }
  }, []);

  const fetchUnbookedItems = async (projectId, packingListId) => {
    await requestHandler(
      async () => await fetchUnbookedPackingListItems(projectId, packingListId),
      null,
      async (data) => {
        setUnpackedItems(data.data.output);
      },
      toast.error
    );
  };

  const deleteItem = async () => {
    await requestHandler(
      async () => await deletePackingListItem(selectedRow.id),
      null,
      async (data) => {
        toast.success("Packing List Item Removed Successfully!");
        fetchPackingListDetails({ id: packingListDetails.id });
        fetchUnbookedItems(packingListDetails.project, packingListDetails.id);
        closeModal("delete-packing-list-item");
      },
      toast.error
    );
  };

  const fetchPackingListDetails = async (queryParams = {}) => {
    await requestHandler(
      async () => await getPackingList(queryParams),
      null,
      async (data) => {
        setPackingListDetails(data.data.output[0]);
      },
      toast.error
    );
  };

  const handleAddNewItems = async (items) => {
    let list = [];
    Object.keys(items).map((section) => {
      items[section].map((item) => {
        if (
          item.item_quantity &&
          item.item_quantity != 0 &&
          item.item_quantity !== ""
        ) {
          list.push({
            project_bom_item: item.id,
            quantity: item.item_quantity,
            unit: units.filter((unit) => item.inventory.unit == unit.symbol)[0]
              ?.id,
            remark: item.remark ?? "",
          });
        }
      });
    });

    let apiData = {
      packing_list_no: packingListDetails.id,
      transaction_type: "CREDIT",
      product_details: list,
    };

    await requestHandler(
      async () => await addPackingListItem(apiData),
      null,
      async (data) => {
        closeModal("add-packing-list-item");
        toast.success("Items Added Successfully!");
        fetchPackingListDetails({ id: packingListDetails.id });
        fetchUnbookedItems(packingListDetails.project, packingListDetails.id);
      },
      (error, data) => {
        toast.error(data.status.description);
        let errorMessage = {
          bom_item_quantity_error:
            data.status.error.bom_item_quantity_error.map(
              (item) =>
                `${item.project_bom_item_code}(${item.project_bom_item_name})`
            ),
          inventory_item_quantity_error:
            data.status.error.inventory_item_quantity_error.map(
              (item) =>
                `${item.project_bom_item_code}(${item.project_bom_item_name})`
            ),
        };
        setErrorMessage(errorMessage);
      }
    );
  };

  return (
    <>
      <div className="flex justify-between items-center gap-4">
        <h2 className=" flex text-xl font-bold tracking-tight">
          <span
            className="text-orange-500 hover:underline underline-offset-4 cursor-pointer"
            onClick={() => router.back()}
          >
            Back
          </span>{" "}
          <MdArrowForwardIos className="mt-1 text-orange-500" />
          Edit Packing List
        </h2>
      </div>
      {errorMessage && (
        <div className="border-1 relative text-red-500 border-red-500 rounded p-2 bg-red-50">
          <FaTimes
            className="absolute right-2 top-2 cursor-pointer"
            onClick={() => {
              LocalStorageService.set("packing-list-error", null);
              setErrorMessage(null);
            }}
          />
          <strong>Error!</strong>
          <br />
          {errorMessage.bom_item_quantity_error.length > 0 && (
            <>
              <span>
                BOM Items -{" "}
                <strong>
                  {errorMessage?.bom_item_quantity_error
                    .map((item) => item)
                    .join(", ")}{" "}
                </strong>
                have already been booked.
              </span>
              <br />
            </>
          )}
          {errorMessage.inventory_item_quantity_error.length > 0 && (
            <span>
              BOM Items -{" "}
              <strong>
                {errorMessage?.inventory_item_quantity_error
                  .map((item) => item)
                  .join(", ")}
              </strong>{" "}
              have less quantity available compared to the quantity being
              booked.
            </span>
          )}
        </div>
      )}
      <div className=" bg-white rounded  overflow-scroll p-5">
        <div className="relative flex flex-col gap-4 p-5 border border-zinc-100  overflow-scroll rounded-md grow h-full">
          <Button
            onClick={() => openModal("edit-packing-list-details")}
            className={"absolute top-2 right-2 px-4"}
          >
            <FaPen />
            Edit
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <span>
              <strong>Packing List No: </strong>
              {packingListDetails?.packing_list_no}
            </span>
            <span>
              <strong>Date: </strong>
              {dateFormat(packingListDetails?.date)}
            </span>
            <span>
              <strong>Dispatch From: </strong>
              {packingListDetails?.vendor_name}
            </span>
            <span>
              <strong>PO Number: </strong>
              {packingListDetails?.po_number}
            </span>
            <span>
              <strong>Company: </strong>
              {packingListDetails?.project_company_name}
            </span>
            <span>
              <strong>Project: </strong>
              {packingListDetails?.project_name}
            </span>
            <span>
              <strong>Project Capacity: </strong>
              {packingListDetails?.project_project_capacity}
            </span>
            <span>
              <strong>Remark: </strong>
              {packingListDetails?.remark}
            </span>
            <span className="col-span-2">
              <strong>Project Site: </strong>
              {packingListDetails?.project_project_site_name}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {unpackedItems.some(
              (item) => item.bom_sections && item.bom_sections.length > 0
            ) && (
              <Button
                onClick={() => openModal("add-packing-list-item")}
                variant={"inverted"}
                customText={"#F47920"}
                className="bg-orange-400/10 self-end text-orange-500 px-2 hover:bg-orange-600/10 "
              >
                <FaPlusCircle />
                Add Item
              </Button>
            )}
            {packingListDetails && (
              <Table
                columns={tableHeader}
                rows={packingListDetails?.packing_list_items}
                showSerialNumber={true}
              />
            )}
          </div>
        </div>
      </div>
      {modals["add-packing-list-item"] && (
        <AddPackingListItem
          modalId="add-packing-list-item"
          itemList={unpackedItems}
          onSubmit={handleAddNewItems}
          vendorName={packingListDetails?.vendor_name}
          addedItemList={packingListDetails?.packing_list_items.map(
            (item) => item.item_id
          )}
        />
      )}

      <WarningModal
        modalId={"delete-packing-list-item"}
        modalContent={
          <>
            Are you sure that you want to delete{" "}
            <strong>
              {selectedRow?.project_bom_item_code} (
              {selectedRow?.project_bom_item_name})
            </strong>
            ?
          </>
        }
        onSubmit={deleteItem}
      />

      <EditPackingListDetails
        details={packingListDetails}
        onSuccessfullSubmit={() => {
          fetchPackingListDetails({ id: packingListDetails.id });
          closeModal("edit-packing-list-details");
        }}
      />
    </>
  );
};

export default EditPackingList;
