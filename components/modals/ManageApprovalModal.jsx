import React, { useState } from "react";
import FormModal from "../shared/FormModal";
import Input from "../formPage/Input";
import { requestHandler } from "@/services/ApiHandler";
import { SelectForObjects } from "../formPage/MultiSelectDropdown/MultiSelectDropdown";
import { approveProject } from "@/services/api";
import { toast } from "sonner";
import { useModal } from "@/contexts/modal";
import { useRouter } from "next/router";
import Loading from "../shared/Loading";

const ManageApproval = ({onSuccessfullSubmit}) => {
  const { closeModal } = useModal();
  const router = useRouter();
  const { id } = router.query;

  const [formDetails, setFormDetails] = useState({ last_approver_status: "" ,last_approver_comment:""});
  const [isLoading, setIsLoading] = useState(false);
  const statusList = [{name:'Approved'}, {name:'Rejected'},{name:'On Hold'}];

  const onSubmit = async ()=>{
    setIsLoading(true)
    await requestHandler(
        async () => await approveProject(id,formDetails),
        null,
        async (data) => {
          toast.success("Project Status Changed Successfully...");
          setIsLoading(false);
          closeModal("manage-approval")
          onSuccessfullSubmit();
       },
        toast.error
      );
  }

  return (
    <FormModal
      id="manage-approval"
      heading={"Manage Approval"}
      ctaText={"Save"}
      onSubmit={onSubmit}
    >
      {isLoading?<Loading/>:<><SelectForObjects
          margin={"0px"}
          mandatory
          height={"36px"}
          setselected={(name, id) =>
            setFormDetails((prev) => ({ ...prev, last_approver_status: id }))
          }
          selected={formDetails.last_approver_status}
          options={statusList}
          optionName={"name"}
          optionID={"name"}
          placeholder={"Status"}
          dropdownLabel={"Status"}
        />
        <Input
        onChange={(e) =>
          setFormDetails((prev) => ({ ...prev, last_approver_comment: e.target.value }))
        }
        name="sectionName"
        value={formDetails.last_approver_comment}
        type={"textarea"}
        label={"Remarks"}
      /></>}
    </FormModal>
  );
};

export default ManageApproval;
