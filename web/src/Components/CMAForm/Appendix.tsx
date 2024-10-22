import { Button, Form, Row, StepProps, Upload } from 'antd';
import React from 'react';
import { CustomStepsProps } from './StepProps';
import TextArea from 'antd/lib/input/TextArea';
import { t } from 'i18next';
import { UploadOutlined } from '@ant-design/icons';
import { DocType } from '../../Definitions/Enums/document.type';
import { isValidateFileType } from '../../Utils/DocumentValidator';
import { getBase64 } from '../../Definitions/Definitions/programme.definitions';
import { RcFile } from 'antd/lib/upload';

const Step08 = (props: CustomStepsProps) => {
  const { next, prev, form, current, handleValuesUpdate, submitForm } = props;

  const maximumImageSize = process.env.REACT_APP_MAXIMUM_FILE_SIZE
    ? parseInt(process.env.REACT_APP_MAXIMUM_FILE_SIZE)
    : 5000000;

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const onFinish = async (values: any) => {
    console.log('-----values---------', values);
    const tempValues = {
      annexures: values?.additionalComments,
      additionalDocuments: await (async function () {
        const base64Docs: string[] = [];
        if (values?.appendixDocuments && values?.appendixDocuments.length > 0) {
          const docs = values.appendixDocuments;
          for (let i = 0; i < docs.length; i++) {
            const temp = await getBase64(docs[i]?.originFileObj as RcFile);
            base64Docs.push(temp); // No need for Promise.resolve
          }
        }
        return base64Docs;
      })(),
    };

    if (submitForm) {
      submitForm(tempValues);
    }
    // handleValuesUpdate({ appendix: tempValues });
  };
  return (
    <>
      {current === 8 && (
        <div>
          <div className="step-form-container">
            <Form
              labelCol={{ span: 20 }}
              wrapperCol={{ span: 24 }}
              className="step-form"
              layout="vertical"
              requiredMark={true}
              form={form}
              onFinish={(values: any) => {
                onFinish(values);

                // if (submitForm) {
                //   setTimeout(() => submitForm(), 1000);
                // }
                // if (next) {
                //   next()
                // }
              }}
            >
              <Form.Item
                className='className="full-width-form-item'
                label={`${t('CMAForm:additionalComments')}`}
                name="additionalComments"
                rules={[
                  {
                    required: true,
                    message: `${t('CMAForm:additionalComments')} ${t('isRequired')}`,
                  },
                ]}
              >
                <TextArea rows={4} />
              </Form.Item>
              <Form.Item
                label={t('CMAForm:uploadDocs')}
                name="appendixDocuments"
                valuePropName="fileList"
                getValueFromEvent={normFile}
                required={false}
                rules={[
                  {
                    validator: async (rule, file) => {
                      if (file?.length > 0) {
                        if (
                          !isValidateFileType(
                            file[0]?.type,
                            DocType.ENVIRONMENTAL_IMPACT_ASSESSMENT
                          )
                        ) {
                          throw new Error(`${t('CMAForm:invalidFileFormat')}`);
                        } else if (file[0]?.size > maximumImageSize) {
                          // default size format of files would be in bytes -> 1MB = 1000000bytes
                          throw new Error(`${t('common:maxSizeVal')}`);
                        }
                      }
                    },
                  },
                ]}
              >
                <Upload
                  accept=".doc, .docx, .pdf, .png, .jpg"
                  beforeUpload={(file: any) => {
                    return false;
                  }}
                  className="design-upload-section"
                  name="design"
                  action="/upload.do"
                  listType="picture"
                  multiple={false}
                  // maxCount={1}
                >
                  <Button className="upload-doc" size="large" icon={<UploadOutlined />}>
                    Upload
                  </Button>
                </Upload>
              </Form.Item>

              <Row justify={'end'} className="step-actions-end">
                <Button danger size={'large'} onClick={prev}>
                  {t('CMAForm:prev')}
                </Button>
                <Button type="primary" size={'large'} htmlType="submit">
                  {t('CMAForm:submit')}
                </Button>
              </Row>
            </Form>
          </div>
        </div>
      )}
    </>
  );
};

export default Step08;