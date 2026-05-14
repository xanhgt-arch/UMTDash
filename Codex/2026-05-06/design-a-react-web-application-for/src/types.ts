import type { ReactNode } from 'react';

export type RawUsageRow = Record<string, string>;

export interface UsageRow {
  id: string;
  source: RawUsageRow;
  applicationName: string;
  functionality: string;
  cadTool: string;
  productLine: string;
  status: string;
  region: string;
  startDate: string;
  stopDate: string;
  date: string;
  month: string;
  isProd: boolean;
  isVDI: boolean;
  environment: string;
  accessMode: string;
  usageCount: number;
  uniqueUsers: number;
  timestamp: number;
  durationDays: number;
}

export interface ChartDatum {
  label: string;
  value: number;
  rawDate?: string;
  month?: string;
  total?: number;
  [key: string]: string | number | undefined;
}

export type FilterValue = string | string[];
export type Filters = Record<string, FilterValue | undefined>;
export type FilterOptions = Record<string, string[]>;

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface DatePreset extends DateRange {
  preset: string;
  label: string;
}

export interface TooltipRow {
  label: string;
  value: string;
  color?: string;
}

export interface TooltipState {
  x: number;
  y: number;
  title: string;
  rows: TooltipRow[];
}

export type TableRow = Record<string, string | number | boolean>;
export type ExportMetadata = Record<string, string | number | boolean>;

export interface WithChildren {
  children: ReactNode;
}
