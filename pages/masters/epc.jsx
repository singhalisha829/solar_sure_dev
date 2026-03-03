import { useState, useEffect } from "react";
import { useModal } from "@/contexts/modal";
import Button from "@/components/shared/Button";
import EditableTable from "@/components/project-components/EditableTable";
import Loading from "@/components/Loading";
import dynamic from "next/dynamic";
import { getEpcs, addEpc, editEpc } from "@/services/api";
import { requestHandler } from "@/services/ApiHandler";
import { toast } from "sonner";
import { LocalStorageService } from "@/services/LocalStorageHandler";
import CustomPagination from "@/components/shared/Pagination";
import { usePagination } from "@/hooks/usePagination";

const AddEpc = dynamic(() => import("@/components/modals/AddVendor"));

const EPCs = () => {
  const { openModal, closeModal } = useModal();
  const { pagination, resetToPageOne, handlePageChange } = usePagination({
    defaultPage: 1,
    defaultLimit: 25
  });
  const [epcs, setEpcs] = useState([]);
  const [totalEpcsCount, setTotalEpcsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const accessibilityInfo =
    LocalStorageService.get("user_accessibility").accessibility[0].master.pages
      .epcs ?? {};

  const tableHeader = [
    {
      name: "Name",
      sortable: true,
      key: "name",
      minWidth: "12rem",
    },
    {
      name: "Contact Person",
      sortable: true,
      key: "contact_person_name",
      minWidth: "12rem",
    },
    {
      name: "Contact No.",
      sortable: true,
      key: "contact_no",
      minWidth: "10rem",
    },
    {
      name: "Email",
      sortable: true,
      key: "email",
      minWidth: "16rem",
    },
    {
      name: "Address",
      type: "complete_address",
      key: ["address", "city_name", "state_name", "pincode"],
      sortable: true,
    },
  ];

  useEffect(() => {
    fetchEpcList();
  }, [pagination.page, pagination.limit]);

  const fetchEpcList = async () => {
    await requestHandler(
      async () => await getEpcs({
        page: pagination.page,
        limit: pagination.limit,
      }),
      setIsLoading,
      (data) => {
        setEpcs(data.data.output);
        setTotalEpcsCount(data.data.length);
      },
      toast.error
    );
  };

  const createEpcHandler = async (data) => {
    await requestHandler(
      async () => await addEpc(data),
      null,
      async (data) => {
        closeModal("add-epc");
        toast.success("Epc Added Successfully!");
        await fetchEpcList();
      },
      toast.error
    );
  };

  const editEpcHandler = async (index, data) => {
    await requestHandler(
      async () => await editEpc(index, data),
      null,
      async (data) => {
        closeModal("edit-epc");
        toast.success("Epc Saved Successfully!");
        await fetchEpcList();
      },
      toast.error
    );
  };

  return (
    <>
      <div className="flex justify-between items-center gap-4">
        <h2 className="text-orange-500 text-xl font-bold tracking-tight">
          EPCs
        </h2>

        {accessibilityInfo?.add_view && (
          <Button className="px-3" onClick={() => openModal("add-epc")}>
            Add EPC
          </Button>
        )}
      </div>
      {!isLoading && (
        <div className="min-h-[85vh] overflow-hidden bg-white p-5">
          <div className="overflow-auto h-[94%] mb-2">
            <EditableTable
              columns={tableHeader}
              rows={epcs}
              isEditMode={accessibilityInfo?.edit_view}
              isModalOpenOnEdit={"edit-epc"}
              onEditSuccess={editEpcHandler}
            />
          </div>
          <div className="relative">
            <CustomPagination
              currentPage={pagination.page}
              totalRows={totalEpcsCount}
              rowsPerPage={pagination.limit}
              onPageChange={handlePageChange}
            />
            <span className="absolute right-0 top-1">
              <strong>Total Count: </strong>
              {totalEpcsCount}
            </span>
          </div>
        </div>
      )}
      {isLoading && <Loading />}
      <AddEpc modalId={"add-epc"} createEpcHandler={createEpcHandler} />
    </>
  );
};

export default EPCs;
