import { Edm, filter, ODataFilter } from '../../src';

describe('OData Query Builder - Filter Test Suite', () => {

  it('should support filter by value/name', () => {

    expect(ODataFilter.New().field('A').eq('a').toString()).toBe("A eq 'a'");
    expect(ODataFilter.New().field('A').eq(Edm.String.createValue("a")).toString()).toBe("A eq 'a'");
    expect(ODataFilter.New().field('A').eq(1).toString()).toBe('A eq 1');

  });

  it('should support filter by object', () => {
    interface Type {
      A: number;
      B: string;
    }
    expect(ODataFilter.New<Type>({ A: 1, B: '2' }).toString()).toBe("A eq 1 and B eq '2'");

    expect(ODataFilter.New<any>({
      A: Edm.Int16.createValue(12),
      B: Edm.String.createValue('12')
    }).toString()).toBe("A eq 12 and B eq '12'");
  });

  it('should support filter alias', () => {
    expect(filter({ A: 1 }).build()).toBe('A eq 1');
  });

  it('should support filter guid', () => {
    expect(
      filter()
        .field("A")
        .eq(Edm.Guid.createValue("253f842d-d739-41b8-ac8c-139ac7a9dd14"))
        .build()
    ).toBe("A eq 253f842d-d739-41b8-ac8c-139ac7a9dd14")

    expect(
      filter({ A: Edm.Guid.createValue("253f842d-d739-41b8-ac8c-139ac7a9dd14") })
        .build()
    ).toBe("A eq 253f842d-d739-41b8-ac8c-139ac7a9dd14")
  });

});
