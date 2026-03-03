import { useState, useEffect } from 'react';
import FormModal from '../shared/FormModal';
import Input from '../formPage/Input';
import { addProjectPaymentInvoice, editProjectPaymentInvoice } from '@/services/api';
import { requestHandler } from '@/services/ApiHandler';
import { useModal } from '@/contexts/modal';
import { toast } from 'sonner';
import { FaEye } from 'react-icons/fa';
import { handleFileUpload } from '@/utils/documentUploadHandler';
import { checkSpecificKeys } from '@/utils/formValidationHandler';
import Loading from '../Loading';

const AddPaymentInvoiceModal = ({ modalId, projectId, onSuccessfullInvoiceSubmit, details }) => {
  const { closeModal } = useModal();
  const [isDocUploading, setIsDocUploading] = useState(false);
  const [editData, setEditData] = useState({});
  const [paymentDetails, setPaymentDetails] = useState({
    project: projectId,
    invoice_amount_without_gst: '',
    invoice_amount_with_gst: '',
    invoice_date: '',
    invoice_doc: '',
    invoice_no: '',
    packing_list_no: '',
    remark: '',
  });

  useEffect(() => {
    if (details) {
      setPaymentDetails(details);
    }
  }, [details]);

  const handleFile = async (e) => {
    setIsDocUploading(true);
    const response = await handleFileUpload(e.target.files[0]);
    if (response.type === 'success') {
      setPaymentDetails({ ...paymentDetails, invoice_doc: response.data });
      setEditData({ ...editData, invoice_doc: response.data });
    } else {
      toast.error(response.error || 'Oops! Something went wrong');
    }
    setIsDocUploading(false);
  };

  const valueHandler = (e) => {
    const regex = /^\d*\.?\d+$/;
    if (
      (e.target.name === 'invoice_amount_with_gst' ||
        e.target.name === 'invoice_amount_without_gst') &&
      !regex.test(e.target.value)
    ) {
      setPaymentDetails((prev) => ({
        ...prev,
        [e.target.name]: '',
      }));
      setEditData((prev) => ({
        ...prev,
        [e.target.name]: '',
      }));
    } else {
      setPaymentDetails((prev) => ({
        ...prev,
        [e.target.name]: e.target.value,
      }));
      setEditData((prev) => ({
        ...prev,
        [e.target.name]: e.target.value,
      }));
    }
  };

  const onSubmit = async () => {
    let keysToCheck = {
      invoice_no: 'Invoice No',
      invoice_date: 'Invoice Date',
      invoice_amount_without_gst: 'Invoice Amount(Without GST)',
      invoice_amount_with_gst: 'Invoice Amount(With GST)',
      invoice_doc: 'Invocie Doc',
    };

    const validationResult = checkSpecificKeys(paymentDetails, keysToCheck);
    if (validationResult.isValid === false) {
      toast.error(validationResult.message);
      return;
    }

    const postData = { ...paymentDetails, invoice_category: 'Ornate Agencies Pvt Ltd' };

    if (modalId.split('-')[0] === 'add') {
      await requestHandler(
        async () => await addProjectPaymentInvoice(postData),
        null,
        async (data) => {
          closeModal(modalId);
          toast.success('Invoice Added Successfully...');
          clearForm();
          onSuccessfullInvoiceSubmit();
        },
        toast.error
      );
    } else {
      await requestHandler(
        async () => await editProjectPaymentInvoice(paymentDetails.id, editData),
        null,
        async (data) => {
          closeModal(modalId);
          toast.success('Invoice Edited Successfully...');
          setEditData({});
          onSuccessfullInvoiceSubmit();
        },
        toast.error
      );
    }
  };

  const clearForm = () => {
    setPaymentDetails({
      project: projectId,
      invoice_amount_without_gst: '',
      invoice_amount_with_gst: '',
      invoice_date: '',
      invoice_doc: '',
      invoice_no: '',
      packing_list_no: '',
      remark: '',
    });
  };

  return (
    <FormModal
      id={modalId}
      onSubmit={onSubmit}
      ctaText={'Save'}
      heading={modalId.split('-')[0] === 'add' ? 'Add Ornate Invoice' : 'Edit Ornate Invoice'}
      onClose={() => {
        if (modalId.split('-')[0] === 'add') {
          clearForm();
        }
      }}
    >
      <div className='grid grid-cols-2 gap-x-2.5 gap-y-5 overflow-y-auto'>
        <Input
          type={'text'}
          mandatory={true}
          value={paymentDetails.invoice_no}
          onChange={valueHandler}
          placeholder={'Invoice No'}
          name='invoice_no'
          label={'Invoice No'}
        />
        <Input
          type={'date'}
          mandatory={true}
          value={paymentDetails.invoice_date}
          onChange={valueHandler}
          name='invoice_date'
          label={'Invoice Date'}
        />
        <Input
          type={'number'}
          mandatory={true}
          value={paymentDetails.invoice_amount_without_gst}
          onChange={valueHandler}
          placeholder={'0.0'}
          name='invoice_amount_without_gst'
          label={'Invoice Amount(Without GST)'}
        />

        <Input
          type={'number'}
          mandatory={true}
          value={paymentDetails.invoice_amount_with_gst}
          onChange={valueHandler}
          placeholder={'0.0'}
          name='invoice_amount_with_gst'
          label={'Invoice Amount(With GST)'}
        />

        <span className='w-full flex gap-2 items-end'>
          <Input type='file' onChange={handleFile} mandatory={true} label={'Invoice Document'} />
          {isDocUploading && <Loading size='w-8 h-8' />}
          {paymentDetails.invoice_doc && paymentDetails.invoice_doc !== '' && (
            <FaEye
              size={15}
              className='cursor-pointer mb-3'
              onClick={() => window.open(paymentDetails.invoice_doc, '__blank')}
            />
          )}
        </span>

        <Input
          type={'text'}
          value={paymentDetails.packing_list_no}
          onChange={valueHandler}
          name='packing_list_no'
          label={'Packing List'}
        />

        <Input
          type={'textarea'}
          value={paymentDetails.remark}
          onChange={valueHandler}
          outerClass='col-span-2'
          placeholder={'Enter Remark'}
          name='remark'
          label={'Remark'}
        />
      </div>
    </FormModal>
  );
};

export default AddPaymentInvoiceModal;
