import { browsers } from './browsers';

export class Helpers {

  public static getUnsupportedVersions({ browser, added, removed }) {
    const browserData = Array.from(browsers.get(browser).releases.keys()).reverse();

    if (!browserData || added === true) {
      return [];
    }

    const indexAdded = browserData.findIndex(key => key === added);
    const indexRemoved = browserData.findIndex(key => key === removed);

    let versions = browserData;

    if (indexAdded !== -1) {
      versions = versions.slice(indexAdded + 1);
    }

    if (indexRemoved !== -1) {
      versions = browserData.slice(0, indexRemoved + 1).concat(versions);
    }

    return versions;
  }

  public static getArrayIntersection(arrays) {
    const head = arrays[0];
    const tail = arrays.slice(1);

    return head.filter(value => {
      return tail.every(array => array.includes(value));
    });
  }

  public static mdnVersionToSemver(version) {
    switch (version) {
      case true:
        return '0.0.0';

      case false:
        return 'Infinity.0.0';

      default:
        return version;
    }
  }

}