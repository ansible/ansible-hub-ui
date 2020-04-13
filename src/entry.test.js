/*global describe, it, expect*/
import getBaseName from './utilities/getBaseName';

describe('utilities/getBaseName', () => {
  it('should find the right base name on Stable ', () => {
    expect(getBaseName('/insights/foo/bar/baz')).toEqual('/insights/foo');
    expect(getBaseName('/rhcs/bar/bar/baz')).toEqual('/rhcs/bar');
  });

  it('should find the right base name on Beta ', () => {
    expect(getBaseName('/beta/insights/foo/bar/baz')).toEqual(
      '/beta/insights/foo',
    );
    expect(getBaseName('/beta/test/fff/bar/baz')).toEqual('/beta/test/fff');
  });
});
