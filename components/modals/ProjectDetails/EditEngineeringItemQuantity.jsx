import React, { useState } from "react";
import FormModal from "../../shared/FormModal";
import Input from "../../formPage/Input";
import { checkSpecificKeys } from "@/utils/formValidationHandler";
import { toast } from "sonner";
import { requestHandler } from "@/services/ApiHandler";
import { editBomItem } from "@/services/api";
import { useModal } from "@/contexts/modal";
import { SelectForObjects } from "../../formPage/MultiSelectDropdown/MultiSelectDropdown";

const EditEngineeringItemQuantity = ({ itemDetails, onSuccessfullSubmit }) => {
  const { closeModal } = useModal();
  const [quantityDetails, setQuantityDetails] = useState({
    quantity: "",
    type: "",
    type_name: "",
    new_quantity: "",
  });

  const quantityType = [
    { name: "Increase", value: "add" },
    { name: "Decrease", value: "subtract" },
  ];

  const onSubmit = async () => {
    const keysToCheck = {
      type: "Type",
      quantity: "Quantity",
    };

    const validationResult = checkSpecificKeys(quantityDetails, keysToCheck);
    if (validationResult.isValid === false) {
      toast.error(validationResult.message);
      return;
    }

    const apiData = {
      transtion_type: quantityDetails.type,
      quantity: quantityDetails.quantity,
    };

    await requestHandler(
      async () => await editBomItem(itemDetails.id, apiData),
      null,
      (data) => {
        toast.success("Quantity Saved Successfully...");
        closeModal("add-engineering-item-quantity");
        onSuccessfullSubmit();
      },
      toast.error
    );
  };

  const clearForm = () => {
    setQuantityDetails({
      quantity: "",
      type: "",
      type_name: "",
      new_quantity: "",
    });
  };

  return (
    <FormModal
      id={"add-engineering-item-quantity"}
      heading={"Adjust Quantity"}
      ctaText={"Save"}
      onSubmit={onSubmit}
      onClose={clearForm}
      z_index="z-[2000]"
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="flex gap-[2px] text-xs capitalize text-zinc-800 font-bold tracking-tight">
            Item:
          </label>
          {itemDetails?.product_code} ({itemDetails?.item_name})
        </div>
        <div>
          <label className="flex gap-[2px] text-xs capitalize text-zinc-800 font-bold tracking-tight">
            Make:
          </label>{" "}
          {itemDetails?.make_name}
        </div>
        <SelectForObjects
          margin={"0px"}
          height={"36px"}
          setselected={(name, value) =>
            setQuantityDetails({
              ...quantityDetails,
              type: value,
              type_name: name,
              new_quantity: itemDetails?.quantity.quantity,
            })
          }
          selected={quantityDetails.type_name}
          options={quantityType}
          mandatory={true}
          optionName={"name"}
          optionID={"value"}
          placeholder="Select"
          dropdownLabel={"Adjustment Mode"}
        />
        <Input
          type={"number"}
          mandatory={true}
          value={quantityDetails.quantity}
          onChange={(e) => {
            let value = e.target.value;
            if (
              quantityDetails?.type === "subtract" &&
              value >
                itemDetails?.bom_items_quantity_left_after_booking?.quantity
            ) {
              setQuantityDetails({
                ...quantityDetails,
                quantity: "",
                new_quantity: itemDetails?.quantity.quantity,
              });
            } else {
              setQuantityDetails({
                ...quantityDetails,
                quantity: value,
                new_quantity:
                  quantityDetails?.type === "add"
                    ? Number(value || 0) +
                      Number(itemDetails?.quantity.quantity || 0)
                    : Number(itemDetails?.quantity.quantity || 0) -
                      Number(value || 0),
              });
            }
          }}
          disabled={quantityDetails?.type === ""}
          placeholder={"0.0"}
          label={`${quantityDetails?.type_name} Quantity`}
        />
        <div>
          <label className="flex gap-[2px] text-xs capitalize text-zinc-800 font-bold tracking-tight">
            New Quantity:
          </label>{" "}
          {quantityDetails.new_quantity}
        </div>

        {quantityDetails.type === "subtract" && (
          <div>
            <label className="flex gap-[2px] text-xs capitalize text-zinc-800 font-bold tracking-tight">
              Left Quantity:
            </label>{" "}
            {itemDetails?.bom_items_quantity_left_after_booking.quantity}
          </div>
        )}
      </div>
    </FormModal>
  );
};

export default EditEngineeringItemQuantity;
