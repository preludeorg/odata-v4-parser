import { filter, literalValues, ODataFilter } from '../../src';

describe('OData Query Builder - Filter Test Suite', () => {

  it('should support filter by value/name', () => {

    expect(ODataFilter.New().field('A').eq('a').toString()).toBe("A eq 'a'");
    expect(ODataFilter.New().field('A').eq(literalValues.String("a")).toString()).toBe("A eq 'a'");
    expect(ODataFilter.New().field('A').eq(1).toString()).toBe('A eq 1');

  });

  it('should support filter by object', () => {
    interface Type {
      A: number;
      B: string;
    }
    expect(ODataFilter.New<Type>({ A: 1, B: '2' }).toString()).toBe("A eq 1 and B eq '2'");

    expect(ODataFilter.New<any>({
      A: literalValues.Int16(12),
      B: literalValues.String('12')
    }).toString()).toBe("A eq 12 and B eq '12'");
  });

  it('should support filter alias', () => {
    expect(filter({ A: 1 }).build()).toBe('A eq 1');
  });

  it('should support filter guid', () => {
    expect(
      filter()
        .field("A")
        .eq(literalValues.Guid("253f842d-d739-41b8-ac8c-139ac7a9dd14"))
        .build()
    ).toBe("A eq 253f842d-d739-41b8-ac8c-139ac7a9dd14")

    expect(
      filter({ A: literalValues.Guid("253f842d-d739-41b8-ac8c-139ac7a9dd14") })
        .build()
    ).toBe("A eq 253f842d-d739-41b8-ac8c-139ac7a9dd14")
  });

  it('should support filter with type', () => {
    expect(filter({ A: 1 }).build()).toBe("A eq 1")
    expect(filter({ A: literalValues.String('1') }).build()).toBe("A eq '1'")
    expect(filter({ A: literalValues.Guid("253f842d-d739-41b8-ac8c-139ac7a9dd14") }).build()).toBe("A eq 253f842d-d739-41b8-ac8c-139ac7a9dd14")
  });

});
