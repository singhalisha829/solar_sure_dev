import React, { useState } from "react";
import FormModal from "../../shared/FormModal";
import Input from "../../formPage/Input";
import { checkSpecificKeys } from "@/utils/formValidationHandler";
import { toast } from "sonner";

const CloseProject = ({ onSubmit }) => {
  const [date, setDate] = useState("");

  const validateField = async () => {
    const keysToCheck = {
      date: "Closing Date",
    };

    const validationResult = checkSpecificKeys({ date: date }, keysToCheck);
    if (validationResult.isValid === false) {
      toast.error(validationResult.message);
      return;
    }
    onSubmit(date);
    clearForm();
  };

  const clearForm = () => {
    setDate("");
  };

  return (
    <FormModal
      id={"close-project-modal"}
      heading={"Close Project"}
      ctaText={"Close Project"}
      onSubmit={validateField}
      onClose={clearForm}
      z_index="z-[2000]"
    >
      <div className="grid grid-cols-2 gap-4">
        <p className="col-span-2 text-sm">
          Are you sure you want to close the project? Once the project status is
          changed to <strong>Closed</strong>, no further edits to the project
          details will be allowed.
        </p>
        <Input
          type={"date"}
          mandatory={true}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          label={"Closing Date"}
        />
      </div>
    </FormModal>
  );
};

export default CloseProject;
