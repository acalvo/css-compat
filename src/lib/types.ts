export type BrowserKey = 'chrome' | 'firefox' | 'safari' | 'edge' | 'ie';
export type Version = string | boolean | undefined;

export interface Source {
  id: string | number; // URL in case of external, int id in case of inline
  content: string;
  external: boolean;
}

export interface Issue {
  type: 'at-rule' | 'property' | 'selector' | 'value';
  title: string;
  data: any;
  instances: Array<{
    source: Source['id'];
    start: {
      column: number;
      line: number;
    };
    end: {
      column: number;
      line: number;
    };
  }>;
  missingPrefixes?: any;
}

export interface Issues {
  [browserKey: string]: {
    [version: string]: {
      [property: string]: Issue;
    };
  };
}

export interface GroupedIssues {
  [browserKey: string]: Array<IssueRange>;
}

export interface IssueRange {
  browser: string;
  versions: {
    first: string;
    last: string;
  };
  issues: {
    [property: string]: Issue;
  };
}

export interface SupportUnit {
  version_added?: string;
  version_removed?: string;
  prefix?: string;
  flags?: [
    {
      type: string;
      name: string;
      value_to_set: string;
    }
  ];
  notes?: string;
  alternative_name?: string;
}

export type Support = SupportUnit | Array<SupportUnit>
