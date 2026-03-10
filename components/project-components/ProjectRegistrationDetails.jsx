import { useState, useEffect } from "react";
import Input from "../formPage/Input";
import { SelectForObjects } from "../formPage/MultiSelectDropdown/MultiSelectDropdown";
import SiteModal from "@/components/modals/AddEditSiteModal";
import { useModal } from "@/contexts/modal";
import { axiosInstance } from "@/services/ApiHandler";
import { getProjectSites } from "@/services/api";
import { getCity, getStates } from "@/services/api";
import { requestHandler } from "@/services/ApiHandler";
import { toast } from "sonner";
import Button from "../shared/Button";
import { generateProject, editRegisteredProject } from "@/services/api";
import File from "../File";
import UploadFile from "../formPage/UploadFileInput";
import Loading from "@/components/shared/Loading";
import {
  checkSpecificKeys,
  checkPincodeValue,
} from "@/utils/formValidationHandler";
import { LocalStorageService } from "@/services/LocalStorageHandler";
import { getProjectRegistrationList } from "@/services/api";
import ButtonLoading from "../shared/ButtonLoader";
import dynamic from "next/dynamic";
import { getCompanies } from "@/services/api";
import { useSalesPerson } from "@/contexts/salesperson";

const AddCompany = dynamic(
  () => import("@/components/modals/AddEditCompanyModal")
);

