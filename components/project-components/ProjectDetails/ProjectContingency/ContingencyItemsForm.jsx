import { useState } from "react";
import Button from "@/components/shared/Button";
import { FaPlusCircle } from "react-icons/fa";
import { useModal } from "@/contexts/modal";
import dynamic from "next/dynamic";
import Table from "@/components/SortableTable";
import ProjectItemTable from "../../ProjectItemTable";
import { useRouter } from "next/router";
import { requestHandler } from "@/services/ApiHandler";
import { toast } from "sonner";
import {
  addContigencyItems,
  editContingencyRemark,
  deleteContigencyItems,
} from "@/services/api";
import { formatPrice } from "@/utils/numberHandler";

const AddContingencyItem = dynamic(
  () =>
    import(
      "@/components/modals/ProjectDetails/ProjectContingency/AddContingencyItemModal"
    )
);

const ReplaceContingencyItem = dynamic(
  () =>
    import(
      "@/components/modals/ProjectDetails/ProjectContingency/ReplaceContingencyItem"
    )
);

const DeleteWarningModal = dynamic(
  () => import("@/components/modals/WarningModal")
);

const ContingencyItemsForm = ({
  projectId,
  projectName,
  contingencyId,
  itemRemark,
  onBackClick,
  contingencyItemList,
  replacedContingencyItemList,
  contingencyOtherItemList,
  replacedContingencyOtherItemList,
  installationItems,
  projectDetails,
}) => {
  const { openModal, closeModal } = useModal();
  const router = useRouter();
  const [itemList, setItemList] = useState(contingencyItemList);
  const [otherItemList, setOtherItemList] = useState(contingencyOtherItemList);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [replacementOtherItemList, setReplacementOtherItemList] = useState(
    replacedContingencyOtherItemList
  );
  const [replacementItemList, setReplacementItemList] = useState(
    replacedContingencyItemList
  );
  // console.log("replacementItemList", replacementItemList);

  let total_amount = 0,
    total_replaced_amount = 0;
  itemList.map(
    (item) => (total_amount += Number(item.contingency_amount || 0))
  );
  otherItemList.map((item) => (total_amount += Number(item.amount || 0)));

  replacementItemList.map(
    (item) =>
      (total_replaced_amount += Number(item.replacement_total_amount || 0))
  );
  replacementOtherItemList.map(
    (item) =>
      (total_replaced_amount += Number(item.replacement_total_amount || 0))
  );

  // UPDATED ON 3RD OCT 2025
  const total_contingency_amount =
    Number(total_amount || 0) - Number(total_replaced_amount || 0);
  // const total_contingency_amount = Number(total_amount || 0);

  const tableHeader = [
    {
      name: "Category",
      key: "category",
      width: "8rem",
    },
    {
      name: "Contingency Type",
      type: "contingency_type",
      width: "12rem",
    },
    {
      name: "Date",
      key: "date",
      displayType: "date",
      width: "8rem",
    },
    {
      name: "Item Code",
      key: "product_code",
      width: "12rem",
    },
    {
      name: "Item Name",
      key: "item_name",
      width: "12rem",
    },
    {
      name: "Quantity",
      key: "quantity",
      key2: "unit_symbol",
      width: "5rem",
    },
    {
      name: "BBU Unit Price",
      key: "unit_price",
      width: "8rem",
    },
    {
      name: "Total BBU Amount",
      key: "total_amount",
      width: "8rem",
    },
    {
      name: "Contingency Amount",
      key: "contingency_amount",
      width: "10rem",
    },
    {
      name: "Remark",
      key: "remarks",
      width: "20rem",
    },
    {
      name: "Actions",
      type: "actions-column",
      actionType: "delete",
      width: "5rem",
      onClickDelete: (row) => {
        handleItemDelete(row);
      },
    },
  ];

  const inputTableHeader = [
    {
      name: "Reduced Quantity",
      key: "replacement_quantity",
      width: "8rem",
    },
    {
      name: "Reduced Amount",
      key: "replacement_total_amount",
      minWidth: "12rem",
    },
  ];

  const replacementTableHeader = [
    ...tableHeader.slice(0, -3),
    ...inputTableHeader,
  ];

  const tableHeaderForOthers = [
    {
      name: "Category",
      key: "category",
      width: "10rem",
    },
    {
      name: "Name",
      key: "name",
      width: "20rem",
    },
    {
      name: "Amount",
      key: "amount",
      type: "price",
      width: "10rem",
    },
    {
      name: "Description",
      key: "description",
    },
    {
      name: "Actions",
      type: "actions-column",
      actionType: "delete",
      onClickDelete: (row) => {
        handleItemDelete(row, true);
      },
    },
  ];

  const replacementTableHeaderForOthers = [
    ...tableHeaderForOthers.slice(0, -1),
    {
      name: "Reduced Amount",
      key: "replacement_total_amount",
      minWidth: "12rem",
    },
  ];

  const deleteContingencyItem = async (id) => {
    await requestHandler(
      async () => await deleteContigencyItems(id),
      null,
      (data) => {
        toast.success("Contingency Item Deleted Successfully!");
        closeModal("delete-project-contignecy-item");
        if (selectedItem?.is_replaced) {
          updateReplacedItemsList();
        } else {
          updateItemsList();
        }
        if (
          [...replacedContingencyItemList, ...replacedContingencyOtherItemList]
            .length > 0
        ) {
          handleEditContingency("Incomplete");
        }
      },
      toast.error
    );
  };

  const updateItemsList = () => {
    if (selectedItem?.isOthers) {
      const index = otherItemList.findIndex(
        (item) => item.name === selectedItem?.name
      );
      if (index != -1) {
        let newList = [...otherItemList];
        newList.splice(index, 1);
        setOtherItemList(newList);
      }
    } else {
      const index = itemList.findIndex(
        (item) => item.item === selectedItem?.item
      );
      if (index != -1) {
        let newList = [...itemList];
        newList.splice(index, 1);
        setItemList(newList);
      }
    }
  };

  const updateReplacedItemsList = () => {
    if (selectedItem?.isOthers) {
      const index = replacementOtherItemList.findIndex(
        (item) => item.name === selectedItem?.name
      );
      if (index != -1) {
        let newList = [...replacementOtherItemList];
        newList.splice(index, 1);
        setReplacementOtherItemList(newList);
      }
    } else {
      const index = replacementItemList.findIndex(
        (item) => item.item === selectedItem?.item
      );
      if (index != -1) {
        let newList = [...replacementItemList];
        newList.splice(index, 1);
        setReplacementItemList(newList);
      }
    }
  };

  const handleItemDelete = (row, isOthers = false) => {
    if (row.id) {
      setSelectedItem(row);
      openModal("delete-project-contignecy-item");
    } else {
      if (isOthers) {
        let list = otherItemList.filter((item) => item.name != row.name);
        setOtherItemList([...list]);
      } else {
        let list = itemList.filter((item) => item.item != row.item);
        setItemList([...list]);
      }
    }
  };

  const handleReplacedItemDelete = (index, isOthers = false) => {
    let row;
    if (isOthers) {
      row = replacementOtherItemList[index];
    } else {
      row = replacementItemList[index];
    }
    if (row.id) {
      setSelectedItem(row);
      openModal("delete-project-contignecy-item");
    } else {
      if (isOthers) {
        let list = replacementOtherItemList.filter(
          (item) => item.name != row.name
        );
        setReplacementOtherItemList([...list]);
      } else {
        let list = replacementItemList.filter((item) => item.item != row.item);
        setReplacementItemList([...list]);
      }
    }
  };

  const onSubmit = async () => {
    setIsLoading(true);
    let apiData = [];

    if (itemList.length > 0 && itemList.some((obj) => !("id" in obj))) {
      const list = itemList.filter((item) => !("id" in item));
      list.map((item) => {
        apiData.push({
          bom_section: item.section_id,
          contingency_type: item.contingency_type,
          item: item.item,
          remarks: item.remarks,
          unit_price: item.unit_price ?? 0,
          quantity: item.quantity,
          unit: item.unit,
          make: item.make,
          date: item.date,
          total_amount: item.total_amount,
          contingency_amount: item.contingency_amount,
          bom_contingency: contingencyId,
          bom_head_name: item.category,
          is_replacement:
            [...replacementItemList, ...replacementOtherItemList].length > 0,
        });
      });
    }
    if (
      otherItemList.length > 0 &&
      otherItemList.some((obj) => !("id" in obj))
    ) {
      const list = otherItemList.filter((item) => !("id" in item));
      list.map((otherItem) => {
        apiData.push({
          name: otherItem.name,
          remarks: otherItem.description,
          total_amount: otherItem.amount ?? 0,
          bom_contingency: contingencyId,
          bom_head_name: otherItem.category,
          is_replacement:
            [...replacementItemList, ...replacementOtherItemList].length > 0,
        });
      });
    }

    if (replacementItemList.length > 0) {
      replacementItemList.map((item) => {
        apiData.push({
          bom_section: item.section_id,
          contingency_type: item.contingency_type,
          item: item.item,
          remarks: item.remarks,
          unit_price: item.unit_price ?? 0,
          quantity: item.replacement_quantity,
          unit: item.unit,
          make: item.make,
          date: item.date,
          total_amount: item.replacement_total_amount,
          bom_contingency: contingencyId,
          bom_head_name: item.category,
          is_replaced: true,
        });
      });
    }

    if (replacementOtherItemList.length > 0) {
      replacementOtherItemList.map((otherItem) => {
        apiData.push({
          name: otherItem.name,
          remarks: otherItem.description,
          total_amount: otherItem.replacement_total_amount ?? 0,
          bom_contingency: contingencyId,
          bom_head_name: otherItem.category,
          is_replaced: true,
        });
      });
    }
    if (apiData.length > 0) {
      await requestHandler(
        async () => await addContigencyItems(apiData),
        null,
        async (data) => {
          toast.success("Contingency Item Added Successfully!");
          await handleEditContingency("Pending", true);
        },
        toast.error
      );
      setIsLoading(false);
    } else {
      router.push(
        `/projects/${projectId}?tab=Engineering&projectName=${projectName}`
      );
    }
  };

  async function handleEditContingency(status, isFinalSubmit = false) {
    let formData = {
      status: status,
      project: projectId,
      total_amount: total_amount,
      contingency_amount: total_contingency_amount,
    };

    await requestHandler(
      async () => await editContingencyRemark(contingencyId, formData),
      null,
      () => {
        if (isFinalSubmit) {
          router.push(
            `/projects/${projectId}?tab=Engineering&projectName=${projectName}`
          );
        }
      },
      toast.error
    );
  }

  const tableValueHandler = (key, value, index, isOthers = false) => {
    if (isOthers) {
      const list = [...replacementOtherItemList];

      list[index][key] = value;
      setReplacementOtherItemList([...list]);
    } else {
      const list = [...replacementItemList];

      list[index][key] = value;
      setReplacementItemList([...list]);
    }
  };

  return (
    <>
      <div className="relative h-full flex flex-col">
        {/* Buttons Section (Fixed) */}
        <div className="flex justify-end">
          <Button
            onClick={() => openModal("add-contingency-item")}
            variant={"inverted"}
            customText={"#F47920"}
            className="bg-orange-400/10 mb-2 mr-2 w-[7rem] self-end text-primary px-2 hover:bg-orange-600/10"
          >
            <FaPlusCircle />
            Add Item
          </Button>
          {[...itemList, ...otherItemList].length > 0 && (
            <Button
              onClick={() => openModal("replace-contingency-item")}
              variant={"inverted"}
              customText={"#F47920"}
              className="bg-orange-400/10 mb-2 self-end text-primary px-2 hover:bg-orange-600/10"
            >
              Replacement
            </Button>
          )}
        </div>

        {/* Scrollable Section */}
        <div className="overflow-auto flex-grow mb-[5rem]">
          {itemList.length > 0 && (
            <div className="overflow-auto mt-2">
              <strong>Contingency Items</strong>
              <div className="overflow-x-auto">
                <Table columns={tableHeader} rows={itemList} />
              </div>
            </div>
          )}

          {otherItemList.length > 0 && (
            <div className="mt-4 overflow-auto">
              <strong>Other Contingency Items</strong>
              <div className="overflow-x-auto">
                <Table columns={tableHeaderForOthers} rows={otherItemList} />
              </div>
            </div>
          )}

          {[...otherItemList, ...itemList].length > 0 && (
            <div className="mt-2 mb-4 flex justify-end w-full">
              <strong>
                Added Increased Amount: ₹{formatPrice(total_amount)}
              </strong>
            </div>
          )}

          {[...replacementItemList, ...replacementOtherItemList].length > 0 && (
            <>
              <strong className=" text-lg">Replaced Items</strong>

              {replacementItemList.length > 0 && (
                <div className="overflow-auto">
                  <strong>Contingency Items</strong>
                  <div className="overflow-x-auto">
                    <ProjectItemTable
                      columns={replacementTableHeader}
                      rows={replacementItemList}
                      valueHandler={tableValueHandler}
                      isEditMode={true}
                      canDelete={true}
                      onDeleteRow={handleReplacedItemDelete}
                    />
                  </div>
                </div>
              )}

              {replacementOtherItemList.length > 0 && (
                <div className="mt-4 overflow-auto">
                  <strong>Other Contingency Items</strong>
                  <div className="overflow-x-auto">
                    <ProjectItemTable
                      isEditMode={true}
                      canDelete={true}
                      valueHandler={(key, value, index) =>
                        tableValueHandler(key, value, index, true)
                      }
                      columns={replacementTableHeaderForOthers}
                      rows={replacementOtherItemList}
                      onDeleteRow={(row) => handleReplacedItemDelete(row, true)}
                    />
                  </div>
                </div>
              )}

              <strong className="flex justify-end">
                Reduced Replacement Amount: ₹
                {formatPrice(total_replaced_amount)}
              </strong>
              <strong className="flex justify-end">
                Net Contingency Amount: ₹{formatPrice(total_contingency_amount)}
              </strong>
            </>
          )}
        </div>

        {/* Fixed Buttons Section */}
        <div className="flex gap-4 justify-end py-4 absolute bottom-0 right-2 bg-white w-full z-[40]">
          <Button
            className="h-[2rem] w-small"
            onClick={() =>
              onBackClick(
                itemList,
                otherItemList,
                replacementItemList,
                replacementOtherItemList
              )
            }
            customText={"#9E9E9E"}
            variant={"gray"}
          >
            Back
          </Button>
          <Button
            className="h-[2rem] w-small"
            onClick={() => (isLoading ? {} : onSubmit())}
          >
            {isLoading ? "Saving..." : "Submit"}
          </Button>
        </div>
      </div>

      <AddContingencyItem
        onAddItem={(data) => {
          if (data.isOthers) {
            setOtherItemList([...otherItemList, data]);
          } else {
            setItemList([...itemList, data]);
          }
        }}
        projectHeads={projectDetails?.bom_heads}
        projectId={projectId}
        itemRemark={itemRemark}
        projectOtherItems={installationItems}
        existingItemIds={new Set(itemList.map((item) => item.product_code))}
        existingOtherItems={otherItemList}
      />

      <ReplaceContingencyItem
        onAddItem={(data) => {
          if (data.isOthers) {
            setReplacementOtherItemList([...replacementOtherItemList, data]);
          } else {
            setReplacementItemList([...replacementItemList, data]);
          }
        }}
        projectHeads={projectDetails?.bom_heads}
        projectId={projectId}
        itemRemark={itemRemark}
        projectOtherItems={installationItems}
        existingOtherItemIds={
          new Set(replacementOtherItemList.map((item) => item.name))
        }
        existingItemIds={
          new Set(
            [...itemList, ...replacementItemList].map(
              (item) => item.product_code
            )
          )
        }
      />

      <DeleteWarningModal
        modalId={"delete-project-contignecy-item"}
        modalContent={
          <>
            Are you sure you want to delete Contingency Item-{" "}
            <strong>
              {selectedItem?.product_code ?? selectedItem?.name}
              {selectedItem?.product_code && <>({selectedItem?.item_name})</>}
            </strong>
            ?
          </>
        }
        onSubmit={() => deleteContingencyItem(selectedItem?.id)}
      />
    </>
  );
};

export default ContingencyItemsForm;
