import { useState } from "react";
import FormModal from "../shared/FormModal";
import Table from "../SortableTable";
import Button from "../shared/Button";
import { FiPlusCircle } from "react-icons/fi";
import Input from "../formPage/Input";
import { SelectForObjects } from "../formPage/MultiSelectDropdown/MultiSelectDropdown";
import { addLeadActivity } from "@/services/api";
import { requestHandler } from "@/services/ApiHandler";
import { toast } from "sonner";
import { checkSpecificKeys } from "@/utils/formValidationHandler";
import { dateFormatInYYYYMMDD } from "@/utils/formatter";

const LeadActivityDetails = ({
  modalId,
  data,
  leadDetails,
  userId,
  onSuccessfullSubmit,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [estimatedValue, setEstimatedValue] = useState({
    currency: "",
    value: "",
  });
  const [activityDetails, setActivityDetails] = useState({
    lead: leadDetails.lead_id,
    follow_up_date: "",
    activity: "",
    priority: "",
    estimated_lead_value: "",
    probability_of_lead_closer: "",
    status: "",
    lost_reason: "",
    remark: "",
    created_by: userId,
    modified_by: userId,
    user_id: userId,
  });

  const activiyList = [
    { name: "Call" },
    { name: "Meeting" },
    { name: "SMS" },
    { name: "Whatsapp" },
  ];
  const priotityList = [
    { name: "High" },
    { name: "Medium" },
    { name: "Low" },
    { name: "Dead" },
  ];
  const statusList = [
    { name: "Contacted" },
    { name: "Followed" },
    { name: "Proposal" },
    { name: "Closed" },
    { name: "Lost" },
  ];

  const currencyList = [
    { name: "₹" },
    { name: "K" },
    { name: "Lac" },
    { name: "Cr" },
  ];

  const lostDueToList = [
    { name: "Other Brand" },
    { name: "Other Distributor" },
    { name: "Project Lost" },
    { name: "Project Postponed" },
    { name: "Unresponsive" },
    { name: "Other" },
  ];

  const percentageValueDDList = [
    { name: "25" },
    { name: "50" },
    { name: "75" },
    { name: "100" },
  ];

  const tableHeader = [
    {
      name: "Activity",
      sortable: true,
      key: "activity",
      width: "6rem",
    },
    {
      name: "Status",
      sortable: true,
      key: "status",
      width: "6rem",
    },
    {
      name: "Priority",
      sortable: true,
      key: "priority",
      width: "6rem",
    },
    {
      name: "Next Followup Date",
      sortable: true,
      key: "follow_up_date",
      type: "ddmmyyyy",
      width: "13rem",
    },
    {
      name: "Remark",
      sortable: true,
      key: "remark",
      width: "15rem",
    },
    {
      name: "Created On",
      sortable: true,
      key: "created_at",
      type: "unix_timestamp",
      width: "9rem",
    },
  ];

  const valueHandler = (e) => {
    setActivityDetails((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async () => {
    let formDetails = { ...activityDetails };
    let keysToCheck = {
      activity: "Activity",
      priority: "Priority",
      status: "Status",
      remark: "Remark",
    };

    if (
      ["Contacted", "Followed", "Proposal", "Closed"].includes(
        activityDetails.status
      )
    ) {
      keysToCheck = {
        ...keysToCheck,
        follow_up_date: "Next Followup Date",
        probability_of_lead_closer: "Probability Of Lead Close (%)",
      };
    }
    if (activityDetails.status === "Lost") {
      keysToCheck = {
        ...keysToCheck,
        lost_reason: "Lost Due To",
      };
      formDetails.follow_up_date = null;
      formDetails.probability_of_lead_closer = null;
    }
    const validationResult = checkSpecificKeys(activityDetails, keysToCheck);

    if (validationResult.isValid === false) {
      toast.error(validationResult.message);
      return;
    }

    let amount = 0;
    if (estimatedValue.currency === "Cr") {
      amount = estimatedValue.value * 10000000;
    }
    if (estimatedValue.currency === "Lac") {
      amount = estimatedValue.value * 100000;
    }
    if (estimatedValue.currency === "K") {
      amount = estimatedValue.value * 1000;
    }
    if (estimatedValue.currency === "₹") {
      amount = estimatedValue.value;
    }

    formDetails.estimated_lead_value = amount;

    await requestHandler(
      async () => await addLeadActivity(formDetails),
      null,
      async (data) => {
        onSuccessfullSubmit();
        setShowForm(false);
        clearForm();
        toast.success("Activity Added Successfully...");
      },
      toast.error
    );
  };

  const clearForm = () => {
    setActivityDetails({
      lead: leadDetails.lead_id,
      follow_up_date: "",
      activity: "",
      priority: "",
      estimated_lead_value: "",
      probability_of_lead_closer: "",
      status: "",
      lost_reason: "",
      remark: "",
      created_by: userId,
      modified_by: userId,
      user_id: userId,
    });
    setEstimatedValue({
      currency: "",
      value: "",
    });
    setShowForm(false);
  };

  return (
    <FormModal
      id={modalId}
      heading={showForm ? "Add Activity" : "Activities"}
      ctaText={showForm ? "Create Activity" : null}
      onClose={clearForm}
      onSubmit={onSubmit}
    >
      {/* activity list */}
      {!showForm && (
        <>
          <div className="grid grid-cols-2 text-zinc-800 relative">
            <div>
              <strong>Company Name: </strong>
              {leadDetails.company_name}
            </div>
            {!["Lost", "Closed"].includes(leadDetails.status) && (
              <Button
                className="px-3 w-[8rem] absolute right-0"
                onClick={() => setShowForm(true)}
              >
                <FiPlusCircle size={15} />
                Create New
              </Button>
            )}
          </div>
          <div className="overflow-auto w-full">
            <Table columns={tableHeader} rows={data} />
          </div>
        </>
      )}

      {showForm && (
        <div className="grid grid-cols-2 gap-4 ">
          <SelectForObjects
            margin={"0px"}
            mandatory
            height={"36px"}
            setselected={(name) =>
              setActivityDetails({ ...activityDetails, activity: name })
            }
            selected={activityDetails.activity}
            options={activiyList}
            optionName={"name"}
            placeholder="Select.."
            dropdownLabel={"Activity"}
          />

          <SelectForObjects
            margin={"0px"}
            mandatory
            height={"36px"}
            setselected={(name) =>
              setActivityDetails({ ...activityDetails, priority: name })
            }
            selected={activityDetails.priority}
            options={priotityList}
            optionName={"name"}
            placeholder="Select.."
            dropdownLabel={"Priority"}
          />

          <SelectForObjects
            margin={"0px"}
            mandatory
            height={"36px"}
            setselected={(name) =>
              setActivityDetails({ ...activityDetails, status: name })
            }
            selected={activityDetails.status}
            options={statusList}
            optionName={"name"}
            placeholder="Select.."
            dropdownLabel={"Status"}
          />

          {activityDetails.status !== "Closed" &&
            activityDetails.status !== "Lost" && (
              <Input
                type={"date"}
                mandatory={true}
                onChange={valueHandler}
                value={activityDetails.follow_up_date}
                name={"follow_up_date"}
                minDate={dateFormatInYYYYMMDD(new Date())}
                label={"Next Followup Date"}
              />
            )}

          {activityDetails.status !== "Lost" &&
            activityDetails.status !== "" && (
              <>
                <span className="flex flex-col gap-[10px]">
                  <label className="flex gap-[2px] text-xs capitalize text-zinc-800 font-bold tracking-tight">
                    Estimated Lead Value <span className="text-red-600">*</span>
                  </label>
                  <span className="flex gap-2">
                    <SelectForObjects
                      margin={"0px"}
                      mandatory
                      height={"36px"}
                      className={"w-1/4"}
                      setselected={(name) =>
                        setEstimatedValue({
                          ...estimatedValue,
                          currency: name,
                        })
                      }
                      selected={estimatedValue.currency}
                      options={currencyList}
                      optionName={"name"}
                    />

                    <Input
                      type={"number"}
                      onChange={(e) =>
                        setEstimatedValue({
                          ...estimatedValue,
                          value: e.target.value,
                        })
                      }
                      value={estimatedValue.value}
                    />
                  </span>
                </span>
                <SelectForObjects
                  margin={"0px"}
                  mandatory
                  height={"36px"}
                  setselected={(name) =>
                    setActivityDetails({
                      ...activityDetails,
                      probability_of_lead_closer: name,
                    })
                  }
                  selected={activityDetails.probability_of_lead_closer}
                  options={percentageValueDDList}
                  optionName={"name"}
                  placeholder="Select.."
                  dropdownLabel={"Probability of lead close (%)"}
                />
              </>
            )}

          {activityDetails.status === "Lost" && (
            <SelectForObjects
              margin={"0px"}
              mandatory
              height={"36px"}
              setselected={(name) =>
                setActivityDetails({ ...activityDetails, lost_reason: name })
              }
              selected={activityDetails.lost_reason}
              options={lostDueToList}
              optionName={"name"}
              placeholder="Select.."
              dropdownLabel={"Lost Due To"}
            />
          )}

          <Input
            type={"textarea"}
            mandatory={true}
            outerClass={"col-span-2"}
            onChange={valueHandler}
            value={activityDetails.remark}
            name={"remark"}
            label={"Remark"}
          />
        </div>
      )}
    </FormModal>
  );
};

export default LeadActivityDetails;
