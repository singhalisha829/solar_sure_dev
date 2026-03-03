import { useState, useEffect } from "react";
import FormModal from "../shared/FormModal";
import ProcurementTable from "../project-components/ProcurementTable";

const AddPackingListItem = ({
  modalId,
  itemList,
  onSubmit,
  vendorName,
  addedItemList,
}) => {
  const [unpackedItems, setUnpackedItems] = useState([]);
  const tableHeader = [
    { name: "Item Code", width: "7rem", key: "product_code" },
    { name: "Item", width: "8rem", key: "item_name" },
    { name: "Make", width: "8rem", key: "make_name" },
    { name: "Quantity", width: "7rem", key: "quantity_new" },
    {
      name: "Packing List Quantity",
      width: "9rem",
      type: "quantity_object",
      key: "bom_items_booked_quantity",
    },
    {
      name: "Left Quantity",
      width: "8rem",
      type: "quantity_object",
      key: "bom_items_quantity_left_after_booking",
    },

    { name: "Inventory", width: "7rem", key: "inventory_new" },
    { name: "Packing List Quantity", width: "9rem", key: "booked_inventory" },
    {
      name: "Left Quantity",
      width: "5rem",
      key: "left_inventory_after_booking",
    },

    {
      name: "Quantity",
      width: "8rem",
      key: "item_quantity",
      type: "packing_list_quantity_field",
    },

    {
      name: "Remark",
      width: "18rem",
      key: "remark",
      type: "text",
    },
  ];

  const parentTableHeader = [
    { name: "", colSpan: 1 },
    { name: "", colSpan: 1 },
    { name: "", colSpan: 1 },
    { name: "BOM", colSpan: 3 },
    { name: "Inventory", colSpan: 3 },
    { name: "", colSpan: 1 },
    { name: "", colSpan: 1 },
  ];

  const [tableHeaderList, setTableHeaderList] = useState(tableHeader);
  const [parentTableHeaderList, setParentTableHeaderList] =
    useState(parentTableHeader);

  useEffect(() => {
    if (itemList.length > 0) {
      let list = {};

      itemList.map((item) => {
        if (item.bom_sections.length > 0) {
          const combinedBomHeads = item.bom_sections.reduce(
            (accumulator, currentValue) => {
              let new_list = [];
              currentValue.bom_items.map((item) => {
                new_list.push(item);
              });
              return accumulator.concat(new_list);
            },
            []
          );
          let new_list = [];
          combinedBomHeads.map((item) => {
            if (addedItemList.includes(item.item)) return;
            new_list.push(item);
          });
          if (new_list.length > 0) {
            list[item.bom_head] = new_list;
          }
        }
      });

      setUnpackedItems(list);
    }
  }, []);

  useEffect(() => {
    if (vendorName) {
      handleTableHeader(vendorName);
    }
  }, [vendorName]);

  const handleTableHeader = (name) => {
    let list = [...tableHeader];
    let parentList = [...parentTableHeader];

    if (name !== "Ornate Agencies Private Limited") {
      list.splice(6, 3);
      parentList.splice(4, 1);
    }
    setParentTableHeaderList(parentList);
    setTableHeaderList(list);
  };

  const onChangeHandler = (section, index, key, value) => {
    let item_list = unpackedItems;
    item_list[section][index][key] = value;
    setUnpackedItems({ ...item_list });
  };

  return (
    <FormModal
      id={modalId}
      onSubmit={() => onSubmit(unpackedItems)}
      width="w-[70%]"
      ctaText={"Add Item"}
      heading={"Add Packing List Item"}
    >
      <div className="overflow-scroll">
        {Object.keys(unpackedItems)?.map((section, index) => {
          return (
            <div key={index} className="flex flex-col gap-2.5">
              <div className="flex justify-between items-center">
                <p className="text-zinc-800 text-xl font-bold tracking-tight">
                  {section}
                </p>
              </div>
              <div className="overflow-scroll">
                <ProcurementTable
                  rows={unpackedItems[section]}
                  parentTableHeader={parentTableHeaderList}
                  columns={tableHeaderList}
                  onChangeHandler={(index, key, value) =>
                    onChangeHandler(section, index, key, value)
                  }
                  selectedVendor={vendorName}
                />
              </div>
            </div>
          );
        })}
      </div>
    </FormModal>
  );
};

export default AddPackingListItem;
