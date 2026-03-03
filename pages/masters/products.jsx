import { useState, useEffect } from "react";
import { useProduct } from "@/contexts/product";
import { useModal } from "@/contexts/modal";
import Button from "@/components/shared/Button";
import Loading from "@/components/Loading";
import dynamic from "next/dynamic";
import { FaFilter } from "react-icons/fa";
import Search from "@/components/shared/SearchComponent";
import { useManufacturers } from "@/contexts/manufacturers";
import { getProducts } from "@/services/api";
import { requestHandler } from "@/services/ApiHandler";
import { toast } from "sonner";
import { LocalStorageService } from "@/services/LocalStorageHandler";
import CustomPagination from "@/components/shared/Pagination";
import { TABLE_SIZE } from "@/utils/constants";
import Table from "@/components/Table";

const AddProduct = dynamic(() => import("@/components/modals/AddEditProduct"));
const Filter = dynamic(() => import("@/components/modals/Filter"));
const MergeProducts = dynamic(
  () => import("@/components/modals/MergeProductModal")
);

const Products = () => {
  const { openModal, closeModal } = useModal();
  const { productTypes } = useProduct();
  const { manufacturers } = useManufacturers();
  const [appliedFilters, setAppliedFilters] = useState({});
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState([]);
  const [totalRowCount, setTotalRowCount] = useState(0);
  const [selectedRow, setSelectedRow] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "",
    direction: "",
  });
  const [filters, setFilters] = useState({
    page: 1,
    limit: TABLE_SIZE,
    manufacturer: "",
    sections: "",
    type: "",
  });

  const accessibilityInfo =
    LocalStorageService.get("user_accessibility").accessibility[0].master.pages
      .products ?? {};

  const sectionList = [
    { name: "Inverter" },
    { name: "Panel" },
    { name: "Electrical" },
    { name: "Mechanical" },
    { name: "Inroof" },
    { name: "Other Structure" },
    { name: "other" },
  ];

  const tableHeader = [
    {
      name: "Product Code",
      width: "15rem",
      sortable: true,
      key: "product_code",
    },
    { name: "Product Type", width: "10rem", sortable: true, key: "type_name" },
    {
      name: "Name",
      sortable: true,
      key: "name",
      width: "15rem",
    },
    {
      name: "Description",
      sortable: true,
      key: "description",
      width: "20rem",
    },
    {
      name: "Section",
      sortable: true,
      key: "sections",
    },
    {
      name: "Datasheet/Drawing",
      type: "file",
      key: "data_sheet",
    },
    // Conditionally add the "Actions" column
    ...(accessibilityInfo?.edit_view
      ? [
        {
          name: "Actions",
          type: "actions-column",
          actionType: "edit",
          onClickEdit: (row) => {
            setSelectedRow(row);
            openModal("edit-product");
          },
        },
      ]
      : []),
  ];

  const filterList = [
    {
      name: "Manufacturer",
      options: manufacturers,
      type: "dropdown",
      optionName: "name",
      optionId: "id",
      key: "manufacturer",
    },
    {
      name: "Section",
      options: sectionList,
      type: "dropdown",
      optionName: "name",
      key: "sections",
    },
    {
      name: "Product Type",
      options: productTypes,
      type: "dropdown",
      optionName: "name",
      optionId: "id",
      key: "type",
    },
  ];

  useEffect(() => {
    fetchProductHandler({ limit: TABLE_SIZE, page: 1 });
  }, []);

  const fetchProductHandler = async (filteredObj = {}) => {
    let filters;
    if (filteredObj.search) {
      filters = { ...filteredObj, search: filteredObj.search };
    } else {
      filters = filteredObj;
    }
    await requestHandler(
      async () => await getProducts(filters),
      setIsLoading,
      (data) => {
        setProducts(data.data.output);
        setTotalRowCount(data.data.length);
      },
      toast.error
    );
  };

  const prepareFilterObjects = (pageFilters) => {
    const filteredObj = Object.fromEntries(
      Object.entries(pageFilters).filter(
        ([key, value]) => value !== null && value !== ""
      )
    );
    return filteredObj;
  };

  const handleFilters = (filterObjects) => {
    setFilters(filterObjects);
    const filteredObj = prepareFilterObjects(filterObjects);
    setAppliedFilters(filteredObj);
  };

  const filterProjects = async (filterData) => {
    const filteredObj = prepareFilterObjects(filterData);
    await fetchProductHandler({ ...filteredObj, page: 1 });
    setFilters({ ...filters, page: 1 });
    closeModal("apply-filter");
  };

  const handlePageChange = (page) => {
    const pageFilters = {
      ...appliedFilters,
      page: page,
      limit: filters.limit,
      ...(search !== "" && {
        search: search,
      }),
    };
    const filteredObj = prepareFilterObjects(pageFilters);
    fetchProductHandler({ ...filteredObj, page: page });
    setFilters({ ...filters, page: page });
  };

  const handleTableSort = (column, direction) => {
    const pageFilters = {
      ...appliedFilters,
      page: 1,
      limit: TABLE_SIZE,
      ...(direction !== "none" && {
        sort_by: direction === "ascending" ? column : `-${column}`,
      }),
      ...(search !== "" && {
        search: search,
      }),
    };
    const filteredObj = prepareFilterObjects(pageFilters);
    fetchProductHandler(filteredObj);
    setFilters({ ...filters, page: 1, limit: TABLE_SIZE });
    setSortConfig({ key: column, direction: direction });
  };

  const onClearFilter = () => {
    fetchProductHandler();
    setAppliedFilters({});
    setSearch("");
    setFilters({
      page: 1,
      limit: TABLE_SIZE,
      manufacturer: "",
      sections: "",
      type: "",
    });
    setSortConfig({
      key: "",
      direction: "",
    });
  };

  return (
    <>
      <div className="flex justify-between items-center gap-4">
        <h2 className="text-orange-500 text-xl font-bold tracking-tight">
          Products
        </h2>

        <div className="flex gap-2 items-center">
          <div className="flex items-center gap-4">
            {(Object.keys(appliedFilters).length > 0 || search !== "") && (
              <Button onClick={onClearFilter} className={"px-2"}>
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
              className={`px-4 flex items-center py-2 bg-neutral-400/10 text-neutral-400 rounded
                ${Object.keys(appliedFilters).length > 0 ? "text-primary" : ""}`}
            >
              <FaFilter />
              {Object.keys(appliedFilters).length > 0 &&
                `(${Object.keys(appliedFilters).length - 2})`}
            </button>
          </div>

          {accessibilityInfo?.add_view && (
            <Button className="px-3" onClick={() => openModal("add-product")}>
              Add Product
            </Button>
          )}

          <Button
            className="px-3"
            onClick={() => openModal("merge-products-modal")}
          >
            Merge Products
          </Button>
        </div>
      </div>
      {!isLoading && (
        <div className="min-h-[85vh] overflow-hidden bg-white p-5">
          <div className="overflow-auto h-[95%] mb-2">
            <Table
              columns={tableHeader}
              rows={products}
              sortConfig={sortConfig}
              onColumnSort={handleTableSort}
              prevPageRows={(filters.page - 1) * filters.limit}
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
      <AddProduct modalId={"add-product"} />
      {selectedRow && (
        <AddProduct modalId={"edit-product"} itemDetails={selectedRow} />
      )}
      <MergeProducts
        modalId={"merge-products-modal"}
        productList={products}
        onSuccessfullSubmit={fetchProductHandler}
      />
    </>
  );
};

export default Products;
