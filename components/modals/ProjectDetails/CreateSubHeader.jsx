import React, { useState } from "react";
import FormModal from "../../shared/FormModal";
import { SelectForObjects } from "../../formPage/MultiSelectDropdown/MultiSelectDropdown";
import Input from "../../formPage/Input";
import { createSubHeader } from "@/services/api";
import { requestHandler } from "@/services/ApiHandler";
import { toast } from "sonner";
import { useModal } from "@/contexts/modal";
import { useProject } from "@/contexts/project";
import { checkSpecificKeys } from "@/utils/formValidationHandler";

const getRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const CreateSubHeader = ({ headers }) => {
  const { closeModal } = useModal();
  const { getProjectDetailsHandler } = useProject();
  const [subHeader, setSubHeader] = useState({
    project_schedule_header: "",
    project_schedule_header_name: "",
    name: "",
    header_color: getRandomColor(),
    weightage: 0,
  });
  const [subHeaderList, setSubHeaderList] = useState([]);
  const [formErrors, setFormErrors] = useState({});

  const addSubHeader = async () => {
    const keysToCheck = {
      project_schedule_header: "Header",
      name: "Sub Header",
      weightage: "Weightage",
    };
    const validationResult = checkSpecificKeys(subHeader, keysToCheck);
    if (validationResult.isValid === false) {
      toast.error(validationResult.message);
      return;
    }

    // duplicate sub header name error
    const error = handleSubHeaderName();

    if (error && Object.keys(error).length > 0) {
      toast.error(error.sub_header);
    } else {
      await requestHandler(
        async () => await createSubHeader(subHeader),
        null,
        async (data) => {
          toast.success("Sub Header Added Successfully...");
          closeModal("schedule-header");
          onSubHeaderFormClose();
          await getProjectDetailsHandler();
        },
        toast.error
      );
    }
  };

  const handleSubHeaderName = () => {
    const subHeaderWithSameName = subHeaderList.filter(
      (headerItem) =>
        headerItem.name.toLowerCase() == subHeader.name.toLowerCase()
    );
    if (subHeaderWithSameName.length > 0) {
      setFormErrors({
        ...formErrors,
        ["sub_header"]: "Sub Header Name must be unique.Please try again!",
      });
      return {
        ...formErrors,
        ["sub_header"]: "Sub Header Name must be unique.Please try again!",
      };
    } else {
      setFormErrors({});
      return null;
    }
  };

  const onSubHeaderFormClose = () => {
    setSubHeader({
      project_schedule_header: "",
      project_schedule_header_name: "",
      name: "",
      header_color: getRandomColor(),
      weightage: 0,
    });
    setFormErrors({});
  };

  return (
    <FormModal
      id="schedule-sub-header"
      heading={"Create Sub Header"}
      ctaText={"Create Sub Header"}
      onSubmit={addSubHeader}
      onClose={onSubHeaderFormClose}
    >
      <SelectForObjects
        mandatory
        margin={"0px"}
        height={"36px"}
        setselected={(name, id) => {
          setSubHeader((prev) => ({
            ...prev,
            project_schedule_header: id,
            project_schedule_header_name: name,
          }));
          const selectedOption = headers.find((option) => option.id == id);
          setSubHeaderList(selectedOption?.project_schedule_sub_header);
        }}
        selected={subHeader.project_schedule_header_name}
        options={headers}
        optionName={"name"}
        optionID={"id"}
        placeholder="Select Name"
        dropdownLabel={"Select Header"}
      />
      <Input
        mandatory
        onChange={(e) =>
          setSubHeader((prev) => ({ ...prev, name: e.target.value }))
        }
        name="sectionName"
        onBlur={() => handleSubHeaderName()}
        value={subHeader.name}
        type={"text"}
        label={"Enter Name"}
        error={formErrors.sub_header}
      />
      <Input
        mandatory
        onChange={(e) =>
          setSubHeader((prev) => ({
            ...prev,
            weightage: Number(e.target.value),
          }))
        }
        name="weightage"
        value={subHeader.weightage}
        type={"number"}
        label={"Weightage"}
      />
      <div className="flex items-center gap-4">
        <label
          className="flex gap-[2px] text-xs capitalize text-zinc-800 font-bold tracking-tight"
          htmlFor="color"
        >
          Choose Header Color:-
        </label>
        <input
          className="rounded-full w-10"
          type="color"
          name="color"
          value={subHeader.header_color}
          onChange={(e) =>
            setSubHeader((prev) => ({ ...prev, header_color: e.target.value }))
          }
          id="color"
        />
        {/* <input
          className="rounded-full w-10"
          type="number"
          name="weightage"
          value={subHeader.header_color}
          onChange={(e) =>
            setSubHeader((prev) => ({
              ...prev,
              weightage: Number(e.target.value),
            }))
          }
          id="weightage"
        /> */}
      </div>
    </FormModal>
  );
};

export default CreateSubHeader;
