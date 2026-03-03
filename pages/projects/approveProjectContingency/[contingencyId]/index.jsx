import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { MdArrowForwardIos } from "react-icons/md";
import { requestHandler } from "@/services/ApiHandler";
import { toast } from "sonner";
import { getBOMContigency } from "@/services/api";
import { dateFormat, dateFormatInYYYYMMDD } from "@/utils/formatter";
import { SelectForObjects } from "@/components/formPage/MultiSelectDropdown/MultiSelectDropdown";
import Input from "@/components/formPage/Input";
import { FaEye } from "react-icons/fa";
import Loading from "@/components/Loading";
import { handleFileUpload } from "@/utils/documentUploadHandler";
import { useSalesPerson } from "@/contexts/salesperson";
import ProjectItemTable from "@/components/project-components/ProjectItemTable";
import Button from "@/components/shared/Button";
import { checkSpecificKeys } from "@/utils/formValidationHandler";
import { approveContingency } from "@/services/api";

const ProjectContingencyPage = () => {
  const router = useRouter();
  const today = new Date();
  const { contingencyId, projectName } = router.query;
  const { salesPersons } = useSalesPerson();
  const [contingencyDetails, setContingencyDetails] = useState({});
  const [originalContingencyDetails, setOriginalContingencyDetails] = useState(
    {}
  );
  const [isDocUploading, setIsDocUploading] = useState(false);
  const [formDetails, setFormDetails] = useState({
    status: "",
    approval_doc: "",
    approved_by: "",
    approved_by_name: "",
    item_list: [],
  });

  const statusList = [{ name: "Approved" }, { name: "Reject" }];

  const tableHeaderForItems = [
    { name: "Bom Category", width: "9rem", key: "bom_head_name" },
    { name: "Contingency Type", width: "10rem", key: "contingency_type" },
    { name: "Item Code", width: "15rem", key: "product_code" },
    { name: "Item Name", width: "15rem", key: "item_name" },
    {
      name: "Make",
      width: "8rem",
      key: "make_name",
    },
    {
      name: "Quantity",
      width: "5rem",
      key: "quantity",
      key2: "unit_symbol",
    },
    {
      name: "Contingency Amount",
      width: "13rem",
      key: "contingency_amount",
      displayType: "price",
    },
    { name: "Remark", width: "15rem", key: "remarks" },
    {
      name: "Status",
      key: "status",
      dropdownValueKey: "status",
      type: "dropdown",
      width: "10rem",
      options: statusList,
      optionId: "name",
      optionName: "name",
    },
    {
      name: "Approver Remark",
      width: "20rem",
      key: "approver_remark",
      type: "text",
    },
  ];

  const tableHeaderForOthers = [
    {
      name: "Category",
      key: "bom_head_name",
      width: "8rem",
    },
    {
      name: "Name",
      key: "installation_freight_budget_name",
      minWidth: "12rem",
    },
    {
      name: "Amount",
      key: "unit_price",
      type: "price",
      width: "8rem",
    },
    {
      name: "Description",
      key: "remarks",
      width: "15rem",
    },
    {
      name: "Status",
      key: "status",
      dropdownValueKey: "status",
      type: "dropdown",
      width: "10rem",
      options: statusList,
      optionId: "name",
      optionName: "name",
    },
    {
      name: "Approver Remark",
      width: "20rem",
      key: "approver_remark",
      type: "text",
    },
  ];

  useEffect(() => {
    fetchParticularContigencyDetails();
  }, []);

  const fetchParticularContigencyDetails = async () => {
    await requestHandler(
      async () => await getBOMContigency({ id: contingencyId }),
      null,
      (data) => {
        let item_list = [],
          other_item_list = [];
        data.data.output[0].item_list.map((item) => {
          if (
            ["Installation", "Freight", "Other"].includes(item.bom_head_name)
          ) {
            other_item_list.push(item);
          } else {
            item_list.push(item);
          }
        });
        setContingencyDetails({
          ...data.data.output[0],
          item_list: item_list,
          other_item_list: other_item_list,
        });
        setOriginalContingencyDetails({
          ...data.data.output[0],
          item_list: item_list,
          other_item_list: other_item_list,
        });
      },
      toast.error
    );
  };

  const handleFile = async (e) => {
    setIsDocUploading(true);
    const response = await handleFileUpload(e.target.files[0]);
    if (response.type === "success") {
      setFormDetails({ ...formDetails, approval_doc: response.data });
    } else {
      toast.error(response.error || "Oops! Something went wrong");
    }
    setIsDocUploading(false);
  };

  const onSelectStatus = (status) => {
    setFormDetails({
      ...formDetails,
      status: status,
    });

    let details = { ...contingencyDetails };
    details?.item_list.map((item) => (item.status = status));
    details?.other_item_list.map((item) => (item.status = status));
    setContingencyDetails(details);
  };

  const tableValueHandler = (key, value, index, category) => {
    let itemList = [];
    if (category === "items") {
      itemList = [...contingencyDetails?.item_list];
    } else {
      itemList = [...contingencyDetails?.other_item_list];
    }

    itemList[index][key] = value;
    if (category === "items") {
      setContingencyDetails({ ...contingencyDetails, item_list: itemList });
    } else {
      setContingencyDetails({
        ...contingencyDetails,
        other_item_list: itemList,
      });
    }
  };

  const onSubmit = async () => {
    const keysToCheck = {
      approved_by: "Approved By",
      status: "Status",
      approval_doc: "Approval Document",
    };
    const validationResult = checkSpecificKeys(formDetails, keysToCheck);
    if (validationResult.isValid === false) {
      toast.error(validationResult.message);
      return;
    }

    let itemList = [];
    contingencyDetails?.item_list.map((item) => {
      itemList.push({
        bom_contingency_itme_id: item.id,
        status: item.status,
        approver_remark: item.approver_remark,
      });
    });
    contingencyDetails?.other_item_list.map((item) => {
      itemList.push({
        bom_contingency_itme_id: item.id,
        status: item.status,
        approver_remark: item.approver_remark,
      });
    });

    const apiData = {
      status: formDetails.status,
      approval_doc: formDetails.approval_doc,
      approved_by: formDetails.approved_by,
      date: dateFormatInYYYYMMDD(today),
      item_list: itemList,
    };

    await requestHandler(
      async () => await approveContingency(contingencyDetails?.id, apiData),
      null,
      async (data) => {
        toast.success("Contingency Approved Successfully!");
        router.push(
          `/projects/${contingencyDetails?.project}?tab=Engineering&projectName=${projectName}`
        );
      },
      toast.error
    );
  };

  return (
    <div className="overflow-auto">
      <div className="flex justify-between items-center gap-4 mb-4">
        <h2 className=" flex text-xl font-bold tracking-tight">
          <span
            className="text-orange-500 hover:underline underline-offset-4 cursor-pointer"
            onClick={() => router.back()}
          >
            {projectName}
          </span>{" "}
          <MdArrowForwardIos className="text-orange-500 mt-1" />
          Approve Contingency Items
        </h2>
      </div>
      <div className=" bg-white rounded flex flex-col gap-4 p-5 overflow-auto">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <strong>Contingency No: </strong>
            {contingencyDetails?.contingency_no}
          </div>
          <div>
            <strong>Status: </strong>
            {contingencyDetails?.status}
          </div>
          <div>
            <strong>Created By: </strong>
            {contingencyDetails?.created_by}
          </div>
          <div>
            <strong>Created At: </strong>
            {dateFormat(contingencyDetails?.created_at?.split("T")[0])}
          </div>
          <div className="col-span-2">
            <strong>Remark: </strong>
            {contingencyDetails?.remark}
          </div>
          <SelectForObjects
            margin={"0px"}
            mandatory
            height={"36px"}
            setselected={(name, id) => {
              setFormDetails({
                ...formDetails,
                approved_by: Number(id),
                approved_by_name: name,
              });
            }}
            selected={formDetails.approved_by_name}
            options={salesPersons}
            optionName={"name"}
            optionID={"id"}
            placeholder="Select.."
            dropdownLabel={"Approved By"}
          />
          <SelectForObjects
            margin={"0px"}
            mandatory
            height={"36px"}
            setselected={(name) => onSelectStatus(name)}
            selected={formDetails.status}
            options={[{ name: "Approved" }, { name: "Reject" }]}
            optionID={"name"}
            optionName={"name"}
            placeholder="Select.."
            dropdownLabel={"Status"}
          />
          <span className="w-full flex gap-2 items-end">
            <Input
              type="file"
              onChange={handleFile}
              mandatory={true}
              label={"Approval Document"}
            />
            {isDocUploading && <Loading size="w-8 h-8" />}
            {formDetails.approval_doc && formDetails.approval_doc !== "" && (
              <FaEye
                size={15}
                className="cursor-pointer mb-3"
                onClick={() => window.open(formDetails.approval_doc, "__blank")}
              />
            )}
          </span>
        </div>

        {contingencyDetails?.item_list?.length > 0 && (
          <>
            <strong>Contingency Items</strong>
            <div className="overflow-x-auto">
              <ProjectItemTable
                columns={tableHeaderForItems}
                rows={contingencyDetails?.item_list ?? []}
                isEditMode={true}
                valueHandler={(key, value, index) =>
                  tableValueHandler(key, value, index, "items")
                }
                showSerialNumber={true}
              />
              <div className="h-[5rem]"></div>
            </div>
          </>
        )}

        {contingencyDetails?.other_item_list?.length > 0 && (
          <>
            <strong>Contingency Other Items</strong>
            <div className="overflow-x-auto">
              <ProjectItemTable
                columns={tableHeaderForOthers}
                rows={contingencyDetails?.other_item_list ?? []}
                isEditMode={true}
                valueHandler={(key, value, index) =>
                  tableValueHandler(key, value, index, "others")
                }
                showSerialNumber={true}
              />
              <div className="h-[5rem]"></div>
            </div>
          </>
        )}

        <div className=" w-full flex justify-end gap-4">
          <Button
            className=" h-[2rem] w-small"
            onClick={() => {
              setFormDetails({
                status: "",
                approval_doc: "",
                approved_by: "",
                approved_by_name: "",
                date: new Date(),
                item_list: [],
              });
              setContingencyDetails(originalContingencyDetails);
            }}
            customText={"#9E9E9E"}
            variant={"gray"}
          >
            Clear
          </Button>
          <Button className=" h-[2rem] w-small" onClick={onSubmit}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProjectContingencyPage;
