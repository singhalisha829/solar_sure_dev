import React, { useState, useEffect } from "react";
import FormModal from "../../shared/FormModal";
import Input from "../../formPage/Input";
import { checkSpecificKeys } from "@/utils/formValidationHandler";
import { toast } from "sonner";
import { requestHandler } from "@/services/ApiHandler";
import {
  addProjectCompletionDocs,
  editProjectCompletionDocs,
} from "@/services/api";
import { useModal } from "@/contexts/modal";

const AddEditProjectCompletionDocument = ({
  modalId,
  itemDetails,
  onSuccessfullSubmit,
}) => {
  const { closeModal } = useModal();
  const [name, setName] = useState("");

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
    if (itemDetails) {
      await editDocuments();
    } else {
      await addDocuments();
    }
  };

  const addDocuments = async () => {
    await requestHandler(
      async () => await addProjectCompletionDocs({ name: name }),
      null,
      (data) => {
        toast.success("Project Completion Document Added Successfully!");
        onSuccessfullSubmit();
        clearForm();
        closeModal(modalId);
      },
      toast.error
    );
  };

  const editDocuments = async () => {
    await requestHandler(
      async () =>
        await editProjectCompletionDocs(itemDetails.id, { name: name }),
      null,
      (data) => {
        toast.success("Project Completion Document Saved Successfully!");
        onSuccessfullSubmit();
        closeModal(modalId);
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
      heading={!itemDetails ? "Add Document" : "Edit Document"}
      ctaText={!itemDetails ? "Add Document" : "Save"}
      onSubmit={onSubmit}
      onClose={() => {
        if (!itemDetails) {
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
        label={"Document Name"}
      />
    </FormModal>
  );
};

export default AddEditProjectCompletionDocument;
