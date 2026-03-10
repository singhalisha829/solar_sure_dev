import { useModal } from "@/contexts/modal";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Button from "@/components/shared/Button";
import EditableTable from "@/components/project-components/EditableTable";
import Loading from "@/components/Loading";
import dynamic from "next/dynamic";
import { LocalStorageService } from "@/services/LocalStorageHandler";
import { requestHandler } from "@/services/ApiHandler";
import { getManufacturers } from "@/services/api";
import { toast } from "sonner";
import CustomPagination from "@/components/shared/Pagination";
import { usePagination } from "@/hooks/usePagination";

const AddEditManufacturer = dynamic(
  () => import("@/components/modals/AddEditManufaturer")
);

const Manufacturers = () => {
  const { openModal } = useModal();
  const router = useRouter();
  const { pagination, resetToPageOne, handlePageChange } = usePagination({
    defaultPage: 1,
    defaultLimit: 25
  });
  const [manufacturers, setManufacturers] = useState([]);
  const [manufacturersCount, setManufacturersCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const accessibilityInfo =
    LocalStorageService.get("user_accessibility").accessibility[0].master.pages
      .manufacturers ?? {};

  const tableHeader = [
    {
      name: "Name",
      sortable: true,
      key: "name",
      width: "[100%]",
    },
  ];

  useEffect(() => {
    getManufacturersHandler();
  }, [pagination.page, pagination.limit]);

  const getManufacturersHandler = async () => {
    await requestHandler(
      async () => await getManufacturers({
        page: pagination.page,
        limit: pagination.limit,
      }),
      setIsLoading,
      (data) => {
        setManufacturers(data.data.output);
        setManufacturersCount(data.data.length);
      },
      toast.error
    );
  };

  return (
    <>
      <div className="flex justify-between items-center gap-4">
        <h2 className="text-primary text-xl font-bold tracking-tight">
          Manufacturers
        </h2>

        {accessibilityInfo?.add_view && (
          <Button
            className="px-3"
            onClick={() => openModal("add-manufacturer")}
          >
            Add Manufacturer
          </Button>
        )}
      </div>
      {!isLoading && (
        <div className="min-h-[85vh] overflow-hidden bg-white p-5">
          <div className="overflow-auto h-[94%] mb-2">
            <EditableTable
              columns={tableHeader}
              rows={manufacturers}
              isEditMode={accessibilityInfo?.edit_view}
              isModalOpenOnEdit={"edit-manufacturer"}
              onEditSuccess={getManufacturersHandler}
            />
          </div>
          <div className="relative">
            <CustomPagination
              currentPage={pagination.page}
              totalRows={manufacturersCount}
              rowsPerPage={pagination.limit}
              onPageChange={handlePageChange}
            />
            <span className="absolute right-0 top-1">
              <strong>Total Count: </strong>
              {manufacturersCount}
            </span>
          </div>
        </div>
      )}
      {isLoading && <Loading />}
      <AddEditManufacturer modalId={"add-manufacturer"} onSuccess={getManufacturersHandler} />
    </>
  );
};

export default Manufacturers;
