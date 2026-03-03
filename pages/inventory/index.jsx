import { useState, useEffect } from "react";
import Loading from "@/components/Loading";
import Button from "@/components/shared/Button";
import { useRouter } from "next/router";
import Table from "@/components/Table";
import Search from "@/components/shared/SearchComponent";
import { FaFilter } from "react-icons/fa";
import { useModal } from "@/contexts/modal";
import { useManufacturers } from "@/contexts/manufacturers";
import { requestHandler } from "@/services/ApiHandler";
import { toast } from "sonner";
import { getProducts } from "@/services/api";
import { useProduct } from "@/contexts/product";
import dynamic from "next/dynamic";
import { dateFormatInYYYYMMDD } from "@/utils/formatter";
import { LocalStorageService } from "@/services/LocalStorageHandler";
import { axiosInstance } from "@/services/ApiHandler";
import { LuDownload } from "react-icons/lu";
import CustomPagination from "@/components/shared/Pagination";
import { TABLE_SIZE } from "@/utils/constants";

const InventoryDetails = dynamic(
  () => import("@/components/modals/InventoryDetailsModal")
);
const Filter = dynamic(() => import("@/components/modals/Filter"));

const Inventory = () => {
  const router = useRouter();
  const { productTypes } = useProduct();
  const { openModal, closeModal } = useModal();
  const { manufacturers } = useManufacturers();
  const [inventory, setInventory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedRow, setSelectedRow] = useState(null);
  const [totalRowCount, setTotalRowCount] = useState(0);
  const [sortConfig, setSortConfig] = useState({
    key: "",
    direction: "",
  });

  // Simplified state management - single source of truth for filters
  const [filters, setFilters] = useState({
    page: 1,
    limit: TABLE_SIZE,
    manufacturer: [],
    type: [],
    sections: [],
    start_date: null,
    end_date: null,
    search: "",
  });

  const accessibilityInfo =
    LocalStorageService.get("user_accessibility")?.accessibility[0].inventory ??
    {};

  const sectionList = [
    { name: "Electrical" },
    { name: "Mechanical" },
    { name: "Panel" },
    { name: "Inverter" },
    { name: "Installation" },
  ];

  const tableHeader = [
    {
      name: "Product Code",
      sortable: true,
      key: "product_code",
      width: "10rem",
    },
    {
      name: "Product Type",
      sortable: true,
      key: "type_name",
      width: "10rem",
    },
    { name: "Name", sortable: true, width: "15rem", key: "name" },
    { name: "Description", sortable: true, width: "20rem", key: "description" },
    {
      name: "Manufacturer",
      sortable: true,
      width: "15rem",
      key: "manufacturer_name",
    },
    { name: "Section", sortable: true, width: "8rem", key: "sections" },
    {
      name: "Quantity",
      sortable: true,
      key: "inventory_quantity",
      key2: "inventory_unit",
      width: "8rem",
    },
    {
      name: "Left Quantity After Packing List",
      sortable: true,
      key: "left_inventory_after_booking_quantity",
      key2: "left_inventory_after_booking_unit",
      width: "18rem",
    },
  ];

  const filterList = [
    {
      name: "Manufacturers",
      type: "dropdown",
      dropdownType: "multi-select",
      options: manufacturers,
      optionName: "name",
      optionId: "id",
      key: "manufacturer",
    },
    {
      name: "Product Type",
      type: "dropdown",
      dropdownType: "multi-select",
      options: productTypes,
      optionName: "name",
      key: "type",
    },
    {
      name: "Sections",
      type: "dropdown",
      dropdownType: "multi-select",
      options: sectionList,
      optionName: "name",
      key: "sections",
    },
    {
      name: "Date Range",
      type: "date",
      key: "start_date",
      key2: "end_date",
    },
  ];

  // Load saved filters on component mount
  useEffect(() => {
    const savedFilters = LocalStorageService.get("inventory_filters");

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
      fetchInventory(savedFilters);
    } else {
      // Fetch with default filters
      fetchInventory({ limit: TABLE_SIZE, page: 1 });
    }
  }, []);

  // Convert filters to API compatible format
  const prepareFilterParams = (currentFilters) => {
    // Deep copy to avoid mutation
    const processedFilters = { ...currentFilters };

    // Handle date formatting
    if (processedFilters.start_date) {
      processedFilters.start_date = dateFormatInYYYYMMDD(
        new Date(processedFilters.start_date)
      );
    }

    if (processedFilters.end_date) {
      processedFilters.end_date = dateFormatInYYYYMMDD(
        new Date(processedFilters.end_date)
      );
    }

    // Process array filters (convert objects to IDs/names)
    Object.entries(processedFilters).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) {
        if (key === "product_code") {
          processedFilters[key] = value.map((item) => item.product_code);
        } else if (key !== "search") {
          processedFilters[key] = value.map((item) => item.id ?? item.name);
        }
      }
    });

    // Remove empty filters
    return Object.fromEntries(
      Object.entries(processedFilters).filter(([_, value]) => {
        if (Array.isArray(value)) {
          return value.length > 0;
        }
        return value !== null && value !== "";
      })
    );
  };

  // Main function to fetch inventory data
  const fetchInventory = async (filterParams = {}) => {
    const queryParams = prepareFilterParams(filterParams);

    await requestHandler(
      async () => await getProducts(queryParams),
      setIsLoading,
      (data) => {
        setInventory(data.data.output);
        setTotalRowCount(data.data.length);
      },
      toast.error
    );

    // Save filters to local storage (excluding pagination)
    const filtersToSave = { ...filterParams };
    LocalStorageService.set("inventory_filters", { ...filtersToSave, page: 1 });
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
    fetchInventory(filtersWithPage);
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
    fetchInventory(updatedFilters);
  };

  // Handle page changes
  const handlePageChange = (page) => {
    const updatedFilters = { ...filters, page };
    setFilters(updatedFilters);
    fetchInventory(updatedFilters);
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
    fetchInventory(updatedFilters);
  };

  // Handle export functionality
  const handleInventoryExport = async () => {
    try {
      const queryParams = prepareFilterParams(filters);

      const response = await axiosInstance.post(
        `/api/project/inventory-export/`,
        queryParams,
        { responseType: "blob" }
      );

      if (response.status === 200) {
        // Create a Blob object from the response data
        const blob = new Blob([response.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        // Create a URL for the Blob object
        const url = URL.createObjectURL(blob);

        // Create a temporary anchor element
        const link = document.createElement("a");
        link.href = url;
        link.download = `Inventory.xlsx`;
        document.body.appendChild(link);
        link.click();

        // Clean up
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        toast.error("Failed to export inventory data");
      }
    } catch (error) {
      toast.error("Export failed");
    }
  };

  // Clear all filters and reset to defaults
  const clearFilters = () => {
    LocalStorageService.remove("inventory_filters");
    setSearch("");
    setFilters({
      page: 1,
      limit: TABLE_SIZE,
      manufacturer: [],
      type: [],
      sections: [],
      start_date: null,
      end_date: null,
      search: "",
    });
    setSortConfig({
      key: "",
      direction: "",
    });
    fetchInventory({ limit: TABLE_SIZE, page: 1 });
  };

  // Compute if any filters are applied (for UI indicators)
  const hasAppliedFilters = () => {
    const { page, limit, ...actualFilters } = filters;

    return Object.entries(actualFilters).some(([key, value]) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value !== null && value !== "";
    });
  };

  // Count active filters for UI display
  const getActiveFilterCount = () => {
    let count = 0;
    const { page, limit, start_date, end_date, search, ...otherFilters } =
      filters;

    // Count regular filters
    Object.values(otherFilters).forEach((value) => {
      if (Array.isArray(value) && value.length > 0) count++;
    });

    // Count date range as one filter if either date is set
    if (start_date || end_date) count++;
    return count;
  };

  return (
    <>
      <div className="flex justify-between items-center gap-4">
        <h2 className="text-orange-500 text-xl font-bold tracking-tight">
          Inventories
        </h2>
        <div className="flex items-center gap-2">
          {(hasAppliedFilters() || search) && (
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
          {accessibilityInfo?.ledger_view && (
            <Button
              className="px-3"
              onClick={() => router.push("inventory/ledger/")}
            >
              View Ledger
            </Button>
          )}

          {accessibilityInfo?.stock_in && (
            <Button
              className="px-3"
              onClick={() => router.push("inventory/stock-in/")}
            >
              Stock In
            </Button>
          )}

          {accessibilityInfo?.excel_export && (
            <Button className="px-3" onClick={handleInventoryExport}>
              <LuDownload size={14} />
              Export
            </Button>
          )}
        </div>
      </div>
      {!isLoading && (
        <div className="min-h-[85vh] overflow-hidden bg-white p-5">
          <div className="overflow-auto h-[95%] mb-2">
            <Table
              columns={tableHeader}
              rows={inventory}
              prevPageRows={(filters.page - 1) * filters.limit}
              sortConfig={sortConfig}
              onColumnSort={handleTableSort}
              onRowClick={(row) => {
                setSelectedRow(row);
                openModal("show-inventory-details");
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
      {selectedRow && <InventoryDetails selectedItem={selectedRow} />}
    </>
  );
};

export default Inventory;
