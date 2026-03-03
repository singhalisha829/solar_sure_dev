import { useState, useEffect, use } from "react";
import { FaBuilding, FaFileAlt, FaMapMarkerAlt, FaUniversity, FaUser, FaDownload, FaEdit, FaArrowLeft } from "react-icons/fa";
import Router from "next/router";
import { LocalStorageService } from "@/services/LocalStorageHandler";
import { useRouter } from "next/router";
import { getVendors } from "@/services/vendor-services/api";
import { requestHandler } from "@/services/vendor-services/ApiHandler";
import { toast } from "sonner";

const VendorViewPage = () => {
    const router = useRouter();
    const { uuid } = router.query;
    const [vendor, setVendor] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    const correspondenceAddress = vendor && vendor?.addresses?.length > 0 ? vendor?.addresses.find((addr) => addr.address_type === "correspondence") : '';
    const bankAddress = vendor && vendor?.addresses?.length > 0 ? vendor?.addresses.find((addr) => addr.address_type === "bank") : '';
    const coiDocument = vendor && vendor.vendor?.documents?.length > 0 ? vendor.vendor.documents.find((doc) => doc.document_name === "COI Document") : null;
    const aoaDocument = vendor && vendor.vendor?.documents?.length > 0 ? vendor.vendor.documents.find((doc) => doc.document_name === "AOA Document") : null;
    const moaDocument = vendor && vendor.vendor?.documents?.length > 0 ? vendor.vendor.documents.find((doc) => doc.document_name === "MOA Document") : null;
    const panDocument = vendor && vendor.vendor?.documents?.length > 0 ? vendor.vendor.documents.find((doc) => doc.document_name === "PAN Document") : null;
    const gstDocument = vendor && vendor.vendor?.documents?.length > 0 ? vendor.vendor.documents.find((doc) => doc.document_name === "GST Certificate") : null;

    useEffect(() => {
        if (uuid) {
            const token = LocalStorageService.get("vendor_token");
            fetchVendorDetails(token, uuid);
        }
    }, [uuid]);

    const fetchVendorDetails = async (token, uuid) => {
        await requestHandler(
            async () => await getVendors({
                'temp_token': token,
                'uuid': uuid
            }),
            null,
            (data) => {
                setVendor(data.data.output.vendors_data[0]);
                setIsLoading(false);
            },
            toast.error
        );
    }

    const InfoCard = ({ icon, title, children, bgColor = "bg-blue-100", iconColor = "text-blue-600" }) => (
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-200">
                <div className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center`}>
                    {icon}
                </div>
                <h2 className="text-xl font-bold text-zinc-800">{title}</h2>
            </div>
            {children}
        </div>
    );

    const DataField = ({ label, value, fullWidth = false }) => (
        <div className={`${fullWidth ? 'col-span-2' : ''} mb-4`}>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1">{label}</p>
            <p className="text-base text-zinc-800 font-medium">{value || "N/A"}</p>
        </div>
    );

    const DocumentLink = ({ label, url }) => (
        <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg hover:bg-zinc-100 transition-colors">
            <div className="flex items-center gap-3">
                <FaFileAlt className="text-purple-600" size={16} />
                <span className="text-sm font-medium text-zinc-800">{label}</span>
            </div>
            {url ? (
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-semibold"
                >
                    <FaDownload size={14} />
                    Download
                </a>
            ) : (
                <span className="text-zinc-400 text-sm">Not uploaded</span>
            )}
        </div>
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="loader ease-linear rounded-full border-8 border-t-8 border-zinc-200 h-16 w-16"></div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4 overflow-scroll">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => Router.back()}
                        className="flex items-center gap-2 text-zinc-600 hover:text-zinc-800 mb-4 transition-colors"
                    >
                        <FaArrowLeft size={16} />
                        <span className="font-medium">Back</span>
                    </button>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-zinc-800 mb-2">Vendor Details</h1>
                            <p className="text-zinc-600">{vendor.vendor.name}</p>
                        </div>
                        <button
                            onClick={() => Router.push(`/vendor-registration/edit-vendor-details/${uuid}`)}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 hover:scale-105 transition-all duration-200"
                        >
                            <FaEdit size={16} />
                            Edit Details
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Company Details */}
                    <InfoCard
                        icon={<FaBuilding className="text-blue-600" size={20} />}
                        title="Company Details"
                        bgColor="bg-blue-100"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <DataField label="Company Name" value={vendor.vendor.name} fullWidth />
                            <DataField label="CIN Number" value={vendor.vendor.cin_no} />
                            <DataField label="PAN Number" value={vendor.vendor.pan} />
                            <DataField label="GST Number" value={vendor.vendor.gst} fullWidth />
                        </div>
                    </InfoCard>

                    {/* Point of Contact */}
                    <InfoCard
                        icon={<FaUser className="text-indigo-600" size={20} />}
                        title="Point of Contact"
                        bgColor="bg-indigo-100"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <DataField label="Contact Person" value={vendor.vendor.contact_person_name} fullWidth />
                            <DataField label="Email" value={vendor.vendor.email} fullWidth />
                            <DataField label="Phone" value={vendor.vendor.contact_no} />
                            <DataField label="Telephone" value={vendor.vendor.telephone_no} />
                            <DataField label="Fax" value={vendor.vendor.fax_no} fullWidth />
                        </div>
                    </InfoCard>

                    {/* Registered Office Address */}
                    <InfoCard
                        icon={<FaMapMarkerAlt className="text-green-600" size={20} />}
                        title="Registered Office Address"
                        bgColor="bg-green-100"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <DataField label="Address" value={vendor.vendor.address} fullWidth />
                            <DataField label="City" value={vendor.vendor.city_name} />
                            <DataField label="State" value={vendor.vendor.state_name} />
                            <DataField label="Pincode" value={vendor.vendor.pincode} />
                        </div>
                    </InfoCard>

                    {/* Correspondence Address */}
                    <InfoCard
                        icon={<FaMapMarkerAlt className="text-orange-600" size={20} />}
                        title="Correspondence Address"
                        bgColor="bg-orange-100"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <DataField label="Address" value={correspondenceAddress?.address} fullWidth />
                            <DataField label="City" value={correspondenceAddress?.city_name} />
                            <DataField label="State" value={correspondenceAddress?.state_name} />
                            <DataField label="Pincode" value={correspondenceAddress?.pincode} />
                        </div>
                    </InfoCard>

                    {/* Documents */}
                    <div className="lg:col-span-2">
                        <InfoCard
                            icon={<FaFileAlt className="text-purple-600" size={20} />}
                            title="Documents"
                            bgColor="bg-purple-100"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <DocumentLink label="Certificate of Incorporation" url={coiDocument?.document} />
                                <DocumentLink label="Memorandum of Association" url={moaDocument?.document} />
                                <DocumentLink label="Articles of Association" url={aoaDocument?.document} />
                                <DocumentLink label="PAN Card" url={panDocument?.document} />
                                <DocumentLink label="GST Certificate" url={gstDocument?.document} />
                            </div>
                        </InfoCard>
                    </div>

                    {/* Account Holder Details */}
                    <InfoCard
                        icon={<FaUser className="text-blue-600" size={20} />}
                        title="Account Holder Details"
                        bgColor="bg-blue-100"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <DataField label="Account Holder Name" value={vendor.bank_accounts[0]?.account_holder_name} fullWidth />
                            <DataField label="Contact Number" value={vendor.bank_accounts[0]?.mobile_no_updated_in_bank} />
                            <DataField label="Telephone" value={vendor.bank_accounts[0]?.telephone_no_updated_in_bank} />
                        </div>
                    </InfoCard>

                    {/* Bank Account Details */}
                    <InfoCard
                        icon={<FaUniversity className="text-purple-600" size={20} />}
                        title="Bank Account Details"
                        bgColor="bg-purple-100"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <DataField label="Bank Name" value={vendor.bank_accounts[0]?.bank_name} />
                            <DataField label="Branch Name" value={vendor.bank_accounts[0]?.branch_name} />
                            <DataField label="Account Number" value={vendor.bank_accounts[0]?.account_number} />
                            <DataField label="IFSC Code" value={vendor.bank_accounts[0]?.ifsc_code} />
                            <DataField label="Account Type" value={vendor.bank_accounts[0]?.account_type} />
                            <DataField label="Currency" value={vendor.bank_accounts[0]?.currency} />
                            <DataField label="Branch Code" value={vendor.bank_accounts[0]?.branch_code} />
                        </div>
                    </InfoCard>

                    {/* Branch Address */}
                    <InfoCard
                        icon={<FaMapMarkerAlt className="text-green-600" size={20} />}
                        title="Branch Address"
                        bgColor="bg-green-100"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <DataField label="Address" value={bankAddress?.address} fullWidth />
                            <DataField label="City" value={bankAddress?.city_name} />
                            <DataField label="State" value={bankAddress?.state_name} />
                            <DataField label="Pincode" value={bankAddress?.pincode} />
                        </div>
                    </InfoCard>

                    {/* Relationship Manager */}
                    <InfoCard
                        icon={<FaUser className="text-indigo-600" size={20} />}
                        title="Relationship Manager"
                        bgColor="bg-indigo-100"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <DataField label="RM Name" value={vendor.bank_accounts[0]?.name_of_rm} />
                            <DataField label="RM Phone" value={vendor.bank_accounts[0]?.rm_contact_no} />
                        </div>
                    </InfoCard>

                    {/* Additional Bank Details */}
                    <div className="lg:col-span-2">
                        <InfoCard
                            icon={<FaFileAlt className="text-orange-600" size={20} />}
                            title="Additional Bank Details"
                            bgColor="bg-orange-100"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <DataField label="MICR Code" value={vendor.bank_accounts[0]?.micr_code} />
                                <DataField label="SWIFT Code" value={vendor.bank_accounts[0]?.swift_code} />
                                <DataField label="CRN Number" value={vendor.bank_accounts[0]?.crn_number} />
                                <DataField label="Customer ID" value={vendor.bank_accounts[0]?.customer_id_with_bank} />
                            </div>
                        </InfoCard>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorViewPage;