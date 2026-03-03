import { useEffect, useState } from "react";
import { MdArrowForwardIos } from "react-icons/md";
import Button from "@/components/shared/Button";
import { SelectForObjects } from "@/components/formPage/MultiSelectDropdown/MultiSelectDropdown";
import Input from "@/components/formPage/Input";
import { handleFileUpload } from "@/utils/documentUploadHandler";
import EditableTable from "@/components/project-components/EditableTable";
import { LocalStorageService } from "@/services/LocalStorageHandler";
import { requestHandler } from "@/services/ApiHandler";
import { toast } from "sonner";
import {
  getEmployeeList,
  getProjectSites,
  editSiteVisit,
  addSiteExpense,
  addSiteImage,
  editSiteExpense,
  deleteSiteExpense,
  deleteSiteImage,
} from "@/services/api";
import { useRouter } from "next/router";
import { useProject } from "@/contexts/project";
import { useCompany } from "@/contexts/companies";
import File from "@/components/File";
import { useModal } from "@/contexts/modal";
import dynamic from "next/dynamic";
import { capitalizeFirstLetter } from "@/utils/formatter";
import { checkContactValue } from "@/utils/formValidationHandler";

const AddExpenses = dynamic(
  () => import("@/components/modals/AddSiteVisitProjectExpense")
);

const WarningModal = dynamic(() => import("@/components/modals/WarningModal"));

