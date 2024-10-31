import React, { useEffect, useState } from 'react';
import { Steps, message } from 'antd';
import { ProjectDetailsStep } from './ProjectDetailsStep';
import './VerificationReport.scss';
import { IntroductionStep } from './InstroductionStep';
import { MethodologyStep } from './MethodologyStep';
import { VerificationFindingStep } from './VerificationFindingStep';
import { VerificationOpinionStep } from './VerificationOpinionStep';
import { ReferenceStep } from './ReferenceStep';
import { AppendixStep } from './AppendixStep';
import { useForm } from 'antd/lib/form/Form';
import { useConnection } from '../../../Context/ConnectionContext/connectionContext';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import { DocumentTypeEnum } from '../../../Definitions/Enums/document.type.enum';
const StepperComponent = (props: any) => {
  const { useLocation, translator, countries } = props;
  const [current, setCurrent] = useState(0);
  const [lastVerificationReport, setLastVerificationReport] = useState(null);
  const [formValues, setFormValues] = useState({});
  const { get, post } = useConnection();
  const { id } = useParams();
  const t = translator.t;
  const reportVersion = process.env.VERIFICATION_REPORT_VERSION
    ? process.env.VERIFICATION_REPORT_VERSION
    : 'Version 03';
  const onValueChange = (newValues: any) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      ...newValues,
    }));
    console.log(JSON.stringify(formValues));
  };

  const onFinish = async (newValues: any) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      ...newValues,
    }));
    const body = { content: JSON.stringify({ ...formValues, ...newValues }), programmeId: id };
    try {
      const res = await post('national/verification/createVerificationReport', body);
      if (res?.statusText === 'SUCCESS') {
        message.open({
          type: 'success',
          content: t('verificationReport:createVerificationReportSuccess'),
          duration: 4,
          style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
        });
        // navigate('/programmeManagementSLCF/viewAll');
      }
    } catch (error: any) {
      if (error && error.errors && error.errors.length > 0) {
        error.errors.forEach((err: any) => {
          Object.keys(err).forEach((field) => {
            console.log(`Error in ${field}: ${err[field].join(', ')}`);
            message.open({
              type: 'error',
              content: err[field].join(', '),
              duration: 4,
              style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
            });
          });
        });
      } else {
        message.open({
          type: 'error',
          content: error?.message,
          duration: 4,
          style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
        });
      }
    }
  };
  const [projectDetailsForm] = useForm();
  const [introductionForm] = useForm();
  const [methodologyForm] = useForm();
  const [verificationFindingForm] = useForm();
  const [verificationOpinionForm] = useForm();
  const [referenceForm] = useForm();
  const [appendixForm] = useForm();

  const next = () => {
    setCurrent(current + 1);
  };

  const prev = () => {
    setCurrent(current - 1);
  };

  const getProjectById = async (programId: any) => {
    try {
      const { data } = await post('national/programmeSl/getProjectById', {
        programmeId: programId,
      });

      const {
        data: { user },
      } = await get('national/User/profile');
      console.log('-----response-------', data, user);

      projectDetailsForm.setFieldsValue({
        projectName: data?.title,
      });

      verificationFindingForm.setFieldsValue({
        siteLocations: [
          {
            siteLocation: '',
            commissioningDate: '',
          },
        ],
        complianceList: [
          {
            dataParameter: '',
            sourceOfData: '',
            reportedValue: '',
          },
        ],
        resolutionOfFindings: [
          {
            type: [],
            findingNo: '',
            refToMR: '',
            description: '',
            summary: '',
            assesment: '',
            conclusion: [],
          },
        ],
      });
    } catch (error) {
      console.log('error');
    }
  };

  const getLatestVerificationReport = async (programId: any) => {
    try {
      const { data } = await post('national/programmeSl/getDocLastVersion', {
        programmeId: programId,
        docType: DocumentTypeEnum.VERIFICATION_REPORT,
      });
      setLastVerificationReport(data);
    } catch (error) {
      console.log('error');
    }
  };

  const getLatestCMA = async (programId: any) => {
    try {
      const { data } = await post('national/programmeSl/getDocLastVersion', {
        programmeId: programId,
        docType: DocumentTypeEnum.CMA,
      });

      // const cmaData = JSON.parse(data?.content);
      const {
        data: { user },
      } = await get('national/User/profile');
      console.log('-----response-------', data, user);
    } catch (error) {
      console.log('error');
    }
  };

  const loadCMAForm = async () => {
    try {
      const { data } = await post('national/project/project');
      const cma = data.map((provinceData: any) => provinceData.provinceName);
    } catch (error) {
      console.log(error);
    }
  };

  const loadMonitoringReport = async () => {
    try {
      const { data } = await post('national/monitoring/monitoring');
      const cma = data.map((provinceData: any) => provinceData.provinceName);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getLatestVerificationReport(id);
    getProjectById(id);
  }, []);

  useEffect(() => {
    // loadProjectDetails();
    // loadCMAForm();
  }, []);
  const steps = [
    {
      title: (
        <div className="stepper-title-container">
          {/* <div className="step-count"></div> */}
          <div className="title">{t('verificationReport:title01')}</div>
        </div>
      ),
      description: (
        <ProjectDetailsStep
          useLocation={useLocation}
          translator={translator}
          current={current}
          form={projectDetailsForm}
          next={next}
          countries={countries}
          onValueChange={onValueChange}
        />
      ),
    },
    {
      title: (
        <div className="stepper-title-container">
          <div className="step-count">01</div>
          <div className="title">{t('verificationReport:title02')}</div>
        </div>
      ),
      description: (
        <IntroductionStep
          useLocation={useLocation}
          translator={translator}
          current={current}
          form={introductionForm}
          next={next}
          prev={prev}
          countries={countries}
          onValueChange={onValueChange}
        />
      ),
    },
    {
      title: (
        <div className="stepper-title-container">
          <div className="step-count">02</div>
          <div className="title">{t('verificationReport:title03')}</div>
        </div>
      ),
      description: (
        <MethodologyStep
          useLocation={useLocation}
          translator={translator}
          current={current}
          form={methodologyForm}
          next={next}
          prev={prev}
          onValueChange={onValueChange}
        />
      ),
    },
    {
      title: (
        <div className="stepper-title-container">
          <div className="step-count">03</div>
          <div className="title">{t('verificationReport:title04')}</div>
        </div>
      ),
      description: (
        <VerificationFindingStep
          useLocation={useLocation}
          translator={translator}
          current={current}
          form={verificationFindingForm}
          next={next}
          prev={prev}
          onValueChange={onValueChange}
        />
      ),
    },
    {
      title: (
        <div className="stepper-title-container">
          <div className="step-count">04</div>
          <div className="title">{t('verificationReport:title05')}</div>
        </div>
      ),
      description: (
        <VerificationOpinionStep
          useLocation={useLocation}
          translator={translator}
          current={current}
          form={verificationOpinionForm}
          next={next}
          prev={prev}
          onValueChange={onValueChange}
        />
      ),
    },
    {
      title: (
        <div className="stepper-title-container">
          <div className="step-count">05</div>
          <div className="title">{t('verificationReport:title06')}</div>
        </div>
      ),
      description: (
        <ReferenceStep
          useLocation={useLocation}
          translator={translator}
          current={current}
          form={referenceForm}
          next={next}
          prev={prev}
          onValueChange={onValueChange}
        />
      ),
    },
    {
      title: (
        <div className="stepper-title-container">
          <div className="step-count">06</div>
          <div className="title">{t('verificationReport:title07')}</div>
        </div>
      ),
      description: (
        <AppendixStep
          useLocation={useLocation}
          translator={translator}
          current={current}
          form={appendixForm}
          prev={prev}
          onFinish={onFinish}
        />
      ),
    },
  ];

  return (
    <>
      <Steps
        progressDot
        direction="vertical"
        current={current}
        items={steps.map((step) => ({
          title: step.title,
          description: step.description,
        }))}
      />
    </>
  );
};

export default StepperComponent;
