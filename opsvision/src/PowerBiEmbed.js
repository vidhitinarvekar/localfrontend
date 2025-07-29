import React, { useEffect, useRef, useState } from 'react';
import { models, factories, service } from 'powerbi-client';
 
const PowerBiEmbed = ({ reportName }) => {
  const reportRef = useRef(null);
  const [reportConfig, setReportConfig] = useState(null);
 
  useEffect(() => {
    if (!reportName) return;
 
    const fetchReportConfig = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`https://opsvisionbe.integrator-orange.com/api/PowerBi/embed/${reportName}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
 
        if (!res.ok) {
          console.error(`API error: ${res.status}`);
          setReportConfig(null);
          return;
        }
 
        const data = await res.json();
        setReportConfig(data);
      } catch (err) {
        console.error('Error fetching Power BI config:', err);
        setReportConfig(null);
      }
    };
 
    fetchReportConfig();
  }, [reportName]);
 
  useEffect(() => {
    if (reportConfig && reportRef.current) {
      const { embedToken, embedUrl, reportId } = reportConfig;
 
      const powerbiService = new service.Service(
        factories.hpmFactory,
        factories.wpmpFactory,
        factories.routerFactory
      );
 
      powerbiService.reset(reportRef.current);
 
      const config = {
        type: 'report',
        id: reportId,
        embedUrl,
        accessToken: embedToken,
        tokenType: models.TokenType.Embed,
        permissions: models.Permissions.All,
        settings: {
          panes: {
            filters: { visible: false },
            pageNavigation: { visible: true }
          }
        }
      };
 
      powerbiService.embed(reportRef.current, config);
    }
  }, [reportConfig]);
 
  return <div ref={reportRef} style={{ height: '100%', width: '100%' }} />;
};
 
export default PowerBiEmbed;
 
 
 