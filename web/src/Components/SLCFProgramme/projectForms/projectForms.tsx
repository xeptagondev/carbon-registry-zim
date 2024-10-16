import { Col, Row, Skeleton, Tooltip, message } from 'antd';
import React, { FC, useEffect, useRef, useState } from 'react';
import './projectForms.scss';
import {
  CheckCircleOutlined,
  DislikeOutlined,
  ExclamationCircleOutlined,
  FileAddOutlined,
  LikeOutlined,
  BookOutlined,
  FolderViewOutlined,
} from '@ant-design/icons';
import { RcFile } from 'antd/lib/upload';
import moment from 'moment';
import { RejectDocumentationConfirmationModel } from '../../Models/rejectDocumenConfirmationModel';
import { useUserContext } from '../../../Context/UserInformationContext/userInformationContext';
import { useConnection } from '../../../Context/ConnectionContext/connectionContext';
import { ProgrammeStageUnified } from '../../../Definitions/Enums/programmeStage.enum';
import { DocType } from '../../../Definitions/Enums/document.type';
import { Role } from '../../../Definitions/Enums/role.enum';
import { isValidateFileType } from '../../../Utils/DocumentValidator';
import { DocumentStatus } from '../../../Definitions/Enums/document.status';
import { CompanyRole } from '../../../Definitions/Enums/company.role.enum';
import {
  formCreatePermission,
  formViewPermission,
  linkDocVisible,
} from '../../../Utils/documentsPermissionSl';
import { useNavigate } from 'react-router-dom';

export interface ProjectFormProps {
  data: any;
  title: any;
  icon: any;
  programmeId: any;
  programmeOwnerId: number;
  getDocumentDetails: any;
  getProgrammeById: any;
  ministryLevelPermission?: boolean;
  translator: any;
  programmeStatus?: any;
}

