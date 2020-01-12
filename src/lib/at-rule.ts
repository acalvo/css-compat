import compatData from './data.json';
import Helpers from './Helpers';

export class AtRule {
  constructor(private node, private source) {
  }

  public process(issues) {
    const atRuleIssues = {};

    console.log(this.node);

    switch (this.node.name) {
      case 'counter-style': {
        const counterStyleCompat = compatData.css['at-rules']['counter-style'];

        atRuleIssues['counter-style'] = counterStyleCompat;

        const counterStyleProperties = [
          'additive-symbols',
          'fallback',
          'negative',
          'pad',
          'prefix',
          'range',
          'speak-as',
          'suffix',
          'symbols',
          'system'
        ];

        this.node.walkDecls(declaration => {
          if (counterStyleProperties.includes(declaration.prop)) {
            atRuleIssues[`counter-style.${declaration.prop}`] = counterStyleCompat[declaration.prop];
          }
        });

        break;
      }
      case 'font-face': {
        const fontFaceCompat = compatData.css['at-rules']['font-face'];

        atRuleIssues['font-face'] = fontFaceCompat;

        const fontFaceProperties = [
          'font-display',
          'font-family',
          'font-feature-settings',
          'font-style',
          'font-weight',
          'src',
          'unicode-range'
        ];

        this.node.walkDecls(declaration => {
          if (fontFaceProperties.includes(declaration.prop)) {
            atRuleIssues[`font-face.${declaration.prop}`] = fontFaceCompat[declaration.prop];
          }
        });

        break;
      }
    }
    console.log(Object.keys(atRuleIssues));

    Object.keys(atRuleIssues).forEach(issueKey => {
      const issueSupport = atRuleIssues[issueKey].__compat.support;

      Object.keys(issueSupport).forEach(browser => {
        const unsupportedVersions = Helpers.getUnsupportedVersions({
          browser,
          added: issueSupport[browser].version_added,
          removed: issueSupport[browser].version_removed
        });

        unsupportedVersions.forEach(version => {
          issues[browser][version].push({
            data: issueSupport,
            compat: atRuleIssues[issueKey].__compat,
            instance: {
              start: this.node.source.start,
              end: this.node.source.end
            },
            source: this.source.id,
            subType: 'at-rule',
            title: `@${issueKey}`,
            type: 'CSS'
          });
        });
      });
    });
  }
}
