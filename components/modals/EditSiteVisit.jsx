import { useEffect, useState } from "react";
import FormModal from "../shared/FormModal";
import Button from "../shared/Button";
import EditableTable from "../project-components/EditableTable";
import { useProject } from "@/contexts/project";
import { FaPen } from "react-icons/fa";
import { dateFormat } from "@/utils/formatter";
import { LocalStorageService } from "@/services/LocalStorageHandler";
import { useRouter } from "next/router";

const EditSiteVisit = ({ modalId, selectedEvent, canEditSiteVisit }) => {
  const router = useRouter();
  const { projects } = useProject();
  const [siteVisitDetails, setSiteVisitDetails] = useState({
    company: "",
    project: "",
    user: "",
    start_date: "",
    end_date: "",
    site_address: "",
    point_of_contact_name: "",
    point_of_contact_phone_no: "",
    remark: "",
    project_site_images: [],
    project_site_expense: [],
  });

  const displayFields = {
    employe_name: "Employee",
    company_name: "Company",
    project_name: "Project",
    complete_site_address: "Project Site",
    start_date: "Start Date",
    end_date: "End Date",
    point_of_contact_name: "Contact Person Name",
    point_of_contact_phone_no: "Contact Person Phone",
    remark: "Remark",
  };

  const expenseTypes = [
    { name: "Food", value: "food" },
    { name: "Hotel", value: "hotel" },
    { name: "Travel", value: "travel" },
    { name: "Material", value: "material" },
    { name: "Labour", value: "labour" },
    { name: "Other", value: "other" },
  ];

  const tableColumns = [
    {
      name: "Type of Expense",
      key: "type_of_expense",
      type: "dropdown",
      width: "80px",
      options: expenseTypes,
      optionId: "value",
      optionName: "name",
    },
    {
      name: "Document",
      type: "file",
      key: "bill_document",
      width: "80px",
    },
    {
      name: "Amount(₹)",
      type: "number",
      displayType: "price",
      key: "amount",
      width: "50px",
    },
    {
      name: "Remarks",
      type: "text",
      key: "remark",
      width: "80px",
    },
  ];

  useEffect(() => {
    if (selectedEvent) {
      const selectedProject = projects.find(
        (project) => project.id == selectedEvent.project
      );
      if (selectedProject?.name !== "") {
        setSiteVisitDetails({
          ...selectedEvent,
          project_name: selectedProject?.name,
        });
      } else {
        setSiteVisitDetails({
          ...selectedEvent,
          project_name: selectedProject?.refrence_number,
        });
      }
    }
  }, [selectedEvent]);

  return (
    <FormModal
      id={modalId}
      width="w-[60%]"
      heading={"Site Visit Details"}
      className={"overflow-visible"}
      cancelButtonText={"Close"}
    >
      <div className="relative grid grid-cols-2 gap-x-2.5 gap-y-5 overflow-scroll p-2">
        {canEditSiteVisit && (
          <Button
            onClick={() => {
              router.push("site-visits/edit-site-visit");
              LocalStorageService.set("edit-site-visit-details", selectedEvent);
            }}
            variant={"inverted"}
            customText={"#F47920"}
            className="absolute right-0 w-[4rem] border-1 border-dark-bluish-green text-dark-bluish-green px-2 bg-white hover:bg-slate-100 "
          >
            <FaPen />
            Edit
          </Button>
        )}
        {Object.keys(displayFields).map((key, index) => {
          return (
            <span key={index}>
              {" "}
              <label className="flex gap-[2px] text-xs capitalize text-zinc-800 font-bold tracking-tight">
                {displayFields[key]}:
              </label>{" "}
              {["start_date", "end_date"].includes(key)
                ? dateFormat(siteVisitDetails[key])
                : siteVisitDetails[key]}
            </span>
          );
        })}

        <hr className="col-span-2" />

        <span className="relative col-span-2">
          <label className="flex gap-[2px] text-xs capitalize text-zinc-800 font-bold tracking-tight">
            Images:
          </label>
          <div className="flex flex-wrap gap-2">
            {siteVisitDetails?.project_site_images.map((image, index) => {
              let fileNamePartsLength = image.url.split("/").length;
              const fileName = image.url.split("/")[fileNamePartsLength - 1];
              return (
                <span
                  key={index}
                  className="hover:text-primary cursor-pointer hover:underline underline-offset-4"
                  onClick={() => window.open(image.url, "_blank")}
                  title={fileName}
                >
                  Image {index + 1}
                </span>
              );
            })}
          </div>
        </span>

        <hr className="col-span-2" />

        <span className="relative col-span-2">
          <label className="flex gap-[2px] mb-6 text-xs capitalize text-zinc-800 font-bold tracking-tight">
            Expenses:
          </label>
          <EditableTable
            rows={siteVisitDetails?.project_site_expense}
            columns={tableColumns}
          />
        </span>
      </div>
    </FormModal>
  );
};

export default EditSiteVisit;
