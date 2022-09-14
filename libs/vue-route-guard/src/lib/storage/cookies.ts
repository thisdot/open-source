import { CookieAttributes } from '../types';

export default class CookieStorage {
  public setItem(key: string, value: string, attributes: CookieAttributes = {}) {
    attributes.expires = this.getDate(attributes?.expires || '');
    this.setCookie(key, value, attributes);
  }

  public getItem(name: string): string | null {
    if (typeof document === 'undefined' || !name) {
      return null;
    }

    const cookie = (document.cookie.replace(/;\s+/g, ';').split(';') || []).map((s) => {
      return s.replace(/\s+=\s+/g, '=').split('=');
    });
    const keyIndex = 0;
    const valueIndex = 1;

    for (let i = 0; i < cookie.length; i++) {
      if (cookie[i][keyIndex] && cookie[i][keyIndex] === name) {
        return cookie[i][valueIndex];
      }
    }

    return null;
  }

  public removeItem(name: string) {
    this.setCookie(name, '', {
      expires: -1,
    });
  }

  private setCookie(name: string, value: string, attributes: CookieAttributes = {}) {
    if (typeof document === 'undefined' || !name) {
      return;
    }

    let cookie =
      name +
      '=' +
      encodeURIComponent(value).replace(
        /%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g,
        decodeURIComponent
      ) +
      ';';

    for (const attributeName in attributes) {
      const attributeValue = attributes[attributeName as keyof CookieAttributes];

      if (attributeValue === false || attributeValue === undefined) {
        continue;
      }

      if (attributeValue === true) {
        cookie += ` ${attributeName};`;
      } else {
        cookie += ` ${attributeName}=${attributeValue};`;
      }
    }

    document.cookie = cookie;
  }

  private getDate(val: number | string): string {
    if (typeof val === 'number') {
      const milisecondsDay = 864e5;
      return new Date(Date.now() + val * milisecondsDay).toUTCString();
    }

    return val;
  }
}
