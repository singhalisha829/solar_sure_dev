import React, { useState } from "react";
import Input from "../formPage/Input";
import Button from "../shared/Button";
import { SelectForObjects } from "../formPage/MultiSelectDropdown/MultiSelectDropdown";
import FormModal from "../shared/FormModal";
import { LuX } from "react-icons/lu";
import { useModal } from "@/contexts/modal";
import { FaPlusCircle } from "react-icons/fa";

const RequestChangeModal = ({ items }) => {
  const [change, setChange] = useState({
    item: "",
    type: "",
    current_quantity: "",
    new_quantity: "",
  });
  const { closeModal } = useModal();

  const valueHandler = (e) => {
    setChange((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const itemHandler = (value) => {
    const item = items.find((item) => item.item === value);
    setChange((prev) => ({
      ...prev,
      item: value,
      current_quantity: item.Estimated_CP,
    }));
  };
  return (
    <FormModal id="change">
      <div className="flex items-center justify-between">
        <h3 className="text-zinc-800 text-lg font-semibold capitalize pl-4 border-l-2 border-orange-500">
          Request Change
        </h3>
        <button className="z-30" onClick={() => closeModal("change")}>
          <LuX size={14} />
        </button>
      </div>
      <div className="w-1/2">
        <SelectForObjects
          margin={"0px"}
          height={"36px"}
          setselected={(value) =>
            setChange((prev) => ({ ...prev, type: value }))
          }
          selected={change.type}
          options={[{ name: "type 1" }]}
          optionName={"name"}
          placeholder="Select Type"
          dropdownLabel={"Change Type"}
        />
      </div>
      <SelectForObjects
        margin={"0px"}
        height={"36px"}
        setselected={itemHandler}
        selected={change.item}
        options={items}
        optionName={"item"}
        placeholder="Select Item"
        dropdownLabel={"Item"}
      />
      <div className="grid grid-cols-2 gap-x-2.5 gap-y-5">
        <Input
          type="number"
          onChange={valueHandler}
          disabled={true}
          value={change.current_quantity}
          name={"new_quantity"}
          label={"Current Quantity"}
        />
        <Input
          type="number"
          onChange={valueHandler}
          value={change.new_quantity}
          name={"new_quantity"}
          label={"New Quantity"}
        />
      </div>

      <div className="flex justify-end items-center gap-2.5">
        <Button
          variant={"gray"}
          onClick={() => closeModal("change")}
          className={"flex gap-2 items-center justify-center"}
          customText={"#9E9E9E"}
          size="small"
        >
          Cancel
        </Button>
        <Button
          className={"flex gap-2 items-center justify-center"}
          size="small"
        >
          <FaPlusCircle />
          Send
        </Button>
      </div>
    </FormModal>
  );
};

export default RequestChangeModal;
