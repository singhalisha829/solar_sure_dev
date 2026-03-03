import React, { useState } from "react";
import FormModal from "../../shared/FormModal";
import Input from "../../formPage/Input";
import { SelectForObjects } from "@/components/formPage/MultiSelectDropdown/MultiSelectDropdown";
import { useModal } from "@/contexts/modal";
import { requestHandler } from "@/services/ApiHandler";
import { toast } from "sonner";
import { useProject } from "@/contexts/project";
import { changeProjectStatus } from "@/services/api";
import { checkSpecificKeys } from "@/utils/formValidationHandler";

const ManageStatus = ({ modalId, status, projectId }) => {
  const { getProjectDetailsHandler } = useProject();
  const { closeModal } = useModal();
  const [formData, setFormData] = useState({
    start_date: "",
    deadline_date: "",
    remark: "",
  });
  const [selectedStatus, setSelectedStatus] = useState(status);
  const statusList = [{ name: "Active" }, { name: "Hold" }, { name: "Cancelled" }];

  const onSubmit = async () => {
    let keysToCheck = {
      remark: "Remark",
    };
    if (selectedStatus === "Active") {
      keysToCheck = {
        ...keysToCheck,
        start_date: "Start Date",
        deadline_date: "Deadline Date",
      };
    }

    const validationResult = checkSpecificKeys(formData, keysToCheck);
    if (validationResult.isValid === false) {
      toast.error(validationResult.message);
      return;
    }

    let apiData = {
      status: selectedStatus,
      remark: formData.remark,
    };
    if (selectedStatus === "Active") {
      apiData = {
        ...apiData,
        start_date: formData.start_date,
        deadline_date: formData.deadline_date,
      };
    }

    await requestHandler(
      async () => await changeProjectStatus(projectId, apiData),
      null,
      async (data) => {
        toast.success("Project Status Changed Successfully...");
        closeModal(modalId);
        getProjectDetailsHandler();
      },
      toast.error
    );
  };

  const onClose = () => {
    setFormData({
      start_date: "",
      deadline_date: "",
      remark: "",
    });
  };

  return (
    <FormModal
      id={modalId}
      ctaText={"Change"}
      onSubmit={onSubmit}
      onClose={onClose}
      heading={"Manage Project Status"}
    >
      <div className="grid grid-cols-2 gap-4">
        <SelectForObjects
          margin={"0px"}
          // disabled={true}
          height={"36px"}
          setselected={(name, id) => {
            setSelectedStatus(name);

          }}
          selected={selectedStatus}
          options={statusList.filter((item) => item.name !== selectedStatus)}
          optionName={"name"}
          dropdownLabel="Status"
        />
        {selectedStatus === "Active" && (
          <>
            <Input
              onChange={(e) =>
                setFormData({ ...formData, start_date: e.target.value })
              }
              mandatory={true}
              value={formData.start_date}
              type={"date"}
              label={"Start Date"}
            />
            <Input
              onChange={(e) =>
                setFormData({ ...formData, deadline_date: e.target.value })
              }
              mandatory={true}
              value={formData.deadline_date}
              minDate={formData.start_date}
              type={"date"}
              label={"Deadline Date"}
            />
          </>
        )}
        <Input
          onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
          value={formData.remark}
          mandatory={true}
          outerClass="col-span-2"
          type={"textarea"}
          label={"Remark"}
        />
      </div>
    </FormModal>
  );
};

export default ManageStatus;