const ProjectRegistrationDetail = ({
  details,
  onNextClick,
  projectId,
  onProjectCreated,
  requiredFieldsError,
}) => {
  const { salesPersons } = useSalesPerson();
  const { openModal } = useModal();
  const [companies, setCompanies] = useState([]);
  const [projectSites, setProjectSites] = useState([]);
  const [states, setStates] = useState([]);
  const [city, setCity] = useState([]);
  const [projectSiteDetails, setProjectSiteDetails] = useState(null);
  const [formErrors, setFormErrors] = useState(requiredFieldsError);
  const [companyAddress, setCompanyAddress] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [currentModalId, setCurrentModalId] = useState(null);

  const [
    isBillingAddressSameAsCompanyAddress,
    setIsBillingAddressSameAsCompanyAddress,
  ] = useState(false);
  const [projectRegistrationDetails, setProjectRegistrationDetails] =
    useState(details);
  const [editData, setEditData] = useState({});

  const projectTypes = [
    { name: "Inroof" },
    { name: "Skin Roof" },
    { name: "Conventional" },
    { name: "Ground mounted-Ornate" },
    { name: "⁠Tracker(GM-SG)" },
    { name: "BESS" },
  ];


  useEffect(() => {
    getStatesHandler();
    getCompaniesHandler();
  }, []);

  // console.log("form",formErrors)

  useEffect(() => {
    if (
      projectRegistrationDetails?.company &&
      projectRegistrationDetails?.company !== ""
    ) {
      getSitesHandler(projectRegistrationDetails.company);
      let selectedCompany = companies.find(
        (company) => company.id == projectRegistrationDetails.company
      );
      setCompanyAddress(selectedCompany);
    }

    if (projectRegistrationDetails?.company == "") {
      setProjectRegistrationDetails({
        ...projectRegistrationDetails,
        gst_no: "",
      });
      setCompanyAddress({});
    }
  }, [projectRegistrationDetails?.company, companies]);

  const getSitesHandler = async (id) => {
    await requestHandler(
      async () => await getProjectSites(id),
      null,
      (data) => {
        setProjectSites(data.data.output);
        if (projectRegistrationDetails.project_site !== "") {
          const selectedSite = data.data.output.filter(
            (site) => site.id == projectRegistrationDetails.project_site
          )[0];
          setProjectSiteDetails(selectedSite);
        }
      },
      toast.error
    );
  };

  const getStatesHandler = async () => {
    await requestHandler(
      async () => await getStates(),
      null,
      (data) => setStates(data.data.output),
      toast.error
    );
  };

  const getCityHandler = async (id) => {
    await requestHandler(
      async () => await getCity(id),
      null,
      (data) => setCity(data.data.output),
      toast.error
    );
  };

  const handleLayoutFileChange = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const { data } = await axiosInstance.post(
        "/api/document-upload/",
        formData
      );
      if (data.status.code == 200) {
        let list = [
          ...projectRegistrationDetails.layout,
          {
            name: file.name,
            drawing: data.path,
            // drawing: data.document,
          },
        ];
        setProjectRegistrationDetails({
          ...projectRegistrationDetails,
          layout: list,
        });
        setEditData({ ...editData, layout: list });
      }
    } catch (error) {
      toast.error;
    }
  };

  const handleOtherFileChange = async (fileName, file) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const { data } = await axiosInstance.post(
        "/api/document-upload/",
        formData
      );
      if (data.status.code == 200) {
        let other_documents = projectRegistrationDetails?.other_documents ?? [];
        let list = [
          ...other_documents,
          {
            document_name: fileName,
            document: data.path,
            // document: data.document,
          },
        ];
        setProjectRegistrationDetails({
          ...projectRegistrationDetails,
          other_documents: list,
        });
        setEditData({ ...editData, other_documents: list });
      }
    } catch (error) {
      toast.error;
    }
  };

  const handleCompanyDetails = (selectedCompany) => {
    setCompanyAddress({
      address: selectedCompany?.address,
      pincode: selectedCompany?.pincode,
      city: selectedCompany?.city,
      state: selectedCompany?.state_id,
      city_name: selectedCompany?.city_name,
      state_name: selectedCompany?.state_name,
      gstin: selectedCompany?.gstin,
      gstin_doc: selectedCompany?.gstin_doc,
      pan: selectedCompany?.pan,
      pan_doc: selectedCompany?.pan_doc,
    });
    setProjectSiteDetails(null);
  };

  const removeLayoutFile = (index) => {
    let list = projectRegistrationDetails.layout;
    list.splice(index, 1);
    setProjectRegistrationDetails({
      ...projectRegistrationDetails,
      layout: list,
    });
    setEditData({ ...editData, layout: list });
  };

  const removeOtherFile = (index) => {
    let list = projectRegistrationDetails.other_documents;
    list.splice(index, 1);
    setProjectRegistrationDetails({
      ...projectRegistrationDetails,
      other_documents: list,
    });
    setEditData({ ...editData, other_documents: list });
  };
  // console.log(projectRegistrationDetails);

  const onSubmit = async () => {
    if (formErrors.registration_no) {
      toast.error("Please Enter a valid Registration No.");
      return;
    }

    // const keysToCheck = {
    //   company: "Customer",
    //   project_site: "Project Site",
    //   po_capacity_in_kw: "PO Capacity(KW)",
    //   project_site_area_in_sq_feet: "Project Site Area(Sq. Ft)",
    //   sales_lead_id: "Sales Lead",
    // };

    const keysToCheck = {
      registration_no: "Registration No.",
      type_of_project: "Project Type",
    };

    const validationResult = checkSpecificKeys(
      projectRegistrationDetails,
      keysToCheck
    );

    if (validationResult.isValid === false) {
      toast.error(validationResult.message);
      return;
    }

    const formData = new FormData();
    setIsLoading(true);

    // if new project is being registered
    if (projectId) {
      if (Object.keys(editData).length !== 0) {
        for (let key in editData) {
          if (["layout", "other_documents"].includes(key)) {
            formData.append([key], JSON.stringify(editData[key]));
          } else {
            formData.append([key], editData[key]);
          }
        }
        await requestHandler(
          async () => await editRegisteredProject(formData, projectId),
          null,
          async (data) => {
            toast.success("Project Details Saved Successfully...");
            onNextClick(projectRegistrationDetails);
            setIsLoading(false);
          },
          toast.error
        );
        setIsLoading(false);
      } else {
        onNextClick(projectRegistrationDetails);
      }
      // adding or updating details of already registered project
    } else {
      formData.append(
        "registration_no",
        projectRegistrationDetails.registration_no
      );

      formData.append(
        "type_of_project",
        projectRegistrationDetails.type_of_project
      );
      {
        projectRegistrationDetails.date !== "" &&
          formData.append("date", projectRegistrationDetails.date);
      }
      {
        projectRegistrationDetails.company !== "" &&
          formData.append("company", projectRegistrationDetails.company);
      }
      formData.append("gst_no", projectRegistrationDetails.gst_no);
      {
        projectRegistrationDetails.project_site !== "" &&
          formData.append("project_site", projectRegistrationDetails.project_site);
      }
      {
        projectRegistrationDetails.delivery_schedule !== "" &&
          formData.append("delivery_schedule", projectRegistrationDetails.delivery_schedule);
      }
      {
        projectRegistrationDetails.billing_address !== "" &&
          formData.append("billing_address", projectRegistrationDetails.billing_address);
      }
      {
        projectRegistrationDetails.billing_pincode !== "" &&
          formData.append("billing_pincode", projectRegistrationDetails.billing_pincode);
      }
      {
        projectRegistrationDetails.billing_city !== "" &&
          formData.append("billing_city", projectRegistrationDetails.billing_city);
      }
      formData.append("status", "Incomplete");
      {
        projectRegistrationDetails.po_date !== "" &&
          formData.append("po_date", projectRegistrationDetails.po_date);
      }
      {
        projectRegistrationDetails.po_value_without_gst !== "" &&
          formData.append("po_value_without_gst", projectRegistrationDetails.po_value_without_gst);
      }
      {
        projectRegistrationDetails.po_value_with_gst !== "" &&
          formData.append("po_value_with_gst", projectRegistrationDetails.po_value_with_gst);
      }
      {
        projectRegistrationDetails.po_capacity_in_kw !== "" &&
          formData.append("po_capacity_in_kw", projectRegistrationDetails.po_capacity_in_kw);
      }
      {
        projectRegistrationDetails.project_site_area_in_sq_feet !== "" &&
          formData.append("project_site_area_in_sq_feet", projectRegistrationDetails.project_site_area_in_sq_feet);
      }
      {
        projectRegistrationDetails.po_copy !== null &&
          formData.append("po_copy", projectRegistrationDetails.po_copy);
      }
      {
        projectRegistrationDetails.final_offer_copy !== null &&
          formData.append(
            "final_offer_copy",
            projectRegistrationDetails.final_offer_copy
          );
      }
      {
        projectRegistrationDetails?.sales_lead_id && projectRegistrationDetails?.sales_lead_id !== "" &&
          formData.append("sales_lead", Number(projectRegistrationDetails.sales_lead_id));
      }
      {
        projectRegistrationDetails.layout.length !== 0 &&
          formData.append(
            "layout",
            JSON.stringify(projectRegistrationDetails.layout)
          );
      }

      {
        projectRegistrationDetails.other_documents.length !== 0 &&
          formData.append(
            "other_documents",
            JSON.stringify(projectRegistrationDetails.other_documents)
          );
      }

      await requestHandler(
        async () => await generateProject(formData),
        null,
        async (data) => {
          toast.success("Project Details Saved Successfully...");
          onProjectCreated(data.status.last_id);
          LocalStorageService.set(
            "project-registration-id",
            data.status.last_id
          );
          onNextClick(projectRegistrationDetails);
          setIsLoading(false);
        },
        toast.error
      );
      setIsLoading(false);
    }
    // setIsLoading(false)
  };

  const checkForUniqueRegistrationNumber = async (registration_no) => {
    if (registration_no !== "") {
      await requestHandler(
        async () =>
          await getProjectRegistrationList({
            registration_no_search: registration_no,
          }),
        null,
        (data) => {
          let projectList = data.data.output;
          // remove the current project registration number while checking for duplicates,
          // or else this test will always fail for existing projects that have an registration number
          if (projectId && details.registration_no !== "") {
            projectList = projectList.filter(
              (project) => project.registration_no !== details.registration_no
            );
          }
          if (projectList.length > 0) {
            setFormErrors({
              ...formErrors,
              ["registration_no"]:
                "This Registration No. is already being used.Please try again!",
            });
          } else {
            setFormErrors({});
          }
        },
        toast.error
      );
    } else {
      setFormErrors({});
    }
  };

  function pincodeHandler(e) {
    if (checkPincodeValue(e) != null) {
      setProjectRegistrationDetails({
        ...projectRegistrationDetails,
        billing_pincode: e.target.value,
      });
      setEditData({ ...editData, billing_pincode: e.target.value });
    }
  }

  function positiveValueHandler(e, key) {
    const inputValue = e.target.value;
    const regex = /^(?:\d+|\d*\.\d+)$/;
    if (regex.test(inputValue) || inputValue === "") {
      setProjectRegistrationDetails({
        ...projectRegistrationDetails,
        [key]: inputValue,
      });
      setEditData({ ...editData, [key]: e.target.value });
    }
  }

  const handleBillingAddress = (e) => {
    if (e.target.checked) {
      setProjectRegistrationDetails({
        ...projectRegistrationDetails,
        billing_address: companyAddress?.address,
        billing_pincode: companyAddress.pincode,
        billing_city: companyAddress.city,
        billing_city_name: companyAddress.city_name,
        billing_state_name: companyAddress.state_name,
      });
      setEditData({
        ...editData,
        billing_address: companyAddress?.address,
        billing_pincode: companyAddress.pincode,
        billing_city: companyAddress.city,
        billing_city_name: companyAddress.city_name,
        billing_state_name: companyAddress.state_name,
      });
    } else {
      setProjectRegistrationDetails({
        ...projectRegistrationDetails,
        billing_address: "",
        billing_pincode: "",
        billing_city: "",
        billing_city_name: "",
        billing_state_name: "",
      });
      setEditData({
        ...editData,
        billing_address: "",
        billing_pincode: "",
        billing_city: "",
        billing_city_name: "",
        billing_state_name: "",
      });
    }
    setIsBillingAddressSameAsCompanyAddress(e.target.checked);
  };

  const getCompaniesHandler = async () => {
    await requestHandler(
      async () => await getCompanies(),
      setIsLoading,
      (data) => setCompanies(data.data.output),
      toast.error
    );
  };

  return (
    <>
      {!projectRegistrationDetails ? (
        <Loading />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2.5">
            <Input
              type="text"
              mandatory
              value={projectRegistrationDetails?.registration_no}
              onChange={(e) => {
                setProjectRegistrationDetails({
                  ...projectRegistrationDetails,
                  registration_no: e.target.value,
                });
                setEditData({ ...editData, registration_no: e.target.value });
              }}
              placeholder={"Registration No."}
              label={"Registration No."}
              onBlur={() =>
                checkForUniqueRegistrationNumber(
                  projectRegistrationDetails.registration_no
                )
              }
              error={formErrors.registration_no}
            />

            <SelectForObjects
              margin={"0px"}
              mandatory
              height={"36px"}
              setselected={(name, id) => {
                setProjectRegistrationDetails({
                  ...projectRegistrationDetails,
                  type_of_project: name,
                });
                setEditData({ ...editData, type_of_project: name });
              }}
              selected={projectRegistrationDetails?.type_of_project}
              options={projectTypes}
              optionName={"name"}
              optionID={"name"}
              placeholder="Select Name"
              dropdownLabel={"Select Project Type"}
              error={
                projectRegistrationDetails?.type_of_project === ""
                  ? formErrors.type_of_project
                  : ""
              }
            />

            <span></span>


            <SelectForObjects
              margin={"0px 0px 10px 0px"}
              mandatory
              height={"36px"}
              setselected={(name, id) => {
                const selectedOption = companies.find(
                  (option) => option.id == id
                );
                setProjectRegistrationDetails({
                  ...projectRegistrationDetails,
                  company: id,
                  gst_no: selectedOption?.gstin,
                  company_name: selectedOption?.name,
                  project_site: "",
                  project_site_name: "",
                });
                handleCompanyDetails(selectedOption);
                setEditData({
                  ...editData,
                  company: id,
                  gst_no: selectedOption?.gstin,
                });
              }}
              selected={projectRegistrationDetails?.company_name}
              options={companies}
              optionName={"name"}
              optionID={"id"}
              placeholder="Select.."
              dropdownLabel={"Select Customer"}
              canAdd={true}
              toAddName={"Customer"}
              onAddClick={() => {
                openModal("add-company");
                setCurrentModalId("add-company");
              }}
              // error={formErrors.company === "" ? formErrors.company : ""}
              error={
                projectRegistrationDetails?.company === ""
                  ? formErrors.company
                  : ""
              }
            />

            {currentModalId === "add-company" && (
              <AddCompany
                modalId={"add-company"}
                onSuccessfullSubmit={async (data, companyId) => {
                  await getCompaniesHandler();
                  handleCompanyDetails(data);
                  setProjectRegistrationDetails({
                    ...projectRegistrationDetails,
                    gst_no: data.gstin,
                    company: companyId,
                    company_name: data.name,
                    project_site: "",
                    project_site_name: "",
                  });
                  setEditData({
                    ...editData,
                    company: companyId,
                    gst_no: data?.gstin,
                  });
                  getSitesHandler(companyId);
                }}
              />
            )}
            <Input
              type="text"
              disabled={true}
              value={projectRegistrationDetails?.gst_no}
              onChange={(e) => { }}
              label={"GST No."}
            />

            <Input
              type="text"
              disabled={true}
              value={companyAddress?.address}
              onChange={(e) => { }}
              label={"Customer Address"}
            />

            <SelectForObjects
              margin={"0px 0px 10px 0px"}
              height={"36px"}
              mandatory
              disabled={projectRegistrationDetails?.company === ""}
              setselected={(name, id) => {
                const selectedOption = projectSites.find(
                  (option) => option.id == id
                );
                setProjectRegistrationDetails({
                  ...projectRegistrationDetails,
                  project_site: id,
                  project_site_name: selectedOption?.name,
                });
                setProjectSiteDetails(selectedOption);
                setEditData({
                  ...editData,
                  project_site: id,
                  contact_point_at_site: selectedOption.primary_poc_phone,
                });
              }}
              selected={projectRegistrationDetails?.project_site_name}
              options={projectSites}
              optionName={"name"}
              optionID={"id"}
              placeholder="Select.."
              dropdownLabel={"Project Sites"}
              onAddClick={() => {
                openModal("add-site");
                setCurrentModalId("add-site");
              }}
              canAdd={true}
              toAddName={"Project Site"}
              error={
                projectRegistrationDetails?.project_site === ""
                  ? formErrors.project_site
                  : ""
              }
            />
            {currentModalId === "add-site" && (
              <SiteModal
                companyList={companies}
                getSitesHandler={getSitesHandler}
                project={{
                  company: projectRegistrationDetails.company,
                  ...companyAddress,
                }}
                modalId="add-site"
                setProject={(data) => {
                  setProjectRegistrationDetails({
                    ...projectRegistrationDetails,
                    project_site: data.project_site,
                    project_site_name: data.name,
                  });
                  setProjectSiteDetails(data);
                  setEditData({
                    ...editData,
                    project_site: data.project_site,
                    contact_point_at_site: data.primary_poc_phone,
                  });
                }}
              />
            )}

            <Input
              type="text"
              value={projectSiteDetails?.primary_poc_client_name ?? ""}
              onClick={() => {
                openModal("edit-site");
                setCurrentModalId("edit-site");
              }}
              onChange={(e) => { }}
              placeholder={"POC Name at Site"}
              label={"POC Name at Site"}
            />

            <Input
              type="text"
              value={projectSiteDetails?.primary_poc_phone ?? ""}
              onClick={() => {
                openModal("edit-site");
                setCurrentModalId("edit-site");
              }}
              onChange={(e) => { }}
              placeholder={"POC Phone at Site"}
              label={"POC Phone at Site"}
            />

            {currentModalId === "edit-site" && (
              <SiteModal
                getSitesHandler={getSitesHandler}
                project={{
                  company: projectRegistrationDetails.company,
                  ...companyAddress,
                }}
                modalId="edit-site"
                siteDetails={projectSiteDetails}
              />
            )}

            <span>
              <Input
                type="checkbox"
                label="Same as Customer Address"
                className="w-fit"
                checked={isBillingAddressSameAsCompanyAddress}
                onChange={handleBillingAddress}
              />
            </span>
            <span className="col-span-2">
              <Input
                type="textarea"
                mandatory
                disabled={isBillingAddressSameAsCompanyAddress ? true : false}
                value={projectRegistrationDetails?.billing_address}
                onChange={(e) => {
                  setProjectRegistrationDetails({
                    ...projectRegistrationDetails,
                    billing_address: e.target.value,
                  });
                  setEditData({ ...editData, billing_address: e.target.value });
                }}
                placeholder={"Billing Address"}
                label={"Billing Address"}
                error={
                  projectRegistrationDetails?.billing_address === ""
                    ? formErrors.billing_address
                    : ""
                }
              />
            </span>

            <Input
              type="number"
              mandatory
              disabled={isBillingAddressSameAsCompanyAddress ? true : false}
              value={projectRegistrationDetails?.billing_pincode}
              onChange={pincodeHandler}
              placeholder={"Pincode"}
              label={"Pincode"}
              error={
                projectRegistrationDetails?.billing_pincode === ""
                  ? formErrors.billing_pincode
                  : ""
              }
            />
            <SelectForObjects
              margin={"0px"}
              height={"36px"}
              disabled={isBillingAddressSameAsCompanyAddress ? true : false}
              selected={projectRegistrationDetails?.billing_state_name}
              setselected={(name, id) => {
                setProjectRegistrationDetails({
                  ...projectRegistrationDetails,
                  billing_state: id,
                  billing_state_name: name,
                });
                getCityHandler(id);
              }}
              options={states}
              optionName={"name"}
              optionID={"id"}
              placeholder="Select.."
              dropdownLabel={"Select State"}
            />

            <SelectForObjects
              margin={"0px"}
              height={"36px"}
              mandatory
              disabled={isBillingAddressSameAsCompanyAddress ? true : false}
              setselected={(name, id) => {
                setProjectRegistrationDetails({
                  ...projectRegistrationDetails,
                  billing_city: id,
                  billing_city_name: name,
                });
                setEditData({ ...editData, billing_city: id });
              }}
              selected={projectRegistrationDetails?.billing_city_name}
              options={city}
              optionName={"name"}
              optionID={"id"}
              placeholder="Select.."
              dropdownLabel={"Select City"}
              error={
                projectRegistrationDetails?.billing_city === ""
                  ? formErrors.billing_city
                  : ""
              }
            />

            <div className={`relative flex flex-col gap-2.5 w-full`}>
              <label
                className="flex gap-[2px] text-xs capitalize text-zinc-800 font-bold tracking-tight"
                htmlFor="Upload PO Copy"
              >
                PO Copy<span className="text-red-600">*</span>
              </label>
              <UploadFile
                id={"PO Copy"}
                placeholderText={"Click to upload PO Copy"}
                isFileLoaded={
                  projectRegistrationDetails?.po_copy ? true : false
                }
                showFileName={true}
                uploadSingleFile={true}
                onFileChange={(file) => {
                  setProjectRegistrationDetails({
                    ...projectRegistrationDetails,
                    po_copy: file,
                  });
                  setEditData({ ...editData, po_copy: file });
                }}
                error={
                  projectRegistrationDetails?.po_copy === ""
                    ? formErrors.po_copy
                    : ""
                }
              />
              {projectRegistrationDetails?.po_copy !== "" &&
                projectRegistrationDetails?.po_copy !== null &&
                typeof projectRegistrationDetails?.po_copy !== "object" && (
                  <File
                    id={"PO Copy"}
                    name={"View"}
                    file={projectRegistrationDetails?.po_copy}
                    onRemoveFile={() => {
                      setProjectRegistrationDetails({
                        ...projectRegistrationDetails,
                        po_copy: null,
                      });
                      setEditData({ ...editData, po_copy: null });
                    }}
                  />
                )}
            </div>

            <div className={`relative flex flex-col gap-2.5 w-full`}>
              <label
                className="flex gap-[2px] text-xs capitalize text-zinc-800 font-bold tracking-tight"
                htmlFor="Upload PO Copy"
              >
                Final Offer Copy
              </label>
              <UploadFile
                id={"Final Offer Copy"}
                placeholderText={"Click to upload Final Offer Copy"}
                isFileLoaded={
                  projectRegistrationDetails?.final_offer_copy ? true : false
                }
                showFileName={true}
                uploadSingleFile={true}
                onFileChange={(file) => {
                  setProjectRegistrationDetails({
                    ...projectRegistrationDetails,
                    final_offer_copy: file,
                  });
                  setEditData({ ...editData, final_offer_copy: file });
                }}
              />
              {projectRegistrationDetails?.final_offer_copy !== "" &&
                projectRegistrationDetails?.final_offer_copy !== null &&
                typeof projectRegistrationDetails?.final_offer_copy !==
                "object" && (
                  <File
                    id={"Final Offer Copy"}
                    name={"View"}
                    file={projectRegistrationDetails?.final_offer_copy}
                    onRemoveFile={() => {
                      setProjectRegistrationDetails({
                        ...projectRegistrationDetails,
                        final_offer_copy: null,
                      });
                      setEditData({ ...editData, final_offer_copy: null });
                    }}
                  />
                )}
            </div>

            <Input
              type="date"
              mandatory
              value={projectRegistrationDetails?.po_date}
              onChange={(e) => {
                setProjectRegistrationDetails({
                  ...projectRegistrationDetails,
                  po_date: e.target.value,
                });
                setEditData({ ...editData, po_date: e.target.value });
              }}
              label={"PO Date"}
              error={
                projectRegistrationDetails?.po_date === ""
                  ? formErrors.po_date
                  : ""
              }
            />

            <Input
              type="number"
              mandatory
              value={projectRegistrationDetails?.po_value_without_gst}
              onChange={(e) => positiveValueHandler(e, "po_value_without_gst")}
              placeholder={"0.0"}
              label={"PO value (Without GST)"}
              error={
                projectRegistrationDetails?.po_value_without_gst === ""
                  ? formErrors.po_value_without_gst
                  : ""
              }
            />

            <Input
              type="number"
              mandatory
              value={projectRegistrationDetails?.po_value_with_gst}
              onChange={(e) => positiveValueHandler(e, "po_value_with_gst")}
              placeholder={"0.0"}
              label={"PO value (With GST)"}
              error={
                projectRegistrationDetails?.po_value_with_gst === ""
                  ? formErrors.po_value_with_gst
                  : ""
              }
            />

            <Input
              type="number"
              mandatory
              value={projectRegistrationDetails?.po_capacity_in_kw}
              onChange={(e) => positiveValueHandler(e, "po_capacity_in_kw")}
              placeholder={"0.0"}
              label={"PO capacity(KW)"}
              error={
                projectRegistrationDetails?.po_capacity_in_kw === ""
                  ? formErrors.po_capacity_in_kw
                  : ""
              }
            />

            <Input
              type="number"
              mandatory
              value={projectRegistrationDetails?.project_site_area_in_sq_feet}
              onChange={(e) => {
                setProjectRegistrationDetails({
                  ...projectRegistrationDetails,
                  project_site_area_in_sq_feet: e.target.value,
                });
                setEditData({
                  ...editData,
                  project_site_area_in_sq_feet: e.target.value,
                });
              }}
              placeholder={"0.0"}
              label={"Project Site Area(sq. ft)"}
              error={
                projectRegistrationDetails?.project_site_area_in_sq_feet === ""
                  ? formErrors.project_site_area_in_sq_feet
                  : ""
              }
            />

            <Input
              type="date"
              mandatory
              value={projectRegistrationDetails?.date}
              onChange={(e) => {
                setProjectRegistrationDetails({
                  ...projectRegistrationDetails,
                  date: e.target.value,
                });
                setEditData({ ...editData, date: e.target.value });
              }}
              label={"Project Start Date"}
              error={
                projectRegistrationDetails?.date === "" ? formErrors.date : ""
              }
            />

            <Input
              type="date"
              mandatory
              value={projectRegistrationDetails?.delivery_schedule}
              onChange={(e) => {
                setProjectRegistrationDetails({
                  ...projectRegistrationDetails,
                  delivery_schedule: e.target.value,
                });
                setEditData({ ...editData, delivery_schedule: e.target.value });
              }}
              label={"Delivery Schedule"}
              error={
                projectRegistrationDetails?.delivery_schedule === ""
                  ? formErrors.delivery_schedule
                  : ""
              }
            />

            <SelectForObjects
              margin={"0px 0px 10px 0px"}
              mandatory
              height={"36px"}
              setselected={(name, id) => {
                // setSiteVisitDetails((prev) => ({
                //   ...prev,
                //   installer: Number(id),
                //   installer_name: name,
                // }));
                // console.log(name, id);
                setProjectRegistrationDetails({
                  ...projectRegistrationDetails,
                  sales_lead_id: id,
                  sales_lead: name,
                });
                setEditData({ ...editData, sales_lead: id });
              }}
              selected={projectRegistrationDetails?.sales_lead}
              options={salesPersons}
              optionOtherKeys={["email"]}
              optionNameSeperator={" - "}
              optionName={"name"}
              optionID={"id"}
              placeholder="Select.."
              dropdownLabel={"Sales Lead"}
              error={
                projectRegistrationDetails?.sales_lead_id === ""
                  ? formErrors.sales_lead_id
                  : ""
              }
            />
          </div>

          <div className="gap-2.5 flex flex-wrap items-end">
            <div className={`relative flex flex-col gap-2.5 w-1/3`}>
              <label
                className="flex gap-[2px] text-xs capitalize text-zinc-800 font-bold tracking-tight"
                htmlFor="Upload Layout"
              >
                Layout<span className="text-red-600">*</span>
              </label>
              <UploadFile
                id={"Layout Drawing"}
                placeholderText="Click to upload Layout"
                onFileChange={handleLayoutFileChange}
                fileList={projectRegistrationDetails?.layout}
                fileNameKey="name"
                filePathKey="drawing"
                onRemoveFile={removeLayoutFile}
                showFileNameInputField={false}
                error={
                  projectRegistrationDetails?.layout.length === 0
                    ? formErrors.layout
                    : ""
                }
              />
            </div>

            {projectRegistrationDetails?.layout.length !== 0 && (
              <div className="flex items-center gap-2.5 flex-wrap">
                {projectRegistrationDetails?.layout.map((document, index) => (
                  <File
                    id={index}
                    key={index}
                    name={document.name}
                    file={document.drawing}
                    onRemoveFile={removeLayoutFile}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2.5 items-end">
            <div className={`relative flex flex-col gap-2.5 w-1/3`}>
              <label
                className="flex gap-[2px] text-xs capitalize text-zinc-800 font-bold tracking-tight"
                htmlFor="Upload Others"
              >
                Other Documents
              </label>
              <UploadFile
                id={"Others"}
                placeholderText="Click to upload Other Documents"
                onFileChange={handleOtherFileChange}
                fileList={projectRegistrationDetails?.other_documents}
                fileNameKey="document_name"
                filePathKey="document"
                onRemoveFile={removeOtherFile}
                showFileNameInputField={true}
              />
            </div>
            {projectRegistrationDetails?.other_documents &&
              projectRegistrationDetails?.other_documents.length !== 0 && (
                <div className="flex items-center gap-2.5 flex-wrap">
                  {projectRegistrationDetails?.other_documents.map(
                    (document, index) => (
                      <File
                        id={index}
                        key={index}
                        name={document.document_name}
                        file={document.document}
                        onRemoveFile={removeOtherFile}
                      />
                    )
                  )}
                </div>
              )}
          </div>
        </>
      )}

      <div className="h-[10%] w-full flex justify-end gap-4">
        {isLoading ? (
          <Button
            variant="inverted"
            className="my-2 w-[5rem] mr-2 border  border-primary px-2 text-xs text-primary"
            customText={true}
          >
            <ButtonLoading />
          </Button>
        ) : (
          <Button className=" h-[2rem] w-small" onClick={onSubmit}>
            Save and Next
          </Button>
        )}
      </div>
    </>
  );
};

export default ProjectRegistrationDetail;
