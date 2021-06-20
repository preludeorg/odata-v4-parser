import { get } from '@newdash/newdash';
import { Edm } from "@odata/metadata";
import { defaultParser, ODataDateTimeOffsetV4, ODataDateTimeV4, ODataFilter } from '../src';


describe('Filter Test Suite', () => {

  it('should support simple eq', () => {
    defaultParser.query('$format=json&$filter=A eq 2');
  });

  it('should support complex query', () => {
    defaultParser.query('$format=json&$filter=(A eq 2) and (B eq 3 or B eq 4)');
  });

  it('should support eq with guid & string', () => {
    const ast = defaultParser.query("$filter=A eq 702dac82-923d-4958-805b-ca41c593d74f and B eq 'strValue'")
    expect(ast).not.toBeNull()
    expect(get(ast, "value.options[0].value.value.left.value.right.value")).toBe(Edm.Guid.className)
    expect(get(ast,"value.options[0].value.value.right.value.right.value")).toBe(Edm.String.className)
  });

  it('should support complex filter', () => {

    const sFilter = ODataFilter.New()
      .field('A').eq(1).field('A').eq(2)
      .field('B').gt(3)
      .field('C').between(1, 3)
      .field('F').between(1, 3, true)
      .field('E').in(['a', 'c', 'd'])
      .field('year(Date)').eq(2010)
      .field('Date2').gt(ODataDateTimeOffsetV4.from('2020-07-30T03:16:27.023Z'))
      .field('Date3').lt(ODataDateTimeV4.from(new Date()))
      .toString();

    defaultParser.filter(sFilter);

  });

});
