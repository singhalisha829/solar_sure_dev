import { useEffect, useState } from "react";
import Input from "@/components/formPage/Input";
import Button from "@/components/shared/Button";
import { SelectForObjects } from "@/components/formPage/MultiSelectDropdown/MultiSelectDropdown";
import {
  checkContactValue,
  checkSpecificKeys,
} from "@/utils/formValidationHandler";
import { useProject } from "@/contexts/project";
import File from "@/components/File";
import { handleFileUpload } from "@/utils/documentUploadHandler";
import {
  getEmployeeList,
  getProjectSites,
  addSiteVisits,
} from "@/services/api";
import { requestHandler } from "@/services/ApiHandler";
import { toast } from "sonner";
import { useCompany } from "@/contexts/companies";
import { useRouter } from "next/router";
import { MdArrowForwardIos } from "react-icons/md";
import EditableTable from "@/components/project-components/EditableTable";
import dynamic from "next/dynamic";
import { useModal } from "@/contexts/modal";

const AddExpenses = dynamic(
  () => import("@/components/modals/AddSiteVisitProjectExpense")
);

const AddSiteVisit = () => {
  const router = useRouter();
  const { date } = router.query;
  const { openModal } = useModal();
  const { projects, getProjectsHandler } = useProject();
  const { companies } = useCompany();
  const [isLoading, setIsLoading] = useState(false);
  const [employeeList, setEmployeeList] = useState([]);
  const [projectSites, setProjectSites] = useState([]);
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
      name: "Amount",
      type: "number",
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
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (date) {
      setSiteVisitDetails({
        ...siteVisitDetails,
        start_date: date,
        end_date: date,
      });
    }
  }, [date]);

  const fetchEmployees = async () => {
    await requestHandler(
      async () => await getEmployeeList(),
      null,
      (data) => setEmployeeList(data.data.output),
      toast.error
    );
  };

  const valueHandler = (e) => {
    setSiteVisitDetails((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // const contactHandler = (e) => {
  //   if (checkContactValue(e) != null) {
  //     setSiteVisitDetails((prev) => ({
  //       ...prev,
  //       point_of_contact_phone_no: checkContactValue(e),
  //     }));
  //   }
  // };

  const contactHandler = (e) => {
    let val = checkContactValue(e);
    if (val != null) {
      if (val.length > 10) {
        val = val.slice(0, 10);
      }
      setSiteVisitDetails((prev) => ({
        ...prev,
        point_of_contact_phone_no: val,
      }));
    }
  };

  const removeSiteImages = (index) => {
    let list = siteVisitDetails.project_site_images;
    list.splice(index, 1);
    setSiteVisitDetails({
      ...siteVisitDetails,
      project_site_images: list,
    });
  };

  const handleSiteImages = async (e) => {
    const response = await handleFileUpload(e.target.files[0]);
    if (response.type === "success") {
      let list = [
        ...siteVisitDetails.project_site_images,
        {
          url: response.data,
          name: e.target.files[0].name,
        },
      ];
      setSiteVisitDetails({
        ...siteVisitDetails,
        project_site_images: list,
      });
    } else {
      toast.error(response.error || "Oops! Something went wrong");
    }
  };

  const getSitesHandler = async (id) => {
    await requestHandler(
      async () => await getProjectSites(id),
      null,
      (data) => {
        setProjectSites(data.data.output);
      },
      toast.error
    );
  };

  const expenseValueHandler = (data, index) => {
    let expenseList = siteVisitDetails.project_site_expense;
    expenseList[index] = data;
    setSiteVisitDetails({
      ...siteVisitDetails,
      project_site_expense: expenseList,
    });
  };

  const onAddExpenseRow = (data) => {
    let expenseList = siteVisitDetails.project_site_expense;
    expenseList.push(data);
    setSiteVisitDetails({
      ...siteVisitDetails,
      project_site_expense: expenseList,
    });
  };

  const handleDeleteRow = (index) => {
    let expenseList = siteVisitDetails.project_site_expense;
    expenseList.splice(index, 1);
    setSiteVisitDetails({
      ...siteVisitDetails,
      project_site_expense: expenseList,
    });
  };

  const onSubmit = async () => {
    setIsLoading(true);
    const keysToCheck = {
      user: "Employee",
      company: "Company",
      project: "Project",
      site_address: "Project Site",
      start_date: "Start Date",
      end_date: "End Date",
    };
    const validationResult = checkSpecificKeys(siteVisitDetails, keysToCheck);
    if (validationResult.isValid === false) {
      toast.error(validationResult.message);
      return;
    }

    await requestHandler(
      async () => await addSiteVisits(siteVisitDetails),
      null,
      async (data) => {
        toast.success("Site Visit Added Successfully...");
        router.back();
      },
      (error) => {
        toast.error(error);
        setIsLoading(false);
      }
    );
  };

  const clearForm = () => {
    setSiteVisitDetails({
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
  };

  return (
    <>
      <div className="flex flex-col w-full gap-4">
        <h2 className="flex text-xl font-bold tracking-tight">
          <span
            className="flex text-orange-500 hover:underline underline-offset-4 cursor-pointer"
            onClick={() => router.back()}
          >
            Site Visits
          </span>
          <MdArrowForwardIos className="mt-1 text-orange-500" />
          Add Site Visit
        </h2>
        <div className="min-h-[85vh] overflow-hidden bg-white p-5 grid grid-cols-2 gap-x-2.5 gap-y-5">
          <SelectForObjects
            margin={"0px"}
            mandatory
            height={"36px"}
            setselected={(name, id) => {
              const selectedOption = employeeList.find(
                (employee) => employee.id == id
              );
              setSiteVisitDetails((prev) => ({
                ...prev,
                user: Number(id),
                employe_name: `${selectedOption?.first_name} ${selectedOption.last_name}`,
              }));
            }}
            selected={siteVisitDetails.employe_name}
            options={employeeList}
            optionName={"first_name"}
            optionOtherKeys={["last_name"]}
            optionNameSeperator={" "}
            optionID={"id"}
            placeholder="Select.."
            dropdownLabel={"Employee"}
          />
          <SelectForObjects
            margin={"0px"}
            mandatory
            height={"36px"}
            setselected={(name, id) => {
              setSiteVisitDetails((prev) => ({
                ...prev,
                company: Number(id),
              }));
              getProjectsHandler({ company: id });
              getSitesHandler(id);
            }}
            selected={
              companies.find(
                (company) => company.id == siteVisitDetails.company
              )?.name
            }
            options={companies}
            optionName={"name"}
            optionID={"id"}
            placeholder="Select.."
            dropdownLabel={"Company"}
          />
          <SelectForObjects
            margin={"0px"}
            mandatory
            height={"36px"}
            setselected={(name, id) => {
              setSiteVisitDetails((prev) => ({
                ...prev,
                project: Number(id),
              }));
            }}
            selected={
              projects.find((project) => project.id == siteVisitDetails.project)
                ?.refrence_number
            }
            options={siteVisitDetails.company === "" ? [] : projects}
            optionName={"refrence_number"}
            optionOtherKeys={["name"]}
            optionNameSeperator={" - "}
            optionID={"id"}
            placeholder="Select.."
            dropdownLabel={"Project"}
          />

          <SelectForObjects
            margin={"0px"}
            mandatory
            height={"36px"}
            setselected={(name, id) => {
              setSiteVisitDetails((prev) => ({
                ...prev,
                site_address: Number(id),
              }));
            }}
            selected={
              projectSites.find(
                (site) => site.id == siteVisitDetails.site_address
              )?.name
            }
            options={projectSites}
            optionName={"name"}
            optionID={"id"}
            placeholder="Select.."
            dropdownLabel={"Project Site"}
          />

          <Input
            mandatory={true}
            type={"date"}
            onChange={valueHandler}
            value={siteVisitDetails.start_date}
            name={"start_date"}
            label={"Start Date"}
          />
          <Input
            type={"date"}
            mandatory={true}
            onChange={valueHandler}
            value={siteVisitDetails.end_date}
            name={"end_date"}
            label={"End Date"}
          />
          <Input
            type={"text"}
            onChange={valueHandler}
            value={siteVisitDetails.point_of_contact_name}
            name={"point_of_contact_name"}
            label={"Contact Person Name"}
          />
          <Input
            type={"number"}
            onChange={contactHandler}
            value={siteVisitDetails.point_of_contact_phone_no}
            name={"point_of_contact_phone_no"}
            label={"Contact Person Phone"}
          />
          <Input
            type={"textarea"}
            outerClass="col-span-2"
            onChange={valueHandler}
            value={siteVisitDetails.remark}
            name={"remark"}
            label={"Remark"}
          />
          <div className="col-span-2 items-end gap-2.5 flex flex-wrap">
            {" "}
            <Input
              type={"file"}
              onChange={handleSiteImages}
              label={"Upload Images"}
              fileTypes={".jpg, .jpeg, .png"}
              width="49%"
            />
            {siteVisitDetails?.project_site_images.length !== 0 &&
              siteVisitDetails?.project_site_images.map((document, index) => (
                <File
                  id={index}
                  key={index}
                  onHover={document.name}
                  name={`Image ${index + 1}`}
                  file={document.url}
                  onRemoveFile={removeSiteImages}
                />
              ))}
          </div>

          <div className="col-span-2">
            <span className="flex justify-between">
              {" "}
              <label className="flex gap-[2px] text-xs capitalize text-zinc-800 font-bold tracking-tight">
                Project Expenses
              </label>
              <Button
                className={"px-4 mb-2"}
                onClick={() => openModal("add-site-visit-project-expense")}
              >
                Add
              </Button>
            </span>
            <div className="overflow-x-auto">
              <EditableTable
                onEditSuccess={expenseValueHandler}
                isEditMode={true}
                isModalOpenOnEdit={"edit-site-visit-project-expense"}
                rows={siteVisitDetails.project_site_expense}
                columns={tableColumns}
                onDeleteRow={handleDeleteRow}
              />
            </div>
          </div>
          <div className="col-span-2 flex gap-4 justify-end right-2">
            <Button
              className=" h-[2rem] w-small"
              onClick={clearForm}
              customText={"#9E9E9E"}
              variant={"gray"}
            >
              Clear
            </Button>
            <Button className=" h-[2rem] w-small" onClick={onSubmit} disabled={isLoading}>
              Submit
            </Button>
          </div>
        </div>
      </div>
      <AddExpenses
        modalId={"add-site-visit-project-expense"}
        onSaveExpense={onAddExpenseRow}
        filterOptions={siteVisitDetails?.project_site_expense?.map(el => el?.type_of_expense)}
      />
    </>
  );
};

export default AddSiteVisit;
