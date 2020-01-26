import { GroupedIssues, Issues, Source, StatusFilter } from './types';
import { AtRule } from './at-rule';
import { Declaration } from './declaration';
import { browsers } from './browsers';
import postcss from 'postcss';
import { Selector } from './selector';

export class Stylesheets {
  private issues: Issues = {};
  private sources: Array<Source> = [];

  constructor() {
    Array.from(browsers.keys()).forEach(browser => {
      this.issues[browser] = {};
      Array.from(browsers.get(browser).releases.keys()).forEach(version => {
        this.issues[browser][version] = {};
      });
    });
  }

  public add(source: Source) {
    const plugin = postcss.plugin('postcss-css-report', (opts) => (css, result) => {
      css.walkRules((rule) => this.processRule(source, rule));
      css.walkAtRules((node) => this.processAtRule(source, node));
    });
    return postcss([plugin])
      .process(source.content, { from: undefined })
      .then(() => {
        this.sources.push(source);
      }).catch(err => {
        console.error('[css-compat] CSS parse error:', err);
      });
  }

  public getIssues(status: StatusFilter): GroupedIssues {
    const filteredIssues: Issues = {};
    for (const browser in this.issues) {
      filteredIssues[browser] = {};
      for (const version in this.issues[browser]) {
        filteredIssues[browser][version] = {};
        for (const property in this.issues[browser][version]) {
          const s = this.issues[browser][version][property].data.__compat.status;
          const showProperty = (status.experimental || !s.experimental)
            && (status.nonstandard || s.standard_track)
            && (status.deprecated || !s.deprecated);
          if (showProperty) {
            filteredIssues[browser][version][property] = this.issues[browser][version][property];
          }
        }
      }
    }
    const groupedIssues: GroupedIssues = {};
    for (const browser in filteredIssues) {
      groupedIssues[browser] = [];
      const releases = browsers.get(browser).releases.entries();
      let result = releases.next();
      while (!result.done) {
        const releaseIssues = filteredIssues[browser][result.value[0]];
        if (groupedIssues[browser].length === 0
          || Object.keys(groupedIssues[browser][0].issues).length !== Object.keys(releaseIssues).length
          || Object.keys(releaseIssues).length !==
          (new Set(Object.keys(groupedIssues[browser][0].issues).concat(Object.keys(releaseIssues)))).size) {
          groupedIssues[browser].unshift({
            browser,
            versions: {
              first: result.value[0],
              last: undefined
            },
            issues: releaseIssues
          });
        } else {
          groupedIssues[browser][0].versions.last = result.value[0];
        }
        result = releases.next();
      }
    }
    return groupedIssues;
  }

  private processAtRule(source: Source, node: postcss.AtRule) {
    const atRule = new AtRule(node, source);
    atRule.process(this.issues);
  }

  private processRule(source: Source, rule: postcss.Rule) {
    // Process selector
    if (rule.selector) {
      const selector = new Selector(
        rule,
        source
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
