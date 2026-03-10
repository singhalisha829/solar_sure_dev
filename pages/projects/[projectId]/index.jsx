import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import {
  BsFillGrid1X2Fill,
  BsCalendarWeek,
  BsCalendarRange,
} from "react-icons/bs";
import { FaFileAlt } from "react-icons/fa";
import {
  FaTruck,
  FaMoneyBillTransfer,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa6";
import { MdEngineering, MdArrowForwardIos } from "react-icons/md";
import AddManufaturer from "@/components/modals/AddEditManufaturer";
import AddVendor from "@/components/modals/AddVendor";
import ProjectCatagorySidebar from "@/components/project-components/ProjectDetails/ProjectCatagorySidebar";
import ProjectDetailWrapper from "@/components/project-components/ProjectDetails/ProjectDetailWrapper";
import { useProject } from "@/contexts/project";
import { LocalStorageService } from "@/services/LocalStorageHandler";
import dynamic from "next/dynamic";
import {
  fetchProjectFinancials,
  fetchProjectInstallationDetails,
} from "@/services/api";
import { requestHandler } from "@/services/ApiHandler";
import { toast } from "sonner";

const DashBoard = dynamic(
  () =>
    import("../../../components/project-components/ProjectDetails/DashBoard")
);
const ProjectEngineering = dynamic(
  () =>
    import(
      "../../../components/project-components/ProjectDetails/ProjectEngineering"
    )
);
const ProjectPlanning = dynamic(
  () =>
    import(
      "../../../components/project-components/ProjectDetails/ProjectPlanning"
    )
);
const ProjectProcurement = dynamic(
  () =>
    import(
      "../../../components/project-components/ProjectDetails/ProjectProcurement"
    )
);
const ProjectSchedule = dynamic(
  () =>
    import(
      "../../../components/project-components/ProjectDetails/ProjectSchedule"
    )
);
const ProjectPayment = dynamic(
  () =>
    import(
      "../../../components/project-components/ProjectDetails/ProjectPayment"
    )
);
const ProjectSiteProgressReport = dynamic(
  () =>
    import(
      "../../../components/project-components/ProjectDetails/ProjectSiteProgressReport"
    )
);
const ProjectCompletion = dynamic(
  () =>
    import(
      "../../../components/project-components/ProjectDetails/ProjectCompletion"
    )
);
const ProjectPurchaseOrder = dynamic(
  () =>
    import(
      "../../../components/project-components/ProjectDetails/ProjectPurchaseOrder"
    )
);

const ProjectDetailsPage = () => {
  const router = useRouter();
  const { projectId, tab, projectName } = router.query;
  const {
    getProjectDetailsHandler,
    projectDetails,
    contigencyBomList,
    fetchProjectContigency,
  } = useProject();
  const tabContainerRef = useRef(null);

  const [selectedCatagory, setSelectedCatagory] = useState("Electrical");
  const [engineeringSelectedCategory, setEngineeringSelectedCategory] =
    useState("Electrical");
  const [planningSelectedCategory, setPlanningSelectedCategory] =
    useState("Electrical");
  const [installationItems, setInstallationItems] = useState([]);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [projectFinancesDetails, setProjectFinancesDetails] = useState({});

  const [user, setUser] = useState(null);

  const accessibilityInfo =
    LocalStorageService.get("user_accessibility")?.accessibility[0].projects ??
    {};

  const tabsConfig = [
    {
      name: "Dashboard",
      key: "dashboard_tab",
      icon: <BsFillGrid1X2Fill />,
    },
    // {
    //   name: "Schedule",
    //   key: "schedule_tab",
    //   icon: <BsCalendarRange className="h-[18px] w-[18px]" />,
    // },
    {
      name: "Engineering",
      key: "engineering_tab",
      icon: <MdEngineering className="h-[20px] w-[20px]" />,
    },
    {
      name: "Planning",
      key: "planning_tab",
      icon: <BsCalendarWeek className="h-[18px] w-[18px]" />,
    },
    {
      name: "Procurement",
      key: "procurement_tab",
      icon: <FaTruck className="h-[18px] w-[18px]" />,
    },
    {
      name: "Packing List",
      key: "packing_list_tab",
      icon: <FaTruck className="h-[18px] w-[18px]" />,
    },
    {
      name: "Site Progress",
      key: "site_progress_report_tab",
      icon: <FaFileAlt className="h-[16px] w-[16px]" />,
    },
    {
      name: "Payment",
      key: "payment_tab",
      icon: <FaMoneyBillTransfer className="h-[16px] w-[16px]" />,
    },
    {
      name: "Project Completion",
      key: "project_completion_tab",
      icon: <FaMoneyBillTransfer className="h-[16px] w-[16px]" />,
    },
  ];

  // Generate tabs based on accessibility info
  const tabs = tabsConfig.filter((tab) => {
    const tabAccess = accessibilityInfo?.[tab.key];
    return tabAccess && tabAccess?.page_view; // Include tab only if page_view is true
  });

  const [selectedTab, setSelectedTab] = useState(tab ? tab : tabs[0].name);

  useEffect(() => {
    const userInfo = LocalStorageService.get("user");
    setUser(userInfo);
    getProjectDetailsHandler();
    fetchInstallationItems();
    fetchProjectContigency();
    fetchProjectFinances(projectId);
  }, []);

  useEffect(() => {
    if (tab !== selectedTab) {
      setSelectedTab(tab);
    }
  }, [tab]);

  useEffect(() => {
    checkOverflow(); // Check overflow on component mount and after tabs are updated.

    // Recheck on window resize
    window.addEventListener("resize", checkOverflow);

    return () => {
      window.removeEventListener("resize", checkOverflow);
    };
  }, [tabs]);

  const tabHandler = (value) => {
    router.push({
      pathname: `/projects/${projectId}`,
      query: { tab: value, projectName: projectName },
    });
  };

  const fetchProjectFinances = async (projectId) => {
    await requestHandler(
      async () => await fetchProjectFinancials({ id: projectId }),
      null,
      (data) => {
        // Assuming the response contains financial data
        const financialData = data.data.output[0] ?? {};
        setProjectFinancesDetails(financialData);
      },
      (error) => {
        toast.error("Failed to fetch project finances.");
      }
    );
  };

  const fetchInstallationItems = async () => {
    await requestHandler(
      async () => await fetchProjectInstallationDetails(projectId),
      null,
      (data) => {
        setInstallationItems(data.data.output);
      },
      toast.error
    );
  };

  const scrollLeft = () => {
    if (tabContainerRef.current) {
      tabContainerRef.current.scrollBy({
        left: -200, // Adjust the scroll amount based on the tab width
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (tabContainerRef.current) {
      tabContainerRef.current.scrollBy({
        left: 200, // Adjust the scroll amount based on the tab width
        behavior: "smooth",
      });
    }
  };

  const checkOverflow = () => {
    if (tabContainerRef.current) {
      const { scrollWidth, clientWidth } = tabContainerRef.current;
      setIsOverflowing(scrollWidth > clientWidth);
    }
  };

  return (
    <div className="flex flex-col h-full gap-2 overflow-auto">
      <div className="flex items-center gap-4">
        <h2 className=" flex text-xl font-bold tracking-tight capitalize">
          <span
            className="text-primary hover:underline underline-offset-4 cursor-pointer"
            onClick={() => router.push("/projects")}
          >
            Projects
          </span>
          <MdArrowForwardIos className="text-primary mt-1" />
          {projectName}
        </h2>
        <div className="bg-zinc-800/10 rounded-full px-2.5 py-1 text-zinc-800 text-[10px] font-bold tracking-tight">
          {projectDetails?.project_site_name}
        </div>
      </div>
      <div className="grow bg-white p-5 pb-0 rounded-md overflow-auto">
        <div className="flex flex-col gap-4 p-5 border border-zinc-100 rounded-md grow h-full ">
          <div className="flex items-center gap-4">
            {isOverflowing && <FaChevronLeft size={20} onClick={scrollLeft} />}
            <div
              ref={tabContainerRef}
              className="flex overflow-x-auto no-scrollbar"
              style={{ scrollBehavior: "smooth" }}
            >
              <div className="flex gap-4">
                {tabs.map((tab, idx) => (
                  <Tab
                    key={idx}
                    value={selectedTab}
                    onClick={tabHandler}
                    name={tab.name}
                  />
                ))}
              </div>
            </div>
            {isOverflowing && (
              <FaChevronRight size={20} onClick={scrollRight} />
            )}
          </div>

          <div className="overflow-auto h-full">
            {selectedTab === "Dashboard" && (
              <DashBoard financialData={projectFinancesDetails} />
            )}

            {selectedTab === "Planning" && (
              <ProjectDetailWrapper>
                <ProjectCatagorySidebar
                  selectedCatagory={planningSelectedCategory}
                  hasContingencyItems={
                    projectDetails?.bom_item_contingency_list?.length > 0 ||
                    installationItems.some((item) => item.is_contigency) ||
                    contigencyBomList?.length > 0
                  }
                  onClick={(value) => {
                    setPlanningSelectedCategory(value);
                    setEngineeringSelectedCategory(value);
                    if (value !== "Contingency") {
                      setSelectedCatagory(value);
                    }
                  }}
                />

                <ProjectPlanning
                  selectedCatagory={planningSelectedCategory}
                  userInfo={user}
                  installationItems={installationItems}
                />
              </ProjectDetailWrapper>
            )}

            {selectedTab === "Packing List" && (
              <ProjectDetailWrapper>
                <ProjectCatagorySidebar
                  selectedCatagory={selectedCatagory}
                  onClick={(value) => {
                    setSelectedCatagory(value);
                    setEngineeringSelectedCategory(value);
                    setPlanningSelectedCategory(value);
                  }}
                />

                <ProjectProcurement
                  selectedCatagory={selectedCatagory}
                  accessInfo={accessibilityInfo?.packing_list_tab}
                  installationItems={installationItems}
                />
              </ProjectDetailWrapper>
            )}

            {selectedTab === "Procurement" &&
              projectDetails?.planning_section_approval === "Approved" && (
                <ProjectDetailWrapper>
                  <ProjectCatagorySidebar
                    selectedCatagory={selectedCatagory}
                    onClick={(value) => {
                      setSelectedCatagory(value);
                      setEngineeringSelectedCategory(value);
                      setPlanningSelectedCategory(value);
                    }}
                  />

                  <ProjectPurchaseOrder
                    selectedCatagory={selectedCatagory}
                    accessInfo={accessibilityInfo?.procurement_tab}
                    installationItems={installationItems}
                  />
                </ProjectDetailWrapper>
              )}

            {selectedTab === "Procurement" &&
              projectDetails?.planning_section_approval !== "Approved" && (
                <div className="w-full flex justify-center mt-16">
                  The BBU price for this project has not been approved yet.
                </div>
              )}

            {selectedTab === "Engineering" && (
              <ProjectDetailWrapper>
                <ProjectCatagorySidebar
                  selectedTab={"Engineering"}
                  selectedCatagory={engineeringSelectedCategory}
                  showMDL={accessibilityInfo?.engineering_tab?.mdl_page_view}
                  hasContingencyItems={
                    (projectDetails?.bom_item_contingency_list?.length > 0 ||
                      installationItems.some((item) => item.is_contigency) ||
                      contigencyBomList?.length > 0) &&
                    accessibilityInfo?.engineering_tab?.contingency_page_view
                  }
                  onClick={(value) => {
                    setEngineeringSelectedCategory(value);
                    if (value !== "MDL" && value !== "Contingency") {
                      setSelectedCatagory(value);
                    }
                    if (value != "MDL") {
                      setPlanningSelectedCategory(value);
                    }
                  }}
                />

                <ProjectEngineering
                  selectedCatagory={engineeringSelectedCategory}
                  userInfo={user}
                  installationItems={installationItems}
                  onSuccessfullSubmit={fetchInstallationItems}
                />
              </ProjectDetailWrapper>
            )}

            {selectedTab === "Schedule" && (
              <ProjectDetailWrapper className="flex-col gap-2.5">
                <ProjectSchedule />
              </ProjectDetailWrapper>
            )}

            {selectedTab === "Site Progress" && (
              <ProjectDetailWrapper className="flex-col gap-2.5">
                <ProjectSiteProgressReport />
              </ProjectDetailWrapper>
            )}

            {selectedTab === "Payment" && (
              <ProjectDetailWrapper className="flex-col gap-2.5">
                <ProjectPayment
                  projectBudget={{
                    budget_without_gst: projectDetails?.po_value_without_gst,
                    budget_with_gst: projectDetails?.po_value_with_gst,
                    po_total_with_gst:
                      projectDetails?.additional_po_total_with_gst,
                    po_total_without_gst:
                      projectDetails?.additional_po_total_without_gst,
                  }}
                />
              </ProjectDetailWrapper>
            )}

            {selectedTab === "Project Completion" && (
              <ProjectDetailWrapper className="flex-col gap-2.5">
                <ProjectCompletion />
              </ProjectDetailWrapper>
            )}

            <AddManufaturer modalId={"add-manufacturer"} />
            <AddVendor modalId={"add-vendor"} />
          </div>
        </div>
      </div>
    </div>
  );
};

function Tab({ icon, name, value, onClick }) {
  return (
    <button
      onClick={() => onClick(name)}
      className="flex items-center whitespace-nowrap gap-2.5 px-4 py-2 rounded-lg bg-zinc-600/10 text-zinc-600 text-base font-medium tracking-tight cursor-pointer disabled:cursor-default disabled:bg-orange-500/10 disabled:text-primary"
      disabled={value === name}
    >
      {icon} <p>{name}</p>
    </button>
  );
}

export default ProjectDetailsPage;
