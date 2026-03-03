import { useState, useEffect } from "react";
import Button from "@/components/shared/Button";
import Input from "@/components/formPage/Input";
import { requestHandler } from "@/services/ApiHandler";
import { toast } from "sonner";
import { addContingencyRemark, editContingencyRemark } from "@/services/api";
import { LocalStorageService } from "@/services/LocalStorageHandler";
import { dateFormat } from "@/utils/formatter";

const ContingencyForm = ({
  projectId,
  onSuccessfullSubmit,
  contingencyDetails,
}) => {
  const [remark, setRemark] = useState("");
  const userInfo = LocalStorageService.get("user");

  useEffect(() => {
    setRemark(contingencyDetails?.remark ?? "");
  }, [contingencyDetails]);

  const handleNextClick = async () => {
    if (remark == "") {
      toast.error("Field Remark is empty!");
      return;
    }

    if (contingencyDetails?.id && contingencyDetails?.id != "") {
      await requestHandler(
        async () =>
          await editContingencyRemark(contingencyDetails?.id, {
            remark: remark,
          }),
        null,
        (data) => {
          onSuccessfullSubmit(contingencyDetails?.id, remark);
        },
        toast.error
      );
    } else {
      const formData = {
        remark: remark,
        project: projectId,
      };

      await requestHandler(
        async () => await addContingencyRemark(formData),
        null,
        (data) => {
          onSuccessfullSubmit(data.data.output.last_id, remark);
        },
        toast.error
      );
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <strong>Created By: </strong>
          {userInfo?.name}
        </div>
        <div>
          <strong>Date: </strong>
          {dateFormat(new Date())}
        </div>
        <Input
          type="textarea"
          mandatory={true}
          onChange={(e) => setRemark(e.target.value)}
          value={remark}
          label={"Remark"}
          outerClass={"col-span-2"}
        />
      </div>
      <div className="flex gap-4 justify-end right-2">
        <Button
          className=" h-[2rem] w-small"
          onClick={() => setRemark("")}
          customText={"#9E9E9E"}
          variant={"gray"}
        >
          Clear
        </Button>
        <Button className=" h-[2rem] w-small" onClick={() => handleNextClick()}>
          Add Contingency Items
        </Button>
      </div>
    </>
  );
};

export default ContingencyForm;
