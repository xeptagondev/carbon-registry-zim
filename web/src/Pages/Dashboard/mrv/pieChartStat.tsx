import React, { FC } from 'react';
import { Skeleton, Tooltip } from 'antd';
import Chart from 'react-apexcharts';
import { InfoCircle } from 'react-bootstrap-icons';

export interface PieChartStatsProps {
  id: string;
  title: any;
  options: any;
  series: any[];
  lastUpdate: any;
  loading: boolean;
  toolTipText: string;
  subTitle?: string;
}

const PieChartsStat: FC<PieChartStatsProps> = (props: PieChartStatsProps) => {
  const { id, title, options, series, lastUpdate, loading, toolTipText, subTitle } = props;
  return (
    <div className="stastics-and-pie-card height-pie-rem">
      {loading ? (
        <div className="margin-top-2">
          <Skeleton active />
          <Skeleton active />
        </div>
      ) : (
        <>
          <div className="pie-charts-top">
            <div className="pie-charts-title">
              {title}
              {subTitle && <div className="unit">{subTitle}</div>}
            </div>
            <div className="info-container">
              <Tooltip
                arrowPointAtCenter
                placement="bottomRight"
                trigger="hover"
                title={toolTipText}
                overlayClassName="custom-tooltip"
              >
                <InfoCircle color="#000000" size={17} />
              </Tooltip>
            </div>
          </div>
          <div className="pie-charts-section">
            <Chart id={id} options={options} series={series} type="donut" height="320px" />
          </div>
          <div className="updated-on margin-top-2">
            {lastUpdate !== '0' && <div className="updated-moment-container">{lastUpdate}</div>}
          </div>
        </>
      )}
    </div>
  );
};

export default PieChartsStat;
