import React, { useState, useEffect } from "react";
import { profilePicture } from "@/utils/images";
import CustomTimeline from "../../CustomTimeline";
import { Badge } from "../../shared/Badge";
import Image from "next/image";
import Loading from "../../shared/Loading";
import { useProject } from "@/contexts/project";
import { FaPen } from "react-icons/fa6";
import { LuCheck, LuX, LuFilter } from "react-icons/lu";
import Input from "../../formPage/Input";
import { SelectForObjects } from "../../formPage/MultiSelectDropdown/MultiSelectDropdown";
import { useSalesPerson } from "@/contexts/salesperson";
import { toast } from "sonner";
import { requestHandler } from "@/services/ApiHandler";
import {
  editProject,
  getEpcs,
  addProjectInstaller,
  addProjectStaff,
  getProjectAdditionalPO,
  deleteProjectAdditionalPO,
} from "@/services/api";
import { dateFormat } from "@/utils/formatter";
import { formatPrice } from "@/utils/numberHandler";
import { useModal } from "@/contexts/modal";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import Button from "../../shared/Button";
import { LocalStorageService } from "@/services/LocalStorageHandler";
import Table from "@/components/SortableTable";
import { useSalesPersonsByRole } from "@/hooks/useSalesPersonsByRole";

const AddProjectInstaller = dynamic(
  () => import("@/components/modals/ProjectDetails/AddProjectInstaller")
);

const ProjectInstallerHistory = dynamic(
  () => import("@/components/modals/ProjectDetails/ProjectInstallerHistory")
);
const AddPurchaseOrder = dynamic(
  () => import("@/components/modals/ProjectDetails/AddAdditionalPurchaseOrder")
);
const DeleteWarningModal = dynamic(() => import("../../modals/WarningModal"));
const ManageProjectStatus = dynamic(
  () => import("../../modals/ProjectDetails/ManageProjectStatus")
);



