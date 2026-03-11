import { useModal } from "@/contexts/modal";
import { ImCross } from "react-icons/im";
import Button from "./Button";
import { FaPlusCircle } from "react-icons/fa";
import { LuX } from "react-icons/lu";

const FormModal = ({
  hide = false,
  id,
  children,
  width = "w-1/2",
  z_index = "z-50",
  overlay_z_index = "z-40",
  heading,
  onSubmit,
  ctaText,
  onClose,
  cancelButtonText,
  backButton,
  onBackButtonClick,
  className,
  disableAddButton,
}) => {
  const { isModalOpen, closeModal } = useModal();

  if (!isModalOpen(id)) return null;

  return (
    <div
      tabIndex="0"
      className={`fixed inset-0 flex items-center justify-center bg-[#2d3e5080] ${overlay_z_index}`}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        className={`relative ${width} flex-col p-[30px] gap-5 bg-white max-h-[600px] rounded-2xl ${z_index} ${hide ? "hidden" : "flex"
          } overflow-auto ${className}`}
      >
        <div
          className={`sticky top-0 bg-white w-full z-[${parseInt(z_index.match(/\d+/)) + 50}]`}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-zinc-800 text-lg font-semibold capitalize pl-4 border-l-2 border-secondary flex items-center">
              {heading}
            </h3>
            <button
              type="button"
              className="z-30"
              onClick={
                onClose
                  ? () => {
                    onClose();
                    closeModal(id);
                  }
                  : () => closeModal(id)
              }
            >
              <LuX size={14} />
            </button>
          </div>
        </div>
        {children}
        <div className="flex justify-end items-center gap-2.5">
          <Button
            variant={"gray"}
            onClick={
              onClose
                ? () => {
                  onClose();
                  closeModal(id);
                }
                : () => closeModal(id)
            }
            className={"flex gap-2 items-center justify-center"}
            customText={"#9E9E9E"}
            size="small"
          >
            {cancelButtonText ?? "Cancel"}
          </Button>

          {backButton && (
            <Button
              variant={"gray"}
              onClick={onBackButtonClick}
              className={"flex gap-2 items-center justify-center"}
              customText={"#9E9E9E"}
              size="small"
            >
              Back
            </Button>
          )}

          {ctaText && (
            <Button
              type={"submit"}
              onClick={(e) => {
                e.preventDefault();
                onSubmit();
              }}
              disabled={disableAddButton}
              className={"flex gap-2 items-center justify-center"}
              size="small"
            >
              <FaPlusCircle />
              {ctaText}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};
export default FormModal;
