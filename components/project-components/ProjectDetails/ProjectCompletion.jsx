import { useState, useEffect } from "react";
import { requestHandler } from "@/services/ApiHandler";
import { toast } from "sonner";
import {
  addProjectCompletionDocuments,
  editProjectCompletionDocument,
  fetchProjectCompletionDetails,
} from "@/services/api";
import { useRouter } from "next/router";
import ProjectItemTable from "../ProjectItemTable";
import Button from "@/components/shared/Button";
import { FaPen } from "react-icons/fa";
import { LuX, LuCheck } from "react-icons/lu";
import dynamic from "next/dynamic";
import { useModal } from "@/contexts/modal";
import { useProject } from "@/contexts/project";
import { LocalStorageService } from "@/services/LocalStorageHandler";
import Loading from "@/components/Loading";

const CloseModal = dynamic(
  () => import("@/components/modals/ProjectDetails/CloseProjectModal")
);

const ProjectCompletion = () => {
  const router = useRouter();
  const { projectId } = router.query;
  const { openModal, closeModal } = useModal();
  const { getProjectDetailsHandler, getProjectsHandler } = useProject();
  const [isLoading, setIsLoading] = useState(false);

  const [projectCompletionDetails, setProjectCompletionDetails] = useState([]);
  const [
    originalProjectCompletionDetails,
    setOriginalProjectCompletionDetails,
  ] = useState([]);
  const [modifiedDocuments, setModifiedDocuments] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);

  const accessibilityInfo =
    LocalStorageService.get("user_accessibility")?.accessibility[0].projects
      .project_completion_tab ?? {};

  const tableColumns = [
    {
      name: "Name",
      key: "name",
      width: "15rem",
    },
    {
      name: "Date",
      key: "date",
      type: "date",
      width: "10rem",
    },
    {
      name: "Document",
      key: "document",
      type: "file",
      width: "20rem",
    },
    {
      name: "Remark",
      key: "remark",
      type: "text",
    },
  ];

  useEffect(() => {
    getProjectCompletionDetails();
  }, []);

  const getProjectCompletionDetails = async () => {
    await requestHandler(
      async () => await fetchProjectCompletionDetails(projectId),
      null,
      (data) => {
        setProjectCompletionDetails(data.data.output);
        setOriginalProjectCompletionDetails(data.data.output);
      },
      toast.error
    );
  };

  const valueHandler = (key, value, index) => {
    let list = [...projectCompletionDetails];
    list[index][key] = value;
    setProjectCompletionDetails(list);

    let docIndex = modifiedDocuments.findIndex(
      (doc) => doc.name === list[index].name
    );
    if (docIndex == -1) {
      setModifiedDocuments([...modifiedDocuments, list[index]]);
    } else {
      let docList = [...modifiedDocuments];
      docList[docIndex][key] = value;
      setModifiedDocuments(docList);
    }
  };

  const handleSaveDocuments = async (
    isProjectClosed = false,
    date = undefined
  ) => {
    let newDocs = [],
      existingDocs = [];

    modifiedDocuments.forEach((doc) => {
      if (doc.project_compilation_id === "") {
        if (!doc.document || doc.document == "") {
          toast.error(`Please add Document for ${doc.name}`);
          return;
        }
        if (!doc.date || doc.date == "") {
          toast.error(`Please add Date for ${doc.name}`);
          return;
        }
        newDocs.push({
          document_name: doc.id,
          document: doc.document,
          date: doc.date,
          remark: doc.remark,
        });
      } else {
        existingDocs.push({
          document_name: doc.id,
          document: doc.document,
          date: doc.date,
          remark: doc.remark,
          project_compilation_id: doc.project_compilation_id,
        });
      }
    });

    // Handle both new and existing documents in parallel and call getProjectCompletionDetails once
    const promises = [];

    if (newDocs.length > 0 || isProjectClosed) {
      let apiBody = {
        project: projectId,
        project_complation_document: newDocs,
      };
      if (isProjectClosed) {
        apiBody = {
          ...apiBody,
          project_status: "Closed",
          project_closing_date: date,
        };
      }
      promises.push(addDocuments(apiBody));
    }

    if (existingDocs.length > 0) {
      existingDocs.forEach((document) => {
        promises.push(editDocuments(document));
      });
    }

    if (newDocs.length > 0 || existingDocs.length > 0 || isProjectClosed) {
      setIsLoading(true);

      // Wait for all promises to resolve
      await Promise.all(promises);

      // Fetch project completion details once after all documents are saved
      await getProjectCompletionDetails();
      if (isProjectClosed) {
        await getProjectDetailsHandler();
        await getProjectsHandler();
        closeModal("close-project-modal");
      }

      // Clear modified documents and exit edit mode
      setModifiedDocuments([]);
      toast.success("Project Completion Document Saved Successfully!");
      setIsEditMode(false);
      setIsLoading(false);
    }
  };

  const addDocuments = async (apiData) => {
    return requestHandler(
      async () => await addProjectCompletionDocuments(apiData),
      null,
      (data) => { },
      toast.error
    );
  };

  const editDocuments = async (doc) => {
    return requestHandler(
      async () =>
        await editProjectCompletionDocument(doc.project_compilation_id, doc),
      null,
      (data) => { },
      toast.error
    );
  };

  return (
    <>
      {accessibilityInfo?.add_view && (
        <div className="flex items-center gap-2 justify-end">
          {isEditMode ? (
            <>
              <Button
                onClick={() => {
                  setProjectCompletionDetails(originalProjectCompletionDetails);
                  setIsEditMode(false);
                }}
                variant={"inverted"}
                customText={"#F47920"}
                className="border-1 h-[29px] hover:bg-slate-100  bg-white px-2  "
              >
                <LuX size={15} />
                Cancel Edit
              </Button>
              <Button
                onClick={() => handleSaveDocuments()}
                variant={"inverted"}
                customText={"#F47920"}
                className="border-1 h-[29px] bg-white text-green-500 px-2 hover:bg-green-50 "
              >
                <LuCheck size={15} />
                Save
              </Button>
              <Button
                onClick={() => openModal("close-project-modal")}
                variant={"inverted"}
                customText={"#F47920"}
                className="border-1 h-[29px] bg-white text-green-500 px-2 hover:bg-green-50 "
              >
                <LuCheck size={15} />
                Save And Close Project
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setIsEditMode(true)}
              variant={"inverted"}
              customText={"#F47920"}
              className="bg-orange-400/10 text-primary px-2 hover:bg-orange-600/10 "
            >
              <FaPen />
              Edit Items
            </Button>
          )}
        </div>
      )}
      {isLoading ? (
        <Loading />
      ) : (
        <ProjectItemTable
          onEditSuccess={() => { }}
          isEditMode={isEditMode}
          rows={projectCompletionDetails}
          columns={tableColumns}
          valueHandler={valueHandler}
          onRowClick={(row) => { }}
        />
      )}

      <CloseModal onSubmit={(date) => handleSaveDocuments(true, date)} />
    </>
  );
};

export default ProjectCompletion;
