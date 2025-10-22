export interface ITimeRange {
  startTime: Date | string;
  endTime: Date | string;
}

export type SortType = Record<string, 1 | -1>;
