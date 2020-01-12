import { AtRule } from './at-rule';
import cssBeautify from 'cssbeautify';
import Declaration from './Declaration';
import { browsers } from './browsers';
import postcss from 'postcss';
import Selector from './Selector';

export interface Source {
  id: string | number; // URL in case of external, int id in case of inline
  content: string;
  external: boolean;
}

export interface Issues {
  [browserKey: string]: {
    [version: string]: Array<any>;
  };
}

export class Stylesheet {
  issues: Issues = {}
  sources: Array<Source> = []

  constructor() {
    Array.from(browsers.keys()).forEach(browser => {
      this.issues[browser] = {};

      Array.from(browsers.get(browser).releases.keys()).forEach(version => {
        this.issues[browser][version] = [];
      });
    });
  }

  public add(source: Source) {
    this.sources.push(source);
  }

  private groupIssues(issues: Issues, property: string) {
    const groupedIssues: Issues = {};

    Object.keys(issues).forEach(browser => {
      groupedIssues[browser] = groupedIssues[browser] || {};

      Object.keys(issues[browser]).forEach(version => {
        groupedIssues[browser][version] = issues[browser][version].reduce((issues, issue) => {
          const key = issue[property];

          issues[key] = issues[key] || [];
          issues[key].push(issue);

          return issues;
        }, {});
      });
    });

    return groupedIssues;
  }

  public parse() {
    const failedSources = [];
    const processedSources = {};

    const queue = this.sources.map(source => {
      const plugin = postcss.plugin('postcss-css-report', (opts) => (css, result) => {
        css.walkRules((rule) => this.processRule(source, rule));
        css.walkAtRules((node) => this.processAtRule(source, node));
      });
      const formattedCss = cssBeautify(source.content);

      return postcss([plugin])
        .process(formattedCss, { from: undefined })
        .then(result => {
          processedSources[source.id] = result.css;

          return result;
        })
        .catch(err => {
          console.log('** CSS parse error:', err);

          failedSources.push(source.id);
        });
    });

    return Promise.all(queue).then(stylesheets => ({
      data: this.groupIssues(this.issues, 'title'),
      failedSources,
      stylesheets: processedSources,
      allSources: this.sources
    }));
  }

  private processAtRule(source: Source, node: postcss.AtRule) {
    const atRule = new AtRule(node, source);
    atRule.process(this.issues);
  }

  private processRule(source: Source, rule: postcss.Rule) {
    const ruleCache = {};

    // Process selector
    if (rule.selector) {
      const selector = new Selector(
        rule.selector,
        source,
        rule
      );

      selector.process(this.issues);
    }

    // Process declarations
    rule.walkDecls(declarationNode => {
      const declaration = new Declaration(
        declarationNode,
        source,
        rule,
        ruleCache
      );

      declaration.process(this.issues);
    });
  }
}
