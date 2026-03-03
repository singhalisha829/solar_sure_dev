import { useModal } from "@/contexts/modal";
import { LuX } from "react-icons/lu";

const Modal = ({
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
}) => {
  const { isModalOpen, closeModal } = useModal();

  if (!isModalOpen(id)) return null;

  return (
    <div
      onClick={
        onClose
          ? () => {
              onClose();
              closeModal(id);
            }
          : () => closeModal(id)
      }
      tabIndex="0"
      className={`fixed inset-0 flex items-center justify-center bg-[#2d3e5080] ${overlay_z_index}`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative ${width} flex-col p-[30px] gap-5 bg-white max-w-[600px] max-h-[600px] rounded-2xl ${z_index} ${
          hide ? "hidden" : "flex"
        }`}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-zinc-800 text-lg font-semibold capitalize pl-4 border-l-2 border-orange-500">
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
        {children}
      </div>
    </div>
  );
};
export default Modal;
