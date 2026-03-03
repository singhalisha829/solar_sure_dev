import FormModal from "../../shared/FormModal";
import { useModal } from "@/contexts/modal";

const RevisionHistoryModal = ({ modalId, documentName, revisionList }) => {
  const { closeModal } = useModal();

  return (
    <FormModal
      id={modalId}
      onSubmit={() => closeModal(modalId)}
      heading={documentName + " Revision History"}
      cancelButtonText={"Close"}
    >
      {revisionList?.length > 0 &&
        revisionList.map((revision, index) => {
          return (
            <div
              className="grid grid-cols-2 rounded-md border-1 p-2 text-xs gap-2"
              key={index}
            >
              <span>
                <strong>Revision: </strong>
                {revision.revision_no}
              </span>
              {revision.document !== "" ? (
                <span
                  className="text-primary cursor-pointer underline underline-offset-4"
                  onClick={() => window.open(revision.document, "_blank")}
                >
                  View Document
                </span>
              ) : (
                <span></span>
              )}
              <span>
                <strong>Category: </strong>
                {revision.category}
              </span>
              <span>
                <strong>Status: </strong>
                {revision.status}
              </span>
              <span>
                <strong>Submission Date: </strong>
                {revision.submission_date}
              </span>
              <span>
                <strong>Reply Date: </strong>
                {revision.reply_date}
              </span>
            </div>
          );
        })}
    </FormModal>
  );
};

export default RevisionHistoryModal;
