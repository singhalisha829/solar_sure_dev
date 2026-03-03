import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { MdArrowForwardIos } from "react-icons/md";
import dynamic from "next/dynamic";
import Stepper from "react-stepper-horizontal";
import {
  getBOMContigency,
  fetchProjectInstallationDetails,
} from "@/services/api";
import { requestHandler } from "@/services/ApiHandler";
import { toast } from "sonner";
import { useProject } from "@/contexts/project";

const ContingencyForm = dynamic(
  () =>
    import(
      "@/components/project-components/ProjectDetails/ProjectContingency/ContingencyForm"
    )
);
const EditContingencyItems = dynamic(
  () =>
    import(
      "@/components/project-components/ProjectDetails/ProjectContingency/EditContingencyItemsForm"
    )
);

const ProjectContingencyPage = () => {
  const router = useRouter();
  const { projectId, projectName, id } = router.query;
  const { projectDetails, getProjectDetailsHandler } = useProject();
  const [currentStep, setCurrentStep] = useState(0);
  const [contingencyDetails, setContingencyDetails] = useState({});
  const [itemList, setItemList] = useState([]);
  const [replacedItemList, setReplacedItemList] = useState([]);
  const [otherItemList, setOtherItemList] = useState([]);
  const [replacedOtherItemList, setReplacedOtherItemList] = useState([]);
  const [installationItems, setInstallationItems] = useState([]);

  const formSteps = [
    { title: "Contingency", onClick: () => setCurrentStep(0) },
    { title: "Contingency Items", onClick: () => setCurrentStep(2) },
  ];

  useEffect(() => {
    getProjectDetailsHandler();
  }, []);

  useEffect(() => {
    if (projectDetails) {
      fetchInstallationItems();
    }
  }, [projectDetails]);

  const fetchContigencyDetails = async (id, installationItemList) => {
    await requestHandler(
      async () => await getBOMContigency({ id: id }),
      null,
      (data) => {
        let item_list = [],
          replaced_item_list = [],
          other_item_list = [],
          replaced_other_item_list = [];
        const projectBomItems = projectDetails?.bom_heads;
        const contingencyData = data.data.output[0];

        contingencyData.item_list.map((item) => {
          // separate the item list into bom item and others category, since the table headers are different for both category
          if (
            ["Installation", "Freight", "Other"].includes(item.bom_head_name)
          ) {
            const data = {
              id: item.id,
              amount: item.unit_price,
              category: item.bom_head_name,
              description: item.remarks,
              isOthers: true,
              name: item.installation_freight_budget_name,
              is_replaced: item.is_replaced,
            };
            // separate bom items into two different lists, one bng replaced and other bng the replacement
            if (item.is_replaced) {
              // for replaced item, get its original amount
              const selectedItem = installationItemList.filter(
                (bomItem) =>
                  bomItem.budget_type === item.bom_head_name &&
                  bomItem.name === item.installation_freight_budget_name
              );
              replaced_other_item_list.push({
                ...data,
                replacement_total_amount: item.total_amount,
                amount: selectedItem[0]?.amount,
              });
            }
            // others category replacement item
            else {
              other_item_list.push(data);
            }
          } else {
            const data = {
              id: item.id,
              category: item.bom_head_name,
              contingency_type: item.is_replaced
                ? "price"
                : item.contingency_type,
              date: item.date,
              item: item.item_id,
              item_name: item.item_name,
              make: item.make_id,
              product_code: item.product_code,
              project: projectId,
              quantity: item.quantity,
              remarks: item.remarks,
              section_id: item.bom_section_id,
              section_name: item.bom_section,
              total_amount: item.total_amount,
              contingency_amount: item.contingency_amount,
              unit: item.unit_id,
              unit_symbol: item.unit_symbol,
              unit_price: item.unit_price,
              is_replaced: item.is_replaced,
            };
            // separate bom items into two different lists, one bng replaced and other bng the replacement
            if (item.is_replaced) {
              // for replaced item, get its original quantity and total amount
              const selectedBomItem = projectBomItems[
                item.bom_head_name === "Other Structure"
                  ? "Other_structure"
                  : item.bom_head_name
              ][0].bom_items?.filter((bomItem) => bomItem.item == item.item_id);

              replaced_item_list.push({
                ...data,
                replacement_quantity: item.quantity,
                replacement_total_amount: item.total_amount,
                quantity:
                  selectedBomItem[0]?.bom_items_quantity_left_after_po_booking
                    ?.quantity || 0,
                unit_symbol:
                  selectedBomItem[0]?.bom_items_quantity_left_after_po_booking
                    ?.unit,
                total_amount:
                  Number(
                    selectedBomItem[0]?.bom_items_quantity_left_after_po_booking
                      ?.quantity || 0
                  ) * Number(item.unit_price),
              });
            }
            // bom items category replacement item
            else {
              item_list.push(data);
            }
          }
        });
        setContingencyDetails({
          id: id,
          remark: contingencyData.remark,
          contingency_no: contingencyData.contingency_no,
        });
        setItemList(item_list);
        setOtherItemList(other_item_list);
        setReplacedItemList(replaced_item_list);
        setReplacedOtherItemList(replaced_other_item_list);
      },
      toast.error
    );
  };

  const fetchInstallationItems = async () => {
    await requestHandler(
      async () => await fetchProjectInstallationDetails(projectId),
      null,
      (data) => {
        setInstallationItems(data.data.output);
        if (id) {
          fetchContigencyDetails(id, data.data.output);
        }
      },
      toast.error
    );
  };

  return (
    <>
      <div className="flex justify-between items-center gap-4">
        <h2 className=" flex text-xl font-bold tracking-tight">
          <span
            className="flex text-primary hover:underline underline-offset-4 cursor-pointer"
            onClick={() => router.back()}
          >
            {projectName}
            <MdArrowForwardIos className="text-primary mt-1" />
            {contingencyDetails?.contingency_no}
          </span>{" "}
          <MdArrowForwardIos className="text-primary mt-1" />
          Edit Contingency Items
        </h2>

        <div className="w-1/2 text-xs">
          <Stepper
            steps={formSteps}
            activeStep={currentStep}
            size={13}
            titleFontSize={12}
            circleFontSize={0}
            activeColor="#f47920"
            completeColor="#f47920"
            completeBarColor="#f47920"
            activeBorderColor="#fef0e8"
            completeBorderColor="#fef0e8"
            defaultBorderColor="#fafafa"
          />
        </div>
      </div>
      <div className=" bg-white rounded relative flex flex-col gap-4 p-5 overflow-scroll grow h-full">
        {currentStep == 0 && (
          <ContingencyForm
            projectId={projectId}
            contingencyDetails={contingencyDetails}
            onSuccessfullSubmit={(id, remark) => {
              setCurrentStep(1);
              setContingencyDetails({
                id: id,
                remark: remark,
                ...contingencyDetails,
              });
            }}
          />
        )}

        {currentStep == 1 && (
          <EditContingencyItems
            projectId={projectId}
            contingencyId={contingencyDetails?.id}
            itemRemark={contingencyDetails?.remark}
            projectName={projectName}
            contingencyItemList={itemList}
            contingencyOtherItemList={otherItemList}
            installationItems={installationItems}
            replacedContingencyItemList={replacedItemList}
            replacedContingencyOtherItemList={replacedOtherItemList}
            projectDetails={projectDetails}
            onBackClick={(
              itemList,
              otherItemList,
              replacedItemList,
              replacedOtherItemList
            ) => {
              setCurrentStep(0);
              setItemList([...itemList]);
              setOtherItemList([...otherItemList]);
              setReplacedItemList([...replacedItemList]);
              setReplacedOtherItemList([...replacedOtherItemList]);
            }}
          />
        )}
      </div>
    </>
  );
};

export default ProjectContingencyPage;
