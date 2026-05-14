import { useEffect, useMemo, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import ChartPanel from '../components/Common/ChartPanel';
import FilterBar from '../components/Common/FilterBar';
import KpiTile from '../components/Common/KpiTile';
import PageHeader from '../components/Common/PageHeader';
import ComparisonChart from '../components/Charts/ComparisonChart';
import HorizontalBarChart from '../components/Charts/HorizontalBarChart';
import MultiSeriesLineChart from '../components/Charts/MultiSeriesLineChart';
import PieChart from '../components/Charts/PieChart';
import StackedBarChart from '../components/Charts/StackedBarChart';
import TimeSeriesChart from '../components/Charts/TimeSeriesChart';
import TrendHeatmap from '../components/Charts/TrendHeatmap';
import {
  aggregateByField,
  aggregateByMonth,
  aggregateMonthlySeries,
  compareApplications,
  filterRows,
  getDateRange,
  getDatePresetOptions,
  getTrendSummary
} from '../services/dataProcessor';
import type { FilterOptions, Filters, UsageRow } from '../types';

interface DashboardPageProps {
  rows: UsageRow[];
  filterOptions: FilterOptions;
  loading: boolean;
}

export default function DashboardPage({ rows, filterOptions, loading }: DashboardPageProps) {
  const range = useMemo(() => getDateRange(rows), [rows]);
  const datePresets = useMemo(() => getDatePresetOptions(rows), [rows]);
  const defaultApps = filterOptions.applicationName || [];
  const [graph1Filters, setGraph1Filters] = useState<Filters>({});
  const [graph2Filters, setGraph2Filters] = useState<Filters>({});
  const [graph3Filters, setGraph3Filters] = useState<Filters>({});
  const [productLineFilters, setProductLineFilters] = useState<Filters>({});
  const [regionFilters, setRegionFilters] = useState<Filters>({});
  const [graph2ChartType, setGraph2ChartType] = useState('bar');
  const [exportError, setExportError] = useState('');
  const [exporting, setExporting] = useState('');

  useEffect(() => {
    if (!rows.length) return;

    setGraph1Filters((current) => ({
      startDate: current.startDate || range.startDate,
      endDate: current.endDate || range.endDate,
      cadTool: current.cadTool || '',
      productLine: current.productLine || '',
      region: current.region || ''
    }));

    setGraph2Filters((current) => ({
      startDate: current.startDate || range.startDate,
      endDate: current.endDate || range.endDate,
      applicationName: Array.isArray(current.applicationName) ? current.applicationName : [],
      functionality: current.functionality || '',
      environment: current.environment || '',
      accessMode: current.accessMode || ''
    }));

    setGraph3Filters((current) => ({
      startDate: current.startDate || range.startDate,
      endDate: current.endDate || range.endDate,
      appA: (current.appA as string) || defaultApps[0] || '',
      appB: (current.appB as string) || defaultApps[1] || ''
    }));

    const shared = (current) => ({
      startDate: current.startDate || range.startDate,
      endDate: current.endDate || range.endDate,
      cadTool: current.cadTool || '',
      productLine: current.productLine || '',
      region: current.region || ''
    });

    setProductLineFilters(shared);
    setRegionFilters(shared);
  }, [rows.length, range.startDate, range.endDate, defaultApps]);

  const graph1Rows = useMemo(() => filterRows(rows, graph1Filters), [rows, graph1Filters]);
  const graph2Rows = useMemo(() => filterRows(rows, graph2Filters), [rows, graph2Filters]);
  const productLineRows = useMemo(() => filterRows(rows, productLineFilters), [rows, productLineFilters]);
  const regionRows = useMemo(() => filterRows(rows, regionFilters), [rows, regionFilters]);
  const graph3Rows = useMemo(
    () =>
      filterRows(rows, {
        startDate: graph3Filters.startDate as string,
        endDate: graph3Filters.endDate as string
      }),
    [rows, graph3Filters.startDate, graph3Filters.endDate]
  );

  const graph1Data = useMemo(() => aggregateByMonth(graph1Rows), [graph1Rows]);
  const graph1ApplicationData = useMemo(() => aggregateByField(graph1Rows, 'applicationName'), [graph1Rows]);
  const isGraph1ShortRange = isDateRangeWithinDays(graph1Filters.startDate, graph1Filters.endDate, 31);
  const isGraph2ShortRange = isDateRangeWithinDays(graph2Filters.startDate, graph2Filters.endDate, 31);
  const isGraph3ShortRange = isDateRangeWithinDays(graph3Filters.startDate, graph3Filters.endDate, 31);
  const selectedApplications = useMemo(
    () => (Array.isArray(graph2Filters.applicationName) ? graph2Filters.applicationName : []),
    [graph2Filters.applicationName]
  );
  const graph2SeriesData = useMemo(
    () => aggregateMonthlySeries(graph2Rows, 'applicationName', selectedApplications),
    [graph2Rows, selectedApplications]
  );
  const graph2PieData = useMemo(() => aggregateByField(graph2Rows, 'applicationName'), [graph2Rows]);
  const graph2ApplicationData = useMemo(() => aggregateByField(graph2Rows, 'applicationName'), [graph2Rows]);
  const graph2FunctionalityOptions = useMemo(() => {
    const scopedRows = filterRows(rows, {
      startDate: graph2Filters.startDate,
      endDate: graph2Filters.endDate,
      applicationName: selectedApplications,
      environment: graph2Filters.environment,
      accessMode: graph2Filters.accessMode
    });

    return [...new Set(scopedRows.map((row) => row.functionality).filter(Boolean))].sort();
  }, [
    rows,
    graph2Filters.startDate,
    graph2Filters.endDate,
    selectedApplications,
    graph2Filters.environment,
    graph2Filters.accessMode
  ]);
  const graph3Data = useMemo(
    () => compareApplications(graph3Rows, graph3Filters.appA as string, graph3Filters.appB as string),
    [graph3Rows, graph3Filters.appA, graph3Filters.appB]
  );
  const graph3ApplicationData = useMemo(
    () =>
      aggregateByField(
        graph3Rows.filter((row) => row.applicationName === graph3Filters.appA || row.applicationName === graph3Filters.appB),
        'applicationName'
      ),
    [graph3Rows, graph3Filters.appA, graph3Filters.appB]
  );
  const productLineData = useMemo(() => aggregateByField(productLineRows, 'productLine'), [productLineRows]);
  const regionSeriesData = useMemo(
    () => aggregateMonthlySeries(regionRows, 'region', filterOptions.region || []),
    [regionRows, filterOptions.region]
  );
  const trends = useMemo(() => getTrendSummary(rows), [rows]);
  const kpis = useMemo(
    () => [
      {
        label: 'Busiest month',
        value: trends.busiestMonth?.label || '-',
        detail: trends.busiestMonth ? `${trends.busiestMonth.value.toLocaleString()} runs` : 'No data'
      },
      {
        label: 'Top application',
        value: trends.byApp[0]?.label || '-',
        detail: formatDetail(trends.byApp[0]?.value)
      },
      {
        label: 'Next top application',
        value: trends.byApp[1]?.label || '-',
        detail: formatDetail(trends.byApp[1]?.value)
      },
      {
        label: 'Top product line',
        value: trends.byProductLine[0]?.label || '-',
        detail: formatDetail(trends.byProductLine[0]?.value)
      },
      {
        label: 'Top region',
        value: trends.byRegion[0]?.label || '-',
        detail: formatDetail(trends.byRegion[0]?.value)
      }
    ],
    [trends]
  );

  const setFilter = (setter: Dispatch<SetStateAction<Filters>>) => (field: string, value: Filters[string]) =>
    setter((current) => ({ ...current, [field]: value }));
  const setGraph2Filter = (field: string, value: Filters[string]) => {
    setGraph2Filters((current) => ({
      ...current,
      [field]: value,
      ...(field === 'applicationName' ? { functionality: '' } : {})
    }));
  };

  useEffect(() => {
    if (!graph2Filters.functionality) return;
    if (graph2FunctionalityOptions.includes(graph2Filters.functionality)) return;

    setGraph2Filters((current) => ({ ...current, functionality: '' }));
  }, [graph2Filters.functionality, graph2FunctionalityOptions]);

  const getGraph2ExportPayload = () => {
    const exportRows = graph2Rows.map((row) => ({
      ApplicationName: row.applicationName,
      Functionality: row.functionality,
      cadTool: row.cadTool,
      ProductLine: row.productLine,
      Status: row.status,
      Region: row.region,
      StartDate: row.startDate,
      StopDate: row.stopDate,
      isProd: row.isProd,
      isVDI: row.isVDI
    }));
    const filename = selectedApplications.length
      ? `cooper-standard-${slugify(selectedApplications.join('-'))}-usage-data.xlsx`
      : 'cooper-standard-all-usage-data.xlsx';
    const metadata = {
      exportScope: selectedApplications.length ? 'Selected applications' : 'All applications',
      applications: selectedApplications.length ? selectedApplications.join(', ') : 'All',
      startDate: (graph2Filters.startDate as string) || 'All',
      endDate: (graph2Filters.endDate as string) || 'All',
      exportedRows: exportRows.length
    };

    return { exportRows, filename, metadata };
  };

  const exportGraph2 = async () => {
    setExportError('');
    setExporting('excel');
    const { exportRows, filename, metadata } = getGraph2ExportPayload();

    try {
      const { downloadExcelWorkbook } = await import('../services/excelExport');
      await downloadExcelWorkbook(filename, exportRows, metadata);
    } catch (error) {
      setExportError(error instanceof Error ? error.message : 'Excel export failed. Please try again.');
    } finally {
      setExporting('');
    }
  };

  const exportGraph2Pdf = async () => {
    setExportError('');
    setExporting('pdf');
    const { exportRows, filename, metadata } = getGraph2ExportPayload();

    try {
      const { downloadPdfReport } = await import('../services/pdfExport');
      downloadPdfReport(filename.replace(/\.xlsx$/i, '.pdf'), exportRows, metadata);
    } catch (error) {
      setExportError(error instanceof Error ? error.message : 'PDF export failed. Please try again.');
    } finally {
      setExporting('');
    }
  };

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="CAD automation usage"
        title="Dashboard"
        description={`${rows.length.toLocaleString()} report events across CAD tools, product lines, regions, and execution outcomes.`}
      />

      <section className="kpi-grid" aria-label="Usage summary">
        {kpis.map((kpi) => (
          <KpiTile key={kpi.label} {...kpi} />
        ))}
      </section>

      <div className="dashboard-insights-grid">
        <ChartPanel title="Monthly Usage Heatmap" subtitle="Peak months and softer demand windows.">
          <TrendHeatmap data={loading ? [] : trends.byMonth} />
        </ChartPanel>

        <ChartPanel title="Most Used Applications" subtitle="Ranked by total usage across the report.">
          <HorizontalBarChart data={loading ? [] : trends.byApp} />
        </ChartPanel>
      </div>

      <ChartPanel
        title={isGraph1ShortRange ? 'Application Usage Mix' : 'Monthly Usage Runs'}
        subtitle={
          isGraph1ShortRange
            ? 'Graph 1: application usage distribution for the selected short date range.'
            : 'Graph 1: total monthly runs filtered by CAD tool, product line, and region.'
        }
      >
        <FilterBar
          filters={graph1Filters}
          onChange={setFilter(setGraph1Filters)}
          datePresets={datePresets}
          fields={[
            { type: 'date', name: 'startDate', label: 'Start Date' },
            { type: 'date', name: 'endDate', label: 'End Date' },
            { name: 'cadTool', label: 'CAD Tool', options: filterOptions.cadTool },
            { name: 'productLine', label: 'Product Line', options: filterOptions.productLine },
            { name: 'region', label: 'Region', options: filterOptions.region }
          ]}
        />
        {isGraph1ShortRange ? (
          <PieChart
            data={loading ? [] : graph1ApplicationData}
            limit={graph1ApplicationData.length}
            size="large"
          />
        ) : (
          <TimeSeriesChart data={loading ? [] : graph1Data} variant="line" showValues />
        )}
      </ChartPanel>

      <ChartPanel
        title="Execution Breakdown"
        subtitle="Graph 2: monthly usage totals filtered by application, related functionality, production state, and VDI mode."
        actions={
          <>
            <div className="segmented-control" aria-label="Graph 2 chart type">
              {[
                ['bar', 'Bar'],
                ['line', 'Line'],
                ['pie', 'Pie']
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  disabled={isGraph2ShortRange}
                  className={graph2ChartType === value ? 'active' : ''}
                  onClick={() => setGraph2ChartType(value)}
                >
                  {label}
                </button>
              ))}
            </div>
            <button className="button primary" type="button" onClick={exportGraph2} disabled={Boolean(exporting)}>
              {exporting === 'excel' ? 'Preparing Excel' : 'Download Excel'}
            </button>
            <button className="button" type="button" onClick={exportGraph2Pdf} disabled={Boolean(exporting)}>
              {exporting === 'pdf' ? 'Preparing PDF' : 'Download PDF'}
            </button>
          </>
        }
      >
        <FilterBar
          filters={graph2Filters}
          onChange={setGraph2Filter}
          datePresets={datePresets}
          fields={[
            { type: 'date', name: 'startDate', label: 'Start Date' },
            { type: 'date', name: 'endDate', label: 'End Date' },
            { type: 'multiselect', name: 'applicationName', label: 'Applications', options: filterOptions.applicationName },
            { name: 'functionality', label: 'Functionality', options: graph2FunctionalityOptions },
            { name: 'environment', label: 'Environment', options: filterOptions.environment },
            { name: 'accessMode', label: 'Access Mode', options: filterOptions.accessMode }
          ]}
        />
        {exportError ? <p className="inline-error">{exportError}</p> : null}
        {isGraph2ShortRange ? (
          <HorizontalBarChart data={loading ? [] : graph2ApplicationData} limit={12} />
        ) : null}
        {!isGraph2ShortRange && graph2ChartType === 'bar' ? (
          <StackedBarChart data={loading ? [] : graph2SeriesData.data} series={graph2SeriesData.series} />
        ) : null}
        {!isGraph2ShortRange && graph2ChartType === 'line' ? (
          <MultiSeriesLineChart data={loading ? [] : graph2SeriesData.data} series={graph2SeriesData.series} />
        ) : null}
        {!isGraph2ShortRange && graph2ChartType === 'pie' ? (
          <PieChart data={loading ? [] : graph2PieData} limit={graph2PieData.length} size="large" />
        ) : null}
      </ChartPanel>

      <ChartPanel
        title="Application Usage Comparison"
        subtitle="Graph 3: compare two Cooper Standard tools month by month."
      >
        <FilterBar
          filters={graph3Filters}
          onChange={setFilter(setGraph3Filters)}
          datePresets={datePresets}
          fields={[
            { type: 'date', name: 'startDate', label: 'Start Date' },
            { type: 'date', name: 'endDate', label: 'End Date' },
            { name: 'appA', label: 'Application 1', options: filterOptions.applicationName, includeAll: false },
            { name: 'appB', label: 'Application 2', options: filterOptions.applicationName, includeAll: false }
          ]}
        />
        {isGraph3ShortRange ? (
          <HorizontalBarChart data={loading ? [] : graph3ApplicationData} limit={2} />
        ) : (
          <ComparisonChart data={loading ? [] : graph3Data} series={[graph3Filters.appA as string, graph3Filters.appB as string]} />
        )}
      </ChartPanel>

      <ChartPanel title="Product Line Mix" subtitle="Overall usage distribution by product line.">
        <FilterBar
          filters={productLineFilters}
          onChange={setFilter(setProductLineFilters)}
          datePresets={datePresets}
          fields={[
            { type: 'date', name: 'startDate', label: 'Start Date' },
            { type: 'date', name: 'endDate', label: 'End Date' },
            { name: 'cadTool', label: 'CAD Tool', options: filterOptions.cadTool },
            { name: 'region', label: 'Region', options: filterOptions.region }
          ]}
        />
        <PieChart data={productLineData} size="large" />
      </ChartPanel>

      <ChartPanel title="Region Monthly Comparison" subtitle="Monthwise usage split across available regions.">
        <FilterBar
          filters={regionFilters}
          onChange={setFilter(setRegionFilters)}
          datePresets={datePresets}
          fields={[
            { type: 'date', name: 'startDate', label: 'Start Date' },
            { type: 'date', name: 'endDate', label: 'End Date' },
            { name: 'cadTool', label: 'CAD Tool', options: filterOptions.cadTool },
            { name: 'productLine', label: 'Product Line', options: filterOptions.productLine }
          ]}
        />
        <StackedBarChart data={regionSeriesData.data} series={regionSeriesData.series} />
      </ChartPanel>
    </div>
  );
}

function slugify(value: string) {
  return String(value || 'all')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function formatDetail(value?: number) {
  return value ? `${value.toLocaleString()} usage events` : 'No data';
}

function isDateRangeWithinDays(startDate: Filters[string], endDate: Filters[string], maxDays: number) {
  if (!startDate || !endDate) return false;

  const start = new Date(`${startDate}T00:00:00`).getTime();
  const end = new Date(`${endDate}T00:00:00`).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return false;

  return Math.floor((end - start) / 86400000) + 1 <= maxDays;
}