export const ProjectForms: FC<ProjectFormProps> = (props: ProjectFormProps) => {
  const {
    data,
    title,
    icon,
    programmeId,
    getDocumentDetails,
    getProgrammeById,
    translator,
    programmeStatus,
  } = props;

  const t = translator.t;
  const { userInfoState } = useUserContext();
  const { delete: del, post } = useConnection();
  const fileInputRef: any = useRef(null);
  const fileInputRefMeth: any = useRef(null);
  const fileInputRefImpactAssessment: any = useRef(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [designDocUrl, setDesignDocUrl] = useState<any>('');
  const [designDocDate, setDesignDocDate] = useState<any>('');
  const [designDocversion, setDesignDocversion] = useState<any>('');
  const [docData, setDocData] = useState<any[]>([]);
  const [openRejectDocConfirmationModal, setOpenRejectDocConfirmationModal] = useState(false);
  const [actionInfo, setActionInfo] = useState<any>({});
  const [rejectDocData, setRejectDocData] = useState<any>({});
  const navigate = useNavigate();
  const maximumImageSize = process.env.REACT_APP_MAXIMUM_FILE_SIZE
    ? parseInt(process.env.REACT_APP_MAXIMUM_FILE_SIZE)
    : 5000000;

  const navigateToCostQuotationView = () => {};
  const navigateToCostQuotationCreate = () => {};
  const navigateToProposalView = () => {};
  const navigateToProposalCreate = () => {};

  useEffect(() => {
    setDocData(data);
  }, [data]);

  const getBase64 = (file: RcFile): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const onUploadDocument = async (file: any, type: any) => {
    if (file.size > maximumImageSize) {
      message.open({
        type: 'error',
        content: `${t('common:maxSizeVal')}`,
        duration: 4,
        style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
      });
      return;
    }

    setLoading(true);
    const logoBase64 = await getBase64(file as RcFile);
    try {
      if (isValidateFileType(file?.type, type)) {
        const response: any = await post('national/programme/addDocument', {
          type: type,
          data: logoBase64,
          programmeId: programmeId,
        });
        fileInputRefMeth.current = null;
        if (response?.data) {
          setDocData([...docData, response?.data]);
          message.open({
            type: 'success',
            content: `${t('projectDetailsView:isUploaded')}`,
            duration: 4,
            style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
          });
        }
      } else {
        message.open({
          type: 'error',
          content: `${t('projectDetailsView:invalidFileFormat')}`,
          duration: 4,
          style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
        });
      }
    } catch (error: any) {
      fileInputRefMeth.current = null;
      message.open({
        type: 'error',
        content: `${t('projectDetailsView:notUploaded')}`,
        duration: 4,
        style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
      });
    } finally {
      getDocumentDetails();
      setLoading(false);
    }
  };

  const docAction = async (id: any, status: DocumentStatus) => {
    setLoading(true);
    try {
      const response: any = await post('national/programme/docAction', {
        id: id,
        status: status,
      });
      message.open({
        type: 'success',
        content:
          status === DocumentStatus.ACCEPTED
            ? `${t('projectDetailsView:docApproved')}`
            : `${t('projectDetailsView:docRejected')}`,
        duration: 4,
        style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
      });
    } catch (error: any) {
      message.open({
        type: 'error',
        content: error?.message,
        duration: 4,
        style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
      });
    } finally {
      setOpenRejectDocConfirmationModal(false);
      getDocumentDetails();
      getProgrammeById();
      setLoading(false);
    }
  };

  const handleOk = () => {
    docAction(rejectDocData?.id, DocumentStatus.REJECTED);
  };

  const handleCancel = () => {
    setOpenRejectDocConfirmationModal(false);
  };

  const navigateToCMACreate = () => {
    navigate(`/programmeManagementSLCF/cmaForm/${programmeId}`);
  };

  return loading ? (
    <Skeleton />
  ) : (
    <>
      <div className="info-view">
        <div className="title">
          <span className="title-icon">{icon}</span>
          <span className="title-text">{title}</span>
        </div>
        <div>
          <Row className="field" key="Cost Quotation">
            <Col span={18} className="field-key">
              <div className="label-container">
                <div className="label">{t('projectDetailsView:costQuotationForm')}</div>
              </div>
            </Col>
            <Col span={3} className="field-value">
              <>
                <Tooltip
                  arrowPointAtCenter
                  placement="top"
                  trigger="hover"
                  title={
                    !formViewPermission(userInfoState, DocType.COST_QUOTATION) &&
                    t('projectDetailsView:orgNotAuthView')
                  }
                  overlayClassName="custom-tooltip"
                >
                  <FolderViewOutlined
                    className="common-progress-icon"
                    style={
                      formViewPermission(userInfoState, DocType.COST_QUOTATION)
                        ? {
                            color: '#3F3A47',
                            cursor: 'pointer',
                            margin: '0px 0px 1.5px 0px',
                          }
                        : {
                            color: '#cacaca',
                            cursor: 'default',
                            margin: '0px 0px 1.5px 0px',
                          }
                    }
                    onClick={() =>
                      formViewPermission(userInfoState, DocType.COST_QUOTATION) &&
                      navigateToCostQuotationView()
                    }
                  />
                </Tooltip>
              </>
            </Col>
            <Col span={3} className="field-value">
              <>
                <Tooltip
                  arrowPointAtCenter
                  placement="top"
                  trigger="hover"
                  title={
                    !formCreatePermission(userInfoState, DocType.COST_QUOTATION) &&
                    t('projectDetailsView:orgNotAuthCreate')
                  }
                  overlayClassName="custom-tooltip"
                >
                  <FileAddOutlined
                    className="common-progress-icon"
                    style={
                      formCreatePermission(userInfoState, DocType.COST_QUOTATION)
                        ? {
                            color: '#3F3A47',
                            cursor: 'pointer',
                            margin: '0px 0px 1.5px 0px',
                          }
                        : {
                            color: '#cacaca',
                            cursor: 'default',
                            margin: '0px 0px 1.5px 0px',
                          }
                    }
                    onClick={() =>
                      formCreatePermission(userInfoState, DocType.COST_QUOTATION) &&
                      navigateToCostQuotationCreate()
                    }
                  />
                </Tooltip>
              </>
            </Col>
          </Row>
          <Row className="field" key="Proposal">
            <Col span={18} className="field-key">
              <div className="label-container">
                <div className="label">{t('projectDetailsView:proposalForm')}</div>
              </div>
            </Col>
            <Col span={3} className="field-value">
              <>
                <Tooltip
                  arrowPointAtCenter
                  placement="top"
                  trigger="hover"
                  title={
                    !formViewPermission(userInfoState, DocType.PROPOSAL) &&
                    t('projectDetailsView:orgNotAuthView')
                  }
                  overlayClassName="custom-tooltip"
                >
                  <FolderViewOutlined
                    className="common-progress-icon"
                    style={
                      formViewPermission(userInfoState, DocType.PROPOSAL)
                        ? {
                            color: '#3F3A47',
                            cursor: 'pointer',
                            margin: '0px 0px 1.5px 0px',
                          }
                        : {
                            color: '#cacaca',
                            cursor: 'default',
                            margin: '0px 0px 1.5px 0px',
                          }
                    }
                    onClick={() =>
                      formViewPermission(userInfoState, DocType.PROPOSAL) &&
                      navigateToProposalView()
                    }
                  />
                </Tooltip>
              </>
            </Col>
            <Col span={3} className="field-value">
              <>
                <Tooltip
                  arrowPointAtCenter
                  placement="top"
                  trigger="hover"
                  title={
                    !formCreatePermission(userInfoState, DocType.PROPOSAL) &&
                    t('projectDetailsView:orgNotAuthCreate')
                  }
                  overlayClassName="custom-tooltip"
                >
                  <FileAddOutlined
                    className="common-progress-icon"
                    style={
                      formCreatePermission(userInfoState, DocType.PROPOSAL)
                        ? {
                            color: '#3F3A47',
                            cursor: 'pointer',
                            margin: '0px 0px 1.5px 0px',
                          }
                        : {
                            color: '#cacaca',
                            cursor: 'default',
                            margin: '0px 0px 1.5px 0px',
                          }
                    }
                    onClick={() =>
                      formCreatePermission(userInfoState, DocType.PROPOSAL) &&
                      navigateToProposalCreate()
                    }
                  />
                </Tooltip>
              </>
            </Col>
          </Row>
          <Row className="field" key="Validation Agreement">
            <Col span={18} className="field-key">
              <div className="label-container">
                <div className="label">{t('projectDetailsView:validationAgreementForm')}</div>
              </div>
              {designDocUrl !== '' && (
                <div className="time">
                  {moment(parseInt(designDocDate)).format('DD MMMM YYYY @ HH:mm')}
                  {' ~ ' + designDocversion}
                </div>
              )}
            </Col>
            <Col span={6} className="field-value">
              <>
                <Tooltip
                  arrowPointAtCenter
                  placement="top"
                  trigger="hover"
                  title={
                    !formCreatePermission(userInfoState, DocType.DESIGN_DOCUMENT) &&
                    t('projectDetailsView:orgNotAuthCreate')
                  }
                  overlayClassName="custom-tooltip"
                >
                  <FileAddOutlined
                    className="common-progress-icon"
                    style={
                      formCreatePermission(userInfoState, DocType.DESIGN_DOCUMENT)
                        ? {
                            color: '#3F3A47',
                            cursor: 'pointer',
                            margin: '0px 0px 1.5px 0px',
                          }
                        : {
                            color: '#cacaca',
                            cursor: 'default',
                            margin: '0px 0px 1.5px 0px',
                          }
                    }
                    onClick={() =>
                      formCreatePermission(userInfoState, DocType.DESIGN_DOCUMENT) &&
                      navigateToCostQuotationCreate()
                    }
                  />
                </Tooltip>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept=".xls, .xlsx, .ppt, .pptx, .csv, .doc, .docx, .pdf, .png, .jpg"
                  onChange={(e: any) => {
                    const selectedFile = e.target.files[0];
                    e.target.value = null;
                    onUploadDocument(selectedFile, DocType.DESIGN_DOCUMENT);
                  }}
                />
              </>
            </Col>
          </Row>
          <Row className="field" key="Carbon Management Assessment (CMA)">
            <Col span={18} className="field-key">
              <div className="label-container">
                <div className="label">{t('projectDetailsView:cmaForm')}</div>
              </div>
              {designDocUrl !== '' && (
                <div className="time">
                  {moment(parseInt(designDocDate)).format('DD MMMM YYYY @ HH:mm')}
                  {' ~ ' + designDocversion}
                </div>
              )}
            </Col>
            <Col span={6} className="field-value">
              <>
                <Tooltip
                  arrowPointAtCenter
                  placement="top"
                  trigger="hover"
                  title={
                    !formCreatePermission(userInfoState, DocType.CMA) &&
                    t('projectDetailsView:orgNotAuthCreate')
                  }
                  overlayClassName="custom-tooltip"
                >
                  <FileAddOutlined
                    className="common-progress-icon"
                    style={
                      formCreatePermission(userInfoState, DocType.CMA)
                        ? {
                            color: '#3F3A47',
                            cursor: 'pointer',
                            margin: '0px 0px 1.5px 0px',
                          }
                        : {
                            color: '#cacaca',
                            cursor: 'default',
                            margin: '0px 0px 1.5px 0px',
                          }
                    }
                    onClick={() =>
                      formCreatePermission(userInfoState, DocType.CMA) && navigateToCMACreate()
                    }
                  />
                </Tooltip>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept=".xls, .xlsx, .ppt, .pptx, .csv, .doc, .docx, .pdf, .png, .jpg"
                  onChange={(e: any) => {
                    const selectedFile = e.target.files[0];
                    e.target.value = null;
                    onUploadDocument(selectedFile, DocType.DESIGN_DOCUMENT);
                  }}
                />
              </>
            </Col>
          </Row>
          <Row className="field" key="Validation Report">
            <Col span={18} className="field-key">
              <div className="label-container">
                <div className="label">{t('projectDetailsView:validationReportForm')}</div>
              </div>
              {designDocUrl !== '' && (
                <div className="time">
                  {moment(parseInt(designDocDate)).format('DD MMMM YYYY @ HH:mm')}
                  {' ~ ' + designDocversion}
                </div>
              )}
            </Col>
            <Col span={6} className="field-value">
              <>
                <Tooltip
                  arrowPointAtCenter
                  placement="top"
                  trigger="hover"
                  title={
                    !formCreatePermission(userInfoState, DocType.DESIGN_DOCUMENT) &&
                    t('projectDetailsView:orgNotAuthCreate')
                  }
                  overlayClassName="custom-tooltip"
                >
                  <FileAddOutlined
                    className="common-progress-icon"
                    style={
                      formCreatePermission(userInfoState, DocType.DESIGN_DOCUMENT)
                        ? {
                            color: '#3F3A47',
                            cursor: 'pointer',
                            margin: '0px 0px 1.5px 0px',
                          }
                        : {
                            color: '#cacaca',
                            cursor: 'default',
                            margin: '0px 0px 1.5px 0px',
                          }
                    }
                    onClick={() =>
                      formCreatePermission(userInfoState, DocType.DESIGN_DOCUMENT) &&
                      navigateToCostQuotationCreate()
                    }
                  />
                </Tooltip>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept=".xls, .xlsx, .ppt, .pptx, .csv, .doc, .docx, .pdf, .png, .jpg"
                  onChange={(e: any) => {
                    const selectedFile = e.target.files[0];
                    e.target.value = null;
                    onUploadDocument(selectedFile, DocType.DESIGN_DOCUMENT);
                  }}
                />
              </>
            </Col>
          </Row>
          <Row className="field" key="Project Registration Certificate">
            <Col span={18} className="field-key">
              <div className="label-container">
                <div className="label">{t('projectDetailsView:registrationCertificate')}</div>
              </div>
              {designDocUrl !== '' && (
                <div className="time">
                  {moment(parseInt(designDocDate)).format('DD MMMM YYYY @ HH:mm')}
                  {' ~ ' + designDocversion}
                </div>
              )}
            </Col>
            <Col span={6} className="field-value">
              <>
                <Tooltip
                  arrowPointAtCenter
                  placement="top"
                  trigger="hover"
                  title={
                    !formCreatePermission(userInfoState, DocType.DESIGN_DOCUMENT) &&
                    t('projectDetailsView:orgNotAuthCreate')
                  }
                  overlayClassName="custom-tooltip"
                >
                  <FileAddOutlined
                    className="common-progress-icon"
                    style={
                      formCreatePermission(userInfoState, DocType.DESIGN_DOCUMENT)
                        ? {
                            color: '#3F3A47',
                            cursor: 'pointer',
                            margin: '0px 0px 1.5px 0px',
                          }
                        : {
                            color: '#cacaca',
                            cursor: 'default',
                            margin: '0px 0px 1.5px 0px',
                          }
                    }
                    onClick={() =>
                      formCreatePermission(userInfoState, DocType.DESIGN_DOCUMENT) &&
                      navigateToCostQuotationCreate()
                    }
                  />
                </Tooltip>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept=".xls, .xlsx, .ppt, .pptx, .csv, .doc, .docx, .pdf, .png, .jpg"
                  onChange={(e: any) => {
                    const selectedFile = e.target.files[0];
                    e.target.value = null;
                    onUploadDocument(selectedFile, DocType.DESIGN_DOCUMENT);
                  }}
                />
              </>
            </Col>
          </Row>
        </div>
      </div>
      <RejectDocumentationConfirmationModel
        actionInfo={actionInfo}
        onActionConfirmed={handleOk}
        onActionCanceled={handleCancel}
        openModal={openRejectDocConfirmationModal}
        errorMsg={''}
        loading={loading}
        translator={translator}
      />
    </>
  );
};