const EditSiteVisit = () => {
  const router = useRouter();
  const { openModal, closeModal } = useModal();
  const { projects, getProjectsHandler } = useProject();
  const { companies } = useCompany();
  const [projectSites, setProjectSites] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);
  const [editData, setEditData] = useState({});
  const [selectedExpense, setSelectedExpense] = useState(null);
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
    fetchEmployees();
    const siteVisitData = LocalStorageService.get("edit-site-visit-details");
    if (siteVisitData) {
      const selectedProject = projects.find(
        (project) => project.id == siteVisitData.project
      );
      if (selectedProject?.name !== "") {
        setSiteVisitDetails({
          ...siteVisitData,
          project_name: selectedProject?.name,
        });
      } else {
        setSiteVisitDetails({
          ...siteVisitData,
          project_name: selectedProject?.refrence_number,
        });
      }
      getSitesHandler(siteVisitData.company_id);
    }
  }, []);

  const fetchEmployees = async () => {
    await requestHandler(
      async () => await getEmployeeList(),
      null,
      (data) => setEmployeeList(data.data.output),
      toast.error
    );
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

  const valueHandler = (e) => {
    setSiteVisitDetails((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

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
      setEditData({
        ...editData,
        point_of_contact_phone_no: val,
      });
    }
  };
  // console.log(siteVisitDetails.project_site_expense);

  // const contactHandler = (e) => {
  //   if (checkContactValue(e) != null) {
  //     setSiteVisitDetails((prev) => ({
  //       ...prev,
  //       point_of_contact_phone_no: checkContactValue(e),
  //     }));
  //     setEditData({
  //       ...editData,
  //       point_of_contact_phone_no: checkContactValue(e),
  //     });
  //   }
  // };

  const handleSiteImages = async (e) => {
    const response = await handleFileUpload(e.target.files[0]);
    if (response.type === "success") {
      //  call post api to add the image to the particular site visit
      const data = {
        url: response.data,
        name: e.target.files[0].name,
        project_site_visit: siteVisitDetails.id,
      };
      await requestHandler(
        async () => await addSiteImage(data),
        null,
        async (data) => {
          //   update the states accordingly
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
          LocalStorageService.set("edit-site-visit-details", {
            ...siteVisitDetails,
            project_site_images: list,
          });
        },
        toast.error
      );
    } else {
      toast.error(response.error || "Oops! Something went wrong");
    }
  };

  const removeSiteImages = async (index) => {
    await requestHandler(
      async () =>
        await deleteSiteImage(siteVisitDetails.project_site_images[index].id, {
          is_active: false,
          project_site_visit: siteVisitDetails?.id,
        }),
      null,
      async (data) => {
        toast.success("Site Visit Image Removed Successfully...");
        let list = siteVisitDetails.project_site_images;
        list.splice(index, 1);
        setSiteVisitDetails({
          ...siteVisitDetails,
          project_site_images: list,
        });
        LocalStorageService.set("edit-site-visit-details", {
          ...siteVisitDetails,
          project_site_images: list,
        });
      },
      toast.error
    );
  };

  const handleSiteExpense = async (expenseData, index) => {
    // edit already existing expense data
    if (expenseData.id) {
      await requestHandler(
        async () =>
          await editSiteExpense(expenseData.id, {
            ...expenseData,
            project_site_visit: siteVisitDetails?.id,
          }),
        null,
        async (data) => {
          toast.success("Site Visit Expense Saved Successfully...");
          const list = siteVisitDetails.project_site_expense;
          list[index] = expenseData;
          setSiteVisitDetails({
            ...siteVisitDetails,
            project_site_expense: list,
          });
          LocalStorageService.set("edit-site-visit-details", {
            ...siteVisitDetails,
            project_site_expense: list,
          });
        },
        toast.error
      );
    }
    // add new expense data
    else {
      await requestHandler(
        async () =>
          await addSiteExpense({
            ...expenseData,
            project_site_visit: siteVisitDetails?.id,
          }),
        null,
        async (data) => {
          toast.success("Site Visit Expense Added Successfully...");
          const list = siteVisitDetails.project_site_expense;
          list.push({ ...expenseData, id: data.status.last_id });
          setSiteVisitDetails({
            ...siteVisitDetails,
            project_site_expense: list,
          });
          LocalStorageService.set("edit-site-visit-details", {
            ...siteVisitDetails,
            project_site_expense: list,
          });
        },
        toast.error
      );
    }
  };

  const handleDeleteRow = async () => {
    await requestHandler(
      async () =>
        await deleteSiteExpense(selectedExpense.id, {
          is_active: false,
          project_site_visit: siteVisitDetails?.id,
        }),
      null,
      async (data) => {
        toast.success("Site Visit Expense Removed Successfully...");
        closeModal("delete-site-visit-expense");
        let expenseList = siteVisitDetails.project_site_expense;
        const index = expenseList.findIndex(
          (expense) => expense.id == selectedExpense.id
        );
        if (index != -1) {
          expenseList.splice(index, 1);
          setSiteVisitDetails({
            ...siteVisitDetails,
            project_site_expense: expenseList,
          });
          LocalStorageService.set("edit-site-visit-details", {
            ...siteVisitDetails,
            project_site_expense: expenseList,
          });
        }
      },
      toast.error
    );
  };

  const onSubmit = async () => {
    await requestHandler(
      async () => await editSiteVisit(siteVisitDetails.id, editData),
      null,
      async (data) => {
        toast.success("Site Visit Saved Successfully...");
        router.back();
      },
      toast.error
    );
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
          Edit Site Visit
        </h2>
        <div className="min-h-[85vh] bg-white relative grid grid-cols-2 gap-x-2.5 gap-y-5 overflow-hidden p-5">
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
              setEditData({
                ...editData,
                user: Number(id),
              });
            }}
            selected={siteVisitDetails.employe_name}
            options={employeeList}
            optionName={"first_name"}
            optionNameSeperator={" "}
            optionOtherKeys={["last_name"]}
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
                (company) => company.id == siteVisitDetails.company_id
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
              setEditData({ ...editData, project: Number(id) });
            }}
            selected={
              projects.find((project) => project.id == siteVisitDetails.project)
                ?.refrence_number
            }
            options={siteVisitDetails.company === "" ? [] : projects}
            optionName={"refrence_number"}
            optionOtherKeys={["name"]}
            optionNameSeperator={"-"}
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
              setEditData({ ...editData, site_address: Number(id) });
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
              width="49%"
              fileTypes={".jpg, .jpeg, .png"}
            />
            {siteVisitDetails?.project_site_images.length !== 0 &&
              siteVisitDetails?.project_site_images.map((document, index) => {
                let fileNamePartsLength = document.url.split("/").length;
                const fileName =
                  document.url.split("/")[fileNamePartsLength - 1];
                return (
                  <File
                    id={index}
                    key={index}
                    onHover={fileName}
                    name={`Image ${index + 1}`}
                    file={document.url}
                    onRemoveFile={removeSiteImages}
                  />
                );
              })}
          </div>

          <div className="col-span-2 mb-4">
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
            <EditableTable
              isEditMode={true}
              rows={siteVisitDetails.project_site_expense}
              onEditSuccess={handleSiteExpense}
              isModalOpenOnEdit={"edit-site-visit-project-expense"}
              columns={tableColumns}
              onDeleteRow={(index) => {
                setSelectedExpense(
                  siteVisitDetails.project_site_expense[index]
                );
                openModal("delete-site-visit-expense");
              }}
            />
          </div>
          <div className="col-span-2 flex gap-4 justify-end right-2">
            <Button
              className=" h-[2rem] w-small"
              onClick={() => router.back()}
              customText={"#9E9E9E"}
              variant={"gray"}
            >
              Cancel
            </Button>
            <Button className=" h-[2rem] w-small" onClick={onSubmit}>
              Save
            </Button>
          </div>
        </div>
      </div>
      <AddExpenses
        modalId={"add-site-visit-project-expense"}
        onSaveExpense={handleSiteExpense}
        filterOptions={siteVisitDetails?.project_site_expense?.map(el => el?.type_of_expense)}
      />
      <WarningModal
        modalId={"delete-site-visit-expense"}
        modalContent={
          <>
            Are you sure that you want to delete expense for -{" "}
            <strong>
              {capitalizeFirstLetter(selectedExpense?.type_of_expense)}
            </strong>
            ?
          </>
        }
        onSubmit={handleDeleteRow}
      />
    </>
  );
};

export default EditSiteVisit;
