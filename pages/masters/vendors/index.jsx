import { useState, useEffect } from "react";
import Button from "@/components/shared/Button";
import Loading from "@/components/Loading";
import dynamic from "next/dynamic";
import Search from "@/components/shared/SearchComponent";
import { LocalStorageService } from "@/services/LocalStorageHandler";
import { useRouter } from "next/router";
import Table from "@/components/SortableTable";
import { requestHandler } from "@/services/ApiHandler";
import { getVendors } from "@/services/api";
import { toast } from "sonner";
import CustomPagination from "@/components/shared/Pagination";
import { usePagination } from "@/hooks/usePagination";

const AddVendor = dynamic(() => import("@/components/modals/AddVendor"));

const Vendors = () => {
    const router = useRouter();
    const { pagination, resetToPageOne, handlePageChange } = usePagination({
        defaultPage: 1,
        defaultLimit: 25
    });
    const [allVendors, setAllVendors] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [allVendorsCount, setAllVendorsCount] = useState(0);
    const [search, setSearch] = useState("");

    const accessibilityInfo =
        LocalStorageService.get("user_accessibility").accessibility[0].master.pages
            .vendors ?? {};

    const tableHeader = [
        {
            name: "Name",
            sortable: true,
            key: "name",
            width: "30%",
        },
        { name: "Email", sortable: true, key: "email", width: "30%" },
        { name: "POC Name", sortable: true, key: "contact_person_name", width: "30%" },
        { name: "POC Contact", sortable: true, key: "contact_no", width: "10%" },
        {
            name: "Action", type: "actions-column",
            actionType: "edit",
            width: "5rem",
            onClickEdit: (row) => {
                router.push(`/masters/vendors/edit-vendor-details/${row.id}`);
            },
        }
    ];

    useEffect(() => {
        getVendorsHandler();
    }, [pagination.page, pagination.limit]);

    const getVendorsHandler = async () => {
        await requestHandler(
            async () => await getVendors({
                page: pagination.page,
                limit: pagination.limit,
            }),
            setIsLoading,
            (data) => {
                setAllVendors(data.data.output);
                setAllVendorsCount(data.data.length);
            },
            toast.error
        );
    };

    const vendors = (allVendors || []).filter(vendor => vendor.name.toLowerCase().includes(search.toLowerCase()));


    return (
        <>
            <div className="flex justify-between items-center gap-4">
                <h2 className="text-orange-500 text-xl font-bold tracking-tight">
                    Vendor
                </h2>
                <div className="flex flex-row gap-3 items-center">
                    <Search
                        searchText={(data) => {
                            setSearch(data);
                        }}
                        searchPlaceholder="Search.."
                        value={search}
                    />
                    {accessibilityInfo?.add_view && (
                        <Button className="px-3" onClick={() => router.push("/masters/vendors/create-new-vendor")}>
                            Add Vendor
                        </Button>
                    )}
                </div>
            </div>
            {!isLoading && (
                <div className="min-h-[85vh] overflow-hidden bg-white p-5">
                    <div className="overflow-auto h-[94%] mb-4">
                        <Table
                            columns={tableHeader}
                            rows={vendors}
                            {...(accessibilityInfo?.view_details && {
                                onRowClick: (row) => {
                                    router.push(`/masters/vendors/view-vendor-details/${row.id}`);
                                },
                            })}
                        />
                    </div>
                    <div className="relative">
                        <CustomPagination
                            currentPage={pagination.page}
                            totalRows={allVendorsCount}
                            rowsPerPage={pagination.limit}
                            onPageChange={handlePageChange}
                        />
                        <span className="absolute right-0 top-1">
                            <strong>Total Count: </strong>
                            {allVendorsCount}
                        </span>
                    </div>
                </div>
            )}
            {isLoading && <Loading />}
            <AddVendor modalId={"add-vendor"} />
        </>
    );
};

export default Vendors;
