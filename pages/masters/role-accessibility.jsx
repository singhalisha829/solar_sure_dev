import { useState, useEffect } from "react";
import Button from "@/components/shared/Button";
import { requestHandler } from "@/services/ApiHandler";
import { toast } from "sonner";
import { getRoleAccessibilityInfo } from "@/services/api";
import { convertToTitleCase } from "@/utils/wordFormatter";
import Input from "@/components/formPage/Input";

const RoleAccessibility = () => {
  const [roleAccessibilityDetail, setRoleAccessibilityDetails] = useState({});
  // console.log("roleAccessibilityDetail", roleAccessibilityDetail);

  useEffect(() => {
    fetchAccessibilityDetails();
  }, []);

  const fetchAccessibilityDetails = async () => {
    await requestHandler(
      async () => await getRoleAccessibilityInfo(),
      null,
      (data) => {
        setRoleAccessibilityDetails(data.data.output[0].accessibility[0]);
      },
      toast.error
    );
  };
  return (
    <>
      <div className="flex justify-between items-center gap-4">
        <h2 className="text-orange-500 text-xl font-bold tracking-tight">
          Role Accessibility
        </h2>

        <Button className="px-3" onClick={() => openModal("add-vendor")}>
          Edit
        </Button>
      </div>
      {Object.keys(roleAccessibilityDetail).length > 0 &&
        Object.keys(roleAccessibilityDetail).map((page) => {
          if (Object.keys(roleAccessibilityDetail[page]).length > 0) {
            return (
              <div key={page}>
                <strong>{convertToTitleCase(page)}</strong>
                <div className="grid grid-cols-3 gap-8">
                  {Object.keys(roleAccessibilityDetail[page]).map(
                    (accessKey) => {
                      return (
                        <div
                          className="flex justify-between"
                          key={page + accessKey}
                        >
                          <div>{convertToTitleCase(accessKey)}</div>
                          <input
                            type="checkbox"
                            className="w-fit"
                            checked={false}
                            onChange={() => {}}
                          />{" "}
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            );
          }
        })}
    </>
  );
};

export default RoleAccessibility;
