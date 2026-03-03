import { useState, useEffect } from "react";
import { useModal } from "@/contexts/modal";
import Button from "@/components/shared/Button";
import Loading from "@/components/Loading";
import dynamic from "next/dynamic";
import { LocalStorageService } from "@/services/LocalStorageHandler";
import { fetchProjectCompletionDocuments } from "@/services/api";
import { requestHandler } from "@/services/ApiHandler";
import { toast } from "sonner";
import Table from "@/components/SortableTable";

const AddEditDocument = dynamic(
  () => import("@/components/modals/ProjectDetails/AddEditProjectCompletionDoc")
);

const Manufacturers = () => {
  const { openModal } = useModal();
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRow, setSelectedRow] = useState(null);

  const accessibilityInfo =
    LocalStorageService.get("user_accessibility").accessibility[0].master.pages
      .project_completion ?? {};

  useEffect(() => {
    fetchDocumentList();
  }, []);

  const tableHeader = [
    {
      name: "Name",
      sortable: true,
      key: "name",
      width: "100%",
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
            openModal("add-edit-project-completion-document");
          },
        },
      ]
      : []),
  ];

  const fetchDocumentList = async () => {
    await requestHandler(
      async () => await fetchProjectCompletionDocuments(),
      setIsLoading,
      (data) => {
        setDocuments(data.data.output);
      },
      toast.error
    );
  };

  return (
    <>
      <div className="flex justify-between items-center gap-4">
        <h2 className="text-primary text-xl font-bold tracking-tight">
          Project Completions
        </h2>

        {accessibilityInfo?.add_view && (
          <Button
            className="px-3"
            onClick={() => {
              setSelectedRow(null);
              openModal("add-edit-project-completion-document");
            }}
          >
            Add Project Completion Document
          </Button>
        )}
      </div>
      {!isLoading && (
        <div className="min-h-[85vh] overflow-hidden bg-white p-5">
          <div className="overflow-auto h-full">
            <Table columns={tableHeader} rows={documents} />
          </div>
        </div>
      )}
      {isLoading && <Loading />}
      <AddEditDocument
        modalId={"add-edit-project-completion-document"}
        itemDetails={selectedRow}
        onSuccessfullSubmit={fetchDocumentList}
      />
    </>
  );
};

export default Manufacturers;
