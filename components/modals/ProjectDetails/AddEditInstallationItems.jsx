import React, { useState, useEffect } from "react";
import FormModal from "@/components/shared/FormModal";
import Input from "@/components/formPage/Input";
import { checkSpecificKeys } from "@/utils/formValidationHandler";
import { toast } from "sonner";
import { requestHandler } from "@/services/ApiHandler";
import {
  addProjectInstallationItems,
  editProjectInstallationItem,
} from "@/services/api";
import { useModal } from "@/contexts/modal";

const AddEditInstallationItems = ({
  activeSubTab,
  modalId,
  itemDetails,
  projectId,
  isContingency,
  onSuccessfullSubmit,
  isPlanningApproved,
}) => {
  const { closeModal } = useModal();
  const [item, setItem] = useState({
    name: "",
    description: "",
    amount: "",
    is_contigency: isContingency,
  });

  useEffect(() => {
    if (itemDetails && itemDetails !== null) {
      setItem(itemDetails);
    }
  }, [itemDetails]);

  const onSubmit = async () => {
    const keysToCheck = {
      name: "Name",
      amount: "Amount",
      description: "Description",
    };

    const validationResult = checkSpecificKeys(item, keysToCheck);
    if (validationResult.isValid === false) {
      toast.error(validationResult.message);
      return;
    }
    if (modalId.split("-")[0] === "add") {
      let formDetails = {
        project: projectId,
        is_contigency: isPlanningApproved,
        installation_details: [{ ...item, budget_type: activeSubTab }],
      };
      await requestHandler(
        async () => await addProjectInstallationItems(formDetails),
        null,
        (data) => {
          toast.success("Installation Item added Successfully!");
          closeModal(modalId);
          clearForm();
          onSuccessfullSubmit();
        },
        toast.error
      );
    } else {
      await requestHandler(
        async () =>
          await editProjectInstallationItem(itemDetails?.id, {
            ...item,
            budget_type: activeSubTab,
          }),
        null,
        (data) => {
          toast.success("Installation Item saved Successfully!");
          closeModal(modalId);
          onSuccessfullSubmit();
        },
        toast.error
      );
    }
  };

  const clearForm = () => {
    setItem({
      name: "",
      description: "",
      amount: "",
    });
  };

  return (
    <FormModal
      id={modalId}
      heading={
        modalId.split("-")[0] === "add"
          ? `Add ${activeSubTab} Item`
          : `Edit ${activeSubTab} Item`
      }
      ctaText={modalId.split("-")[0] === "add" ? "Add" : "Save"}
      onSubmit={onSubmit}
      onClose={() => {
        if (modalId.split("-")[0] === "add") {
          clearForm();
        }
      }}
    >
      <div className="grid grid-cols-2 gap-2">
        <Input
          type={"text"}
          mandatory={true}
          value={item.name}
          onChange={(e) => setItem({ ...item, name: e.target.value })}
          placeholder={"Name"}
          label={"Name"}
        />
        <Input
          type={"number"}
          mandatory={true}
          value={item.amount}
          onChange={(e) => setItem({ ...item, amount: e.target.value })}
          placeholder={"0.0"}
          label={"Amount"}
        />
        <Input
          type={"textarea"}
          mandatory={true}
          value={item.description}
          outerClass="col-span-2 "
          onChange={(e) => setItem({ ...item, description: e.target.value })}
          placeholder={"Description"}
          label={"Description"}
        />
      </div>
    </FormModal>
  );
};

export default AddEditInstallationItems;
