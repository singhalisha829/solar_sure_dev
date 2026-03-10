import Button from "@/components/shared/Button";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Stepper from "react-stepper-horizontal";
import {
  getProjectRegistrationProductList,
  getRegisteredProjectDetail,
  editRegisteredProject,
} from "@/services/api";
import { requestHandler } from "@/services/ApiHandler";
import { useRouter } from "next/router";
import Loading from "@/components/shared/Loading";
import { LocalStorageService } from "@/services/LocalStorageHandler";
import { checkAllSpecificKeys } from "@/utils/formValidationHandler";
import ButtonLoading from "@/components/shared/ButtonLoader";
import dynamic from "next/dynamic";
import { MdArrowForwardIos } from "react-icons/md";

const ProjectRegistrationDetail = dynamic(
  () => import("../../components/project-components/ProjectRegistrationDetails")
);
const CostEstimation = dynamic(
  () =>
    import(
      "../../components/project-components/ProjectRegistrationCostEstimation"
    )
);
const ProjectHeads = dynamic(
  () => import("../../components/project-components/ProjectRegistrationTable")
);

const GenerateProject = () => {
  const router = useRouter();
  const [projectHeads, setProjectHeads] = useState([]);
  const [projectId, setProjectId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [charges, setCharges] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [fetchedProjectDetails, setFetchedProjectDetails] = useState(null);
  const [projectHeadsNameList, setProjectHeadsNameList] = useState([]);
  const [totalProjectCapacity, setTotalProjectCapacity] = useState(0);
  const [formErrors, setFormErrors] = useState({});

  const projectRegistrationDetails = {
    registration_no: "",
    date: "",
    type_of_project: "",
    company: "",
    company_name: "",
    gst_no: "",
    project_site: "",
    delivery_schedule: "",
    billing_address: "",
    billing_pincode: "",
    po_copy: null,
    final_offer_copy: null,
    billing_city: "",
    billing_city_name: "",
    billing_state: "",
    billing_state_name: "",
    po_date: "",
    po_value_without_gst: "",
    po_value_with_gst: "",
    po_capacity_in_kw: "",
    project_site_area_in_sq_feet: "",
    layout: [],
    other_documents: []
  };

  const steps = [
    { title: "Project Detail", onClick: () => setCurrentStep(0) },
    { title: "Add/Modify Project Heads", onClick: () => setCurrentStep(1) },
    { title: "Cost Estimation", onClick: () => setCurrentStep(2) },
  ];

  useEffect(() => {
    const localStorageId = LocalStorageService.get("project-registration-id");
    if (router.asPath.includes("?")) {
      const id = router.asPath.split("=")[1];
      setProjectId(id);
      LocalStorageService.set("project-registration-id", id);
    } else if (localStorageId && localStorageId !== null) {
      setProjectId(localStorageId);
    } else {
      setIsLoading(false);
    }
    getProductListHandler();
  }, [router.asPath]);

  useEffect(() => {
    if (projectId !== null) {
      getProjectDetails(projectId);
    }
  }, [projectId]);

  const getProjectDetails = async (id) => {
    await requestHandler(
      async () => await getRegisteredProjectDetail(id),
      null,
      (data) => {
        const details = data.data.output[0];
        if (details.layout !== "" && typeof details.layout === "string") {
          details.layout = JSON.parse(details.layout);
        }
        if (
          details.other_documents !== "" &&
          typeof details.other_documents === "string"
        ) {
          details.other_documents = JSON.parse(details.other_documents);
        }
        setFetchedProjectDetails(details);
        setCharges({
          other_charges: details.other_charges,
          freight_charges: details.freight_charges,
          freight_charges_unit: details.freight_charges_unit,
          total_freight_charges: details.total_freight_charges,
          total_profit_margin: details.total_profit_margin,
          profit_margin: details.profit_margin,
          profit_margin_unit: details.profit_margin_unit,
          total_amount: details.total_amount,
          net_amount: details.net_amount,
          remark: details.remark,
        });
        setIsLoading(false);
      },
      toast.error
    );
  };

  // add the selected project type in first tab as a product in BOS Structure list
  const handleProjectType = (data) => {
    let list = [...projectHeads];
    list.map((section, sectionIndex) => {
      let product_list = [];
      if (
        section.section == "BOS-Structure" &&
        section.product_details.filter(
          (product) => product.Product === data.type_of_project
        ).length === 0
      ) {
        product_list = [
          {
            Product: data.type_of_project,
            cost: "",
            remark: "",
            option: true,
          },
          ...section.product_details,
        ];
        list[sectionIndex].product_details = product_list;
      }
    });
    setFetchedProjectDetails(data);
    setProjectHeads(list);
  };

  // console.log("l",projectRegistrationDetails,fetchedProjectDetails)

  const getProductListHandler = async () => {
    await requestHandler(
      async () => await getProjectRegistrationProductList(),
      null,
      (data) => {
        let name_list = [];
        let details = data.data.output[0];
        details.map((section) => {
          name_list.push({ name: section.section });
          if (section.product_details?.length > 0) {
            section.product_details.map((product) => {
              product.option = true;
            });
          }
        });
        setProjectHeads(details);

        setProjectHeadsNameList(name_list);
      },
      toast.error
    );
  };

  const onSubmit = async (status, nextPage) => {
    if (status === "Completed") {
      const keysToCheck = {
        registration_no: "Registration No.",
        date: "Date",
        type_of_project: "Project Type",
        company: "Customer",
        project_site: "Project Site",
        delivery_schedule: "Delivery Schedule",
        billing_address: "Billing Address",
        billing_pincode: "Billing Pincode",
        po_copy: "PO Copy",
        billing_city: "Billing City",
        po_date: "PO Date",
        po_value_without_gst: "PO Value (Without GST)",
        po_value_with_gst: "PO Value (With GST)",
        po_capacity_in_kw: "PO Capacity (KW)",
        project_site_area_in_sq_feet: "Project Site Area(Sq. Ft)",
        layout: "Layout",
        sales_lead_id: "Sales Lead",
      };

      const validationResult = checkAllSpecificKeys(
        fetchedProjectDetails,
        keysToCheck
      );

      if (validationResult.isValid === false) {
        setCurrentStep(0);
        setFormErrors(validationResult.fields);
        const firstKey = Object.keys(validationResult.fields)[0];
        toast.error(validationResult.fields[firstKey]);
        return;
      }
    }
    setFormErrors({});
    setIsButtonLoading(true);
    const formData = new FormData();

    formData.append("freight_charges", charges.freight_charges);
    formData.append("total_freight_charges", charges.total_freight_charges);
    formData.append("freight_charges_unit", charges.freight_charges_unit);
    formData.append("other_charges", charges.other_charges);
    formData.append("total_amount", charges.total_amount);
    formData.append("net_amount", charges.net_amount);
    formData.append("total_profit_margin", charges.total_profit_margin);
    formData.append("profit_margin", charges.profit_margin);
    formData.append("profit_margin_unit", charges.profit_margin_unit);
    formData.append("remark", charges.remark);
    // formData.append("status", status);
    if (status === "Completed") formData.append("status", status);

    await requestHandler(
      async () => await editRegisteredProject(formData, projectId),
      null,
      async (data) => {
        toast.success("Project Details Saved Successfully...");
        if (nextPage === "view-preview") {
          router.push(`/project-registration/preview-project?id=${projectId}`);
        } else {
          router.push("/project-registration");
        }
        setIsButtonLoading(false);
      },
      toast.error
    );
    setIsButtonLoading(false);
  };

  const onPreview = () => {
    window.open(
      `/project-registration/preview-project?id=${projectId}`,
      "__blank"
    );
  };

  const handleProjectDetails = (data) => {
    if (
      data.type_of_project !== "" &&
      fetchedProjectDetails?.product_section.length === 0
    ) {
      handleProjectType(data);
    } else {
      setFetchedProjectDetails(data);
    }
    setCurrentStep(1);
  };

  // console.log("form",fetchedProjectDetails.po_capacity_in_kw, totalProjectCapacity)

  return (
    <>
      {" "}
      <div className="flex justify-between items-center gap-4">
        <h2 className="flex text-xl font-bold tracking-tight">
          <span
            className="flex text-primary hover:underline underline-offset-4 cursor-pointer"
            onClick={() => router.back()}
          >
            Back
          </span>
          <MdArrowForwardIos className="mt-1 text-primary" />
          Project Registration Detail
          {!(
            projectRegistrationDetails?.company_name == "" &&
            !fetchedProjectDetails?.company_name
          ) && (
              <>
                <MdArrowForwardIos className="mt-1" />
                {projectRegistrationDetails?.company_name ||
                  fetchedProjectDetails?.company_name}{" "}
                ({fetchedProjectDetails?.project_site_name})
              </>
            )}
        </h2>
        <div className="w-1/2 text-xs">
          <Stepper
            steps={steps}
            activeStep={currentStep}
            size={13}
            titleFontSize={12}
            circleFontSize={0}
            activeColor="#f47920"
            completeColor="#f47920"
            completeBarColor="#f47920"
            activeBorderColor="#fef0e8"
            completeBorderColor="#fef0e8"
            defaultBorderColor="#fafafa"
          />
        </div>
      </div>
      <div className=" bg-white rounded p-5">
        {isLoading ? (
          <Loading />
        ) : (
          <div className="flex flex-col gap-4 p-5 border border-zinc-100 rounded-md grow h-full">
            {currentStep === 0 && (
              <ProjectRegistrationDetail
                details={
                  projectId || fetchedProjectDetails
                    ? fetchedProjectDetails
                    : projectRegistrationDetails
                }
                projectId={projectId}
                onNextClick={(data) => {
                  handleProjectDetails(data);
                }}
                onProjectCreated={(id) => {
                  setProjectId(id);
                }}
                requiredFieldsError={formErrors}
              />
            )}

            {currentStep === 1 && (
              <ProjectHeads
                projectId={projectId}
                enteredProjectCapacity={
                  Number(fetchedProjectDetails.po_capacity_in_kw) * 1000
                }
                enteredProjectArea={
                  fetchedProjectDetails.project_site_area_in_sq_feet
                }
                onTotalProjectCapacityChange={(data) =>
                  setTotalProjectCapacity(data)
                }
                onNextClick={(data) => {
                  setCurrentStep(2);
                  setFetchedProjectDetails({
                    ...fetchedProjectDetails,
                    product_section: data,
                  });
                }}
                onBackClick={() => setCurrentStep(0)}
                sectionDetails={
                  projectId &&
                    fetchedProjectDetails?.product_section?.length > 0 &&
                    fetchedProjectDetails?.product_section !== ""
                    ? fetchedProjectDetails.product_section
                    : projectHeads
                }
                sectionNameList={projectHeadsNameList}
                charges={charges}
                status={fetchedProjectDetails?.status}
              />
            )}

            {currentStep === 2 && projectHeads.length > 0 && (
              <CostEstimation
                sectionDetails={
                  projectId &&
                    fetchedProjectDetails?.product_section?.length > 0 &&
                    fetchedProjectDetails?.product_section !== ""
                    ? fetchedProjectDetails.product_section
                    : projectHeads
                }
                onChangeCharge={(data) => setCharges(data)}
                totalProjectCapacity={totalProjectCapacity}
                charges={charges}
                poValueWithoutGst={
                  projectId || fetchedProjectDetails
                    ? fetchedProjectDetails.po_value_without_gst
                    : projectRegistrationDetails.po_value_without_gst
                }
              />
            )}

            {currentStep === 2 && (
              <>
                {Number(totalProjectCapacity) !==
                  Number(fetchedProjectDetails.po_capacity_in_kw) * 1000 && (
                    <span className="text-red-500 text-xs">
                      <strong>Note-</strong>{" "}
                      <p>
                        Kindly note that the Entered Project Capacity deviates
                        from the aggregate of Project Capacities of all solar
                        panels within the project.
                      </p>
                    </span>
                  )}
                <div className="h-[10%] w-full flex justify-end gap-4">
                  <Button
                    className=" h-[2rem] w-small"
                    onClick={() => setCurrentStep(1)}
                    customText={"#9E9E9E"}
                    variant={"gray"}
                  >
                    Back
                  </Button>
                  {fetchedProjectDetails.status === "Incomplete" && (
                    <>
                      {isButtonLoading ? (
                        <Button
                          variant="inverted"
                          className="my-2 w-[5rem] mr-2 border  border-primary px-2 text-xs text-primary"
                          customText={true}
                        >
                          <ButtonLoading />
                        </Button>
                      ) : (
                        <Button
                          className=" h-[2rem] w-small"
                          onClick={() => onSubmit("Incomplete", "view-list")}
                        >
                          Close
                        </Button>
                      )}
                    </>
                  )}
                  <Button className=" h-[2rem] w-small" onClick={() => {
                    onPreview()
                    // onSubmit("Completed", "view-preview")
                    onSubmit("Incomplete", "view-preview")
                  }}>
                    Preview and Save
                  </Button>
                  {isButtonLoading ? (
                    <Button
                      variant="inverted"
                      className="my-2 w-[5rem] mr-2 border border-primary px-2 text-xs text-primary"
                      customText={true}
                    >
                      <ButtonLoading />
                    </Button>
                  ) : (
                    <Button
                      className=" h-[2rem] w-small"
                      onClick={() => onSubmit("Completed", "view-preview")}
                    >
                      Send for approval
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default GenerateProject;
