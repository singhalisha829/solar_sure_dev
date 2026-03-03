import { useManufacturers } from "@/contexts/manufacturers";
import { useState } from "react";
import Input from "../formPage/Input";
import { SelectForObjects } from "../formPage/MultiSelectDropdown/MultiSelectDropdown";
import FormModal from "../shared/FormModal";

const AddItemModal = ({ id, onSubmit, products, sectionName }) => {
  const { manufacturers } = useManufacturers();
  const [item, setItem] = useState({
    bom_section: id,
    item: "",
    item_name: "",
    product_code: "",
    make: "",
    quantity: "",
    unit: "",
    estimated_cost_price: null,
    cost_price: null,
    vendor: null,
    selling_price: null,
    uom: "",
    remarks: "",
  });

  const valueHandler = (e) => {
    setItem((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const clearForm = () => {
    setItem({
      bom_section: id,
      item: "",
      item_name: "",
      product_code: "",
      make: "",
      quantity: "",
      unit: "",
      estimated_cost_price: null,
      cost_price: null,
      vendor: null,
      selling_price: null,
      uom: "",
      remarks: "",
    });
  };

  return (
    <FormModal
      id={"item" + id}
      onSubmit={() => {
        onSubmit(item);
      }}
      ctaText={"Create Item"}
      heading={
        <>
          Add Item For <span className="font-extrabold">{sectionName}</span>
        </>
      }
      onClose={clearForm}
      className={"overflow-visible"}
    >
      <div className="grid grid-cols-2 gap-x-2.5 gap-y-5">
        <SelectForObjects
          margin={"0px"}
          height={"36px"}
          setselected={(value) => {
            const selected = products.find(
              (product) => product.product_code === value
            );
            setItem((prev) => ({
              ...prev,
              item: selected?.id,
              unit: selected?.inventory?.unit,
              uom: selected?.inventory?.unit,
              item_name: selected?.name,
              product_code: selected?.product_code,
            }));
          }}
          selected={
            products?.find((product) => product.id === item.item)?.product_code
          }
          options={products}
          optionName={"product_code"}
          placeholder="Select Item"
          dropdownLabel={"Select Item"}
        />
        <div className={`relative flex flex-col gap-2.5 w-full justify-center`}>
          <label
            className="flex gap-[2px] text-xs capitalize text-zinc-800 font-bold tracking-tight"
            htmlFor={"Unit of Measurement"}
          >
            Unit of Measurement
          </label>
          <span className="text-sm">{item.unit}</span>
        </div>
        <SelectForObjects
          margin={"0px"}
          height={"36px"}
          setselected={(value) => {
            const selected = manufacturers.find((m) => m.name === value);
            setItem((prev) => ({ ...prev, make: selected?.id }));
          }}
          selected={manufacturers.find((m) => m.id === item.make)?.name}
          options={manufacturers}
          optionName={"name"}
          placeholder="Select Make"
          dropdownLabel={"Select Make"}
        />
        <Input
          type="number"
          onChange={valueHandler}
          value={item.quantity}
          name={"quantity"}
          label={"Select Quantity (Value)"}
        />
        <Input
          type="textarea"
          onChange={valueHandler}
          value={item.remarks}
          name={"remarks"}
          label={"Remark"}
          outerClass="col-span-2"
        />
      </div>
    </FormModal>
  );
};

export default AddItemModal;
