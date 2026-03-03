import React, { useState } from "react";
import FormModal from "../shared/FormModal";
import Input from "../formPage/Input";
import { checkSpecificKeys } from "@/utils/formValidationHandler";
import { toast } from "sonner";
import { addPOExtraCharges } from "@/services/api";
import { useModal } from "@/contexts/modal";
import { requestHandler } from "@/services/ApiHandler";

const AddExtraCharges = ({ modalId, onSuccessfullSubmit }) => {
  const { closeModal } = useModal();
  const [name, setName] = useState("");

  const onSubmit = async () => {
    const keysToCheck = {
      name: "Extra Charge Name",
    };
    const validationResult = checkSpecificKeys({ name: name }, keysToCheck);
    if (validationResult.isValid === false) {
      toast.error(validationResult.message);
      return;
    }

    await requestHandler(
      async () => await addPOExtraCharges({ name: name }),
      null,
      async (data) => {
        closeModal(modalId);
        toast.success("Extra Charge Added Successfully!");
        onSuccessfullSubmit();
      },
      toast.error
    );
  };

  const clearForm = () => {
    setName("");
  };

  return (
    <FormModal
      id={modalId}
      heading={"Add Extra Charge"}
      ctaText={"Save"}
      onSubmit={onSubmit}
      onClose={clearForm}
    >
      <Input
        type={"text"}
        mandatory={true}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={"Name..."}
        label={"Extra Charge Name"}
      />
    </FormModal>
  );
};

export default AddExtraCharges;
