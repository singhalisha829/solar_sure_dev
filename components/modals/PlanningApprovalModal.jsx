import { useState, useEffect } from "react";
import FormModal from "../shared/FormModal";
import Input from "../formPage/Input";
import { SelectForObjects } from "../formPage/MultiSelectDropdown/MultiSelectDropdown";
import { checkSpecificKeys } from "@/utils/formValidationHandler";
import { approvePlanning, getEmployeeList } from "@/services/api";
import { requestHandler } from "@/services/ApiHandler";
import { toast } from "sonner";
import { useModal } from "@/contexts/modal";
import { useRouter } from "next/router";
import { handleFileUpload } from "@/utils/documentUploadHandler";
import { FaEye } from "react-icons/fa";
import dynamic from "next/dynamic";
import { dateFormatInYYYYMMDD } from "@/utils/formatter";
import { useSalesPerson } from "@/contexts/salesperson";

const Table = dynamic(() => import("@/components/SortableTable"));

const PlanningApprovalModal = ({
  onSuccessfullSubmit,
  approvalList,
  defaultActiveTab,
}) => {
  const { closeModal } = useModal();
  const { salesPersons } = useSalesPerson();
  const router = useRouter();
  const { projectId } = router.query;
  const today = new Date();
  const nonPendingApprovalList = approvalList?.filter(
    (approval) => approval.status != "Pending"
  );

  const pendingApprovalId = approvalList?.filter(
    (approval) => approval.status === "Pending"
  )[0]?.id;

  const [activeTab, setActiveTab] = useState(defaultActiveTab);
  const [planningApprovalDetails, setPlanningApprovalDetails] = useState({
    section_type: "Planning",
    project: projectId,
    document: "",
    approved_by: "",
    approved_by_name: "",
    status: "",
    remarks: "",
    approval_date: dateFormatInYYYYMMDD(today),
  });

  const statusList = [{ name: "Approved" }, { name: "Reject" }];
  const tabs = ["Approval Form", "Approval History"];

  const tableHeader = [
    {
      name: "Approved By",
      width: "30%",
      key: "approved_by",
    },
    {
      name: "Status",
      key: "status",
      width: "20%",
    },
    {
      name: "Approval Date",
      key: "approval_date",
      type: "date",
      width: "20%",
    },
    {
      name: "BBU Date",
      key: "bbu_date",
      type: "date",
      width: "20%",
    },
    {
      name: "Document",
      key: "document",
      type: "file",
      width: "10%",
    },
  ];

  useEffect(() => {
    setActiveTab(defaultActiveTab);
  }, [defaultActiveTab]);

  const valueHandler = (e) => {
    setPlanningApprovalDetails((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const uploadDocument = async (e) => {
    const response = await handleFileUpload(e.target.files[0]);
    if (response.type === "success") {
      setPlanningApprovalDetails((prev) => ({
        ...prev,
        document: response.data,
      }));
    } else {
      toast.error(response.error || "Oops! Something went wrong");
    }
  };

  const onSubmit = async () => {
    const keysToCheck = {
      status: "Status",
      document: "Document",
      approval_date: "Date",
    };
    const validationResult = checkSpecificKeys(
      planningApprovalDetails,
      keysToCheck
    );
    if (validationResult.isValid === false) {
      toast.error(validationResult.message);
      return;
    }

    await requestHandler(
      async () =>
        await approvePlanning(pendingApprovalId, planningApprovalDetails),
      null,
      async (data) => {
        toast.success("Planning Approved Successfully...");
        closeModal("planning-approval-modal");
        clearForm();
        onSuccessfullSubmit();
      },
      toast.error
    );
  };

  const clearForm = () => {
    setPlanningApprovalDetails({
      section_type: "Planning",
      project: projectId,
      document: "",
      approved_by: "",
      approved_by_name: "",
      status: "",
      remarks: "",
      approval_date: dateFormatInYYYYMMDD(today),
    });
    setActiveTab(defaultActiveTab);
  };

  return (
    <FormModal
      id={"planning-approval-modal"}
      width="w-[60%]"
      heading={`Planning Approval`}
      cancelButtonText={
        defaultActiveTab === "Approval History" ? "Close" : "Cancel"
      }
      disableAddButton={!pendingApprovalId}
      onSubmit={onSubmit}
      onClose={clearForm}
      {...(defaultActiveTab !== "Approval History" && { ctaText: "Add" })}
    >
      {nonPendingApprovalList?.length > 0 &&
        defaultActiveTab !== "Approval History" && (
          <span className="flex relative">
            {tabs.map((tab, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab(tab);
                }}
                className={`mr-4 flex px-4 py-1  ${
                  activeTab === tab
                    ? "border-b-2 border-b-primary text-primary  "
                    : "border-transparent"
                } focus:outline-none`}
              >
                {tab}
              </button>
            ))}
          </span>
        )}

      {/* approval form  */}
      {activeTab === "Approval Form" && (
        <div className="grid grid-cols-2 gap-x-2.5 gap-y-5 overflow-scroll p-2">
          <span className="text-red-500 text-xs col-span-2">
            <strong>Note-</strong>{" "}
            <p>
              Please note that the BBU price of items cannot be edited after
              approval.
            </p>
          </span>
          <SelectForObjects
            margin={"0px"}
            mandatory
            height={"36px"}
            setselected={(name, id) => {
              const selectedOption = salesPersons.find(
                (employee) => employee.id == id
              );
              setPlanningApprovalDetails((prev) => ({
                ...prev,
                approved_by: Number(id),
                approved_by_name: selectedOption?.name,
              }));
            }}
            selected={planningApprovalDetails.approved_by_name}
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
            setselected={(name, id) => {
              setPlanningApprovalDetails((prev) => ({
                ...prev,
                status: name,
              }));
            }}
            selected={planningApprovalDetails.status}
            options={statusList}
            optionName={"name"}
            placeholder="Select.."
            dropdownLabel={"Status"}
          />
          <Input
            type="date"
            label={"Date"}
            mandatory={true}
            value={planningApprovalDetails.approval_date}
            onChange={(e) =>
              setPlanningApprovalDetails({
                ...planningApprovalDetails,
                approval_date: e.target.value,
              })
            }
          />

          <div className="flex gap-2 items-center">
            <Input
              type="file"
              label={"Document"}
              mandatory={true}
              onChange={uploadDocument}
            />
            {planningApprovalDetails.document !== "" && (
              <FaEye
                className="cursor-pointer text-[15px]"
                onClick={() =>
                  window.open(planningApprovalDetails.document, "_blank")
                }
              />
            )}
          </div>
          <Input
            type={"textarea"}
            outerClass="col-span-2"
            onChange={valueHandler}
            value={planningApprovalDetails.remarks}
            name={"remarks"}
            label={"Remark"}
          />
        </div>
      )}

      {/* approval history */}
      {activeTab === "Approval History" && (
        <div className="overflow-x-auto">
          <Table rows={nonPendingApprovalList} columns={tableHeader} />
        </div>
      )}
    </FormModal>
  );
};

export default PlanningApprovalModal;
