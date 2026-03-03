import { useModal } from "@/contexts/modal";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Button from "@/components/shared/Button";
import EditableTable from "@/components/project-components/EditableTable";
import Loading from "@/components/Loading";
import dynamic from "next/dynamic";
import { LocalStorageService } from "@/services/LocalStorageHandler";
import { requestHandler } from "@/services/ApiHandler";
import { getCompanies } from "@/services/api";
import { toast } from "sonner";
import CustomPagination from "@/components/shared/Pagination";
import { usePagination } from "@/hooks/usePagination";

const AddCompany = dynamic(
  () => import("@/components/modals/AddEditCompanyModal")
);

const Companies = () => {
  const { openModal } = useModal();
  const router = useRouter();
  const { pagination, resetToPageOne, handlePageChange } = usePagination({
    defaultPage: 1,
    defaultLimit: 25
  });
  const [companies, setCompanies] = useState([]);
  const [totalCompaniesCount, setTotalCompaniesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const accessibilityInfo =
    LocalStorageService.get("user_accessibility").accessibility[0].master.pages
      .companies ?? {};

  const tableHeader = [
    {
      name: "Name",
      sortable: true,
      key: "name",
      width: "[10%]",
    },
    { name: "Email", sortable: true, key: "email" },
    { name: "Contact", sortable: true, key: "phone" },
    { name: "POC Name", sortable: true, key: "primary_poc_client_name" },
    { name: "Sales Lead", sortable: true, key: "salesperson_name" },
    {
      name: "No Of Project Sites",
      sortable: true,
      key: "no_of_sites",
      style: accessibilityInfo?.view_project_site
        ? "underline underline-offset-4 cursor-pointer"
        : "",
      onClick: accessibilityInfo?.view_project_site
        ? (row) => {
          router.push(`project-sites/?id=${row.id}`);
        }
        : null,
    },
  ];

  useEffect(() => {
    getCompaniesHandler();
  }, [pagination.page, pagination.limit]);

  const getCompaniesHandler = async () => {
    await requestHandler(
      async () => await getCompanies({
        page: pagination.page,
        limit: pagination.limit,
      }),
      setIsLoading,
      (data) => {
        setCompanies(data.data.output);
        setTotalCompaniesCount(data.data.length);
      },
      toast.error
    );
  };


  return (
    <>
      <div className="flex justify-between items-center gap-4">
        <h2 className="text-orange-500 text-xl font-bold tracking-tight">
          Companies
        </h2>

        {accessibilityInfo?.add_view && (
          <Button className="px-3" onClick={() => openModal("add-company")}>
            Add Company
          </Button>
        )}
      </div>
      {!isLoading && (
        <div className="min-h-[85vh] overflow-hidden bg-white p-5">
          <div className="overflow-auto h-[95%] mb-2">
            <EditableTable
              columns={tableHeader}
              rows={companies}
              isEditMode={accessibilityInfo?.edit_view}
              isModalOpenOnEdit={"edit-company"}
              onEditSuccess={getCompaniesHandler}
            />
          </div>
          <div className="relative">
            <CustomPagination
              currentPage={pagination.page}
              totalRows={totalCompaniesCount}
              rowsPerPage={pagination.limit}
              onPageChange={handlePageChange}
            />
            <span className="absolute right-0 top-1">
              <strong>Total Count: </strong>
              {totalCompaniesCount}
            </span>
          </div>
        </div>
      )}
      {isLoading && <Loading />}
      <AddCompany
        modalId={"add-company"}
        onSuccessfullSubmit={getCompaniesHandler}
      />
    </>
  );
};

export default Companies;
