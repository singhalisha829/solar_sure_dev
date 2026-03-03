import { useState, useEffect } from "react";
import { useModal } from "@/contexts/modal";
import { useRouter } from "next/router";
import { getProjectSites } from "@/services/api";
import { requestHandler } from "@/services/ApiHandler";
import { useCompany } from "@/contexts/companies";
import Button from "@/components/shared/Button";
import EditableTable from "@/components/project-components/EditableTable";
import Loading from "@/components/Loading";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { MdArrowForwardIos } from "react-icons/md";
import { LocalStorageService } from "@/services/LocalStorageHandler";

const AddProjectSite = dynamic(
  () => import("@/components/modals/AddEditSiteModal")
);

const ProjectSites = () => {
  const { openModal } = useModal();
  const router = useRouter();
  const { companies } = useCompany();
  const [projectSites, setProjectSites] = useState();
  const [companyId, setCompanyId] = useState(null);
  const [isLoading, setIsLoading] = useState([]);

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
    { name: "Company", sortable: true, key: "company_name" },
    { name: "POC Name", sortable: true, key: "primary_poc_client_name" },
    { name: "POC Contact", sortable: true, key: "primary_poc_phone" },
  ];

  useEffect(() => {
    if (router.query.id) {
      getProjectSitesHandler(router.query.id);
      setCompanyId(router.query.id);
    }
  }, [router.query]);

  const getProjectSitesHandler = async (id) => {
    await requestHandler(
      async () => await getProjectSites(id),
      setIsLoading,
      (data) => setProjectSites(data.data.output),
      toast.error
    );
  };

  return (
    <>
      <div className="flex justify-between items-center gap-4">
        <h2 className=" flex text-xl font-bold tracking-tight">
          <span
            className="flex text-orange-500 hover:underline underline-offset-4 cursor-pointer"
            onClick={() => router.push("/masters/companies")}
          >
            {companies.find((company) => company.id == companyId)?.name}
          </span>
          <MdArrowForwardIos className="mt-1 text-orange-500" />
          Project Sites
        </h2>

        {accessibilityInfo?.add_project_site && (
          <Button className="px-3" onClick={() => openModal("add-site")}>
            Add Project Site
          </Button>
        )}
      </div>
      {!isLoading && (
        <div className="min-h-[85vh] overflow-hidden bg-white p-5">
          <div className="overflow-auto h-full">
            <EditableTable
              columns={tableHeader}
              rows={projectSites}
              isEditMode={accessibilityInfo?.edit_project_site}
              isModalOpenOnEdit={"edit-site-master"}
              onEditSuccess={getProjectSitesHandler}
            />
          </div>
        </div>
      )}
      {isLoading && <Loading />}
      {companyId && (
        <AddProjectSite
          modalId={"add-site"}
          setProject={(data) => {}}
          project={{ company: companyId }}
          getSitesHandler={getProjectSitesHandler}
        />
      )}
    </>
  );
};

export default ProjectSites;
