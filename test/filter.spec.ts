import { get } from '@newdash/newdash';
import { Edm } from '@odata/metadata';
import { defaultParser, ODataFilter, ODataParam } from '../src';


describe('Filter Test Suite', () => {

  it('should support simple eq', () => {
    defaultParser.query('$format=json&$filter=A eq 2');
  });

  it('should support complex query', () => {
    defaultParser.query('$format=json&$filter=(A eq 2) and (B eq 3 or B eq 4)');
  });

  it('should support eq with guid & string', () => {
    const ast = defaultParser.query("$filter=A eq 702dac82-923d-4958-805b-ca41c593d74f and B eq 'strValue'");
    expect(ast).not.toBeNull();
    expect(get(ast, 'value.options[0].value.value.left.value.right.value')).toBe(Edm.Guid.className);
    expect(get(ast, 'value.options[0].value.value.right.value.right.value')).toBe(Edm.String.className);
  });
  
  it('shuold support filter without double quote', () => {
    const filter = ODataFilter.New().field("key").eq('val')
    const filterStr = ODataParam.New().filter(filter).toString()
    expect(filterStr).toMatchSnapshot()
    const ast = defaultParser.query(filterStr)
    expect(ast).toMatchSnapshot()
  })

  it('shuold support filter with double quote', () => {
    const filter = ODataFilter.New().field("key").eq('val"')
    const filterStr = ODataParam.New().filter(filter).toString()
    expect(filterStr).toMatchSnapshot()
    const ast = defaultParser.query(filterStr)
    expect(ast).toMatchSnapshot()
  })

  it('should support complex filter', () => {

    const sFilter = ODataFilter.New()
      .field('A').eq(1).field('A').eq(2)
      .field('B').gt(3)
      .field('C').between(1, 3)
      .field('F').between(1, 3, true)
      .field('E').in(['a', 'c', 'd'])
      .field('year(Date)').eq(2010)
      .field('Date2').gt(Edm.DateTimeOffset.createValue('2020-07-30T03:16:27.023Z'))
      .field('Date3').lt(Edm.DateTimeOffset.createValue(new Date()))
      .toString();

    defaultParser.filter(sFilter);

  });

});
