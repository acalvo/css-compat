import compatData from './data.json';
import { Helpers } from './helpers';
import objectPath from 'object-path';
import postcss from 'postcss';

export class Declaration {

  constructor(private node, private source, private rule, private ruleCache) {
  }

  public process(issues) {
    const unprefixedProperty = postcss.vendor.unprefixed(this.node.prop);

    if (this.ruleCache[unprefixedProperty]) return;

    const compatPaths = {
      [unprefixedProperty]: {
        subType: 'property',
        title: unprefixedProperty,
        type: 'CSS'
      }
    };

    Object.keys(compatPaths).filter(Boolean).forEach(compatPath => {
      return this.processCompatPath(compatPath, compatPaths[compatPath], issues);
    });
  }

  private processCompatPath(compatPath, compatPathData, issues) {
    const unprefixedProperty = postcss.vendor.unprefixed(this.node.prop);
    const propertyCompatData = objectPath.get(compatData.css.properties, compatPath);

    if (!propertyCompatData || !propertyCompatData.__compat) return;

    const propertySuppport = propertyCompatData.__compat.support;

    Object.keys(propertySuppport).forEach(browser => {
      let missingPrefixesForVersion = {};
      let unsupportedVersions = [];

      if (Array.isArray(propertySuppport[browser])) {
        const prefixesInRule = [];

        this.rule.walkDecls(declaration => {
          if (postcss.vendor.unprefixed(declaration.prop) === unprefixedProperty) {
            const prefix = postcss.vendor.prefix(declaration.prop);
            prefixesInRule.push(prefix);
          }
        });

        // So that we don't process the same property multiple times
        // within this rule.
        this.ruleCache[unprefixedProperty] = true;

        // The main variant is the one that doesn't contain any keys other than
        // `version_added` and `version_removed`.
        const mainVariantIndex = propertySuppport[browser].findIndex(variant => {
          return Object.keys(variant).filter(property => {
            return ![
              'notes',
              'version_added',
              'version_removed'
            ].includes(property);
          }).length === 0;
        });
        const unsupportedVersionsForMainVariant = Helpers.getUnsupportedVersions({
          browser,
          added: propertySuppport[browser][mainVariantIndex].version_added,
          removed: propertySuppport[browser][mainVariantIndex].version_removed
        });

        const unsupportedVersionsForVariants = [unsupportedVersionsForMainVariant];

        missingPrefixesForVersion = propertySuppport[browser].reduce((result, variant, index) => {
          if (
            index === mainVariantIndex ||
            !variant.prefix ||
            variant.flag
          ) {
            return result;
          }

          const unsupportedVersionsForVariant = Helpers.getUnsupportedVersions({
            browser,
            added: variant.version_added,
            removed: variant.version_removed
          });

          // These versions are not supported by the main variant but supported
          // by adding a prefix.
          const addedVersions = unsupportedVersionsForMainVariant.filter(version => {
            return !unsupportedVersionsForVariant.includes(version);
          });

          addedVersions.forEach(version => {
            result[version] = result[version] || [];

            if (!result[version].includes(variant.prefix)) {
              result[version].push(variant.prefix);
            }
          });

          if (prefixesInRule.includes(variant.prefix)) {
            unsupportedVersionsForVariants.push(unsupportedVersionsForVariant);
          }

          return result;
        }, {});

        unsupportedVersions = Helpers.getArrayIntersection(unsupportedVersionsForVariants);
      } else {
        unsupportedVersions = Helpers.getUnsupportedVersions({
          browser,
          added: propertySuppport[browser].version_added,
          removed: propertySuppport[browser].version_removed
        });
      }

      unsupportedVersions.forEach(version => {
        const versionData = Object.assign({}, compatPathData, {
          data: propertyCompatData,
          instance: {
            start: this.node.source.start,
            end: this.node.source.end
          },
          source: this.source.id
        });

        if (missingPrefixesForVersion[version]) {
          versionData.missingPrefixes = missingPrefixesForVersion[version];
        }

        issues[browser][version].push(versionData);
      });
    });
  }
}
