import { ReportData } from '../types/report';

export function exportToCSV(reportData: ReportData, dateRange: string) {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `transactq-report-${dateRange}-${timestamp}.csv`;

  // Build CSV content
  let csv = 'TransactQ Performance Report\n';
  csv += `Generated: ${new Date().toLocaleDateString()}\n`;
  csv += `Period: ${dateRange}\n\n`;

  // Executive Summary
  csv += 'Executive Summary\n';
  csv += 'Metric,Value,Change,Change %\n';
  csv += `Deals Closed,${reportData.executiveSummary.dealsClosed.value},${reportData.executiveSummary.dealsClosed.change},${reportData.executiveSummary.dealsClosed.changePercent}%\n`;
  csv += `Avg Days to Close,${reportData.executiveSummary.avgDaysToClose.value},${reportData.executiveSummary.avgDaysToClose.change},${reportData.executiveSummary.avgDaysToClose.changePercent}%\n`;
  csv += `At Risk Deals,${reportData.executiveSummary.atRiskDeals.value},${reportData.executiveSummary.atRiskDeals.change},${reportData.executiveSummary.atRiskDeals.changePercent}%\n`;
  csv += `Fall Through Rate,${reportData.executiveSummary.fallThroughRate.value}%,${reportData.executiveSummary.fallThroughRate.change},${reportData.executiveSummary.fallThroughRate.changePercent}%\n\n`;

  // Pipeline Drop-Off
  csv += 'Pipeline Drop-Off\n';
  csv += 'Stage,Count,Percentage\n';
  reportData.pipelineDropOff.forEach(stage => {
    csv += `${stage.stage},${stage.count},${stage.percentage}%\n`;
  });
  csv += '\n';

  // Deal Health
  csv += 'Deal Health Distribution\n';
  csv += 'Status,Count\n';
  csv += `On Track,${reportData.dealHealth.onTrack}\n`;
  csv += `Needs Attention,${reportData.dealHealth.needsAttention}\n`;
  csv += `At Risk,${reportData.dealHealth.atRisk}\n\n`;

  // Delay Factors
  csv += 'Top Delay Factors\n';
  csv += 'Factor,Count,Percentage\n';
  reportData.delayFactors.forEach(factor => {
    csv += `${factor.factor},${factor.count},${factor.percentage}%\n`;
  });
  csv += '\n';

  // Agent Performance
  csv += 'Agent Performance\n';
  csv += 'Agent,Deals Closed,Avg Close Time,At Risk Deals\n';
  reportData.agentPerformance.forEach(agent => {
    csv += `${agent.agentName},${agent.dealsClosed},${agent.avgCloseTime},${agent.atRiskDeals}\n`;
  });
  csv += '\n';

  // Next Action Insights
  csv += 'Most Common Next Actions\n';
  csv += 'Action,Frequency\n';
  reportData.nextActionInsights.forEach(insight => {
    csv += `${insight.action},${insight.frequency}\n`;
  });

  // Create and download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToPDF(reportData: ReportData, dateRange: string) {
  // For now, create a simplified HTML print view
  const timestamp = new Date().toISOString().split('T')[0];

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to export PDF');
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>TransactQ Report - ${dateRange} - ${timestamp}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          margin: 40px;
          color: #1f2937;
        }
        h1 { font-size: 24px; margin-bottom: 8px; }
        h2 { font-size: 18px; margin-top: 32px; margin-bottom: 16px; }
        .header { margin-bottom: 32px; }
        .meta { color: #6b7280; font-size: 14px; }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 24px;
        }
        th, td {
          border: 1px solid #e5e7eb;
          padding: 12px;
          text-align: left;
        }
        th {
          background-color: #f9fafb;
          font-weight: 600;
        }
        .metric-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 32px;
        }
        .metric-card {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
        }
        .metric-label {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 8px;
        }
        .metric-value {
          font-size: 32px;
          font-weight: 600;
          margin-bottom: 4px;
        }
        .metric-change {
          font-size: 12px;
          color: #6b7280;
        }
        .metric-change.positive { color: #059669; }
        .metric-change.negative { color: #dc2626; }
        @media print {
          body { margin: 20px; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>TransactQ Performance Report</h1>
        <div class="meta">
          Generated: ${new Date().toLocaleDateString()} | Period: ${dateRange}
        </div>
      </div>

      <h2>Executive Summary</h2>
      <div class="metric-grid">
        <div class="metric-card">
          <div class="metric-label">Deals Closed</div>
          <div class="metric-value">${reportData.executiveSummary.dealsClosed.value}</div>
          <div class="metric-change ${reportData.executiveSummary.dealsClosed.direction === 'up' ? 'positive' : 'negative'}">
            ${reportData.executiveSummary.dealsClosed.change > 0 ? '+' : ''}${reportData.executiveSummary.dealsClosed.change} (${reportData.executiveSummary.dealsClosed.changePercent}%)
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Avg Days to Close</div>
          <div class="metric-value">${reportData.executiveSummary.avgDaysToClose.value}</div>
          <div class="metric-change ${reportData.executiveSummary.avgDaysToClose.direction === 'down' ? 'positive' : 'negative'}">
            ${reportData.executiveSummary.avgDaysToClose.change > 0 ? '+' : ''}${reportData.executiveSummary.avgDaysToClose.change} (${reportData.executiveSummary.avgDaysToClose.changePercent}%)
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-label">At Risk Deals</div>
          <div class="metric-value">${reportData.executiveSummary.atRiskDeals.value}</div>
          <div class="metric-change ${reportData.executiveSummary.atRiskDeals.direction === 'down' ? 'positive' : 'negative'}">
            ${reportData.executiveSummary.atRiskDeals.change > 0 ? '+' : ''}${reportData.executiveSummary.atRiskDeals.change} (${reportData.executiveSummary.atRiskDeals.changePercent}%)
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Fall Through Rate</div>
          <div class="metric-value">${reportData.executiveSummary.fallThroughRate.value}%</div>
          <div class="metric-change ${reportData.executiveSummary.fallThroughRate.direction === 'down' ? 'positive' : 'negative'}">
            ${reportData.executiveSummary.fallThroughRate.change > 0 ? '+' : ''}${reportData.executiveSummary.fallThroughRate.change} (${reportData.executiveSummary.fallThroughRate.changePercent}%)
          </div>
        </div>
      </div>

      <h2>Pipeline Drop-Off</h2>
      <table>
        <thead>
          <tr>
            <th>Stage</th>
            <th>Count</th>
            <th>Percentage</th>
          </tr>
        </thead>
        <tbody>
          ${reportData.pipelineDropOff.map(stage => `
            <tr>
              <td>${stage.stage}</td>
              <td>${stage.count}</td>
              <td>${stage.percentage.toFixed(1)}%</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <h2>Delay Factors</h2>
      <table>
        <thead>
          <tr>
            <th>Factor</th>
            <th>Count</th>
            <th>Percentage</th>
          </tr>
        </thead>
        <tbody>
          ${reportData.delayFactors.map(factor => `
            <tr>
              <td>${factor.factor}</td>
              <td>${factor.count}</td>
              <td>${factor.percentage.toFixed(1)}%</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <h2>Agent Performance</h2>
      <table>
        <thead>
          <tr>
            <th>Agent</th>
            <th>Deals Closed</th>
            <th>Avg Close Time</th>
            <th>At Risk</th>
          </tr>
        </thead>
        <tbody>
          ${reportData.agentPerformance.map(agent => `
            <tr>
              <td>${agent.agentName}</td>
              <td>${agent.dealsClosed}</td>
              <td>${agent.avgCloseTime}d</td>
              <td>${agent.atRiskDeals}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
