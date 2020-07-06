import { Parser } from '../src/parser';

describe('Query Test Suite', () => {

  const parser = new Parser();

  const expands = [
    ['$expand=A', 'A'],
    ['$expand=A/V', 'A/V'],
    ['$expand=A/B/C', 'A/B/C'],
    ['$expand=A,B/C', 'A'],
    ['$expand=*', '*']
  ];

  expands.forEach(([original, parsed]) => {

    it(`should parse ${original}`, () => {

      expect(parser.query(original).value.options[0].value.items[0].raw).toEqual(parsed);

    });

  });

  it('should parse $top', () => {
    expect(parser.query('$top=1').value.options[0].value.raw).toEqual('1');
  });


  it('should parse $select', () => {
    expect(parser.query('$select=A').value.options[0].value.items[0].value.raw).toEqual('A');
    expect(parser.query('$select=*').value.options[0].value.items[0].value.value).toEqual('*');
    expect(parser.query('$select=A,B,C').value.options[0].value.items.map((v) => v.value.value.value.name)).toStrictEqual(['A', 'B', 'C']);
  });


});
