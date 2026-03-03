import { useState, useEffect } from "react";
import { getVendors } from "@/services/vendor-services/api";
import { requestHandler } from "@/services/vendor-services/ApiHandler";
import { toast } from "sonner";
import { LocalStorageService } from "@/services/LocalStorageHandler";
import Table from "../../components/SortableTable";
import Button from "../../components/shared/Button";
import { useRouter } from "next/router";

const VendorsList = () => {
    const router = useRouter();
    const [vendors, setVendors] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const vendorToken = LocalStorageService.get("vendor_token");
        if (vendorToken) {
            getVendorsList(vendorToken);
        } else {
            router.push("/vendor-registration/login");
        }
    }, []);

    const tableHeader = [
        { name: "Vendor Name", key: "vendor_name", width: '20%' },
        { name: "PAN", key: "pan", width: "10%" },
        { name: "City", key: "city", width: "10%" },
        { name: "State", key: "state", width: '15%' },
        { name: "Address", key: "address", width: '30%' },
        { name: "Contact Person", key: "contact_person", width: '15%' },
        { name: "Phone", key: "phone", width: '5%' },
        {
            name: "Actions",
            type: "actions-column",
            actionType: "edit",
            width: "5rem",
            onClickEdit: (row) => {
                router.push(`/vendor-registration/edit-vendor-details/${row.uuid}`);
            },
        },
    ];

    const getVendorsList = async (token) => {
        await requestHandler(
            async () => await getVendors({ 'temp_token': token }),
            null,
            (data) => {
                const formattedVendors = data.data.output.vendors_data.map((vendor) => {
                    return {
                        vendor_name: vendor.vendor.name,
                        pan: vendor.vendor.pan,
                        city: vendor.vendor.city_name,
                        state: vendor.vendor.state_name,
                        address: vendor.vendor.address,
                        contact_person: vendor.vendor.contact_person_name,
                        phone: vendor.vendor.contact_no,
                        uuid: vendor.vendor.uuid,
                    };
                });
                setVendors(formattedVendors);
                setIsLoading(false);
            },
            toast.error
        );
    };


    return (
        <>
            <div className="flex justify-between items-center gap-4">
                <h4 className="text-primary text-xl font-bold tracking-tight">
                    Vendor List
                </h4>

                <Button
                    className={"px-2"}
                    onClick={() => router.push("/vendor-registration/create-new-vendor")}
                >
                    Add New Vendor
                </Button>
            </div>
            {!isLoading && (
                <div className="min-h-[85vh] overflow-hidden bg-white p-5">
                    <div className="overflow-auto h-[95%] mb-2">
                        <Table
                            columns={tableHeader}
                            rows={vendors}
                            onRowClick={(row) => {
                                router.push(`/vendor-registration/view-vendor-details/${row.uuid}`);
                            }} />
                    </div>
                </div>)}
        </>
    );
};

export default VendorsList;