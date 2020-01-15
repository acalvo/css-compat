import { Source, Issues } from './stylesheet';
import compatData from './data.json';
import { Helpers } from './helpers';
import { AtRule as postcssAtRule } from 'postcss';

export class AtRule {
  constructor(private node: postcssAtRule, private source: Source) {
  }

  public process(issues: Issues) {
    const atRuleIssues = {};
    atRuleIssues[this.node.name] = compatData.css['at-rules'][this.node.name];
    const properties = Object.keys(atRuleIssues[this.node.name]).filter(p => {
      return atRuleIssues[this.node.name][p].__compat?.status.deprecated === false;
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

      Object.keys(issueSupport).forEach(browser => {
        const unsupportedVersions = Helpers.getUnsupportedVersions({
          browser,
          added: issueSupport[browser].version_added || issueSupport[browser][0]?.version_added,
          removed: issueSupport[browser].version_removed
        });

        unsupportedVersions.forEach(version => {
          const [atrule] = issueKey.split('/');
          if (issues[browser][version].every(i => i.title !== `@${atrule}`)) {
            issues[browser][version].push({
              data: atRuleIssues[issueKey],
              instance: {
                start: this.node.source.start,
                end: this.node.source.end
              },
              source: this.source.id,
              subType: 'at-rule',
              title: `@${issueKey}`,
              type: 'CSS'
            });
          }
        });
      });
    });
  }
}
