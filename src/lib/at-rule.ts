import { BrowserKey, Issues, Source } from './types';
import compatData from './data.json';
import { Helpers } from './helpers';
import { AtRule as postcssAtRule } from 'postcss';

export class AtRule {
  constructor(private node: postcssAtRule) {
  }

  public process(issues: Issues) {
    if (!compatData.css['at-rules'][this.node.name]) {
      return;
    }
    const atRuleIssues = {};
    atRuleIssues[this.node.name] = compatData.css['at-rules'][this.node.name];
    const properties = Object.keys(atRuleIssues[this.node.name]).filter(p => {
      return atRuleIssues[this.node.name][p].__compat;
    });

    if (this.node.name === 'media') {
      properties.forEach(p => {
        if (this.node.params.includes(p)) {
          atRuleIssues[`${this.node.name}/${p}`] = atRuleIssues[this.node.name][p];
        }
      });
    } else {
      this.node.walkDecls(declaration => {
        if (properties.includes(declaration.prop)) {
          atRuleIssues[`${this.node.name}/${declaration.prop}`] = atRuleIssues[this.node.name][declaration.prop];
        }
      });
    }

    Object.keys(atRuleIssues).forEach(issueKey => {
      const issueSupport = atRuleIssues[issueKey].__compat.support;

      Object.keys(issueSupport).forEach((browser: BrowserKey) => {
        const support = Helpers.getSupportUnit(issueSupport[browser]);
        const unsupportedVersions = Helpers.getUnsupportedVersions(browser, support.version_added, support.version_removed);
        unsupportedVersions.forEach(version => {
          const [atrule] = issueKey.split('/');
          if (!issueKey.includes('/') || Object.keys(issues[browser][version]).every(t => t !== `@${atrule}`)) {
            if (!issues[browser][version][`@${issueKey}`]) {
              issues[browser][version][`@${issueKey}`] = {
                type: 'at-rule',
                title: `@${issueKey}`,
                data: atRuleIssues[issueKey],
                instances: []
              };
            }
            issues[browser][version][`@${issueKey}`].instances.push({
              source: Helpers.getSourceIndex(this.node.source.input.id),
              start: this.node.source.start,
              end: this.node.source.end
            });
          }
        });
      });
    });
  }
}
