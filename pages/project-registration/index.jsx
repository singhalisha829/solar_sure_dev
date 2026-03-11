import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Button from "@/components/shared/Button";
import Loading from "@/components/Loading";
import { getProjectRegistrationList } from "@/services/api";
import { requestHandler } from "@/services/ApiHandler";
import { toast } from "sonner";
import { LocalStorageService } from "@/services/LocalStorageHandler";
import { useModal } from "@/contexts/modal";
import { FiPlusCircle } from "react-icons/fi";
import { FaFilter } from "react-icons/fa";
import { useSalesPerson } from "@/contexts/salesperson";
import Search from "@/components/shared/SearchComponent";
import Table from "@/components/Table";
import { dateFormatInYYYYMMDD } from "@/utils/formatter";
import dynamic from "next/dynamic";
import CustomPagination from "@/components/shared/Pagination";
import { TABLE_SIZE } from "@/utils/constants";

const Filter = dynamic(() => import("@/components/modals/Filter"));

const ProjectRegistration = () => {
  const router = useRouter();
  const { openModal, closeModal } = useModal();
  const { salesPersons } = useSalesPerson();

  const [isLoading, setIsLoading] = useState(true);
  const [projectRegistrationList, setProjectRegistrationList] = useState([]);
  const [totalRowCount, setTotalRowCount] = useState(0);
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "",
    direction: "",
  });

  // Single source of truth for all filters
  const [filters, setFilters] = useState({
    page: 1,
    limit: TABLE_SIZE,
    sales_lead: "",
    project_type: "",
    start_date: "",
    end_date: "",
    status: "",
    search: "",
  });

  const userAccessibility =
    LocalStorageService.get("user_accessibility")?.accessibility[0];

  const projectRegistrationAccess = userAccessibility?.project_registration;

  // Load saved filters on component mount
  useEffect(() => {
    const savedFilters = LocalStorageService.get(
      "project_registration_filters"
    );

    if (savedFilters) {
      // Update search state if it exists in saved filters
      if (savedFilters.search) {
        setSearch(savedFilters.search);
      }

      // Update filters state with saved filters
      setFilters((prev) => ({
        ...prev,
        ...savedFilters,
        page: 1,
        limit: TABLE_SIZE,
      }));

      // Fetch data with saved filters
      fetchProjectRegistrations(savedFilters);
    } else {
      // Fetch with default filters
      fetchProjectRegistrations({ page: 1, limit: TABLE_SIZE });
    }
  }, []);

  const projectTypes = [
    { name: "Inroof" },
    { name: "Skin Roof" },
    { name: "Conventional" },
    { name: "Ground mounted" },
    { name: "⁠Tracker(GM-SG)" },
    { name: "BESS" },
  ];

  const filterList = [
    {
      name: "Status",
      type: "dropdown",
      // options: [{ name: "Incomplete" }, { name: "Completed" }],
      options: [{ name: "Incomplete" }, { name: "Completed" }, { name: "Approved" }, { name: "Draft" }, { name: "Send for approval" }, { name: "Rejected" }, { name: "Hold" }],
      optionName: "name",
      key: "status",
    },
    { name: "Date Range", type: "date", key: "start_date", key2: "end_date" },
    {
      name: "Sales Lead",
      type: "dropdown",
      options: salesPersons,
      optionName: "name",
      optionId: "id",
      key: "sales_lead",
    },
    {
      name: "Project Type",
      options: projectTypes,
      type: "dropdown",
      optionName: "name",
      key: "project_type",
    },
  ];

  const tableHeader = [
    {
      name: "Registration Number",
      key: "registration_no",
      sortable: true,
      width: "190px",
    },
    {
      name: "Date",
      sortable: true,
      key: "date",
      type: "date",
      width: "100px",
    },
    {
      name: "Project Type",
      sortable: true,
      key: "type_of_project",
      width: "140px",
    },
    { name: "Company", sortable: true, key: "company_name", width: "180px" },
    {
      name: "Project Site",
      sortable: true,
      key: "project_site_name",
      width: "180px",
    },
    {
      name: "Project Value",
      sortable: true,
      displayType: "price",
      key: "po_value_without_gst",
      width: "140px",
    },
    {
      name: "Project Capacity (KW)",
      sortable: true,
      key: "po_capacity_in_kw",
      displayType: "price",
      width: "190px",
    },
    {
      name: "Registration Status",
      sortable: true,
      key: "status",
      width: "140px",
    },
    {
      name: "Approval Status",
      sortable: true,
      type: "project_registration_status",
      key: "last_approver_status",
      width: "170px",
    },
    {
      name: "Created by",
      sortable: true,
      key: "created_by",
      width: "160px",
    },
    {
      name: "Sales Lead",
      sortable: true,
      key: "sales_lead",
      width: "160px",
    },
    {
      name: "Created At",
      sortable: true,
      type: "date",
      key: "created_at",
      width: "130px",
    },
    {
      name: "Remarks",
      key: "last_approver_comment",
      type: "remark",
      width: "230px",
    },
  ];

  // Prepare filters for API
  const prepareFilterParams = (currentFilters) => {
    // Create a clean copy to avoid modifying the original filters
    const queryParams = { ...currentFilters };

    // Format dates if they exist
    if (queryParams.start_date) {
      queryParams.start_date = dateFormatInYYYYMMDD(
        new Date(queryParams.start_date)
      );
    }
    if (queryParams.end_date) {
      queryParams.end_date = dateFormatInYYYYMMDD(
        new Date(queryParams.end_date)
      );
    }

    // Return only non-empty filters
    return Object.fromEntries(
      Object.entries(queryParams).filter(
        ([_, value]) => value !== null && value !== ""
      )
    );
  };

  // Main function to fetch project registration data
  const fetchProjectRegistrations = async (filterParams = {}) => {
    setIsLoading(true);
    const queryParams = prepareFilterParams(filterParams);

    await requestHandler(
      async () => await getProjectRegistrationList(queryParams),
      null,
      (data) => {
        setProjectRegistrationList(data.data.output);
        setTotalRowCount(data.data.length);
        setIsLoading(false);
      },
      (error) => {
        toast.error(error);
        setIsLoading(false);
      }
    );

    // Save filters to local storage, excluding pagination
    const filtersToSave = { ...filterParams };
    delete filtersToSave.page;
    LocalStorageService.set("project_registration_filters", filtersToSave);
  };

  // Handler for updating filters
  const updateFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  // Handler for applying filters
  const applyFilters = () => {
    // Apply current filters including search
    const currentFilters = {
      ...filters,
      search: search || "",
    };

    // Reset to page 1 when applying new filters
    const filtersWithPage = { ...currentFilters, page: 1 };
    setFilters(filtersWithPage);

    // Fetch with new filters
    fetchProjectRegistrations(filtersWithPage);
    closeModal("apply-filter");
  };

  // Handle search changes
  const handleSearch = (searchTerm) => {
    setSearch(searchTerm);

    const updatedFilters = {
      ...filters,
      search: searchTerm,
      page: 1,
    };

    setFilters(updatedFilters);
    fetchProjectRegistrations(updatedFilters);
  };

  // Handle page changes
  const handlePageChange = (page) => {
    const updatedFilters = { ...filters, page };
    setFilters(updatedFilters);
    fetchProjectRegistrations(updatedFilters);
  };

  // Handle table sorting
  const handleTableSort = (column, direction) => {
    setSortConfig({ key: column, direction });

    const updatedFilters = {
      ...filters,
      page: 1,
      ...(direction !== "none" && {
        sort_by: direction === "ascending" ? column : `-${column}`,
      }),
    };

    setFilters(updatedFilters);
    fetchProjectRegistrations(updatedFilters);
  };

  // Navigate to row details
  const onRowClick = (row) => {
    if (row.status === "Completed") {
      router.push(`/project-registration/preview-project?id=${row.id}`);
    } else {
      router.push(
        "project-registration/generate-project/",
        `project-registration/generate-project/?id=${row.id}`,
        { shallow: false }
      );
    }
  };

  // Clear all filters and reset to defaults
  const clearFilters = () => {
    LocalStorageService.remove("project_registration_filters");
    setSearch("");
    setFilters({
      page: 1,
      limit: TABLE_SIZE,
      sales_lead: "",
      project_type: "",
      start_date: "",
      end_date: "",
      status: "",
      search: "",
    });
    setSortConfig({
      key: "",
      direction: "",
    });
    fetchProjectRegistrations({ page: 1, limit: TABLE_SIZE });
  };

  // Compute if any filters are applied (for UI indicators)
  const hasAppliedFilters = () => {
    const { page, limit, ...actualFilters } = filters;

    return Object.entries(actualFilters).some(
      ([_, value]) => value !== null && value !== ""
    );
  };

  // Count active filters for UI display
  const getActiveFilterCount = () => {
    let count = 0;
    const { page, limit, search, start_date, end_date, ...otherFilters } =
      filters;

    // Count normal filters
    Object.values(otherFilters).forEach((value) => {
      if (value !== null && value !== "") count++;
    });

    // Count date range as one filter if either start or end date is set
    if (start_date || end_date) count++;

    return count;
  };

  return (
    <>
      <div className="flex justify-between items-center gap-4">
        <h2 className="text-primary text-xl font-bold tracking-tight">
          Project Registration
        </h2>
        <div className="flex items-center gap-4">
          {hasAppliedFilters() && (
            <Button onClick={clearFilters} className={"px-2"}>
              Clear Filters
            </Button>
          )}

          <Search
            searchText={handleSearch}
            searchPlaceholder="Search.."
            value={search}
          />

          <Filter
            setFilters={updateFilters}
            filterData={filters}
            filterList={filterList}
            onSubmit={applyFilters}
          />

          <button
            onClick={() => openModal("apply-filter")}
            className={`flex items-center px-4 py-2 bg-neutral-400/10 text-neutral-400 rounded
              ${hasAppliedFilters().length > 0 ? "text-primary" : ""}`}
          >
            <FaFilter />
            {hasAppliedFilters().length > 0 && `(${getActiveFilterCount()})`}
          </button>

          {projectRegistrationAccess?.add_view && (
            <Button
              className="px-3 w-[8rem]"
              onClick={() => {
                router.push(
                  "project-registration/generate-project/",
                  "project-registration/generate-project/",
                  { shallow: true }
                );
                LocalStorageService.set("project-registration-id", null);
              }}
            >
              <FiPlusCircle size={15} />
              Create New
            </Button>
          )}
        </div>
      </div>

      {!isLoading && (
        <div className="min-h-[85vh] overflow-hidden bg-white p-5">
          <div className="overflow-auto h-[95%] mb-2">
            <Table
              columns={tableHeader}
              rows={projectRegistrationList}
              onRowClick={onRowClick}
              isFirstColumnFreeze={true}
              prevPageRows={(filters.page - 1) * filters.limit}
              sortConfig={sortConfig}
              onColumnSort={handleTableSort}
            />
          </div>
          <div className="relative">
            <CustomPagination
              currentPage={filters.page}
              totalRows={totalRowCount}
              rowsPerPage={filters.limit}
              onPageChange={handlePageChange}
            />
            <span className="absolute right-0 top-1">
              <strong>Total Count: </strong>
              {totalRowCount}
            </span>
          </div>
        </div>
      )}
      {isLoading && <Loading />}
    </>
  );
};

export default ProjectRegistration;
