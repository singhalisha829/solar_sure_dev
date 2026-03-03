import React, { useState, useEffect } from "react";
import FormModal from "../shared/FormModal";
import Input from "../formPage/Input";
import { useManufacturers } from "@/contexts/manufacturers";
import { checkSpecificKeys } from "@/utils/formValidationHandler";
import { toast } from "sonner";

const AddEditManufaturer = ({ modalId, itemDetails }) => {
  const [name, setName] = useState("");
  const { createManufacturerHandler, editManufacturerHandler } =
    useManufacturers();

  useEffect(() => {
    if (itemDetails && itemDetails !== null) {
      setName(itemDetails.name);
    }
  }, [itemDetails]);

  const onSubmit = async () => {
    const keysToCheck = {
      name: "Manufacturer Name",
    };

    const validationResult = checkSpecificKeys({ name: name }, keysToCheck);
    if (validationResult.isValid === false) {
      toast.error(validationResult.message);
      return;
    }
    if (modalId.split("-")[0] === "add") {
      await createManufacturerHandler({ name });
      clearForm();
    } else {
      await editManufacturerHandler(itemDetails.id, { name }, modalId);
    }
  };

  const clearForm = () => {
    setName("");
  };

  return (
    <FormModal
      id={modalId}
      heading={
        modalId.split("-")[0] === "add"
          ? "Add Manufacturer"
          : "Edit Manufacturer"
      }
      ctaText={modalId.split("-")[0] === "add" ? "Add Manufacturer" : "Save"}
      onSubmit={onSubmit}
      onClose={() => {
        if (modalId.split("-")[0] === "add") {
          clearForm();
        }
      }}
      z_index="z-[2000]"
    >
      <Input
        type={"text"}
        mandatory={true}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={"Name..."}
        label={"Manufacturer Name"}
      />
    </FormModal>
  );
};

export default AddEditManufaturer;
