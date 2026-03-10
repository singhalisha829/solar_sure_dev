import Loading from "@/components/Loading";
import Table from "@/components/SortableTable";
import Button from "@/components/shared/Button";
import { useModal } from "@/contexts/modal";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { FaFilter } from "react-icons/fa";
import { useSalesPerson } from "@/contexts/salesperson";
import { useCompany } from "@/contexts/companies";
import Search from "@/components/shared/SearchComponent";
import { getEpcs, getProjects } from "@/services/api";
import { requestHandler } from "@/services/ApiHandler";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { LocalStorageService } from "@/services/LocalStorageHandler";
import { dateFormatInYYYYMMDD } from "@/utils/formatter";
import CustomPagination from "@/components/shared/Pagination";
import { usePagination } from "@/hooks/usePagination";

const Filter = dynamic(() => import("@/components/modals/Filter"));

const ProjectsPage = () => {
  const router = useRouter();
  const { openModal, closeModal } = useModal();
  const { salesPersons } = useSalesPerson();
  const { companies } = useCompany();
  const { pagination, resetToPageOne, handlePageChange } = usePagination({
    defaultPage: 1,
    defaultLimit: 25
  });
  const [appliedFilters, setAppliedFilters] = useState({});
  const [search, setSearch] = useState("");
  const [epcs, setEpcs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [totProjectsCount, setTotProjectsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    company: null,
    project_head: null,
    status: null,
    stage: null,
    project_size: null,
    start_date: null,
    end_date: null,
    company_type: null,
  });
  // console.log(projects);

  const accessibilityInfo =
    LocalStorageService.get("user_accessibility")?.accessibility[0].projects ??
    {};

  const projectSizeList = [
    { name: "1 - 100 KW", value: "1-100" },
    { name: "100 - 500 KW", value: "100-500" },
    { name: "500 KW - 1 MW", value: "500-1000" },
    { name: "1 MW - More", value: "1000-" },
  ];

  const stageList = [
    { name: "Created" },
    { name: "Engineering" },
    { name: "Planning" },
    { name: "Procurement" },
    { name: "Packing List" },
    { name: "Closed" },
  ];

  const statusList = [{ name: "Active" }, { name: "Hold" }, { name: "Closed" }];

  const filterList = [
    {
      name: "Status",
      type: "dropdown",
      options: statusList,
      optionName: "name",
      key: "status",
    },
    {
      name: "Stage",
      type: "dropdown",
      options: stageList,
      optionName: "name",
      key: "stage",
    },
    {
      name: "Company",
      type: "dropdown",
      options: companies,
      optionName: "name",
      optionId: "id",
      key: "company",
    },
    {
      name: "Sales Lead",
      options: salesPersons,
      type: "dropdown",
      optionName: "name",
      optionId: "id",
      key: "project_head",
    },
    {
      name: "Project Size",
      options: projectSizeList,
      type: "dropdown",
      optionName: "name",
      optionId: "value",
      key: "project_size",
    },
    {
      name: "Installer",
      options: epcs,
      type: "dropdown",
      optionName: "name",
      optionId: "id",
      key: "installer",
    },
    {
      name: "Project Types",
      options: [
        { name: "Inroof" },
        { name: "Skin Roof" },
        { name: "Conventional" },
        { name: "Ground mounted-Ornate" },
        { name: "⁠Tracker(GM-SG)" },
        { name: "BESS" },
      ],
      type: "dropdown",
      optionName: "name",
      key: "project_type",
    },
    {
      name: "Date Range",
      type: "date",
      key: "start_date",
      key2: "end_date",
    },
  ];

  const ProjectsHeader = [
    {
      name: "Project Name",
      key: "name",
      width: "10rem",
      sortable: true,
    },
    {
      name: "Ref Number",
      key: "refrence_number",
      width: "10rem",
      sortable: true,
    },
    {
      name: "Project Site",
      key: "project_site_name",
      width: "15rem",
      sortable: true,
    },
    {
      name: "Date",
      width: "10rem",
      type: "date",
      sortable: true,
      key: "start_date",
    },
    { name: "Company", key: "company_name", width: "12rem", sortable: true },
    {
      name: "Project Capacity(KW)",
      key: "project_capacity",
      displayType: "price",
      width: "14rem",
      sortable: true,
    },
    {
      name: "Budget (₹)",
      key: "budget",
      displayType: "price",
      width: "9rem",
      sortable: true,
    },
    {
      name: "Installer",
      key: "installer_name",
      width: "12rem",
      sortable: true,
    },
    {
      name: "Sales Lead",
      width: "10rem",
      sortable: true,
      // key: "project_head_name",
      key: "sales_lead",
    },
    {
      name: "Project Manager",
      width: "12rem",
      sortable: true,
      key: "project_manager_name",
    },
    {
      name: "Project Type",
      width: "10rem",
      sortable: true,
      key: "project_type",
    },
    {
      name: "DeadLine",
      width: "10rem",
      key: "deadline_date",
      type: "date",
      sortable: true,
    },
    { name: "Status", width: "10rem", sortable: true, key: "status" },
    { name: "Stage", width: "10rem", sortable: true, key: "stage" },
  ];

  useEffect(() => {
    const projectsFilter = LocalStorageService.get("project_filters");
    setFilters({ ...filters, ...projectsFilter });
    setSearch(projectsFilter?.search || "");
    delete projectsFilter?.search;
    setAppliedFilters({ ...projectsFilter });
    fetchEpcList();
    getProjectsHandler({
      page: pagination.page,
      limit: pagination.limit,
      ...projectsFilter
    });
  }, [pagination.page, pagination.limit]);

  const getProjectsHandler = async (queryParams = {}) => {
    if (Object.keys(queryParams).length > 0) {
      Object.keys(queryParams).map((paramKey) => {
        if (paramKey === "start_date" || paramKey === "end_date") {
          queryParams[paramKey] = dateFormatInYYYYMMDD(queryParams[paramKey]);
        }
      });
    }
    await requestHandler(
      async () => await getProjects(queryParams),
      setIsLoading,
      (data) => {
        setProjects(data.data.output);
        setTotProjectsCount(data.data.length);
      },
      toast.error
    );
  };

  const fetchEpcList = async () => {
    await requestHandler(
      async () => await getEpcs(),
      null,
      (data) => {
        setEpcs(data.data.output);
      },
      toast.error
    );
  };

  const onRowClick = (project) => {
    router.push(
      `/projects/${project.id}?tab=Dashboard&projectName=${project.name}`
    );
  };

  const handleFilters = (filterObjects) => {
    setFilters(filterObjects);
    const filteredObj = Object.fromEntries(
      Object.entries(filterObjects).filter(
        ([key, value]) => value !== null && value !== ""
      )
    );
    setAppliedFilters(filteredObj);
  };

  const filterProjects = async (filters) => {
    let projectSize = {};
    const filteredObj = Object.fromEntries(
      Object.entries(filters).filter(([key, value]) => {
        if (key === "project_size" && value !== null && value !== "") {
          projectSize.start_project_size = value.split("-")[0];
          if (value.split("-")[1])
            projectSize.end_project_size = value.split("-")[1];
          return null;
        }
        return value !== null && value !== "";
      })
    );
    LocalStorageService.set("project_filters", {
      ...filteredObj,
      ...projectSize,
    });

    // Reset to page 1 when applying filters
    const resetPagination = resetToPageOne();

    await getProjectsHandler({ ...resetPagination, ...filteredObj, ...projectSize });
    closeModal("apply-filter");
  };

  const handleClearFilter = async () => {
    LocalStorageService.remove("project_filters");

    // Reset to page 1 when clearing filters
    const resetPagination = resetToPageOne(false);

    await getProjectsHandler({ ...resetPagination });
    setAppliedFilters({});
    setSearch("");
    setFilters({
      company: null,
      project_head: null,
      status: null,
      project_size: null,
      stage: null,
      start_date: null,
      end_date: null,
      company_type: null,
    });
  };

  return (
    <>
      <div className="flex justify-between items-center gap-4">
        <h2 className="text-primary text-xl font-bold tracking-tight">
          Projects
        </h2>
        <div className="flex items-center gap-4">
          {(Object.keys(appliedFilters).length > 0 || search !== "") && (
            <Button onClick={handleClearFilter} className={"px-2"}>
              Clear Filters
            </Button>
          )}
          <Search
            searchText={(data) => {
              setSearch(data);
              filterProjects({ ...filters, search: data });
            }}
            searchPlaceholder="Search.."
            value={search}
          />

          <Filter
            setFilters={handleFilters}
            filterData={filters}
            filterList={filterList}
            onSubmit={() => filterProjects({ ...filters, search: search })}
          />
          <button
            onClick={() => openModal("apply-filter")}
            className={`flex items-center px-4 py-2 bg-neutral-400/10 text-neutral-400 rounded
              ${Object.keys(appliedFilters).length > 0 ? "text-primary" : ""}`}
          >
            <FaFilter />
            {Object.keys(appliedFilters).length > 0 &&
              `(${Object.keys(appliedFilters).includes("start_date") ? Object.keys(appliedFilters).length - 1 : Object.keys(appliedFilters).length})`}
          </button>
        </div>
      </div>
      {!isLoading && (
        <div className="min-h-[85vh] overflow-hidden bg-white p-5">
          <div className="overflow-auto h-[94%] mb-2">
            <Table
              columns={ProjectsHeader}
              rows={projects}
              onRowClick={
                accessibilityInfo?.page_view
                  ? (row) => onRowClick(row)
                  : undefined
              }
              hightlightClosedProjects={true}
              hightlightCancelledProject
              hightlightHoldProject
              hightlightActiveProject
              emptyTableMessage={"No Projects added yet."}
              prevPageRows={(pagination.page - 1) * pagination.limit}
              showSerialNumber={true}
            />
          </div>
          <div className="relative">
            <CustomPagination
              currentPage={pagination.page}
              totalRows={totProjectsCount}
              rowsPerPage={pagination.limit}
              onPageChange={handlePageChange}
            />
            <span className="absolute right-0 top-1">
              <strong>Total Count: </strong>
              {totProjectsCount}
            </span>
          </div>
        </div>
      )}
      {isLoading && <Loading />}
    </>
  );
};

export default ProjectsPage;
