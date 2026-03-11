import { useState, useEffect } from "react";
import FormModal from "../shared/FormModal";
import Input from "../formPage/Input";
import { SelectForObjects } from "../formPage/MultiSelectDropdown/MultiSelectDropdown";
import { requestHandler } from "@/services/ApiHandler";
import { createUser, editUser, getRoles } from "@/services/api";
import { toast } from "sonner";
import { useModal } from "@/contexts/modal";
import { checkSpecificKeys } from "@/utils/formValidationHandler";

const defaultForm = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  password: "",
  role: "",
  date_joined: "",
};


const AddUserModal = ({ modalId, itemDetails, onSuccess }) => {
  const isEdit = modalId?.split("-")[0] === "edit";
  const { closeModal } = useModal();
  const [form, setForm] = useState(defaultForm);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    fetchDropdowns();
  }, []);

  useEffect(() => {
    if (isEdit && itemDetails) {
      setForm({
        first_name: itemDetails.first_name ?? "",
        last_name: itemDetails.last_name ?? "",
        email: itemDetails.email ?? "",
        phone: itemDetails.phone ?? "",
        password: "",
        role: itemDetails.role ?? "",
        date_joined: itemDetails.date_joined ? itemDetails.date_joined.split("T")[0] : "",
        organisation: itemDetails.organisation ?? 1,
        seller: itemDetails.seller ?? "",
      });
    }
  }, [itemDetails]);

  const fetchDropdowns = async () => {
    await requestHandler(
      async () => await getRoles(),
      null,
      (data) => setRoles(data.data.output ?? data.data.results ?? data.data ?? []),
      () => { }
    );
  };

  const valueHandler = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const clearForm = () => setForm(defaultForm);

  const onSubmit = async () => {
    const keysToCheck = {
      first_name: "First Name",
      last_name: "Last Name",
      email: "Email",
      phone: "Phone",
      role: "Role",
      date_joined: "Date Joined",
      ...(!isEdit && { password: "Password" }),
    };

    const validationResult = checkSpecificKeys(form, keysToCheck);
    if (!validationResult.isValid) {
      toast.error(validationResult.message);
      return;
    }

    if (!isEdit) {
      if (form.password.length < 8) {
        toast.error("Password must be at least 8 characters.");
        return;
      }
      const emailPrefix = form.email.split("@")[0].toLowerCase();
      if (emailPrefix.length > 3 && form.password.toLowerCase().includes(emailPrefix)) {
        toast.error("Password is too similar to the email address.");
        return;
      }
    }

    const payload = {
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email,
      phone: form.phone,
      role: String(form.role),
      date_joined: form.date_joined,
      is_staff: true,
      is_sales_person: true,
      is_inroof_sales: true,
      hrm_access: false,
      ...(form.password != '' && { password: form.password }),
    };

    if (isEdit) {
      await requestHandler(
        async () => await editUser(itemDetails.id, payload),
        null,
        () => {
          toast.success("User updated successfully!");
          closeModal(modalId);
          onSuccess?.();
        },
        toast.error
      );
    } else {
      await requestHandler(
        async () => await createUser(payload),
        null,
        () => {
          toast.success("User added successfully!");
          closeModal(modalId);
          clearForm();
          onSuccess?.();
        },
        toast.error
      );
    }
  };

  return (
    <FormModal
      id={modalId}
      heading={isEdit ? "Edit User" : "Add User"}
      ctaText={isEdit ? "Save" : "Add User"}
      onSubmit={onSubmit}
      onClose={() => {
        if (!isEdit) clearForm();
      }}
    >
      <div className="grid grid-cols-2 gap-x-2.5 gap-y-5 overflow-y-auto">
        <Input
          mandatory
          type="text"
          name="first_name"
          value={form.first_name}
          onChange={valueHandler}
          label="First Name"
        />
        <Input
          mandatory
          type="text"
          name="last_name"
          value={form.last_name}
          onChange={valueHandler}
          label="Last Name"
        />
        <Input
          mandatory
          type="email"
          name="email"
          value={form.email}
          onChange={valueHandler}
          label="Email"
        />
        <Input
          mandatory
          type="number"
          name="phone"
          value={form.phone}
          onChange={valueHandler}
          label="Phone"
        />
        <div className="flex flex-col gap-1">
          <Input
            mandatory={!isEdit}
            type="text"
            name="password"
            value={form.password}
            onChange={valueHandler}
            label="Password"
          />
          <p className="text-xs text-gray-400">
            Min. 8 characters. Must not be too similar to the email address.
          </p>
        </div>
        <Input
          mandatory
          type="date"
          name="date_joined"
          value={form.date_joined}
          onChange={valueHandler}
          label="Date Joined"
        />
        <SelectForObjects
          mandatory
          margin="0px"
          height="36px"
          optionID="id"
          options={roles}
          optionName="name"
          selected={roles.find((r) => String(r.id) === String(form.role))?.name || ""}
          placeholder="Select Role"
          dropdownLabel="Role"
          setselected={(value, id) => {
            setForm((prev) => ({ ...prev, role: id }));
          }}
        />
        {/* <SelectForObjects
          margin="0px"
          height="36px"
          optionID="id"
          options={sellers}
          optionName="name"
          selected={sellers.find((s) => String(s.id) === String(form.seller))?.name || ""}
          placeholder="Select Seller"
          dropdownLabel="Seller"
          setselected={(value, id) => {
            setForm((prev) => ({ ...prev, seller: id }));
          }}
        /> */}
      </div>
    </FormModal>
  );
};

export default AddUserModal;
