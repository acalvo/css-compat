import { browsers } from './browsers';
import { BrowserKey, Support, SupportUnit, Version } from './types';

export class Helpers {

  public static getUnsupportedVersions(browserKey: BrowserKey, versionAdded: Version, versionRemoved: Version) {
    if (versionAdded === true) {
      return [];
    }
    const allReleases = Array.from(browsers.get(browserKey).releases.keys()).reverse();
    if (!versionAdded) {
      return allReleases;
    }
    const indexAdded = allReleases.findIndex(key => key === versionAdded);
    const indexRemoved = allReleases.findIndex(key => key === versionRemoved);
    let versions = allReleases.slice(indexAdded + 1);
    if (indexRemoved !== -1) {
      versions = allReleases.slice(0, indexRemoved + 1).concat(versions);
    }
    return versions;
  }

  public static getSupportUnit(browserSupport: Support, prefix = undefined): SupportUnit {
    const arr = Array.isArray(browserSupport) ? browserSupport : [browserSupport];
    return arr.filter(x => !x.flags && prefix === x.prefix).shift() || {};
  }

  public static getPossiblePrefixes() {
    return ['-webkit-', '-moz-', '-ms-'];
  }

  public static getSourceIndex(cssInputId: string): number {
    return parseInt(cssInputId.slice(11, -1), 10) - 1;
  }

}
