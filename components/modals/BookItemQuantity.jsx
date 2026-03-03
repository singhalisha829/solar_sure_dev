import { useState } from "react";
import { useProject } from "@/contexts/project";
import { useModal } from "@/contexts/modal";
import { toast } from "sonner";

import { dateFormatInYYYYMMDD } from "@/utils/formatter";

import FormModal from "../shared/FormModal";
import EditableTable from "../project-components/EditableTable";

import { requestHandler } from "@/services/ApiHandler";
import { bookItemQuantity } from "@/services/api";

const BookItemQuantity = ({ modalId, itemDetails, projectId }) => {
  const { closeModal } = useModal();
  const { refetchProjectDetails } = useProject();
  const [bookedItemList, setBookedItemList] = useState([]);
  const [unBookedItemList, setUnBookedItemList] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState('Unbooked Items');

  const tabs=['Unbooked Items', 'Booked Items'];

  // console.log("bookedItemList", bookedItemList);
  // console.log("unBookedItemList", unBookedItemList);

  const tableHeader = [
    { name: "Item", key: "item_name", minWidth: "15%" },
    { name: "Make", key: "make_name", minWidth: "15%" },
    { name: "Quantity", key: "quantity_new", minWidth: "5%" },
    { name: "Inventory", key: "inventory_new", minWidth: "10%" },
    { name: "Booked Quantity", key: "booked_inventory", minWidth: "20%" },
    {
      name: "Left Quantity",
      key: "left_inventory_after_booking",
      minWidth: "20%",
    },
    { name: "Status", key: "status", minWidth: "10%" },
  ];

  const handleBomItem = (value, status, data) => {
    // handle lsit of booked and unbooked quantity items
    if (value && status === "Created") {
      setBookedItemList([...bookedItemList, data]);
    } else if (!value && status === "Created") {
      const index = bookedItemList.filter(
        (item) => item.bom_item_id == data.bom_item_id
      );
      if (index !== -1) {
        const updatedItems = [...bookedItemList];
        updatedItems.splice(index, 1);
        setBookedItemList(updatedItems);
      }
    } else if (!value && status === "Booked") {
      setUnBookedItemList([...unBookedItemList, data]);
    } else if (value && status === "Booked") {
      const index = unBookedItemList.filter(
        (item) => item.bom_item_id == data.bom_item_id
      );
      if (index !== -1) {
        const updatedItems = [...unBookedItemList];
        updatedItems.splice(index, 1);
        setUnBookedItemList(updatedItems);
      }
    }
  };

  const handleAllBomItems = (value, itemList) => {
    let newItemList = itemList.map((item) => {
      return {
        bom_item_id: item.id,
        unit: item.quantity.unit,
        quantity: item.quantity.quantity,
        product: item.item,
      };
    });
    if (value) {
      setBookedItemList(newItemList);
    } else {
      setUnBookedItemList(newItemList);
    }
  };

  const onSubmit = async () => {
    if (bookedItemList.length > 0) {
      const productList = bookedItemList.map(item=>({product:item.item,quantity:item.quantity.quantity,unit:item.quantity.unit,bom_item_id:item.id}))
      const formDetails = {
        project: projectId,
        transaction_type: "CREDIT",
        date: dateFormatInYYYYMMDD(new Date()),
        product_details: productList,
      };

      await requestHandler(
        async () => await bookItemQuantity(formDetails),
        null,
        async (data) => {
          toast.success("Item Quantity Booked Successfully...");
          closeModal(modalId);
          clearForm();
          refetchProjectDetails();
        },
        toast.error
      );
    }

    if (unBookedItemList.length > 0) {
      // const productList = unBookedItemList.map(item=>({product:item.item,quantity:item.quantity.quantity,unit:item.quantity.unit,bom_item_id:item.id}))
      // const formDetails={
      //     project:projectId,
      //     transaction_type:"DEBIT",
      //     date:dateFormatInYYYYMMDD(new Date()),
      //     product_details:productList
      // }
      // await requestHandler(
      //     async () =>
      //       await bookItemQuantity(formDetails),
      //     null,
      //     async (data) => {
      //       toast.success("Quantity Booked Successfully...");
      //       closeModal(modalId)
      //       clearForm();
      //       refetchProjectDetails();
      //     },
      //     toast.error
      //   );
    }
  };

  const handlePreview = () =>{
    if(bookedItemList.length > 0){
      setShowPreview(true)
    }else{
      toast.error('Please Select at least one BOM Item!')
    }
  }

  const clearForm = () => {
    setBookedItemList([]);
    setUnBookedItemList([]);
    setShowPreview(false);
    setActiveTab('Unbooked Items')
  };

  return (
    <FormModal
      id={modalId}
      onSubmit={() => (showPreview ? onSubmit() : handlePreview())}
      ctaText={showPreview ? "Save" : "Continue"}
      width="w-[60%]"
      heading={showPreview?'Book Quantity Preview':`Book Quantity `}
      onClose={clearForm}
    >
        {!showPreview && <span className="flex gap-3 font-semibold text-zinc-800">{tabs.map(tab=><span key={tab}
        className={`cursor-pointer ${activeTab===tab?'border-b-2 border-primary':''}`}
        onClick={()=>setActiveTab(tab)}>{tab}</span>)}</span>}

      <div className="overflow-y-auto">

        {/* UnBooked Items List */}
        {itemDetails && !showPreview && activeTab === 'Unbooked Items' &&
          Object.keys(itemDetails).map((key, index) => {
            const combinedBomHeads = itemDetails[key].reduce(
              (accumulator, currentValue) => {
                let itemList=[];
                currentValue.bom_items.map(item=>{
                  if(item.status === 'Created'){
                    itemList.push(item)
                  }
                })
                return accumulator.concat(itemList);
              },
              []
            );
            if (combinedBomHeads.length > 0) {
              return (
                <div key={index} className="mb-5">
                  <p className="text-zinc-800 text-sm font-bold tracking-tight mb-1">
                    {key}
                  </p>
                  <div className="overflow-x-auto">
                    <EditableTable
                      handleSelectCheckbox={(...props)=>handleBomItem(...props)}
                      handleSelectAllCheckbox={(value) =>
                        handleAllBomItems(value, combinedBomHeads,key)
                      }
                      rows={combinedBomHeads}
                      columns={[{ name: "", type: "checkbox", minWidth: "3rem" },...tableHeader]}
                      tableHeader={key}
                    />
                  </div>
                </div>
              );
            }
          })}

        {/* Booked Items List */}
        {itemDetails && !showPreview && activeTab === 'Booked Items' &&
          Object.keys(itemDetails).map((key, index) => {
            const combinedBomHeads = itemDetails[key].reduce(
              (accumulator, currentValue) => {
                let itemList=[];
                currentValue.bom_items.map(item=>{
                  if(item.status === 'Booked'){
                    itemList.push(item)
                  }
                })
                return accumulator.concat(itemList);
              },
              []
            );

            // console.log('combinedBomHeads',key, combinedBomHeads);
            if (combinedBomHeads.length > 0) {
              return (
                <div key={index} className="mb-5">
                  <p className="text-zinc-800 text-sm font-bold tracking-tight mb-1">
                    {key}
                  </p>
                  <div className="overflow-x-auto">
                    <EditableTable
                      rows={combinedBomHeads}
                      columns={tableHeader}
                      tableHeader={key}
                    />
                  </div>
                </div>
              );
            }
          })}

          {showPreview && bookedItemList.length > 0 && <div className="mb-5">
            <p className="text-zinc-800 text-sm font-bold tracking-tight mb-1">
                    Booked Quantity Items
                  </p>

                  <div className="overflow-x-auto">
                    <EditableTable
                      rows={bookedItemList}
                      columns={tableHeader}
                    />
                  </div>
            </div>}
      </div>
    </FormModal>
  );
};

export default BookItemQuantity;
