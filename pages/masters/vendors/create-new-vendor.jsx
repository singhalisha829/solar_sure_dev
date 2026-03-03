import { useState, useEffect, useRef } from "react";
import Input from "@/components/formPage/Input";
import { SelectForObjects } from "@/components/formPage/MultiSelectDropdown/MultiSelectDropdown";
import { FaBuilding, FaFileAlt, FaMapMarkerAlt, FaUniversity, FaCheckCircle, FaArrowLeft } from "react-icons/fa";
import { getStates, getCity, addVendor } from "@/services/api";
import { toast } from "sonner";
import Router from "next/router";
import { buildVendorPayload } from "@/utils/payloadMapper";
import { checkPincodeValue, checkContactField } from "@/utils/formValidationHandler";
import Button from "@/components/shared/Button";
import { MdArrowForwardIos } from "react-icons/md";
import { requestHandler } from "@/services/ApiHandler";
import { axiosInstance } from "@/services/ApiHandler";
import { useVendors } from "@/contexts/vendors";

const VendorRegistrationForm = () => {
    const { getVendorsHandler } = useVendors();
    const [currentStep, setCurrentStep] = useState(1);
    const [errors, setErrors] = useState({});
    const [states, setStates] = useState([]);
    const [city, setCity] = useState([]);
    const [corrCity, setCorrCity] = useState([]);
    const [branchCity, setBranchCity] = useState([]);
    const [sameAsRegistered, setSameAsRegistered] = useState(false);
    const formContainerRef = useRef(null);

    useEffect(() => {
        getStatesHandler();
    }, []);

    // Step 1 - Company Information
    const [formData, setFormData] = useState({
        // Company Details
        company_name: "",
        cin_number: "",
        pan_number: "",
        gst_number: "",

        //documents
        documents: {},

        // registered office Information
        address: "",
        city: "",
        state: "",
        pincode: "",

        //correspondence address
        corr_address: "",
        corr_city: "",
        corr_state: "",
        corr_pincode: "",

        // contact details
        poc_name: "",
        poc_email: "",
        poc_phone: "",
        poc_fax: "",
        poc_telephone: "",

        // Account Holder Details
        account_holder_name: "",
        account_holder_contact: "",
        account_holder_telephone: "",

        //Bank Details
        bank_name: "",
        account_number: "",
        currency_type: "",
        account_type: "",
        account_type_limit: "",
        branch_name: "",
        ifsc_code: "",
        branch_contact: "",

        //branch address
        branch_address: "",
        branch_city: "",
        branch_state: "",
        branch_pincode: "",

        //RM Details
        rm_name: "",
        rm_phone: "",
        branch_code: "",
        micr_code: "",
        swift_code: "",
        crn_no: "",
        customer_id_with_banker: "",
    });

    const accountTypes = [{ name: 'Savings Account', value: "saving" }, { name: 'Current Account', value: "current" }, { name: 'CC/OD Limit Account', value: "cc_od" }];


    const getStatesHandler = async () => {
        await requestHandler(
            async () => await getStates(),
            null,
            (data) => setStates(data.data.output),
            toast.error
        );
    };

    const getCityHandler = async (id, field) => {
        await requestHandler(
            async () => await getCity(id),
            null,
            (data) => {
                if (field === 'state') {
                    setCity(data.data.output);
                } else if (field === 'corr_state') {
                    setCorrCity(data.data.output);
                } else if (field === 'branch_state') {
                    setBranchCity(data.data.output);
                }
            },
            toast.error
        );
    };

    const pincodeHandler = (field) => (e) => {
        if (checkPincodeValue(e) != null) {
            handleInputChange(field)(e);
        }
    };

    const contactHandler = (field) => (e) => {
        if (checkContactField(e) != null) {
            handleInputChange(field)(e);
        }
    };

    const handleInputChange = (field) => (e) => {
        let value = e.target.value;
        if (field === "account_number") {
            // Remove non-digits
            value = value.replace(/[^\d]/g, "");

            // Remove leading zeros (optional)
            value = value.replace(/^0+/, "");
        }
        setFormData({
            ...formData,
            [field]: value,
        });
        if (errors[field]) {
            setErrors({
                ...errors,
                [field]: "",
            });
        }
    };

    const handleSelectChange = (field) => (name, id) => {
        if (['state', 'corr_state', 'branch_state'].includes(field)) {
            getCityHandler(id, field);
        }
        setFormData({
            ...formData,
            [field]: id,
        });
        if (errors[field]) {
            setErrors({
                ...errors,
                [field]: "",
            });
        }
    };

    const handleFileChange = (fileName) => async (e) => {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append("file", file);
        try {
            const { data } = await axiosInstance.post(
                "/api/document-upload/",
                formData
            );
            if (data.status.code == 200) {
                setFormData((prevFormData) => ({
                    ...prevFormData,
                    documents: {
                        ...prevFormData.documents,
                        [fileName]: { document: data.path, url: data.document }
                    }
                }));
            }
        } catch (error) {
            toast.error;
        }
    };

    const handleSameAsRegistered = (isChecked) => {
        setSameAsRegistered(isChecked);
        if (isChecked) {
            setFormData({
                ...formData,
                corr_address: formData.address,
                corr_city: formData.city,
                corr_state: formData.state,
                corr_pincode: formData.pincode,
            });
            setCorrCity(city);
        } else {
            setFormData({
                ...formData,
                corr_address: "",
                corr_city: "",
                corr_state: "",
                corr_pincode: "",
            });
            setCorrCity([]);
        }
    };

    const validateStep1 = () => {
        const newErrors = {};

        // Company Details
        if (!formData.company_name?.trim()) {
            newErrors.company_name = "Company name is required";
        }
        if (!formData.cin_number?.trim()) {
            newErrors.cin_number = "CIN number is required";
        }
        if (!formData.pan_number?.trim()) {
            newErrors.pan_number = "PAN number is required";
        }

        // Registered Office Address
        if (!formData.address?.trim()) {
            newErrors.address = "Address is required";
        }
        if (!formData.state) {
            newErrors.state = "State is required";
        }
        if (!formData.city) {
            newErrors.city = "City is required";
        }
        if (!formData.pincode?.toString().trim()) {
            newErrors.pincode = "Pincode is required";
        }

        // Correspondence Address
        if (!formData.corr_address?.trim()) {
            newErrors.corr_address = "Correspondence address is required";
        }
        if (!formData.corr_state) {
            newErrors.corr_state = "State is required";
        }
        if (!formData.corr_city) {
            newErrors.corr_city = "City is required";
        }
        if (!formData.corr_pincode?.toString().trim()) {
            newErrors.corr_pincode = "Pincode is required";
        }

        // Point of Contact
        if (!formData.poc_name?.trim()) {
            newErrors.poc_name = "Contact name is required";
        }
        if (!formData.poc_email?.trim()) {
            newErrors.poc_email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.poc_email)) {
            newErrors.poc_email = "Invalid email format";
        }
        if (!formData.poc_phone?.toString().trim()) {
            newErrors.poc_phone = "Phone number is required";
        }
        // if (!formData.poc_telephone?.trim()) {
        //     newErrors.poc_telephone = "Telephone number is required";
        // }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors = {};

        // Account Holder Details
        if (!formData.account_holder_name?.trim()) {
            newErrors.account_holder_name = "Account holder name is required";
        }

        // Bank Account Details
        if (!formData.bank_name?.trim()) {
            newErrors.bank_name = "Bank name is required";
        }
        if (!formData.account_number?.toString().trim()) {
            newErrors.account_number = "Account number is required";
        }
        if (!formData.account_type) {
            newErrors.account_type = "Account type is required";
        }
        if (!formData.branch_name?.trim()) {
            newErrors.branch_name = "Branch name is required";
        }
        if (!formData.ifsc_code?.trim()) {
            newErrors.ifsc_code = "IFSC code is required";
        }

        // Branch Address
        if (!formData.branch_address?.trim()) {
            newErrors.branch_address = "Branch address is required";
        }
        if (!formData.branch_state) {
            newErrors.branch_state = "State is required";
        }
        if (!formData.branch_city) {
            newErrors.branch_city = "City is required";
        }
        if (!formData.branch_pincode?.toString().trim()) {
            newErrors.branch_pincode = "Pincode is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep1()) {
            setCurrentStep(2);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setTimeout(() => {
                if (formContainerRef.current) {
                    formContainerRef.current.scrollTop = 0;
                }
            }, 0);
        }
    };

    const handleBack = () => {
        setCurrentStep(1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
            if (formContainerRef.current) {
                formContainerRef.current.scrollTop = 0;
            }
        }, 0);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateStep2()) {
            handleSubmitForm();
        }
    };

    const handleSubmitForm = async () => {
        // Submit form data to the server or perform desired actions
        const payload = buildVendorPayload(formData);

        await requestHandler(
            async () => await addVendor(payload),
            null,
            async (data) => {
                toast.success("Vendor Registered Successfully!");
                Router.back();
                await getVendorsHandler();
            },
            toast.error
        );
    }

    return (
        <>
            {/* Header */}
            <div className="flex justify-between items-center gap-4">
                <h2 className="flex text-xl font-bold tracking-tight">
                    <span
                        className="flex text-orange-500 hover:underline underline-offset-4 cursor-pointer"
                        onClick={() => Router.back()}
                    >
                        Vendors
                    </span>
                    <MdArrowForwardIos className="mt-1 text-orange-500" />
                    Vendor Registration
                </h2>
            </div>

            {/* Progress Indicator */}
            <div className="mb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${currentStep >= 1
                                ? "bg-primary text-white"
                                : "bg-zinc-300 text-zinc-600"
                                }`}
                        >
                            1
                        </div>
                        <span className="ml-3 font-semibold text-sm">
                            Company Information
                        </span>
                    </div>
                    <div className="flex-1 h-1 bg-zinc-300 mx-4">
                        <div
                            className={`h-full transition-all duration-300 ${currentStep >= 2 ? "bg-primary w-full" : "w-0"
                                }`}
                        />
                    </div>
                    <div className="flex items-center">
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${currentStep >= 2
                                ? "bg-primary text-white"
                                : "bg-zinc-300 text-zinc-600"
                                }`}
                        >
                            2
                        </div>
                        <span className="ml-3 font-semibold text-sm">
                            Banking Details
                        </span>
                    </div>
                </div>
            </div>

            {/* Form Content */}
            <div ref={formContainerRef} className="bg-white rounded-2xl shadow-lg overflow-auto">
                <form onSubmit={handleSubmit}>
                    {/* Step 1: Company Information */}
                    {currentStep === 1 && (
                        <div className="p-8">
                            {/* Company Details Section */}
                            <div className="mb-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                        <FaBuilding className="text-blue-600" size={15} />
                                    </div>
                                    <h2 className="text-xl font-bold text-zinc-800">Company Details</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        label="Company Name"
                                        type="text"
                                        value={formData.company_name}
                                        onChange={handleInputChange("company_name")}
                                        placeholder="Enter company name"
                                        mandatory
                                        error={errors.company_name}
                                    />

                                    <Input
                                        label="CIN Number"
                                        type="text"
                                        value={formData.cin_number}
                                        onChange={handleInputChange("cin_number")}
                                        placeholder="Enter CIN number"
                                        mandatory
                                        error={errors.cin_number}
                                    />

                                    <Input
                                        label="GST Number"
                                        type="text"
                                        value={formData.gst_number}
                                        onChange={handleInputChange("gst_number")}
                                        placeholder="Enter GST number"
                                    />

                                    <Input
                                        label="PAN Number"
                                        type="text"
                                        value={formData.pan_number}
                                        onChange={handleInputChange("pan_number")}
                                        placeholder="Enter PAN number"
                                        mandatory
                                        error={errors.pan_number}
                                    />
                                </div>
                            </div>

                            {/* Documents Section */}
                            <div className="mb-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 rounded-lg bg-primary-light-10 flex items-center justify-center">
                                        <FaFileAlt className="text-primary" size={15} />
                                    </div>
                                    <h2 className="text-xl font-bold text-zinc-800">Documents</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        label="Certificate of Incorporation"
                                        type="file"
                                        onChange={handleFileChange("COI Document")}
                                        fileUrl={formData.documents['COI Document']?.url}
                                        fileTypes=".pdf,.jpg,.png"
                                    />

                                    <Input
                                        label="Memorandum of Association"
                                        type="file"
                                        onChange={handleFileChange("MOA Document")}
                                        fileUrl={formData.documents['MOA Document']?.url}
                                        fileTypes=".pdf,.jpg,.png"
                                    />

                                    <Input
                                        label="Articles of Association"
                                        type="file"
                                        onChange={handleFileChange("AOA Document")}
                                        fileUrl={formData.documents['AOA Document']?.url}
                                        fileTypes=".pdf,.jpg,.png"
                                    />

                                    <Input
                                        label="PAN Card"
                                        type="file"
                                        onChange={handleFileChange("PAN Document")}
                                        fileUrl={formData.documents['PAN Document']?.url}
                                        fileTypes=".pdf,.jpg,.png"
                                    />

                                    <Input
                                        label="GST Certificate"
                                        type="file"
                                        onChange={handleFileChange("GST Certificate")}
                                        fileUrl={formData.documents["GST Certificate"]?.url}
                                        fileTypes=".pdf,.jpg,.png"
                                    />

                                    <Input
                                        label="Cancelled Cheque"
                                        type="file"
                                        onChange={handleFileChange("Cancelled Cheque")}
                                        fileUrl={formData.documents["Cancelled Cheque"]?.url}
                                        fileTypes=".pdf,.jpg,.png"
                                    />
                                </div>
                            </div>

                            {/* Registered Office Address */}
                            <div className="mb-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 rounded-lg bg-primary-light-10 flex items-center justify-center">
                                        <FaMapMarkerAlt className="text-primary" size={15} />
                                    </div>
                                    <h2 className="text-xl font-bold text-zinc-800">Registered Office Address</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <Input
                                            label="Address"
                                            type="textarea"
                                            value={formData.address}
                                            onChange={handleInputChange("address")}
                                            placeholder="Enter complete address"
                                            textareaRows={2}
                                            mandatory
                                            error={errors.address}
                                        />
                                    </div>

                                    <SelectForObjects
                                        dropdownLabel="State"
                                        options={states}
                                        optionName="name"
                                        optionID="id"
                                        selected={states.find(s => s.id === formData.state)?.name || ""}
                                        setselected={handleSelectChange("state")}
                                        placeholder="Select state"
                                        mandatory
                                        error={errors.state}
                                    />

                                    <SelectForObjects
                                        dropdownLabel="City"
                                        options={city}
                                        optionName="name"
                                        optionID="id"
                                        selected={city.find(c => c.id === formData.city)?.name || ""}
                                        setselected={handleSelectChange("city")}
                                        placeholder="Select city"
                                        mandatory
                                        error={errors.city}
                                    />

                                    <Input
                                        label="Pincode"
                                        type="number"
                                        value={formData.pincode}
                                        onChange={pincodeHandler("pincode")}
                                        placeholder="Enter pincode"
                                        mandatory
                                        error={errors.pincode}
                                    />
                                </div>
                            </div>

                            {/* Correspondence Address */}
                            <div className="mb-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 rounded-lg bg-primary-light-10 flex items-center justify-center">
                                        <FaMapMarkerAlt className="text-primary" size={15} />
                                    </div>
                                    <h2 className="text-xl font-bold text-zinc-800">Correspondence Address</h2>
                                    <label className="flex items-center gap-2 text-sm cursor-pointer ml-10">
                                        <input
                                            type="checkbox"
                                            checked={sameAsRegistered}
                                            onChange={(e) => handleSameAsRegistered(e.target.checked)}
                                            className="accent-orange-500"
                                        />
                                        <strong className="text-base">Same as registered address</strong>
                                    </label>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <Input
                                            label="Address"
                                            type="textarea"
                                            value={formData.corr_address}
                                            onChange={handleInputChange("corr_address")}
                                            placeholder="Enter correspondence address"
                                            textareaRows={2}
                                            mandatory
                                            error={errors.corr_address}
                                        />
                                    </div>

                                    <SelectForObjects
                                        dropdownLabel="State"
                                        options={states}
                                        optionName="name"
                                        optionID="id"
                                        selected={states.find(s => s.id === formData.corr_state)?.name || ""}
                                        setselected={handleSelectChange("corr_state")}
                                        placeholder="Select state"
                                        mandatory
                                        error={errors.corr_state}
                                    />

                                    <SelectForObjects
                                        dropdownLabel="City"
                                        options={corrCity}
                                        optionName="name"
                                        optionID="id"
                                        selected={corrCity.find(c => c.id === formData.corr_city)?.name || ""}
                                        setselected={handleSelectChange("corr_city")}
                                        placeholder="Select city"
                                        mandatory
                                        error={errors.corr_city}
                                    />

                                    <Input
                                        label="Pincode"
                                        type="number"
                                        value={formData.corr_pincode}
                                        onChange={pincodeHandler("corr_pincode")}
                                        placeholder="Enter pincode"
                                        mandatory
                                        error={errors.corr_pincode}
                                    />
                                </div>
                            </div>

                            {/* Point of Contact */}
                            <div className="mb-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 rounded-lg bg-primary-light-10 flex items-center justify-center">
                                        <FaBuilding className="text-primary" size={15} />
                                    </div>
                                    <h2 className="text-xl font-bold text-zinc-800">Point of Contact</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        label="Name"
                                        type="text"
                                        value={formData.poc_name}
                                        onChange={handleInputChange("poc_name")}
                                        placeholder="Enter contact name"
                                        mandatory
                                        error={errors.poc_name}
                                    />

                                    <Input
                                        label="Email"
                                        type="email"
                                        value={formData.poc_email}
                                        onChange={handleInputChange("poc_email")}
                                        placeholder="contact@company.com"
                                        mandatory
                                        error={errors.poc_email}
                                    />

                                    <Input
                                        label="Phone"
                                        type="number"
                                        value={formData.poc_phone}
                                        onChange={contactHandler("poc_phone")}
                                        placeholder="Enter phone number"
                                        mandatory
                                        error={errors.poc_phone}
                                    />

                                    <Input
                                        label="Telephone"
                                        type="text"
                                        value={formData.poc_telephone}
                                        onChange={handleInputChange("poc_telephone")}
                                        placeholder="Enter Telephone number"
                                    // mandatory
                                    // error={errors.poc_telephone}
                                    />

                                    <Input
                                        label="Fax"
                                        type="text"
                                        value={formData.poc_fax}
                                        onChange={handleInputChange("poc_fax")}
                                        placeholder="Enter fax number"
                                    />
                                </div>
                            </div>

                            {/* Navigation */}
                            <div className="flex justify-end pt-6 border-t">
                                <Button
                                    onClick={handleNext}
                                    className="px-8"
                                >
                                    Next Step →
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Banking Details */}
                    {currentStep === 2 && (
                        <div className="p-8">
                            {/* Account Holder Details Section */}
                            <div className="mb-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 rounded-lg bg-primary-light-10 flex items-center justify-center">
                                        <FaBuilding className="text-primary" size={15} />
                                    </div>
                                    <h2 className="text-xl font-bold text-zinc-800">Account Holder Details</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        label="Account Holder Name"
                                        type="text"
                                        value={formData.account_holder_name}
                                        onChange={handleInputChange("account_holder_name")}
                                        placeholder="Enter account holder name"
                                        mandatory
                                        error={errors.account_holder_name}
                                    />

                                    <Input
                                        label="Account Holder Contact"
                                        type="number"
                                        value={formData.account_holder_contact}
                                        onChange={contactHandler("account_holder_contact")}
                                        placeholder="Enter contact number"
                                    />

                                    <Input
                                        label="Account Holder Telephone"
                                        type="text"
                                        value={formData.account_holder_telephone}
                                        onChange={handleInputChange("account_holder_telephone")}
                                        placeholder="Enter telephone number"
                                    />
                                </div>
                            </div>


                            {/* Bank Account Details Section */}
                            <div className="mb-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 rounded-lg bg-primary-light-10 flex items-center justify-center">
                                        <FaUniversity className="text-primary" size={15} />
                                    </div>
                                    <h2 className="text-xl font-bold text-zinc-800">Bank Account Details</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        label="Bank Name"
                                        type="text"
                                        value={formData.bank_name}
                                        onChange={handleInputChange("bank_name")}
                                        placeholder="Enter bank name"
                                        mandatory
                                        error={errors.bank_name}
                                    />

                                    <Input
                                        label="Account Number"
                                        type="number"
                                        value={formData.account_number}
                                        onChange={handleInputChange("account_number")}
                                        placeholder="Enter account number"
                                        mandatory
                                        error={errors.account_number}
                                    />

                                    <Input
                                        label="Currency Type"
                                        type="text"
                                        value={formData.currency_type}
                                        onChange={handleInputChange("currency_type")}
                                        placeholder="e.g., INR, USD"
                                    />

                                    <SelectForObjects
                                        dropdownLabel="Account Type"
                                        options={accountTypes}
                                        optionName="name"
                                        optionID="value"
                                        selected={accountTypes.find(a => a.value === formData.account_type)?.name || ""}
                                        setselected={handleSelectChange("account_type")}
                                        placeholder="Select account type"
                                        mandatory
                                        error={errors.account_type}
                                    />

                                    {formData.account_type === "cc_od" && (
                                        <Input
                                            label="Account Type Limit"
                                            type="number"
                                            value={formData.account_type_limit}
                                            onChange={handleInputChange("account_type_limit")}
                                            placeholder="Enter account limit"
                                        />)}

                                    <Input
                                        label="Branch Name"
                                        type="text"
                                        value={formData.branch_name}
                                        onChange={handleInputChange("branch_name")}
                                        placeholder="Enter branch name"
                                        mandatory
                                        error={errors.branch_name}
                                    />

                                    <Input
                                        label="IFSC Code"
                                        type="text"
                                        value={formData.ifsc_code}
                                        onChange={handleInputChange("ifsc_code")}
                                        placeholder="Enter IFSC code"
                                        mandatory
                                        error={errors.ifsc_code}
                                    />

                                    {/* <Input
                                            label="Branch Contact"
                                            type="text"
                                            value={formData.branch_contact}
                                            onChange={handleInputChange("branch_contact")}
                                            placeholder="Enter branch contact"
                                        /> */}

                                    <Input
                                        label="Branch Code"
                                        type="text"
                                        value={formData.branch_code}
                                        onChange={handleInputChange("branch_code")}
                                        placeholder="Enter branch code"
                                    />
                                </div>
                            </div>

                            {/* Branch Address Section */}
                            <div className="mb-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 rounded-lg bg-primary-light-10 flex items-center justify-center">
                                        <FaMapMarkerAlt className="text-primary" size={15} />
                                    </div>
                                    <h2 className="text-xl font-bold text-zinc-800">Branch Address</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <Input
                                            label="Address"
                                            type="textarea"
                                            value={formData.branch_address}
                                            onChange={handleInputChange("branch_address")}
                                            placeholder="Enter branch address"
                                            textareaRows={2}
                                            mandatory
                                            error={errors.branch_address}
                                        />
                                    </div>

                                    <SelectForObjects
                                        dropdownLabel="State"
                                        options={states}
                                        optionName="name"
                                        optionID="id"
                                        selected={states.find(s => s.id === formData.branch_state)?.name || ""}
                                        setselected={handleSelectChange("branch_state")}
                                        placeholder="Select state"
                                        mandatory
                                        error={errors.branch_state}
                                    />

                                    <SelectForObjects
                                        dropdownLabel="City"
                                        options={branchCity}
                                        optionName="name"
                                        optionID="id"
                                        selected={branchCity.find(c => c.id === formData.branch_city)?.name || ""}
                                        setselected={handleSelectChange("branch_city")}
                                        placeholder="Select city"
                                        mandatory
                                        error={errors.branch_city}
                                    />


                                    <Input
                                        label="Branch Pincode"
                                        type="number"
                                        value={formData.branch_pincode}
                                        onChange={pincodeHandler("branch_pincode")}
                                        placeholder="Enter pincode"
                                        mandatory
                                        error={errors.branch_pincode}
                                    />
                                </div>
                            </div>


                            {/* Relationship Manager Details Section */}
                            <div className="mb-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                                        <FaBuilding className="text-indigo-600" size={15} />
                                    </div>
                                    <h2 className="text-xl font-bold text-zinc-800">Relationship Manager Details</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        label="RM Name"
                                        type="text"
                                        value={formData.rm_name}
                                        onChange={handleInputChange("rm_name")}
                                        placeholder="Enter relationship manager name"
                                    />

                                    <Input
                                        label="RM Phone"
                                        type="number"
                                        value={formData.rm_phone}
                                        onChange={contactHandler("rm_phone")}
                                        placeholder="Enter phone number"
                                    />
                                </div>
                            </div>

                            {/* Additional Bank Details Section */}
                            <div className="mb-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                                        <FaFileAlt className="text-orange-600" size={15} />
                                    </div>
                                    <h2 className="text-xl font-bold text-zinc-800">Additional Bank Details</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                    <Input
                                        label="MICR Code"
                                        type="text"
                                        value={formData.micr_code}
                                        onChange={handleInputChange("micr_code")}
                                        placeholder="Enter MICR code"
                                    />

                                    <Input
                                        label="SWIFT Code"
                                        type="text"
                                        value={formData.swift_code}
                                        onChange={handleInputChange("swift_code")}
                                        placeholder="Enter SWIFT code"
                                    />

                                    <Input
                                        label="CRN Number"
                                        type="text"
                                        value={formData.crn_no}
                                        onChange={handleInputChange("crn_no")}
                                        placeholder="Enter CRN number"
                                    />

                                    <Input
                                        label="Customer ID with Banker"
                                        type="text"
                                        value={formData.customer_id_with_banker}
                                        onChange={handleInputChange("customer_id_with_banker")}
                                        placeholder="Enter customer ID"
                                    />
                                </div>
                            </div>

                            {/* Navigation */}
                            <div className="flex justify-between pt-6 border-t">
                                <Button
                                    variant="gray"
                                    className=" w-[5rem] mr-2 border bg-white border-dark-bluish-green px-2 text-xs hover:bg-dark-bluish-green hover:text-white"
                                    customText={true}
                                    onClick={handleBack}
                                >
                                    ← Previous
                                </Button>
                                <Button
                                    type="submit"
                                    className="px-8 flex items-center gap-2"
                                >
                                    <FaCheckCircle size={18} />
                                    Submit Registration
                                </Button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </>
    );
};

export default VendorRegistrationForm;