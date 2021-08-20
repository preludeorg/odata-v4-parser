import { Parser } from '../src/parser';


describe('json parser', () => {
  const parser = new Parser();

  it('should support key-value', () => {

    const jsonObject = JSON.stringify({ 'v1': false, 'v2': 1, 'v3': null, 'v4': '' });
    const token = parser.arrayOrObject(jsonObject);
    expect(token?.value?.value?.items?.map((item) => item?.value?.value?.value))
      .toEqual(['boolean', 'number', 'null', 'string']);

  });

});

