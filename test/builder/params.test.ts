import { ODataFilter, ODataParam, ODataQueryParam, param } from '../../src';

describe('ODataParams Test', () => {

  test('ODataQueryParam alias', () => {
    expect(ODataParam).toEqual(ODataQueryParam);
  });

  test('ODataParam skip and top', () => {
    const param = ODataParam.New().skip(30).top(10);
    expect(decodeURIComponent(param.toString())).toEqual('$skip=30&$top=10');
  });

  test('ODataParam orderby', () => {
    const param = ODataParam.New().orderby('CreationDateTime');
    expect(decodeURIComponent(param.toString())).toEqual('$orderby=CreationDateTime desc');
  });

  test('ODataParam filter', () => {
    const param = ODataParam.New().filter(ODataFilter.New().field('A').eqString('test'));
    expect(param.toString()).toEqual("$filter=A eq 'test'");
    const param2 = ODataParam.New().filter("A eq 'test'");
    expect(decodeURIComponent(param2.toString())).toEqual("$filter=A eq 'test'");
    expect(() => {
      ODataParam.New().filter(undefined);
    }).toThrow();
  });

  test('ODataParam count true', () => {
    const param = ODataParam.New().count(true);
    expect(decodeURIComponent(param.toString())).toEqual('$count=true');
  });

  test('ODataParam orderby multi', () => {
    const param = ODataParam.New().orderbyMulti([{ field: 'A' }, { field: 'B', order: 'asc' }]);
    expect(decodeURIComponent(param.toString())).toEqual('$orderby=A desc,B asc');
    const p2 = ODataParam.New().orderby([{ field: 'A' }, { field: 'B', order: 'asc' }]);
    expect(decodeURIComponent(p2.toString())).toEqual('$orderby=A desc,B asc');
  });

  test('ODataParam search', () => {
    const param = ODataParam.New().search('any word');
    expect(param.toString()).toEqual('$search=any word');
  });

  test('ODataParam select', () => {
    const param = ODataParam.New().select('ObjectID');
    expect(decodeURIComponent(param.toString())).toEqual('$select=ObjectID');
  });

  test('ODataParam select (duplicate)', () => {
    const param = ODataParam.New().select(['ObjectID', 'F1', 'F1']);
    expect(decodeURIComponent(param.toString())).toEqual('$select=ObjectID,F1');
  });

  test('ODataParam select multi', () => {
    const param = ODataParam
      .New()
      .select('ObjectID')
      .select('Name');
    expect(decodeURIComponent(param.toString())).toEqual('$select=ObjectID,Name');
  });

  test('expand navigation & replace', () => {
    const param = ODataParam.New().expand('Customer');
    expect(decodeURIComponent(param.toString())).toEqual('$expand=Customer');
    param.expand(['Customer', 'Employee'], true);
    expect(decodeURIComponent(param.toString())).toEqual('$expand=Customer,Employee');
    expect(decodeURIComponent(ODataParam.New().expand('*').toString())).toEqual('$expand=*');
  });

  it('should support param.filter(obj)', () => {
    const param = ODataParam.New().filter({ A: true, B: 1, C: 'B' });
    expect(param.toString()).toBe("$filter=A eq true and B eq 1 and C eq 'B'");
  });

  it('should support params alias', () => {
    expect(param().top(1).toString()).toBe('$top=1');
  });

  it('should support params with count', () => {
    expect(param().count(true).toString('v2')).toBe('$inlinecount=allpages');
    expect(param().count(true).toString('v4')).toBe('$count=true');
  });

});
