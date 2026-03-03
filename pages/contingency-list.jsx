import { useState, useEffect } from "react";
import { useModal } from "@/contexts/modal";
import Loading from "@/components/Loading";
import { LocalStorageService } from "@/services/LocalStorageHandler";
import Table from "@/components/Table";
import { requestHandler } from "@/services/ApiHandler";
import { toast } from "sonner";
import { getBOMContigency, deleteContingencyRemark } from "@/services/api";
import dynamic from "next/dynamic";
import Search from "@/components/shared/SearchComponent";
import { FaFilter } from "react-icons/fa";
import { useProject } from "@/contexts/project";
import Button from "@/components/shared/Button";
import { useRouter } from "next/router";
import { downloadContingencyDoc } from "@/services/contingencyService";
import CustomPagination from "@/components/shared/Pagination";
import { TABLE_SIZE } from "@/utils/constants";

const Filter = dynamic(() => import("@/components/modals/Filter"));
const ContingencyItemsModal = dynamic(
  () =>
    import(
      "@/components/modals/ProjectDetails/ProjectContingency/ContingencyDetailsModal"
    )
);
const DeleteWarningModal = dynamic(
  () => import("@/components/modals/WarningModal")
);

const ContingencyList = () => {
  const router = useRouter();
  const { openModal, closeModal } = useModal();
  const { projects } = useProject();
  const [contigencyBomList, setContingencyBomList] = useState([]);
  const [selectedContingency, setSelectedContingency] = useState("");
  const [modalTabs, setModalTabs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [totalRowCount, setTotalRowCount] = useState(0);
  const [sortConfig, setSortConfig] = useState({
    key: "",
    direction: "",
  });

  // Single source of truth for all filters
  const [filters, setFilters] = useState({
    page: 1,
    limit: TABLE_SIZE,
    status: "",
    project: "",
    search: "",
  });

  const accessibilityInfo =
    LocalStorageService.get("user_accessibility").accessibility[0]
      ?.contingency_list ?? {};

  const allowedActions =
    (accessibilityInfo?.edit_view ? "edit-" : "") +
    (accessibilityInfo?.delete_view ? "delete-" : "") +
    "download";

  // Load saved filters on component mount
  useEffect(() => {
    const savedFilters = LocalStorageService.get("contingency_list_filters");

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
      fetchContingencies(savedFilters);
    } else {
      // Fetch with default filters
      fetchContingencies({ page: 1, limit: TABLE_SIZE });
    }
  }, []);

  const statusList = [
    { name: "Approved" },
    { name: "Pending" },
    { name: "Partial Approved" },
    { name: "Reject" },
  ];

  const tableHeader = [
    { name: "Project", sortable: true, width: "10rem", key: "project_name" },
    {
      name: "Contingency No.",
      sortable: true,
      width: "12rem",
      key: "contingency_no",
    },
    {
      name: "No. of Items",
      sortable: true,
      width: "10rem",
      key: "item_list_qty",
    },
    {
      name: "Total Amount(₹)",
      sortable: true,
      width: "12rem",
      key: "total_amount",
      displayType: "price",
    },
    {
      name: "Contingency Remark",
      sortable: true,
      width: "20rem",
      key: "remark",
    },
    { name: "Status", sortable: true, width: "8rem", key: "status" },
    { name: "Created By", sortable: true, width: "8rem", key: "created_by" },
    {
      name: "Approval Doc",
      width: "8rem",
      key: "approval_doc",
      type: "file",
    },
    {
      name: "Approved By",
      sortable: true,
      key: "approved_by",
      width: "10rem",
    },
    ...(accessibilityInfo?.edit_view || accessibilityInfo?.delete_view
      ? [
        {
          name: "Actions",
          type: "contingency-actions-column",
          actionType: allowedActions,
          width: "5rem",
          onClickEdit: (row) => {
            router.push(
              `/projects/editProjectContingency/${row.project}?projectName=${row.project_name}&id=${row.id}`
            );
          },
          onClickDelete: (row) => {
            setSelectedContingency(row);
            openModal("delete-project-contignecy");
          },
          onClickDownload: (row) => downloadContingencyDoc(row),
        },
      ]
      : []),
  ];

  const filterList = [
    {
      name: "Project",
      options: projects,
      type: "dropdown",
      optionName: "name",
      optionId: "id",
      key: "project",
    },
    {
      name: "Status",
      options: statusList,
      type: "dropdown",
      optionName: "name",
      key: "status",
    },
  ];

  // Prepare filters for API
  const prepareFilterParams = (currentFilters) => {
    // Return only non-empty filters
    return Object.fromEntries(
      Object.entries(currentFilters).filter(
        ([_, value]) => value !== null && value !== ""
      )
    );
  };

  // Main function to fetch contingency data
  const fetchContingencies = async (filterParams = {}) => {
    const queryParams = prepareFilterParams(filterParams);

    await requestHandler(
      async () => await getBOMContigency(queryParams),
      setIsLoading,
      (data) => {
        setContingencyBomList(data.data.output);
        setTotalRowCount(data.data.length);
      },
      toast.error
    );

    // Save filters to local storage
    const filtersToSave = { ...filterParams };
    LocalStorageService.set("contingency_list_filters", filtersToSave);
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
    fetchContingencies(filtersWithPage);
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
    fetchContingencies(updatedFilters);
  };

  // Handle page changes
  const handlePageChange = (page) => {
    const updatedFilters = { ...filters, page };
    setFilters(updatedFilters);
    fetchContingencies(updatedFilters);
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
    fetchContingencies(updatedFilters);
  };

  // Clear all filters and reset to defaults
  const clearFilters = () => {
    LocalStorageService.remove("contingency_list_filters");
    setSearch("");
    setFilters({
      page: 1,
      limit: TABLE_SIZE,
      status: "",
      project: "",
      search: "",
    });
    setSortConfig({
      key: "",
      direction: "",
    });
    fetchContingencies({ page: 1, limit: TABLE_SIZE });
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
    const { page, limit, search, ...otherFilters } = filters;

    Object.values(otherFilters).forEach((value) => {
      if (value !== null && value !== "") count++;
    });

    return count;
  };

  const fetchParticularContigencyDetails = async (id) => {
    await requestHandler(
      async () => await getBOMContigency({ id: id }),
      null,
      (data) => {
        let item_list = [],
          other_item_list = [];
        data.data.output[0].item_list.map((item) => {
          if (
            ["Installation", "Freight", "Other"].includes(item.bom_head_name)
          ) {
            other_item_list.push(item);
          } else {
            item_list.push(item);
          }
        });

        const newModalTabs = [];
        if (item_list.length > 0) {
          newModalTabs.push("Items");
        }
        if (other_item_list.length > 0) {
          newModalTabs.push("Others");
        }

        setModalTabs(newModalTabs);
        setSelectedContingency({
          ...data.data.output[0],
          item_list: item_list,
          other_item_list: other_item_list,
        });
        openModal("display-contingency-items");
      },
      toast.error
    );
  };

  const deleteParticularContigencyDetails = async (id) => {
    await requestHandler(
      async () => await deleteContingencyRemark(id),
      null,
      (data) => {
        toast.success("Contingency Deleted Successfully!");
        closeModal("delete-project-contignecy");
        fetchContingencies(filters);
      },
      toast.error
    );
  };

  return (
    <>
      <div className="flex justify-between items-center gap-4">
        <h2 className="text-primary text-xl font-bold tracking-tight">
          Contingency List
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
            className={`px-4 flex items-center py-2 bg-neutral-400/10 text-neutral-400 rounded
                ${hasAppliedFilters().length > 0 ? "text-primary" : ""}`}
          >
            <FaFilter />
            {hasAppliedFilters().length > 0 && `(${getActiveFilterCount()})`}
          </button>
        </div>
      </div>
      {!isLoading && (
        <div className="min-h-[85vh] overflow-hidden bg-white p-5">
          <div className="overflow-auto h-[95%] mb-2">
            <Table
              columns={tableHeader}
              rows={contigencyBomList}
              sortConfig={sortConfig}
              onColumnSort={handleTableSort}
              prevPageRows={(filters.page - 1) * filters.limit}
              onRowClick={(row) => {
                if (accessibilityInfo?.details_view) {
                  fetchParticularContigencyDetails(row.id);
                }
              }}
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
      <DeleteWarningModal
        modalId={"delete-project-contignecy"}
        modalContent={
          <>
            Are you sure you want to delete Contingency -{" "}
            <strong>{selectedContingency?.contingency_no}</strong>? This action
            is irreversible.
          </>
        }
        onSubmit={() =>
          deleteParticularContigencyDetails(selectedContingency?.id)
        }
      />
      <ContingencyItemsModal
        modalId={"display-contingency-items"}
        width={"w-3/4"}
        modalTabs={modalTabs}
        onClose={() => setModalTabs([])}
        selectedContingency={selectedContingency}
      />
    </>
  );
};

export default ContingencyList;
