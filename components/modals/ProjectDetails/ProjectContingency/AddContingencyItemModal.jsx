import { useManufacturers } from "@/contexts/manufacturers";
import { useState, useEffect } from "react";
import Input from "@/components/formPage/Input";
import { SelectForObjects } from "@/components/formPage/MultiSelectDropdown/MultiSelectDropdown";
import FormModal from "@/components/shared/FormModal";
import { getProducts } from "@/services/api";
import { requestHandler } from "@/services/ApiHandler";
import { toast } from "sonner";
import { useModal } from "@/contexts/modal";
import { checkSpecificKeys } from "@/utils/formValidationHandler";
import { dateFormatInYYYYMMDD } from "@/utils/formatter";

const AddContingencyItem = ({
  projectHeads,
  projectId,
  onAddItem,
  itemRemark,
  projectOtherItems,
  existingItemIds,
  existingOtherItems,
}) => {
  const { closeModal } = useModal();
  const { manufacturers } = useManufacturers();
  const today = dateFormatInYYYYMMDD(new Date());
  const [projectItemList, setProjectItemList] = useState({});
  const [sectionList, setSectionList] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [products, setProducts] = useState([]);
  const [selectedCatagory, setSelecteCategory] = useState("");
  const [otherItemError, setOtherItemError] = useState("");
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

  const contingencyList = [
    { name: "Add New Item", value: "new item" },
    { name: "Increase Quantity", value: "quantity" },
    { name: "Change Unit Price", value: "price" },
    { name: "Change Quantity & Unit Price", value: "quantity_and_price" },
  ];

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

  useEffect(() => {
    if (selectedCatagory != "" && item.contingency_type === "new item") {
      fetchProductHandler(
        selectedCatagory === "Other_structure"
          ? "Other Structure"
          : selectedCatagory
      );
    }
  }, [selectedCatagory, item.contingency_type]);

  const createEngineeringItemList = (sections) => {
    let categoryList = combineCategoryItems(sections);
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
      if (existingItemIds.size > 0) {
        const filteredItems = uniqueItems.filter(
          (item) => !existingItemIds.has(item.product_code)
        );
        result[category] = filteredItems;
      } else {
        result[category] = uniqueItems;
      }
    }

    return result;
  }

  const fetchProductHandler = async (category) => {
    await requestHandler(
      async () =>
        await getProducts({
          sections: [category],
          contingency_type: "new_item",
          project_id: projectId,
        }),
      null,
      (data) => setProducts(data.data.output),
      toast.error
    );
  };

  const valueHandler = (e) => {
    setItem((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCategory = (name, value) => {
    setSelecteCategory(value);
    setOtherItem({
      name: "",
      description: itemRemark,
      amount: "",
    });
    if (!["Installation", "Freight", "Other"].includes(value)) {
      let sections = projectHeads[value].map((section) => ({
        name: section.name,
        id: section.id,
      }));
      setSectionList(sections);
      setItem((prev) => ({
        ...prev,
        category: value,
        section_id: sections[0].id,
        section_name: sections[0].name,
      }));
    }
  };

  const onSubmit = async () => {
    let keysToCheck = {
      contingency_type: "Contingency Type",
      item: "Item",
      category: "Category",
      section_id: "Section",
    };

    if (item.contingency_type === "new item") {
      keysToCheck = {
        ...keysToCheck,
        make: "Make",
        quantity: "Quantity",
        unit_price: "Unit Price",
      };
    } else if (item.contingency_type === "quantity") {
      keysToCheck = { ...keysToCheck, quantity: "Quantity" };
    } else if (item.contingency_type === "price") {
      keysToCheck = { ...keysToCheck, unit_price: "Unit Price" };
    } else if (item.contingency_type === "quantity_and_price") {
      keysToCheck = {
        ...keysToCheck,
        quantity: "Quantity",
        unit_price: "Unit Price",
      };
    }

    keysToCheck = { ...keysToCheck, remarks: "Remark" };

    const validationResult = checkSpecificKeys(item, keysToCheck);
    if (validationResult.isValid === false) {
      toast.error(validationResult.message);
      return;
    }

    let total_amount = item.quantity * item.unit_price || 0;
    let contingency_amount = 0;
    if (["new item", "quantity"].includes(item.contingency_type)) {
      contingency_amount = total_amount;
    } else if (item.contingency_type == "price") {
      contingency_amount =
        item.quantity *
        (Number(item.unit_price || 0) - Number(item?.old_unit_price || 0));
    } else {
      contingency_amount =
        Number(total_amount) -
        Number(item?.old_quantity * item?.old_unit_price);
    }

    onAddItem({
      ...item,
      category:
        item.category === "Other_structure" ? "Other Structure" : item.category,
      total_amount: total_amount,
      contingency_amount: contingency_amount,
    });
    closeModal("add-contingency-item");
    clearForm();
  };

  const onSubmitOthers = async () => {
    // if (otherItemError != "") {
    //   toast.error("This Item already exists.Please try again!");
    //   return;
    // }
    let keysToCheck = {
      name: "Name",
      amount: "Amount",
      description: "Description",
    };

    const validationResult = checkSpecificKeys(otherItem, keysToCheck);
    if (validationResult.isValid === false) {
      toast.error(validationResult.message);
      return;
    }

    onAddItem({ ...otherItem, isOthers: true, category: selectedCatagory });
    closeModal("add-contingency-item");
    clearForm();
  };

  const handleContingency = (value) => {
    if (value === "new item") {
      setItem({
        ...item,
        category: selectedCatagory,
        section_id: projectHeads[selectedCatagory][0].id,
        section_name: projectHeads[selectedCatagory][0].name,
        contingency_type: value,
        item: "",
        make: "",
        quantity: "",
        unit_price: "",
        remarks: itemRemark,
      });

      let sections = projectHeads[selectedCatagory].map((section) => ({
        name: section.name,
        id: section.id,
      }));
      setSectionList(sections);
    } else {
      setItem({
        ...item,
        category: selectedCatagory,
        section_id: "",
        section_name: "",
        contingency_type: value,
        item: "",
        make: "",
        quantity: "",
        unit_price: "",
        remarks: itemRemark,
      });
    }
    setSelectedItem("");
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
    setOtherItemError("");
  };

  const checkForExistingOtherItemName = () => {
    // prepare project's item name list
    if (otherItem.name != "") {
      const filteredCategoryItems = projectOtherItems.filter(
        (item) => item.budget_type === selectedCatagory
      );
      const projectItemList = new Set(
        filteredCategoryItems.map((item) => item.name)
      );

      // prepare contingency form's item name list
      const filteredexistingCategoryItems = existingOtherItems.filter(
        (item) => item.category === selectedCatagory
      );
      const existingItemList = new Set(
        filteredexistingCategoryItems.map((item) => item.name)
      );

      if (
        new Set([...projectItemList, ...existingItemList]).has(otherItem.name)
      ) {
        let index = filteredCategoryItems.findIndex(
          (item) => item.name === otherItem.name
        );
        if (index === -1) {
          index = filteredexistingCategoryItems.findIndex(
            (item) => item.name === otherItem.name
          );
          setOtherItemError(
            `Previous Item Amount: ${filteredexistingCategoryItems[index]?.amount}`
          );
        } else {
          setOtherItemError(
            `Previous Item Amount: ${filteredCategoryItems[index]?.amount}`
          );
        }
      } else {
        setOtherItemError("");
      }
    }
  };

  return (
    <FormModal
      id={"add-contingency-item"}
      onSubmit={() => {
        if (["Installation", "Freight", "Other"].includes(selectedCatagory)) {
          onSubmitOthers();
        } else {
          onSubmit();
        }
      }}
      ctaText={"Create Item"}
      heading={"Add Contingency Item"}
      onClose={clearForm}
      className={"overflow-visible"}
    >
      <div
        className={`grid grid-cols-2 gap-x-2.5 gap-y-5 ${item.contingency_type == "" ? "" : "overflow-y-auto"}`}
      >
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
        {!["Installation", "Freight", "Other"].includes(selectedCatagory) &&
          selectedCatagory != "" && (
            <SelectForObjects
              margin={"0px"}
              height={"36px"}
              setselected={(name, value) => handleContingency(value)}
              selected={
                contingencyList.filter(
                  (contigency) => contigency.value === item.contingency_type
                )[0]?.name
              }
              mandatory={true}
              options={contingencyList}
              optionName={"name"}
              optionID={"value"}
              placeholder="Select"
              dropdownLabel={"Contingency Type"}
            />
          )}

        {!["Installation", "Freight", "Other"].includes(selectedCatagory) ? (
          <>
            {/* display category and section */}
            {item.contingency_type !== "" && (
              <>
                <Input
                  type="date"
                  mandatory={true}
                  onChange={valueHandler}
                  value={item.date}
                  name={"date"}
                  label={"Date"}
                />

                <SelectForObjects
                  margin={"0px"}
                  height={"36px"}
                  setselected={(name, value) =>
                    setItem({ ...item, section_id: value, section_name: name })
                  }
                  selected={item.section_name}
                  disabled={true}
                  options={sectionList}
                  mandatory={true}
                  optionName={"name"}
                  optionID={"id"}
                  placeholder="Select"
                  dropdownLabel={"Section"}
                />
              </>
            )}

            {/* add item form */}
            {item.contingency_type === "new item" && (
              <>
                <SelectForObjects
                  margin={"0px"}
                  height={"36px"}
                  mandatory={true}
                  setselected={(value) => {
                    const selected = products.find(
                      (product) => product.product_code === value
                    );
                    if (["Panel", "Inverter"].includes(selectedCatagory)) {
                      setItem((prev) => ({
                        ...prev,
                        item: selected?.id,
                        unit: selected?.inventory_unit_id,
                        unit_symbol: selected?.inventory_unit,
                        product_code: selected?.product_code,
                        item_name: selected?.name,
                        make: selected?.manufacturer,
                      }));
                    } else {
                      setItem((prev) => ({
                        ...prev,
                        item: selected?.id,
                        unit: selected?.inventory_unit_id,
                        unit_symbol: selected?.inventory_unit,
                        item_name: selected?.name,
                        product_code: selected?.product_code,
                      }));
                    }
                    setSelectedItem(
                      selected != ""
                        ? `${selected?.product_code}(${selected?.name})`
                        : ""
                    );
                  }}
                  selected={selectedItem}
                  // options={products}
                  options={products.filter(product => ![...(existingItemIds || [])].includes(product.product_code))}
                  dropdownType={"product_list"}
                  productDescriptionKey={"name"}
                  optionName={"product_code"}
                  placeholder="Product Code(Product Name)"
                  dropdownLabel={"Select Item"}
                />
                {/* make is automatically selected for Panel and Inverter from product details */}
                <SelectForObjects
                  margin={"0px"}
                  height={"36px"}
                  mandatory={true}
                  setselected={(value) => {
                    const selected = manufacturers.find(
                      (m) => m.name === value
                    );
                    setItem((prev) => ({ ...prev, make: selected?.id }));
                  }}
                  selected={manufacturers.find((m) => m.id === item.make)?.name}
                  options={manufacturers}
                  disabled={["Panel", "Inverter"].includes(selectedCatagory)}
                  optionName={"name"}
                  placeholder="Select Make"
                  dropdownLabel={"Select Make"}
                />
                <Input
                  type="number"
                  mandatory={true}
                  onChange={valueHandler}
                  value={item.quantity}
                  name={"quantity"}
                  label={"Quantity"}
                />
                <div
                  className={`relative flex flex-col gap-2.5 w-full justify-center`}
                >
                  <label
                    className="flex gap-[2px] text-xs capitalize text-zinc-800 font-bold tracking-tight"
                    htmlFor={"Unit of Measurement"}
                  >
                    Unit of Measurement
                  </label>
                  <span className="text-sm">
                    {item?.unit_symbol == "" ? "-" : item.unit_symbol}
                  </span>
                </div>

                <Input
                  type="number"
                  onChange={valueHandler}
                  mandatory={true}
                  value={item.unit_price}
                  name={"unit_price"}
                  label={"Unit Price"}
                />

                <div
                  className={`relative flex flex-col gap-2.5 w-full justify-center`}
                >
                  <label
                    className="flex gap-[2px] text-xs capitalize text-zinc-800 font-bold tracking-tight"
                    htmlFor={"Total Amount"}
                  >
                    Total Amount
                  </label>
                  <span className="text-sm">
                    {item.quantity * item.unit_price || 0}
                  </span>
                </div>
                <div
                  className={`relative flex flex-col gap-2.5 w-full justify-center`}
                >
                  <label
                    className="flex gap-[2px] text-xs capitalize text-zinc-800 font-bold tracking-tight"
                    htmlFor={"Total Amount"}
                  >
                    Contingency Amount
                  </label>
                  <span className="text-sm">
                    {item.quantity * item.unit_price || 0}
                  </span>
                </div>
              </>
            )}

            {/* change unit price form */}
            {item.contingency_type === "price" && (
              <>
                <SelectForObjects
                  margin={"0px"}
                  height={"36px"}
                  setselected={(value) => {
                    const selected = projectItemList[selectedCatagory].find(
                      (product) => product.product_code === value
                    );
                    setItem((prev) => ({
                      ...prev,
                      item: selected?.item,
                      item_name: selected?.item_name,
                      unit_symbol: selected?.inventory?.unit,
                      unit: selected?.bom_item_unit_id,
                      product_code: selected?.product_code,
                      old_unit_price: selected?.bbu_unit_price,
                      quantity:
                        selected?.bom_items_quantity_left_after_booking
                          ?.quantity,
                      section_id: selected?.bom_section,
                      section_name: selected?.bom_section_name,
                      make: selected?.make,
                      old_quantity: selected?.quantity?.quantity,
                      left_quantity_after_booking: selected?.bom_items_quantity_left_after_booking?.quantity,
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
                <Input
                  type="number"
                  onChange={valueHandler}
                  mandatory={true}
                  value={item.unit_price}
                  name={"unit_price"}
                  label={`Unit Price (Old Unit Price: ${item?.old_unit_price ?? ""})`}
                />
                <div
                  className={`relative flex flex-col gap-2.5 w-full justify-center`}
                >
                  <label
                    className="flex gap-[2px] text-xs capitalize text-zinc-800 font-bold tracking-tight"
                    htmlFor={"Left Quantity"}
                  >
                    Total Quantity
                  </label>
                  <span className="text-sm">{item.old_quantity || 0}</span>
                </div>
                <div
                  className={`relative flex flex-col gap-2.5 w-full justify-center`}
                >
                  <label
                    className="flex gap-[2px] text-xs capitalize text-zinc-800 font-bold tracking-tight"
                    htmlFor={"Left Quantity"}
                  >
                    Remaining Quantity
                  </label>
                  <span className="text-sm">{item.left_quantity_after_booking || 0}</span>
                </div>

                {/* <div
                  className={`relative flex flex-col gap-2.5 w-full justify-center`}
                >
                  <label
                    className="flex gap-[2px] text-xs capitalize text-zinc-800 font-bold tracking-tight"
                    htmlFor={"Left Quantity"}
                  >
                    Remaining Quantity
                  </label>
                  <span className="text-sm">{item.quantity || 0}</span>
                </div> */}
                <div
                  className={`relative flex flex-col gap-2.5 w-full justify-center`}
                >
                  <label
                    className="flex gap-[2px] text-xs capitalize text-zinc-800 font-bold tracking-tight"
                    htmlFor={"Total Amount"}
                  >
                    Total Amount
                  </label>
                  <span className="text-sm">
                    {item.quantity * item.unit_price || 0}
                  </span>
                </div>
                <div
                  className={`relative flex flex-col gap-2.5 w-full justify-center`}
                >
                  <label
                    className="flex gap-[2px] text-xs capitalize text-zinc-800 font-bold tracking-tight"
                    htmlFor={"Total Amount"}
                  >
                    Contingency Amount
                  </label>
                  <span className="text-sm">
                    {item.quantity *
                      (Number(item.unit_price || 0) -
                        Number(item?.old_unit_price || 0))}
                  </span>
                </div>
              </>
            )}

            {/* increase quantity form */} {/*task: updated total and left quantity */}
            {item.contingency_type === "quantity" && (
              <>
                <SelectForObjects
                  margin={"0px"}
                  height={"36px"}
                  setselected={(value) => {
                    const selected = projectItemList[selectedCatagory].find(
                      (product) => product.product_code === value
                    );
                    setItem((prev) => ({
                      ...prev,
                      item: selected?.item,
                      item_name: selected?.item_name,
                      unit: selected?.bom_item_unit_id,
                      unit_symbol: selected?.inventory?.unit,
                      product_code: selected?.product_code,
                      unit_price: selected?.bbu_unit_price,
                      old_quantity: selected?.quantity?.quantity,
                      left_quantity_after_booking: selected?.bom_items_quantity_left_after_booking?.quantity,
                      left_quantity:
                        selected?.left_inventory_after_booking?.quantity,
                      section_id: selected?.bom_section,
                      section_name: selected?.bom_section_name,
                      make: selected?.make,
                    }));
                    setSelectedItem(
                      selected != ""
                        ? `${selected?.product_code}(${selected?.item_name})`
                        : ""
                    );
                  }}
                  selected={selectedItem}
                  options={projectItemList[selectedCatagory]}
                  mandatory={true}
                  optionName={"product_code"}
                  dropdownType={"product_list"}
                  productDescriptionKey={"item_name"}
                  placeholder="Product Code(Product Name)"
                  dropdownLabel={"Select Item"}
                />
                <Input
                  type="number"
                  onChange={valueHandler}
                  mandatory={true}
                  value={item.quantity}
                  name={"quantity"}
                  placeholder={"Enter Increased Quantity"}
                  label={`Quantity (Total Quantity:  ${item?.old_quantity ?? ""}, Left Quantity:  ${item?.left_quantity_after_booking ?? ""})`}
                />
                <div
                  className={`relative flex flex-col gap-2.5 w-full justify-center`}
                >
                  <label
                    className="flex gap-[2px] text-xs capitalize text-zinc-800 font-bold tracking-tight"
                    htmlFor={"Unit Price"}
                  >
                    Unit Price
                  </label>
                  <span className="text-sm">{item.unit_price || 0}</span>
                </div>
                <div
                  className={`relative flex flex-col gap-2.5 w-full justify-center`}
                >
                  <label
                    className="flex gap-[2px] text-xs capitalize text-zinc-800 font-bold tracking-tight"
                    htmlFor={"Total Amount"}
                  >
                    Total Amount
                  </label>
                  <span className="text-sm">
                    {item.quantity * item.unit_price || 0}
                  </span>
                </div>
                <div
                  className={`relative flex flex-col gap-2.5 w-full justify-center`}
                >
                  <label
                    className="flex gap-[2px] text-xs capitalize text-zinc-800 font-bold tracking-tight"
                    htmlFor={"Total Amount"}
                  >
                    Contingency Amount
                  </label>
                  <span className="text-sm">
                    {item.quantity * item.unit_price || 0}
                  </span>
                </div>
              </>
            )}

            {/* change quantity/unit price form */}
            {item.contingency_type === "quantity_and_price" && (
              <>
                <SelectForObjects
                  margin={"0px"}
                  height={"36px"}
                  setselected={(value) => {
                    const selected = projectItemList[selectedCatagory].find(
                      (product) => product.product_code === value
                    );
                    setItem((prev) => ({
                      ...prev,
                      item: selected?.item,
                      item_name: selected?.item_name,
                      unit: selected?.bom_item_unit_id,
                      unit_symbol: selected?.inventory?.unit,
                      product_code: selected?.product_code,
                      old_unit_price: selected?.bbu_unit_price,
                      old_quantity: selected?.quantity?.quantity,
                      left_quantity_after_booking: selected?.bom_items_quantity_left_after_booking?.quantity,
                      unit_price: "",
                      left_quantity:
                        selected?.left_inventory_after_booking?.quantity,
                      section_id: selected?.bom_section,
                      section_name: selected?.bom_section_name,
                      make: selected?.make,
                    }));
                    setSelectedItem(
                      selected != ""
                        ? `${selected?.product_code}(${selected?.item_name})`
                        : ""
                    );
                  }}
                  selected={selectedItem}
                  options={projectItemList[selectedCatagory]}
                  mandatory={true}
                  optionName={"product_code"}
                  dropdownType={"product_list"}
                  productDescriptionKey={"item_name"}
                  placeholder="Product Code(Product Name)"
                  dropdownLabel={"Select Item"}
                />
                <Input
                  type="number"
                  onChange={valueHandler}
                  mandatory={true}
                  value={item.quantity}
                  name={"quantity"}
                  label={`Quantity (Total Quantity:  ${item?.old_quantity ?? ""}, Left Quantity:  ${item?.left_quantity_after_booking ?? ""})`}
                />
                <Input
                  type="number"
                  onChange={valueHandler}
                  mandatory={true}
                  value={item.unit_price}
                  name={"unit_price"}
                  label={`Unit Price (Old Unit Price: ${item?.old_unit_price ?? ""})`}
                />
                <div
                  className={`relative flex flex-col gap-2.5 w-full justify-center`}
                >
                  <label
                    className="flex gap-[2px] text-xs capitalize text-zinc-800 font-bold tracking-tight"
                    htmlFor={"Total Amount"}
                  >
                    Total Amount
                  </label>
                  <span className="text-sm">
                    {item.quantity * item.unit_price || 0}
                  </span>
                </div>
                <div
                  className={`relative flex flex-col gap-2.5 w-full justify-center`}
                >
                  <label
                    className="flex gap-[2px] text-xs capitalize text-zinc-800 font-bold tracking-tight"
                    htmlFor={"Total Amount"}
                  >
                    Contingency Amount
                  </label>
                  <span className="text-sm">
                    {Number(item.quantity * item.unit_price) -
                      Number(item?.old_quantity * item?.old_unit_price) || ""}
                  </span>
                </div>
              </>
            )}

            {item.contingency_type !== "" && (
              <Input
                type="textarea"
                onChange={valueHandler}
                mandatory={true}
                value={item.remarks}
                name={"remarks"}
                label={"Remark"}
                outerClass="col-span-2"
              />
            )}
          </>
        ) : (
          // other contigency item form
          <>
            <br />
            <Input
              type={"text"}
              mandatory={true}
              value={otherItem.name}
              onChange={(e) =>
                setOtherItem({ ...otherItem, name: e.target.value })
              }
              onBlur={() => checkForExistingOtherItemName()}
              placeholder={"Name"}
              label={"Name"}
              error={otherItemError}
            />
            <Input
              type={"number"}
              mandatory={true}
              value={otherItem.amount}
              onChange={(e) =>
                setOtherItem({ ...otherItem, amount: e.target.value })
              }
              placeholder={"0.0"}
              label={"Amount"}
            />
            <Input
              type={"textarea"}
              mandatory={true}
              value={otherItem.description}
              outerClass="col-span-2 "
              onChange={(e) =>
                setOtherItem({ ...otherItem, description: e.target.value })
              }
              placeholder={"Description"}
              label={"Description"}
            />
          </>
        )}
      </div>
    </FormModal>
  );
};

export default AddContingencyItem;
