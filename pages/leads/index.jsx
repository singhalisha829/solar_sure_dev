import { useEffect, useState } from "react";
import Loading from "@/components/Loading";
import Table from "@/components/SortableTable";
import { getLeadList, getLeadActivities } from "@/services/api";
import { requestHandler } from "@/services/ApiHandler";
import { toast } from "sonner";
import CustomPagination from "@/components/shared/Pagination";
import { useModal } from "@/contexts/modal";
import dynamic from "next/dynamic";
import Search from "@/components/shared/SearchComponent";
import { FaFilter } from "react-icons/fa";
import { useSalesPerson } from "@/contexts/salesperson";
import Button from "@/components/shared/Button";
import { LocalStorageService } from "@/services/LocalStorageHandler";
import { useStateCity } from "@/contexts/state_city";
import { dateFormatInYYYYMMDD } from "@/utils/formatter";

const ActvityDetails = dynamic(
  () => import("@/components/modals/LeadActivityDetails")
);
const Filter = dynamic(() => import("@/components/modals/Filter"));

const InroofLeads = () => {
  const { openModal, closeModal } = useModal();
  const { salesPersons } = useSalesPerson();
  const { states } = useStateCity();
  const [leadList, setLeadList] = useState([]);
  const [user, setUser] = useState(null);
  const [leadActivities, setLeadActivities] = useState([]);
  const [totalRowCount, setTotalRowCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);
  const [appliedFilters, setAppliedFilters] = useState({});
  const [search, setSearch] = useState("");

  const [filters, setFilters] = useState({
    page: 1,
    limit: 25,
    is_endcustomer: false,
    status: [],
    project_size: [],
    state: [],
    owner: [],
    start_date: null,
    end_date: null,
  });

  const statusList = [
    { name: "Active" },
    { name: "Pending" },
    { name: "Closed" },
    { name: "Lost" },
  ];

  const productSizeList = [
    { name: "1-50 KW" },
    { name: "51-100 KW" },
    { name: "101-200 KW" },
    { name: "201-500 KW" },
    { name: "501-1000 KW" },
    { name: "1001-More KW" },
  ];

  const filterList = [
    {
      name: "Status",
      type: "dropdown",
      dropdownType: "multi-select",
      options: statusList,
      optionName: "name",
      key: "status",
    },
    {
      name: "State",
      type: "dropdown",
      dropdownType: "multi-select",
      options: states,
      optionName: "name",
      optionId: "id",
      key: "state",
    },
    {
      name: "Sales Person",
      options: salesPersons,
      dropdownType: "multi-select",
      type: "dropdown",
      optionName: "name",
      optionId: "id",
      key: "owner",
    },
    {
      name: "Project Size",
      options: productSizeList,
      dropdownType: "multi-select",
      type: "dropdown",
      optionName: "name",
      key: "project_size",
    },
    {
      name: "Date Range",
      type: "date",
      key: "start_date",
      key2: "end_date",
    },
  ];

  const tableHeader = [
    {
      name: "Company Name",
      sortable: true,
      key: "company_name",
      width: "15rem",
    },
    {
      name: "Company City",
      sortable: true,
      key: "company_city",
      width: "10rem",
    },
    {
      name: "Company State",
      sortable: true,
      key: "company_state",
      width: "10rem",
    },
    {
      name: "Client Name",
      sortable: true,
      key: "clients_name",
      width: "12rem",
    },
    {
      name: "Client Contact",
      sortable: true,
      key: "clients_phone",
      width: "12rem",
    },
    { name: "Source", sortable: true, key: "source", width: "10rem" },
    {
      name: "Next Followup Date",
      sortable: true,
      key: "next_followup_date",
      type: "date",
      width: "14rem",
    },
    {
      name: "Description",
      sortable: true,
      key: "requirement_description",
      width: "18rem",
    },
    {
      name: "Product Size",
      sortable: true,
      key: "expected_product_size",
      width: "10rem",
    },
    { name: "Owner", sortable: true, key: "lead_owner", width: "10rem" },

    { name: "Last Remark", sortable: true, key: "last_remark", width: "20rem" },
    { name: "Status", sortable: true, key: "lead_status" },
    {
      name: "Last Followup Date",
      sortable: true,
      key: "last_followup_date",
      type: "date",
      width: "14rem",
    },
    {
      name: "Last Followed By",
      sortable: true,
      key: "last_followup_by",
      width: "12rem",
    },
    {
      name: "Lead Created At",
      sortable: true,
      key: "lead_created_at",
      type: "date",
      width: "12rem",
    },
  ];

  useEffect(() => {
    const userInfo = LocalStorageService.get("user");
    setUser(userInfo);
    fetchLeadList({ page: 1, limit: 25, is_endcustomer: false });
  }, []);

  const fetchLeadList = async (queryParams) => {
    if (Object.keys(queryParams).length > 0) {
      // change date format before filtering
      Object.keys(queryParams).map((paramKey) => {
        if (paramKey === "start_date" || paramKey === "end_date") {
          queryParams[paramKey] = dateFormatInYYYYMMDD(queryParams[paramKey]);
        }
      });
    }
    await requestHandler(
      async () => await getLeadList(queryParams),
      null,
      (data) => {
        setLeadList(data.data.output);
        setTotalRowCount(data.data.total_records);
        setIsLoading(false);
      },
      toast.error
    );
  };

  const fetchLeadActivities = async (id) => {
    await requestHandler(
      async () => await getLeadActivities(id),
      null,
      (data) => {
        setLeadActivities(data.data.output);
        openModal("lead-activity");
      },
      toast.error
    );
  };

  const handleFilters = (filterObjects) => {
    setFilters(filterObjects);
    const filteredObj = Object.fromEntries(
      Object.entries(filterObjects).filter(([key, value]) => {
        if (["owner", "project_size", "state", "status"].includes(key)) {
          return Array.isArray(value) && value.length > 0;
        } else {
          return value !== null && value !== "";
        }
      })
    );
    setAppliedFilters(filteredObj);
  };

  const prepareFilterObjects = (pageFilters) => {
    // remove non selected filters
    const filteredObj = Object.fromEntries(
      Object.entries(pageFilters).filter(
        ([key, value]) =>
          value !== null &&
          value !== "" &&
          (Array.isArray(value) ? value.length !== 0 : true)
      )
    );
    // prepare list of ids for multiselect filters
    const queryParams = Object.fromEntries(
      Object.entries(filteredObj).map(([key, value]) => {
        if (Array.isArray(value)) {
          return [key, value.map((item) => item.id ?? item.name)];
        }
        return [key, value];
      })
    );
    return queryParams;
  };

  const filterProjects = async (pageFilters) => {
    const queryParams = prepareFilterObjects(pageFilters);

    await fetchLeadList({ ...queryParams, page: 1 });
    setFilters({ ...filters, page: 1 });
    closeModal("apply-filter");
  };

  const handleOpenFilter = () => {
    openModal("apply-filter");
  };

  const handlePageChange = (page) => {
    const queryParams = prepareFilterObjects({
      ...appliedFilters,
      page: page,
      limit: filters.limit,
    });
    fetchLeadList({ ...queryParams, page: page });
    setFilters({ ...filters, page: page });
  };

  const clearFilters = () => {
    setAppliedFilters({});
    setSearch("");
    setFilters({
      page: 1,
      limit: 25,
      is_endcustomer: false,
      status: [],
      project_size: [],
      state: [],
      owner: [],
      start_date: null,
      end_date: null,
    });
    fetchLeadList({ page: 1, limit: 25, is_endcustomer: false });
  };

  return (
    <>
      <div className="flex justify-between items-center gap-4">
        <h2 className="text-orange-500 text-xl font-bold tracking-tight">
          Inroof Leads
        </h2>
        <div className="flex items-center gap-4">
          {(Object.keys(appliedFilters).length > 0 || search !== "") && (
            <Button onClick={clearFilters} className={"px-2"}>
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
            onSubmit={() =>
              filterProjects({ ...appliedFilters, search: search })
            }
          />
          <button
            onClick={handleOpenFilter}
            className={`flex items-center px-4 py-2 bg-neutral-400/10 text-neutral-400 rounded
              ${Object.keys(appliedFilters).length > 0 ? "text-primary" : ""}`}
          >
            <FaFilter />
            {Object.keys(appliedFilters).length > 3 &&
              `(${Object.keys(appliedFilters).includes("start_date") ? Object.keys(appliedFilters).length - 4 : Object.keys(appliedFilters).length - 3})`}
          </button>
        </div>
      </div>
      {!isLoading && (
        <div className="min-h-[85vh] overflow-hidden bg-white p-5">
          <div className="overflow-auto h-[95%] mb-2">
            <Table
              columns={tableHeader}
              rows={leadList}
              onRowClick={(row) => {
                fetchLeadActivities(row.id);
                setSelectedLead(row);
              }}
              prevPageRows={(filters.page - 1) * filters.limit}
              showSerialNumber={true}
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
      {selectedLead && (
        <ActvityDetails
          modalId={"lead-activity"}
          data={leadActivities}
          leadDetails={{
            company_name: selectedLead.company_name,
            lead_id: selectedLead.id,
            status: selectedLead.lead_status,
          }}
          onSuccessfullSubmit={() => fetchLeadActivities(selectedLead.id)}
          userId={user.user_id}
        />
      )}
    </>
  );
};

export default InroofLeads;
