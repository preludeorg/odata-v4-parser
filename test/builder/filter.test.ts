import { filter, ODataFilter } from '../../src';

describe('OData Query Builder - Filter Test Suite', () => {

  it('should support filter by value/name', () => {

    expect(ODataFilter.New().field('A').eq('a').toString()).toBe("A eq 'a'");
    expect(ODataFilter.New().field('A').eq(1).toString()).toBe('A eq 1');

  });

  it('should support filter by object', () => {
    interface Type {
      A: number;
      B: string;
    }
    expect(ODataFilter.New<Type>({ A: 1, B: '2' }).toString()).toBe("A eq 1 and B eq '2'");
  });

  it('should support filter alias', () => {
    expect(filter({A:1}).build()).toBe('A eq 1');
  });

});
