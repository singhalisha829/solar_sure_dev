import { useState } from "react";
import FormModal from "../shared/FormModal";
import Input from "../formPage/Input";
import { requestHandler } from "@/services/ApiHandler";
import { adminResetPassword } from "@/services/api";
import { toast } from "sonner";
import { useModal } from "@/contexts/modal";

const defaultForm = { new_password: "", confirm_password: "" };

const ResetPasswordModal = ({ modalId, itemDetails, onSuccess }) => {
  const { closeModal } = useModal();
  const [form, setForm] = useState(defaultForm);

  const valueHandler = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async () => {
    if (!form.new_password || !form.confirm_password) {
      toast.error("Both password fields are required.");
      return;
    }
    if (form.new_password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (form.new_password !== form.confirm_password) {
      toast.error("Passwords do not match.");
      return;
    }

    await requestHandler(
      async () =>
        await adminResetPassword({
          user_id: itemDetails.id,
          new_password: form.new_password,
          confirm_password: form.confirm_password,
        }),
      null,
      () => {
        toast.success("Password reset successfully!");
        closeModal(modalId);
        setForm(defaultForm);
        onSuccess?.();
      },
      toast.error
    );
  };

  return (
    <FormModal
      id={modalId}
      heading="Reset Password"
      ctaText="Reset Password"
      onSubmit={onSubmit}
      onClose={() => setForm(defaultForm)}
    >
      <div className="flex flex-col gap-5">
        <p className="text-sm text-gray-500">
          Resetting password for <strong>{itemDetails?.first_name} {itemDetails?.last_name}</strong>
        </p>
        <Input
          mandatory
          type="text"
          name="new_password"
          value={form.new_password}
          onChange={valueHandler}
          label="New Password"
        />
        <div className="flex flex-col gap-1">
          <Input
            mandatory
            type="text"
            name="confirm_password"
            value={form.confirm_password}
            onChange={valueHandler}
            label="Confirm Password"
          />
          <p className="text-xs text-gray-400">Min. 8 characters.</p>
        </div>
      </div>
    </FormModal>
  );
};

export default ResetPasswordModal;
