import { useState, useEffect } from "react";
import FormModal from "../../shared/FormModal";
import Input from "../../formPage/Input";
import { SelectForObjects } from "../../formPage/MultiSelectDropdown/MultiSelectDropdown";
import { toast } from "sonner";
import { checkSpecificKeys } from "@/utils/formValidationHandler";
import { useModal } from "@/contexts/modal";
import { ImSpinner8 } from "react-icons/im";

const AddProjectInstaller = ({
  modalId,
  installerList,
  onSubmit,
  heading,
  salesPersonList,
  staffCategory,
  isOptionsLoading = false,
}) => {
  const { modals } = useModal();
  const [siteVisitDetails, setSiteVisitDetails] = useState({
    installer: "",
    start_date: "",
    end_date: "",
    remark: "",
  });

  useEffect(() => {
    if (!modals[modalId]) {
      clearForm();
    }
  }, [modals]);

  const valueHandler = (e) => {
    setSiteVisitDetails((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validateFormFields = () => {
    const keysToCheck = {
      installer: "Project Staff",
      start_date: "Start Date",
      end_date: "End Date",
    };
    const validationResult = checkSpecificKeys(siteVisitDetails, keysToCheck);
    if (validationResult.isValid === false) {
      toast.error(validationResult.message);
      return;
    }

    onSubmit(siteVisitDetails);
  };

  const clearForm = () => {
    setSiteVisitDetails({
      project: "",
      installer: "",
      start_date: "",
      end_date: "",
      remark: "",
    });
  };
    
  return (
    <FormModal
      id={modalId}
      width="w-[60%]"
      ctaText={"Add"}
      heading={ <>
          {heading} {
            isOptionsLoading &&
            <ImSpinner8 className="ml-3 text-[12px] animate-spin mt-[2px] text-primary"/>
            }
        </> 
      }
      onSubmit={validateFormFields}
    >
      <div className="grid grid-cols-2 gap-x-2.5 gap-y-5 overflow-scroll p-2">
        <SelectForObjects
          margin={"0px"}
          mandatory
          height={"36px"}
          setselected={(name, id) => {
            setSiteVisitDetails((prev) => ({
              ...prev,
              installer: Number(id),
              installer_name: name,
            }));
          }}
          selected={siteVisitDetails.installer_name}
          options={
            staffCategory === "installer" ? installerList : salesPersonList
          }
          optionOtherKeys={["email"]}
          optionNameSeperator={" - "}
          optionName={"name"}
          optionID={"id"}
          placeholder="Select.."
          dropdownLabel={"Project Staff"}
        />
        <Input
          mandatory={true}
          type={"date"}
          onChange={valueHandler}
          value={siteVisitDetails.start_date}
          max={siteVisitDetails.end_date}
          name={"start_date"}
          label={"Start Date"}
        />
        <Input
          type={"date"}
          mandatory={true}
          onChange={valueHandler}
          value={siteVisitDetails.end_date}
          name={"end_date"}
          minDate={siteVisitDetails.start_date}
          label={"End Date"}
        />
        <Input
          type={"textarea"}
          outerClass="col-span-2"
          onChange={valueHandler}
          value={siteVisitDetails.remark}
          name={"remark"}
          label={"Remark"}
        />
      </div>
    </FormModal>
  );
};

export default AddProjectInstaller;
