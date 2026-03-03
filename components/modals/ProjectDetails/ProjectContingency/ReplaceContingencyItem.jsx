import { useState, useEffect } from "react";
import { SelectForObjects } from "@/components/formPage/MultiSelectDropdown/MultiSelectDropdown";
import FormModal from "@/components/shared/FormModal";
import { toast } from "sonner";
import { useModal } from "@/contexts/modal";
import { checkSpecificKeys } from "@/utils/formValidationHandler";
import { dateFormatInYYYYMMDD } from "@/utils/formatter";

const ReplaceContingencyItem = ({
  projectHeads,
  projectId,
  onAddItem,
  itemRemark,
  projectOtherItems,
  existingItemIds,
  existingOtherItemIds,
}) => {
  const { closeModal } = useModal();
  const today = dateFormatInYYYYMMDD(new Date());
  const [projectItemList, setProjectItemList] = useState({});
  const [selectedItem, setSelectedItem] = useState("");
  const [selectedCatagory, setSelecteCategory] = useState("");

  const [otherItem, setOtherItem] = useState({
    name: "",
    description: itemRemark,
    amount: "",
  });

  const [item, setItem] = useState({
    category: "",
    section_name: "",
    section_id: "",
    item: "",
    product_code: "",
    item_name: "",
    make: "",
    quantity: "",
    contingency_type: "",
    unit_price: "",
    total_amount: "",
    remarks: itemRemark,
    date: today,
    project: projectId,
  });

  const frieghtItems = projectOtherItems.filter(
    (item) =>
      item.budget_type === "Freight" && !existingOtherItemIds.has(item.name)
  );
  const installationItems = projectOtherItems.filter(
    (item) =>
      item.budget_type === "Installation" &&
      !existingOtherItemIds.has(item.name)
  );
  const otherItems = projectOtherItems.filter(
    (item) =>
      item.budget_type === "Other" && !existingOtherItemIds.has(item.name)
  );

  const categoryList = [
    { name: "Electrical", value: "Electrical" },
    { name: "Mechanical", value: "Mechanical" },
    { name: "Inroof", value: "Inroof" },
    { name: "Other Structure", value: "Other_structure" },
    { name: "Panel", value: "Panel" },
    { name: "Inverter", value: "Inverter" },
    { name: "Installation", value: "Installation" },
    { name: "Freight", value: "Freight" },
    { name: "Other", value: "Other" },
  ];

  useEffect(() => {
    if (projectHeads && Object.keys(projectHeads).length > 0) {
      createEngineeringItemList(projectHeads);
    }
  }, [projectHeads, existingItemIds]);

  const createEngineeringItemList = (sections) => {
    let categoryList = combineCategoryItems(sections);
    categoryList["Installation"] = installationItems;
    categoryList["Freight"] = frieghtItems;
    categoryList["Other"] = otherItems;
    setProjectItemList(categoryList);
  };

  function combineCategoryItems(data) {
    let result = {};

    for (let category in data) {
      let combinedItems = [];

      // Collect all bom_items from sections
      data[category].forEach((section) => {
        combinedItems = combinedItems.concat(section.bom_items);
      });

      // Remove duplicates based on item properties (e.g., id)
      let uniqueItems = Array.from(
        new Map(combinedItems.map((item) => [item.id, item])).values()
      );

      //remove items with 0 quantity left after booking
      const filteredItems = uniqueItems.filter(
        (item) => item.bom_items_quantity_left_after_booking.quantity != 0
      );
      if (existingItemIds.size > 0) {
        const nonExistingItems = filteredItems.filter(
          (item) => !existingItemIds.has(item.product_code)
        );
        result[category] = nonExistingItems;
      } else {
        result[category] = filteredItems;
      }
    }
    return result;
  }

  const handleCategory = (name, value) => {
    setSelecteCategory(value);
    if (!["Installation", "Freight", "Other"].includes(value)) {
      let sections = projectHeads[value].map((section) => ({
        name: section.name,
        id: section.id,
      }));
      setItem((prev) => ({
        ...prev,
        category: value,
        contingency_type: "price",
        section_id: sections[0].id,
        section_name: sections[0].name,
      }));
    }
  };

  const onSubmit = async () => {
    if (["Installation", "Freight", "Other"].includes(selectedCatagory)) {
      let keysToCheck = {
        name: "Item",
        category: "Category",
      };

      const validationResult = checkSpecificKeys(otherItem, keysToCheck);
      if (validationResult.isValid === false) {
        toast.error(validationResult.message);
        return;
      }
      onAddItem({
        ...otherItem,
        total_amount: otherItem.amount,
        isOthers: true,
        category: selectedCatagory,
      });
    } else {
      let keysToCheck = {
        item: "Item",
        category: "Category",
      };

      const validationResult = checkSpecificKeys(item, keysToCheck);
      if (validationResult.isValid === false) {
        toast.error(validationResult.message);
        return;
      }
      onAddItem({
        ...item,
        category:
          item.category === "Other_structure"
            ? "Other Structure"
            : item.category,
      });
    }

    closeModal("replace-contingency-item");
    clearForm();
  };

  const clearForm = () => {
    setItem({
      category: "",
      section_name: "",
      section_id: "",
      item: "",
      make: "",
      quantity: "",
      contingency_type: "",
      unit_price: "",
      remarks: itemRemark,
      date: today,
      project: projectId,
    });
    setOtherItem({
      name: "",
      description: itemRemark,
      amount: "",
    });
    setSelecteCategory("");
    setSelectedItem();
  };

  return (
    <FormModal
      id={"replace-contingency-item"}
      onSubmit={onSubmit}
      ctaText={"Replace Item"}
      heading={"Replace Contingency Item"}
      onClose={clearForm}
      className={"overflow-visible"}
    >
      <div className="grid grid-cols-2 gap-x-2.5 gap-y-5">
        <SelectForObjects
          margin={"0px"}
          height={"36px"}
          mandatory={true}
          setselected={handleCategory}
          selected={
            categoryList.filter(
              (category) => category.value == selectedCatagory
            )[0]?.name
          }
          options={categoryList}
          optionName={"name"}
          optionID={"value"}
          placeholder="Select"
          dropdownLabel={"Category"}
        />

        {["Installation", "Freight", "Other"].includes(selectedCatagory) ? (
          <SelectForObjects
            margin={"0px"}
            height={"36px"}
            mandatory={true}
            setselected={(value) => {
              const selected = projectItemList[selectedCatagory].find(
                (product) => product.name === value
              );
              setOtherItem({
                name: selected?.name,
                description: itemRemark,
                amount: selected?.left_po_amount,
                category: selectedCatagory,
                replacement_total_amount: selected?.left_po_amount,
              });
            }}
            selected={otherItem.name}
            options={projectItemList[selectedCatagory]}
            optionName={"name"}
            optionID={"name"}
            placeholder="Select"
            dropdownLabel={"Select Item"}
          />
        ) : (
          <SelectForObjects
            margin={"0px"}
            height={"36px"}
            setselected={(value) => {
              const selected = projectItemList[selectedCatagory].find(
                (product) => product.product_code === value
              );
              const total =
                Number(selected?.bbu_unit_price || 0) *
                Number(
                  selected?.bom_items_quantity_left_after_booking.quantity ||
                  0
                );
              setItem((prev) => ({
                ...prev,
                item: selected?.item,
                item_name: selected?.item_name,
                unit: selected?.bom_item_unit_id,
                product_code: selected?.product_code,
                unit_price: selected?.bbu_unit_price,
                section_id: selected?.bom_section,
                section_name: selected?.bom_section_name,
                make: selected?.make,
                quantity:
                  selected?.bom_items_quantity_left_after_booking.quantity ||
                  0,
                unit_symbol:
                  selected?.bom_items_quantity_left_after_booking?.unit,
                replacement_quantity:
                  selected?.bom_items_quantity_left_after_booking.quantity ||
                  0,
                replacement_total_amount: total,
                total_amount: total,
              }));
              setSelectedItem(
                selected != ""
                  ? `${selected.product_code}(${selected.item_name})`
                  : ""
              );
            }}
            selected={selectedItem}
            options={projectItemList[selectedCatagory]}
            mandatory={true}
            dropdownType={"product_list"}
            productDescriptionKey={"item_name"}
            optionName={"product_code"}
            placeholder="Product Code(Product Name)"
            dropdownLabel={"Select Item"}
          />
        )}
      </div>
    </FormModal>
  );
};

export default ReplaceContingencyItem;
