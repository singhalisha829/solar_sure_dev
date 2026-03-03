import FormModal from "../shared/FormModal";

const WarningModal = ({
  modalId,
  onSubmit,
  hideCtaButton,
  modalContent,
  modalHeading = "Warning!",
  onClose,
  width,
}) => {
  return (
    <FormModal
      id={modalId}
      onSubmit={onSubmit}
      width={width}
      onClose={onClose}
      heading={modalHeading}
      cancelButtonText={hideCtaButton ? "Close" : "Cancel"}
      {...(!hideCtaButton && { ctaText: "Confirm" })}
    >
      <p className="text-sm">{modalContent}</p>
    </FormModal>
  );
};

export default WarningModal;
