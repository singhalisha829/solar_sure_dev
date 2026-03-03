export const buildVendorPayload = (formData = {}, token = null, uuid = null) => {
    if (!formData) return null;

    // -------- Documents ----------
    const documents = Object.entries(formData.documents || {}).map(
        ([key, value]) => ({
            document_name: key,
            document: value?.document,
        })
    );

    // -------- Base Payload ----------
    let payload = {
        temp_token: token,

        name: formData.company_name,
        contact_person_name: formData.poc_name,
        contact_no: formData.poc_phone,
        telephone_no: formData.poc_telephone,
        fax_no: formData.poc_fax,
        email: formData.poc_email,

        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,

        pan: formData.pan_number,
        gst: formData.gst_number,
        cin_no: formData.cin_number,

        documents,
    };

    // -------- Vendor Address ----------
    payload.VendorAddress = {
        id: formData.corr_address_id || undefined,
        address_type: "correspondence",
        address: formData.corr_address,
        city: formData.corr_city,
        state: formData.corr_state,
        pincode: formData.corr_pincode,
    };

    // -------- Bank Account ----------
    payload.VendorBankAccount = {
        id: formData.bank_details_id || undefined,
        account_type: formData.account_type,
        cc_od_limit: formData.account_type_limit,

        account_holder_name: formData.account_holder_name,
        bank_name: formData.bank_name,
        branch_name: formData.branch_name,
        account_number: formData.account_number,
        ifsc_code: formData.ifsc_code,

        name_of_rm: formData.rm_name,
        rm_contact_no: formData.rm_phone,
        branch_code: formData.branch_code,
        currency: formData.currency_type,
        customer_id_with_bank: formData.customer_id_with_banker,
        crn_number: formData.crn_no,
        swift_code: formData.swift_code,
        micr_code: formData.micr_code,

        mobile_no_updated_in_bank: formData.account_holder_contact,
        telephone_no_updated_in_bank:
            formData.account_holder_telephone,

        bank_address: {
            id: formData.branch_address_id || undefined,
            address_type: "bank",
            address: formData.branch_address,
            city: formData.branch_city,
            state: formData.branch_state,
            pincode: formData.branch_pincode,
        },
    };

    // -------- CC / OD Limit ----------
    if (formData.account_type === "cc_od") {
        payload.VendorBankAccount.cc_od_limit =
            formData.account_type_limit;
    }

    // -------- Vendor UUID ----------
    if (uuid) {
        payload.vendor_uuid = uuid;
    }

    return cleanObject(payload);
};

const cleanObject = (obj) => {
    if (Array.isArray(obj)) {
        return obj
            .map(cleanObject)
            .filter((item) => item !== undefined);
    }

    if (obj && typeof obj === "object") {
        return Object.fromEntries(
            Object.entries(obj)
                .map(([key, value]) => [key, cleanObject(value)])
                .filter(
                    ([_, value]) =>
                        value !== "" &&
                        value !== null &&
                        value !== undefined &&
                        !(typeof value === "object" && Object.keys(value).length === 0)
                )
        );
    }

    return obj;
};
