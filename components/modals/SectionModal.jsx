import React, { useState } from "react";
import FormModal from "../shared/FormModal";
import Input from "../formPage/Input";
import { SelectForObjects } from "../formPage/MultiSelectDropdown/MultiSelectDropdown";
import { toast } from "sonner";

const SectionModal = ({
  onSubmit,
  heading,
  ctaText,
  dropdownList,
  existingSectionsNameList,
}) => {
  const [section, setSection] = useState({ name: "" });
  const [error, setError] = useState(null);

  const handleSectionName = (e) => {
    if (
      existingSectionsNameList
        .map((name) => name.toLowerCase())
        .includes(e.target.value.toLowerCase())
    ) {
      toast.error(`Section Name:${e.target.value} already exists!`);
      setError(
        `Section Name: ${e.target.value} already exists! Please try again.`
      );
    } else {
      setSection({ name: e.target.value });
    }
  };

  const clearForm = () => {
    setSection({ name: "" });
    setError(null);
  };

  return (
    <FormModal
      id="add-section"
      heading={heading}
      ctaText={ctaText}
      onClose={clearForm}
      onSubmit={() => onSubmit(section.name)}
    >
      {dropdownList?.length > 0 ? (
        <SelectForObjects
          margin={"0px"}
          mandatory
          height={"36px"}
          setselected={(name, id) =>
            setSection((prev) => ({ ...prev, name: id }))
          }
          selected={section.name}
          options={dropdownList}
          optionName={"name"}
          optionID={"name"}
          placeholder={"Name"}
          dropdownLabel={"Name"}
        />
      ) : (
        <Input
          onChange={handleSectionName}
          name="sectionName"
          value={section.name}
          type={"text"}
          label={"Name"}
          error={error}
        />
      )}
    </FormModal>
  );
};

export default SectionModal;
