import { GroupedIssues, Issues, Source } from './types';
import { AtRule } from './at-rule';
import { Declaration } from './declaration';
import { browsers } from './browsers';
import postcss from 'postcss';
import { Selector } from './selector';

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
    const groupedIssues: GroupedIssues = {};

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

      return postcss([plugin])
        .process(source.content, { from: undefined })
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
    const declaration = new Declaration(
      rule,
      source
    );

    declaration.process(this.issues);
  }
}
