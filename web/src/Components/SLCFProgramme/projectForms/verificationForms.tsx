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

export interface VerificationFormsProps {
  data: any;
  title: any;
  icon: any;
  programmeId: any;
  programmeOwnerId: number;
  getDocumentDetails: any;
  getProgrammeById: any;
  ministryLevelPermission?: boolean;
  translator: any;
  projectProposalStage?: any;
}

export const VerificationForms: FC<VerificationFormsProps> = (props: VerificationFormsProps) => {
  const {
    data,
    title,
    icon,
    programmeId,

    getDocumentDetails,
    getProgrammeById,

    translator,
    projectProposalStage,
  } = props;

  const t = translator.t;
  const { userInfoState } = useUserContext();
  const { delete: del, post } = useConnection();
  const fileInputRef: any = useRef(null);
  const fileInputRefMeth: any = useRef(null);

  const [loading, setLoading] = useState<boolean>(false);

  const [designDocStatus, setDesignDocStatus] = useState<any>('');

  const [docData, setDocData] = useState<any[]>([]);
  const [openRejectDocConfirmationModal, setOpenRejectDocConfirmationModal] = useState(false);
  const [actionInfo, setActionInfo] = useState<any>({});
  const [rejectDocData, setRejectDocData] = useState<any>({});
  const navigate = useNavigate();
  const maximumImageSize = process.env.REACT_APP_MAXIMUM_FILE_SIZE
    ? parseInt(process.env.REACT_APP_MAXIMUM_FILE_SIZE)
    : 5000000;

  useEffect(() => {
    setDocData(data);
  }, [data]);

  const navigateToMonitoringReportCreate = () => {
    navigate(`/programmeManagementSLCF/monitoringReport/${programmeId}`);
  };
  const navigateToMonitoringReportView = () => {
    navigate(`/programmeManagementSLCF/monitoringReport/${programmeId}`);
  };

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
          // methodologyDocumentUpdated();
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

  const companyRolePermission =
    userInfoState?.companyRole === CompanyRole.GOVERNMENT &&
    userInfoState?.userRole !== Role.ViewOnly;

  const designDocActionPermission =
    userInfoState?.companyRole === CompanyRole.GOVERNMENT &&
    userInfoState?.userRole !== Role.ViewOnly;

  const designDocPending = designDocStatus === DocumentStatus.PENDING;
  function navigateToVerificationReportCreate(): void {
    throw new Error('Function not implemented.');
  }
  function navigateToVerificationReportView(): void {
    throw new Error('Function not implemented.');
  }

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
          <Row className="field" key="Monitoring Report">
            <Col span={18} className="field-key">
              <div className="label-container">
                <div className="label">{t('projectDetailsView:monitoringReport')}</div>
              </div>
            </Col>
            <Col span={3} className="field-value">
              <>
                <Tooltip
                  arrowPointAtCenter
                  placement="top"
                  trigger="hover"
                  title={
                    !formViewPermission(
                      userInfoState,
                      DocType.MONITORING_REPORT,
                      projectProposalStage
                    ) && t('projectDetailsView:orgNotAuthView')
                  }
                  overlayClassName="custom-tooltip"
                >
                  <FolderViewOutlined
                    className="common-progress-icon"
                    style={
                      formViewPermission(
                        userInfoState,
                        DocType.MONITORING_REPORT,
                        projectProposalStage
                      )
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
                      formViewPermission(
                        userInfoState,
                        DocType.MONITORING_REPORT,
                        projectProposalStage
                      ) && navigateToMonitoringReportView()
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
                    !formCreatePermission(
                      userInfoState,
                      DocType.MONITORING_REPORT,
                      projectProposalStage
                    ) && t('projectDetailsView:orgNotAuthCreate')
                  }
                  overlayClassName="custom-tooltip"
                >
                  <FileAddOutlined
                    className="common-progress-icon"
                    style={
                      formCreatePermission(
                        userInfoState,
                        DocType.MONITORING_REPORT,
                        projectProposalStage
                      )
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
                      formCreatePermission(
                        userInfoState,
                        DocType.MONITORING_REPORT,
                        projectProposalStage
                      ) && navigateToMonitoringReportCreate()
                    }
                  />
                </Tooltip>
              </>
            </Col>
          </Row>
          <Row className="field" key="Verification Report">
            <Col span={18} className="field-key">
              <div className="label-container">
                <div className="label">{t('projectDetailsView:verificationReport')}</div>
              </div>
            </Col>
            <Col span={3} className="field-value">
              <>
                <Tooltip
                  arrowPointAtCenter
                  placement="top"
                  trigger="hover"
                  title={
                    !formViewPermission(
                      userInfoState,
                      DocType.VERIFICATION_REPORT,
                      projectProposalStage
                    ) && t('projectDetailsView:orgNotAuthView')
                  }
                  overlayClassName="custom-tooltip"
                >
                  <FolderViewOutlined
                    className="common-progress-icon"
                    style={
                      formViewPermission(
                        userInfoState,
                        DocType.VERIFICATION_REPORT,
                        projectProposalStage
                      )
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
                      formViewPermission(
                        userInfoState,
                        DocType.VERIFICATION_REPORT,
                        projectProposalStage
                      ) && navigateToVerificationReportView()
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
                    !formCreatePermission(
                      userInfoState,
                      DocType.VERIFICATION_REPORT,
                      projectProposalStage
                    ) && t('projectDetailsView:orgNotAuthCreate')
                  }
                  overlayClassName="custom-tooltip"
                >
                  <FileAddOutlined
                    className="common-progress-icon"
                    style={
                      formCreatePermission(
                        userInfoState,
                        DocType.VERIFICATION_REPORT,
                        projectProposalStage
                      )
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
                      formCreatePermission(
                        userInfoState,
                        DocType.VERIFICATION_REPORT,
                        projectProposalStage
                      ) && navigateToVerificationReportCreate()
                    }
                  />
                </Tooltip>
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