import { useState } from 'react';
import FormModal from '../shared/FormModal';
import Input from '../formPage/Input';
import { SelectForObjects } from '../formPage/MultiSelectDropdown/MultiSelectDropdown';
import { checkSpecificKeys } from '@/utils/formValidationHandler';
import { addProjectInstaller } from '@/services/api';
import { requestHandler } from '@/services/ApiHandler';
import { toast } from 'sonner';
import { useModal } from '@/contexts/modal';
import { useRouter } from 'next/router';
import { useSalesPerson } from '@/contexts/salesperson';

const AddSiteStaff = ({ modalId, onSuccessfullSubmit, heading = 'Engineer' }) => {
  const { closeModal } = useModal();
  const router = useRouter();
  const { salesPersons } = useSalesPerson();
  const { projectId } = router.query;

  const [siteVisitDetails, setSiteVisitDetails] = useState({
    project: projectId,
    installer: '',
    start_date: '',
    end_date: '',
    remark: '',
  });

  const valueHandler = (e) => {
    setSiteVisitDetails((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async () => {
    const keysToCheck = {
      installer: 'Installer',
      start_date: 'Start Date',
      end_date: 'End Date',
    };
    const validationResult = checkSpecificKeys(siteVisitDetails, keysToCheck);
    if (validationResult.isValid === false) {
      toast.error(validationResult.message);
      return;
    }

    await requestHandler(
      async () => await addProjectInstaller(siteVisitDetails),
      null,
      async (data) => {
        toast.success('Installer Added Successfully...');
        closeModal('add-site-staff');
        clearForm();
        onSuccessfullSubmit();
      },
      toast.error
    );
  };

  const clearForm = () => {
    setSiteVisitDetails({
      project: '',
      installer: '',
      start_date: '',
      end_date: '',
      remark: '',
    });
  };

  return (
    <FormModal
      id={modalId}
      width='w-[60%]'
      ctaText={'Add'}
      heading={`Add Site ${heading}`}
      onSubmit={onSubmit}
      onClose={clearForm}
    >
      <div className='grid grid-cols-2 gap-x-2.5 gap-y-5 overflow-scroll p-2'>
        <SelectForObjects
          margin={'0px'}
          mandatory
          height={'36px'}
          setselected={(name, id) => {
            setSiteVisitDetails((prev) => ({
              ...prev,
              installer: Number(id),
              installer_name: name,
            }));
          }}
          selected={siteVisitDetails.installer_name}
          options={salesPersons}
          optionName={'name'}
          optionID={'id'}
          placeholder='Select..'
          dropdownLabel={'Site'}
        />

        <Input
          mandatory={true}
          type={'date'}
          onChange={valueHandler}
          value={siteVisitDetails.start_date}
          name={'start_date'}
          label={'Start Date'}
        />
        <Input
          type={'date'}
          mandatory={true}
          onChange={valueHandler}
          value={siteVisitDetails.end_date}
          name={'end_date'}
          label={'End Date'}
        />
        <Input
          type={'textarea'}
          outerClass='col-span-2'
          onChange={valueHandler}
          value={siteVisitDetails.remark}
          name={'remark'}
          label={'Remark'}
        />
      </div>
    </FormModal>
  );
};

export default AddSiteStaff;