const DashBoard = ({ financialData }) => {
  const {
    isLoading,
    projectDetails: project,
    refetchProjectDetails,
    getProjectsHandler,
  } = useProject();
  const router = useRouter();
  const { projectId } = router.query;

  const { salesPersons } = useSalesPerson();
  const { openModal, closeModal } = useModal();
  const [isEditMode, setIsEditMode] = useState({});
  const [editFormData, setEditFormData] = useState({});
  const [epcs, setEpcs] = useState([]);
  const [projectStaffKey, setProjectStaffKey] = useState(null);
  const [showEditButton, setShowEditButton] = useState(true);
  const [additionalPos, setAdditionalPos] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const { data: siteEngineers, isLoading: isSiteEngineersLoading } = useSalesPersonsByRole("site_engineer");

  const accessibilityInfo =
    LocalStorageService.get("user_accessibility").accessibility[0].projects
      .dashboard_tab ?? {};

  const projectStaffList = [
    { name: "Site Engineer", value: "site_engineer" },
    { name: "Site Incharge", value: "site_incharge" },
    { name: "Site Coordinator", value: "site_coordinator" },
  ];

  const tableHeader = [
    {
      name: "PO Number",
      key: "purchase_order_number",
      width: "130px",
    },
    {
      name: "PO Doc",
      key: "purchase_order_doc",
      type: "file",
      width: "100px",
    },
    {
      name: "PO Amount (Without GST)(₹)",
      key: "purchase_order_amount_without_gst",
      displayType: "price",
      width: "150px",
    },
    {
      name: "PO Amount (With GST)(₹)",
      key: "purchase_order_amount_with_gst",
      displayType: "price",
      width: "150px",
    },
    {
      name: "Date",
      key: "date",
      type: "date",
      width: "100px",
    },
    {
      name: "Additional Days",
      key: "additional_days",
      width: "100px",
    },
    {
      name: "Remark",
      key: "remark",
    },
    {
      name: "Actions",
      type: "actions-column",
      actionType: "edit-delete",
      width: "5rem",
      onClickEdit: (row) => {
        setSelectedRow(row);
        openModal("add-additional-po");
      },
      onClickDelete: (row) => {
        setSelectedRow(row);
        openModal("delete-warning-modal");
      },
    },
  ];

  useEffect(() => {
    fetchEpcList();
    fetchAdditionalPos();
  }, []);

  useEffect(() => {
    if (project) {
      assignEditableFieldValues();
    }
  }, [project]);

  const final = project
    ? {
      project_name: project.name,
      customer_detail: project.company_name,
      project_type: project.project_type,
      start_date: project.start_date,
      reference_number: project.refrence_number,
      site_detail: project.project_site_name,
      deadline: project.deadline_date,
      project_head: project.project_head_name,
      project_capacity: project.project_capacity,
      po_amount_without_GST: project.po_value_without_gst,
      po_amount_with_GST: project.po_value_with_gst || 0,
      budget_consumed_till_date: project.total_amount_consumed || 0,
      critical: project.project_milestone?.length,
      project_status: project.status,
      project_stage: project.stage,
      project_manager: project.project_manager_name,
      project_preview: project.project_registration,
      installer: project.installer_name,
      site_engineer: project.site_engineer.join(", "),
      site_incharge: project.site_incharge.join(", "),
      site_coordinator: project.site_coordinator.join(", "),
    }
    : {};

  const engineering_heads = project
    ? {
      electrical_engineering_head: project.electrical_engineering_head_name,
      mechanical_engineering_head: project.mechanical_engineering_head_name,
    }
    : {};

  const fetchEpcList = async () => {
    await requestHandler(
      async () => await getEpcs(),
      null,
      (data) => {
        setEpcs(data.data.output);
      },
      toast.error
    );
  };

  const fetchAdditionalPos = async () => {
    await requestHandler(
      async () => await getProjectAdditionalPO(projectId),
      null,
      (data) => {
        setAdditionalPos(data.data.output);
      },
      toast.error
    );
  };

  const assignEditableFieldValues = () => {
    setEditFormData({
      name: project.name,
      project_head: project.project_head,
      project_manager: project.project_manager,
      mechanical_engineering_head: project.mechanical_engineering_head,
      electrical_engineering_head: project.electrical_engineering_head,
    });
  };

  const onSubmitInstaller = async (siteVisitDetails) => {
    if (projectStaffKey === "installer") {
      await requestHandler(
        async () =>
          await addProjectInstaller({
            ...siteVisitDetails,
            project: projectId,
          }),
        null,
        async (data) => {
          toast.success("Installer Added Successfully...");
          closeModal("add-project-staff");
          refetchProjectDetails();
        },
        toast.error
      );
    } else {
      const formDetails = {
        project: projectId,
        person: siteVisitDetails.installer,
        site_person_category: projectStaffList.filter(
          (key) => key.value === projectStaffKey
        )[0]?.name,
        start_date: siteVisitDetails.start_date,
        end_date: siteVisitDetails.end_date,
        remark: siteVisitDetails.remark,
      };

      await requestHandler(
        async () => await addProjectStaff(formDetails),
        null,
        async (data) => {
          toast.success(
            `${formDetails.site_person_category} Added Successfully...`
          );
          closeModal("add-project-staff");
          refetchProjectDetails();
        },
        toast.error
      );
    }
  };

  const handleEditProjectDetails = async () => {
    await requestHandler(
      async () => await editProject(project.id, editFormData),
      null,
      async () => {
        setIsEditMode({});
        toast.success("Project Edited Successfully");
        await refetchProjectDetails();
        await getProjectsHandler();
      },
      toast.error
    );
  };

  const removeDocument = async (id) => {
    await requestHandler(
      async () => await deleteProjectAdditionalPO(id),
      null,
      async () => {
        toast.success("Additional PO Deleted Successfully");
        closeModal("delete-warning-modal");
        await fetchAdditionalPos();
      },
      toast.error
    );
  };

  const renderEditModeButtons = (key) => (
    <span className="flex gap-2">
      <button
        onClick={() => {
          setIsEditMode({ [key]: false });
          assignEditableFieldValues();
        }}
        className="flex items-center cursor-pointer justify-center w-4 h-4 rounded-full bg-red-500 text-white flex-shrink-0"
      >
        <LuX size={10} />
      </button>
      <button
        onClick={handleEditProjectDetails}
        className="flex items-center cursor-pointer justify-center w-4 h-4 rounded-full bg-green-500 text-white flex-shrink-0"
      >
        <LuCheck size={10} />
      </button>
    </span>
  );

  const renderEditableField = (key, value) => (
    <div className="flex items-center gap-2.5 text-zinc-800 text-sm font-semibold tracking-tight">
      {key === "project_head" && (
        <Image
          src={profilePicture}
          alt="profile picture"
          height={18}
          width={18}
        />
      )}
      {key === "project_preview" && (
        <p
          className="cursor-pointer text-primary hover:underline underline-offset-4"
          onClick={() =>
            window.open(
              `/project-registration/preview-project?id=${value}`,
              "_blank"
            )
          }
        >
          View
        </p>
      )}
      {["project_name", "project_head", "project_manager"].includes(key) && (
        <>
          {isEditMode[key] ? (
            <>
              {key === "project_name" && (
                <Input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => {
                    setEditFormData({ ...editFormData, name: e.target.value });
                  }}
                />
              )}
              {key === "project_head" && (
                <SelectForObjects
                  margin="0px"
                  height="36px"
                  setselected={(name, id) =>
                    setEditFormData({ ...editFormData, project_head: id })
                  }
                  selected={
                    salesPersons.find(
                      (person) => person.id === editFormData.project_head
                    )?.name
                  }
                  options={salesPersons}
                  optionOtherKeys={["email"]}
                  optionNameSeperator={" - "}
                  optionName="name"
                  optionID="id"
                />
              )}
              {key === "project_manager" && (
                <SelectForObjects
                  margin="0px"
                  height="36px"
                  setselected={(name, id) =>
                    setEditFormData({ ...editFormData, project_manager: id })
                  }
                  selected={
                    salesPersons.find(
                      (person) => person.id === editFormData.project_manager
                    )?.name
                  }
                  options={salesPersons}
                  optionOtherKeys={["email"]}
                  optionNameSeperator={" - "}
                  optionName="name"
                  optionID="id"
                />
              )}
              {renderEditModeButtons(key)}
            </>
          ) : (
            <span className="flex gap-2 items-center">
              <p>{value !== "" ? value : "-"}</p>
              {!showEditButton && (
                <FaPen
                  size={10}
                  className="ml-2 text-stone-300 hover:text-zinc-600 cursor-pointer"
                  onClick={() => setIsEditMode({ [key]: true })}
                />
              )}
            </span>
          )}
        </>
      )}

      {key === "installer" && (
        <span className="flex gap-2 items-center">
          <p
            className="hover:underline underline-offset-4 cursor-pointer"
            onClick={() => openModal("project-installer-history")}
          >
            {value !== "" ? value : "-"}
          </p>
          {!showEditButton && (
            <FaPen
              size={10}
              className="ml-2 text-stone-300 hover:text-zinc-600 cursor-pointer"
              onClick={() => {
                setProjectStaffKey(key);
                openModal("add-project-staff");
              }}
            />
          )}
        </span>
      )}

      {(key === "site_engineer" ||
        key === "site_coordinator" ||
        key === "site_incharge") && (
          <span className="flex gap-2 items-center">
            {value !== "" ? value : "-"}
            {!showEditButton && (
              <FaPen
                size={10}
                className="ml-2 text-stone-300 hover:text-zinc-600 cursor-pointer"
                onClick={() => {
                  setProjectStaffKey(key);
                  openModal("add-project-staff");
                }}
              />
            )}
          </span>
        )}

      {![
        "project_name",
        "project_head",
        "project_manager",
        "project_preview",
        "installer",
        "site_engineer",
        "site_incharge",
        "site_coordinator",
      ].includes(key) && <div>{renderField(key, value)}</div>}
    </div>
  );

  const renderField = (key, value) => (
    <div className="flex items-center gap-2.5 text-zinc-800 text-sm font-semibold tracking-tight">
      {["start_date", "deadline"].includes(key)
        ? dateFormat(value)
        : key === "po_amount_without_GST" &&
          project?.additional_po_total_without_gst &&
          project?.additional_po_total_without_gst != 0
          ? `₹ ${formatPrice(value)} + ₹ ${formatPrice(project?.additional_po_total_without_gst ?? 0)} = ₹ ${formatPrice(Number(value || 0) + Number(project?.additional_po_total_without_gst || 0))}`
          : key === "po_amount_with_GST" &&
            project?.additional_po_total_with_gst &&
            project?.additional_po_total_with_gst != 0
            ? `₹ ${formatPrice(value)} + ₹ ${formatPrice(project?.additional_po_total_with_gst ?? 0)} = ₹ ${formatPrice(Number(value || 0) + Number(project?.additional_po_total_with_gst || 0))}`
            : [
              "budget_consumed_till_date",
              "po_amount_without_GST",
              "po_amount_with_GST",
            ].includes(key)
              ? `₹ ${formatPrice(value)}`
              : key === "project_capacity"
                ? `${formatPrice(value)} KW`
                : value}
    </div>
  );

  const renderProjectFields = () =>
    Object.keys(final).map((key, index) => (
      <div className="flex flex-col gap-2.5" key={index}>
        <p className="capitalize text-neutral-400 text-xs font-medium tracking-tight">
          {key === "project_head"
            ? "Sales Lead"
            : ["po_amount_without_GST", "po_amount_with_GST"].includes(key)
              ? `${key.replaceAll("_", " ").toLowerCase()}(Additional Po Count: ${project?.additional_po_count ?? 0})`
              : key.replaceAll("_", " ").toLowerCase()}
        </p>
        {key !== "project_status" ? (
          renderEditableField(key, final[key])
        ) : (
          <Badge variant={final[key].replaceAll(" ", "_").toLowerCase()}>
            {final[key] !== "" ? final[key] : "-"}
          </Badge>
        )}
      </div>
    ));

  const renderEngineeringHeads = () =>
    Object.keys(engineering_heads).map((key, index) => (
      <div className="flex flex-col gap-2.5" key={index}>
        <p className="capitalize text-neutral-400 text-xs font-medium tracking-tight">
          {key === "electrical_engineering_head"
            ? "Electrical Lead"
            : "Mechanical Lead"}
        </p>
        <div className="flex items-center gap-2.5 text-zinc-800 text-sm font-semibold tracking-tight">
          {isEditMode[key] ? (
            <>
              {key === "electrical_engineering_head" && (
                <SelectForObjects
                  margin="0px"
                  height="36px"
                  setselected={(name, id) =>
                    setEditFormData({
                      ...editFormData,
                      electrical_engineering_head: id,
                    })
                  }
                  selected={
                    salesPersons.find(
                      (person) =>
                        person.id === editFormData.electrical_engineering_head
                    )?.name
                  }
                  options={salesPersons}
                  optionOtherKeys={["email"]}
                  optionNameSeperator={" - "}
                  optionName="name"
                  optionID="id"
                />
              )}
              {key === "mechanical_engineering_head" && (
                <SelectForObjects
                  margin="0px"
                  height="36px"
                  setselected={(name, id) =>
                    setEditFormData({
                      ...editFormData,
                      mechanical_engineering_head: id,
                    })
                  }
                  selected={
                    salesPersons.find(
                      (person) =>
                        person.id === editFormData.mechanical_engineering_head
                    )?.name
                  }
                  options={salesPersons}
                  optionOtherKeys={["email"]}
                  optionNameSeperator={" - "}
                  optionName="name"
                  optionID="id"
                />
              )}
              {renderEditModeButtons(key)}
            </>
          ) : (
            <span className="flex gap-2 items-center">
              <p>
                {engineering_heads[key] !== "" ? engineering_heads[key] : "-"}
              </p>
              {!showEditButton && (
                <FaPen
                  size={10}
                  className="ml-2 text-stone-300 hover:text-zinc-600 cursor-pointer"
                  onClick={() => setIsEditMode({ [key]: true })}
                />
              )}
            </span>
          )}
        </div>
      </div>
    ));

  const renderProjectFinances = () => {
    const financialSections = [
      {
        category: "Planned",
        bgColor: "bg-blue-50",
        items: [
          {
            // name: "Total PO amount without GST",  
            name: (
              <>
                Total PO amount without GST{" "}
                <span className="text-zinc-400">
                  (Additional PO amount + PO amount )
                </span>
              </>
            ),
            value: financialData?.po_value_without_gst || 0,
            showPerWatt: true,
          },
          {
            name: "Contingency",
            value: financialData?.contingecy_value || 0,
            showPerWatt: true,
          },
          {
            name: (
              <>
                New BBU Amount{" "}
                <span className="text-zinc-400">
                  (Approved BBU + Contingency Amount)
                </span>
              </>
            ),
            value: financialData?.new_bbu_amount || 0,
            showPerWatt: true,
          },
          {
            name: (
              <>
                Planned Margin{" "}
                <span className="text-zinc-400">
                  (Total PO amount without GST - New BBU Amount)
                </span>
              </>
            ),
            value: financialData?.planned_margin || 0,
            showPerWatt: true,
          },
          {
            name: (
              <>
                Gross Margin(%){" "}
                <span className="text-zinc-400">
                  (Planned Margin / Total PO amount without GST)
                </span>
              </>
            ),
            value:
              (financialData?.planned_gross_margin_percentage || 0).toFixed(2) +
              "%",
            showPerWatt: false,
          },
        ],
      },
      {
        category: "Actuals",
        bgColor: "bg-green-50",
        items: [
          {
            name: (
              <>
                New total PO amount without GST{" "}
                <span className="text-zinc-400">
                  (Total PO amount without GST + Additional POs Amount)
                </span>
              </>
            ),
            value: financialData?.new_total_po_value_without_gst || 0,
            showPerWatt: true,
          },
          {
            name: "Consumed amount",
            value: financialData?.consumed_amount || 0,
            showPerWatt: true,
          },
          {
            name: (
              <>
                Actuals Margin{" "}
                <span className="text-zinc-400">
                  (New total PO amount without GST - Consumed amount)
                </span>
              </>
            ),
            value: financialData?.actual_margin || 0,
            showPerWatt: true,
          },
          {
            name: (
              <>
                Gross Margin(%){" "}
                <span className="text-zinc-400">
                  (Actuals Margin / New total PO amount without GST)
                </span>
              </>
            ),
            value: (financialData?.actual_gross_margin || 0).toFixed(2) + "%",
            showPerWatt: false,
          },
        ],
      },
      {
        category: "Net cash",
        bgColor: "bg-red-50",
        items: [
          {
            name: "Total SG Invoice Amount",
            value:
              financialData?.total_invoice_amount_till_date_without_gst || 0,
            showPerWatt: true,
          },
          {
            name: "Payment received to date",
            value: financialData?.payment_received_till_date_without_gst || 0,
            showPerWatt: true,
          },
          {
            name: (
              <>
                Consumed amount{" "}
                <span className="text-zinc-400">
                  (Summation of all Packing List Items Amount +
                  Installation/Freight/Others POs Amount)
                </span>
              </>
            ),
            value: financialData?.consumed_amount || 0,
            showPerWatt: true,
          },
          {
            name: (
              <>
                Net cash in project{" "}
                <span className="text-zinc-400">
                  (Payment received to date - Consumed amount)
                </span>
              </>
            ),
            value: financialData?.net_cash_in_project || 0,
            showPerWatt: true,
          },
        ],
      },
    ];

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-zinc-800 text-sm font-semibold border-gray-300 border-2">
          <thead>
            <tr className="bg-gray-100 border-gray-300 font-bold border-2">
              <th className="border  px-3 py-2 border-r-2  text-left">
                Capacity(kW) = {financialData?.project_capacity || 0}
              </th>
              <th className="border px-3 py-2 border-r-2  text-center ">
                Item
              </th>
              <th className="border px-3 py-2 border-r-2  text-center">
                Amount
              </th>
              <th className="border px-3 py-2 text-center">Amount per Wp</th>
            </tr>
          </thead>
          <tbody>
            {financialSections.map((section, sectionIndex) => (
              <React.Fragment key={sectionIndex}>
                {section.items.map((item, itemIndex) => (
                  <tr key={`${sectionIndex}-${itemIndex} `}>
                    {itemIndex === 0 && (
                      <td
                        rowSpan={section.items.length}
                        className="border border-gray-300 border-b-2 border-x-2 px-3 py-2 text-center font-bold align-middle"
                      >
                        {section.category}
                      </td>
                    )}
                    <td
                      className={`border border-gray-300 border-r-2 px-3 py-2 ${itemIndex == section.items.length - 1 ? "border-b-2" : ""}`}
                    >
                      {item.name}
                    </td>
                    <td
                      className={`border border-gray-300 border-r-2  px-3 py-2 text-right ${itemIndex == section.items.length - 1 ? "border-b-2" : ""}`}
                    >
                      {typeof item.value === "string" &&
                        item.value.includes("%") ? (
                        item.value
                      ) : ["Consumed amount"].includes(item.name) &&
                        item.value > 0 ? (
                        <p
                          className="underline underline-offset-4 hover:text-primary cursor-pointer"
                          onClick={() => {
                            router.push({
                              pathname: `/reports/project-report/${financialData.id}`,
                              query: { name: financialData.name },
                            });
                          }}
                        >
                          {`₹ ${formatPrice(item.value)}`}
                        </p>
                      ) : (
                        `₹ ${formatPrice(item.value)}`
                      )}
                    </td>
                    <td
                      className={`border border-gray-300 px-3 py-2 text-right ${itemIndex == section.items.length - 1 ? "border-b-2" : ""}`}
                    >
                      {item.showPerWatt &&
                        (financialData.project_capacity || 0) > 0
                        ? `₹ ${formatPrice(item.value / (financialData.project_capacity * 1000))}`
                        : ""}
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="border border-zinc-100 rounded-md overflow-auto flex min-h-full flex-col gap-5">
      <div className="grid grid-cols-3 gap-y-[40px] gap-x-5 p-5 relative">
        <div className="flex gap-2 absolute top-2 right-2">
          {accessibilityInfo?.edit_view && (
            <Button
              className={`px-4 ${!showEditButton ? "bg-white border-1 hover:bg-zinc-800/10 text-zinc-500" : ""}`}
              onClick={() => setShowEditButton(!showEditButton)}
            >
              {showEditButton ? "Edit" : "Cancel Edit"}
            </Button>
          )}
          <Button
            className={` px-4`}
            onClick={() => {
              setSelectedRow(null);
              openModal("add-additional-po");
            }}
          >
            Add Aditional POs
          </Button>
          {(project?.status === "Hold" || project?.status === "Active" || project?.status === "Cancelled") && (
            <Button
              className={` px-4`}
              onClick={() => {
                openModal("manage-project-status");
              }}
            >
              Change Status
            </Button>
          )}
        </div>
        {renderProjectFields()}
      </div>
      <div className="flex flex-col gap-2 ">
        <p className="mx-2.5 font-medium text-primary">Engineering Heads</p>
        <div className="mx-2.5 border border-zinc-100 rounded-md p-3">
          <div className="grid grid-cols-3 gap-y-[40px] gap-x-5">
            {renderEngineeringHeads()}
          </div>
        </div>
      </div>

      {accessibilityInfo?.project_dashboard_financials && (
        <div className="flex flex-col gap-2 ">
          <p className="mx-2.5 font-medium text-primary">Project Financials</p>
          <div className="mx-2.5 border border-zinc-100 rounded-md p-3">
            {renderProjectFinances()}
          </div>
        </div>
      )}

      {additionalPos.length > 0 && (
        <div className="flex flex-col gap-2 mx-2">
          <p className="mx-2.5 font-medium text-primary">
            Additional Purchase Orders{" "}
            <span className="text-zinc-600 text-sm">
              (Po Count: {formatPrice(project?.additional_po_count)}; Additional
              Days: {formatPrice(project?.additional_po_total_additional_days)};
              Po Value Without Gst: ₹
              {formatPrice(project?.additional_po_total_without_gst)}; Po Value
              With Gst: ₹{formatPrice(project?.additional_po_total_with_gst)})
            </span>
          </p>
          <Table rows={additionalPos} columns={tableHeader} />
        </div>
      )}
      {project?.project_milestone?.length > 0 && (
        <div className="m-2.5 border border-zinc-100 rounded-md p-2.5 overflow-x-auto">
          <CustomTimeline tasks={project?.project_milestone} />
        </div>
      )}


      <AddProjectInstaller
        modalId="add-project-staff"
        installerList={epcs}
        staffCategory={projectStaffKey}
        salesPersonList={projectStaffKey === "site_engineer" ? siteEngineers : salesPersons}
        onSubmit={onSubmitInstaller}
        heading={`Add Project ${projectStaffKey?.split("_").join(" ")}`}
        isOptionsLoading={projectStaffKey === "site_engineer" ? isSiteEngineersLoading : undefined}
      />

      <ProjectInstallerHistory details={project?.project_installer} />

      <AddPurchaseOrder
        modalId={"add-additional-po"}
        projectId={projectId}
        onSuccessfullSubmit={fetchAdditionalPos}
        poDetails={selectedRow}
      />

      <DeleteWarningModal
        modalId={"delete-warning-modal"}
        modalContent={
          <>
            Are you sure you want to delete Additional PO -{" "}
            <strong>{selectedRow?.purchase_order_number}</strong>? This action
            is irreversible.
          </>
        }
        onSubmit={() => removeDocument(selectedRow?.id)}
      />

      <ManageProjectStatus
        modalId={"manage-project-status"}
        status={project?.status}
        projectId={projectId}
      />
    </div>
  );
};

export default DashBoard;
