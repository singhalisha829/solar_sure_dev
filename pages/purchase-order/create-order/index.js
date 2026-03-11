import { useState, useEffect } from "react";
import Stepper from "react-stepper-horizontal";
import dynamic from "next/dynamic";
import { LocalStorageService } from "@/services/LocalStorageHandler";
import {
  addPurchaseOrder,
  getPurchaserList,
  getPurchaseOrderItemListForOthers,
  getCompanyConfiguration,
} from "@/services/api";
import { requestHandler } from "@/services/ApiHandler";
import { toast } from "sonner";
import { useRouter } from "next/router";
import { getPurchaseOrderItemList } from "@/services/api";
import { MdArrowForwardIos } from "react-icons/md";
import { dateFormatInYYYYMMDD } from "@/utils/formatter";

const PurchaseOrderBomItems = dynamic(
  () => import("@/components/project-components/PurchaseOrderBomItems")
);
const PurchaseOrderDetails = dynamic(
  () => import("@/components/project-components/PurchaseOrderDetails")
);

const PurchaseOrderCostEstimation = dynamic(
  () => import("@/components/project-components/PurchaseOrderCostEstimation")
);


const CreateOrder = () => {
  const router = useRouter();
  const today = new Date();
  const projectDetails = LocalStorageService.get("purchase-order-project");
  const [currentStep, setCurrentStep] = useState(0);
  const [poItemList, setPoItemList] = useState([]);
  const [purchasers, setPurchasers] = useState([]);
  const [isExtraChargeAdded, setIsExtraChargeAdded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [companyConfig, setCompanyConfig] = useState(null);
  const [formSteps, setFormSteps] = useState([
    { title: "Project Items", onClick: () => setCurrentStep(0) },
    { title: "Purchase Order Details", onClick: () => setCurrentStep(2) },
  ]);

  const [formDetails, setFormDetails] = useState({
    project: projectDetails.id,
    other_terms: "",
    purchase_order_date: dateFormatInYYYYMMDD(today),
    vendor: "",
    vendor_name: "",
    vendor_address: "",
    vendor_gst: "",
    total_po_amount: "",
    total_po_taxable_amount: "",
    total_po_tax_amount: "",
    extra_charges: [],
    payment_terms: "",
    delivery_terms: "",
    remark: "",
    purchaser: "",
    purchaser_name: "",
    status: "Generate",
    product_list: [],
    sections: [],

    shipper_type: "Project Site",
    shipper_name: projectDetails.site_details.name,
    shipper_address: projectDetails.site_details.address,
    shipper_city: projectDetails.site_details.city,
    shipper_city_name: projectDetails.site_details.city_name,
    shipper_state: projectDetails.site_details.state,
    shipper_state_name: projectDetails.site_details.state_name,
    shipper_pincode: projectDetails.site_details.pincode,
    shipper_gst: projectDetails.site_details.gst,
    shipper_contact_person_name: projectDetails.site_details.poc_name,
    shipper_email: projectDetails.site_details.poc_email,
    shipper_mobile_no: projectDetails.site_details.poc_contact,
  });
  console.log('formDetails', formDetails);

  useEffect(() => {
    fetchCompanyConfig();
    if (projectDetails.id !== "") {
      if (
        ["Installation", "Freight", "Other"].includes(projectDetails.section)
      ) {
        getPurchaseOrderItemsForOtherSection(projectDetails.id);
      } else {
        getPurchaseOrderItems(projectDetails.id);
      }
      fetchPurchasers();
    }
  }, []);

  const fetchCompanyConfig = async () => {
    await requestHandler(
      async () => await getCompanyConfiguration(),
      null,
      (data) => {
        const config = data.data.output;
        setCompanyConfig(config);
        const terms = config.purchase_order_terms_and_conditions ?? {};
        console.log('terms', terms);
        setFormDetails(() => ({
          ...formDetails,
          payment_terms: terms.payment_terms ?? "",
          delivery_terms: terms.delivery_terms ?? "",
          other_terms: terms.other_terms ?? "",
        }));
      },
      () => { }
    );
  };

  const fetchPurchasers = async () => {
    await requestHandler(
      async () => await getPurchaserList(),
      null,
      (data) => {
        setPurchasers(data.data.output);
      },
      toast.error
    );
  };

  const getPurchaseOrderItems = async (id) => {
    await requestHandler(
      async () => await getPurchaseOrderItemList(id),
      null,
      (data) => {
        const filteredData = data.data.output.map((bom) => ({
          ...bom,
          product_list: bom.product_list.filter(
            (product) =>
              product.quantity_left_after_purchase_order.quantity !== 0
          ),
        }));
        const updatedData = filteredData.map((section) => ({
          ...section,
          product_list: section.product_list.map((product) => ({
            ...product,
            section: section.bom_head,
            charges_cost: 0,
          })),
        }));
        setPoItemList(updatedData);
      },
      toast.error
    );
  };

  const getPurchaseOrderItemsForOtherSection = async (id) => {
    await requestHandler(
      async () => await getPurchaseOrderItemListForOthers(id),
      null,
      (data) => {
        const filteredData = data.data.output.map((bom) => ({
          ...bom,
          product_list: bom.product_list.filter(
            (product) => product.left_po_amount !== 0
          ),
        }));
        const updatedData = filteredData.map((section) => ({
          ...section,
          product_list: section.product_list.map((product) => ({
            ...product,
            section: section.bom_head,
          })),
        }));
        setPoItemList(updatedData);
      },
      toast.error
    );
  };

  const preserveTerms = (data) => ({
    ...data,
    payment_terms: formDetails.payment_terms,
    delivery_terms: formDetails.delivery_terms,
    other_terms: formDetails.other_terms,
  });

  const onNextClick = (data, itemList, willAddExtraCharge, is_draft = false) => {
    if (is_draft) {
      handleFormSubmit(preserveTerms(data), true)
      return;
    };

    if (willAddExtraCharge) {
      setFormSteps([
        { title: "Project Items", onClick: () => setCurrentStep(0) },
        { title: "Extra Charges", onClick: () => setCurrentStep(1) },
        {
          title: "Purchase Order Details",
          onClick: () => setCurrentStep(2),
        },
      ]);
      if (formDetails.extra_charges?.length === 0) {
        setFormDetails({
          ...preserveTerms(data),
          extra_charges: [
            {
              charges: "",
              amount: "",
              tax_rate: "",
              tax_amount: "",
              total_amount: "",
              description: "",
            },
          ],
        });
      } else {
        setFormDetails(preserveTerms(data));
      }

      setIsExtraChargeAdded(true);
      setCurrentStep(1);
    } else if (formDetails.extra_charges?.length > 0) {
      setCurrentStep(1);
      setFormDetails(preserveTerms(data));
    } else {
      setCurrentStep(2);
      setFormDetails(preserveTerms(data));
    }
    setPoItemList(itemList);


  };

  const handlePOCostEstimation = (extraCharges, poCharges) => {
    setCurrentStep(2);
    setFormDetails({
      ...formDetails,
      extra_charges: [...extraCharges],
      total_po_amount: poCharges.total_po_amount,
      total_po_taxable_amount: poCharges.total_po_taxable_amount,
      total_po_tax_amount: poCharges.total_po_tax_amount,
    });
  };

  const handleFormSubmit = async (data, is_draft = false) => {
    setIsLoading(true);
    let productList = [];
    data?.product_list?.map((product) => {
      let productData = {
        unit: product.unit_id,
        taxable_amount: product.taxable_amount,
        tax_rate: product.tax,
        tax_amount: product.tax_amount,
        total_amount: product.total_amount,
        description: product.description,
        section: product.section,
        etd: product.etd,
      };
      if (
        ["Installation", "Freight", "Other"].includes(projectDetails.section)
      ) {
        productData.project_installation_budget = product.id;
        productData.quantity = 1;
        productData.unit_price = product.required_amount;
      } else {
        productData.project_bom_item = product.id;
        productData.quantity = product.required_quantity;
        productData.unit_price = product.unit_price;
        productData.ex_works_unit_price = product.ex_works_unit_price;
        productData.charges = product.charges;
        productData.charges_cost =
          product.charges_cost != "" ? product.charges_cost : 0;
      }
      productList.push(productData);
    });

    let apiData = {
      project: data.project,
      other_terms: data.other_terms,
      purchase_order_date: data.purchase_order_date,
      vendor: data.vendor,
      total_po_amount: data.total_po_amount,
      total_po_taxable_amount: data.total_po_taxable_amount,
      total_po_tax_amount: data.total_po_tax_amount,
      payment_terms: data.payment_terms,
      delivery_terms: data.delivery_terms,
      remark: data.remark,
      purchaser: data.purchaser,
      status: "Generate",
      product_list: productList,

      shipper_name: data.shipper_name,
      shipper_address: data.shipper_address,
      shipper_city: data.shipper_city,
      shipper_city_name: data.shipper_city_name,
      shipper_state: data.shipper_state,
      shipper_state_name: data.shipper_state_name,
      shipper_pincode: data.shipper_pincode,
      shipper_gst: data.shipper_gst,
      shipper_contact_person_name: data.shipper_contact_person_name,
      shipper_email: data.shipper_email,
      shipper_mobile_no: data.shipper_mobile_no,
    };

    if (data?.extra_charges?.length > 0) {
      apiData.extra_charges = data.extra_charges;
    }

    if (is_draft) {
      apiData.is_draft = true;
    }

    await requestHandler(
      async () => await addPurchaseOrder(apiData),
      null,
      (data) => {
        toast.success(is_draft ? "Saved as draft" : "Purchase Order added Successfully!");
        router.back();
      },
      toast.error
    );
    setIsLoading(false);
  };

  return (
    <>
      {" "}
      <div className="flex justify-between items-center gap-4">
        <h2 className=" flex text-xl font-bold tracking-tight">
          <span
            className="text-primary hover:underline underline-offset-4 cursor-pointer"
            onClick={() => router.back()}
          >
            Create Purchase Order
          </span>{" "}
          <MdArrowForwardIos className="mt-1 text-primary" />
          {projectDetails?.project_name}
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
        {currentStep === 0 && (
          <PurchaseOrderBomItems
            poItemList={poItemList}
            section={projectDetails?.section}
            purchasers={purchasers}
            bomItemDetails={formDetails}
            onNextClick={onNextClick}
          />
        )}

        {currentStep === 1 && (
          <PurchaseOrderCostEstimation
            extraPoCharges={formDetails.extra_charges}
            onBackClick={() => setCurrentStep(0)}
            poItemCharges={{
              total_po_taxable_amount: formDetails.total_po_taxable_amount,
              total_po_tax_amount: formDetails.total_po_tax_amount,
              total_po_amount: formDetails.total_po_amount,
            }}
            handleOnNextClick={handlePOCostEstimation}
          />
        )}

        {currentStep === 2 && (
          <PurchaseOrderDetails
            bomItemDetails={formDetails}
            companyConfig={companyConfig}
            onBackClick={() =>
              isExtraChargeAdded ? setCurrentStep(1) : setCurrentStep(0)
            }
            isLoading={isLoading}
            onSubmitHandler={(data, is_draft = false) => handleFormSubmit(data, is_draft)}
          />
        )}
      </div>
    </>
  );
};
export default CreateOrder;
