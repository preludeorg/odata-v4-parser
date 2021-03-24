import { defaultParser } from '../src';

describe('Issue Related Test Suite', () => {

  it('should support paser uri with geography - Polygon', () => {

    const t = defaultParser.odataUri("/Products?$filter=geo.intersects(Location, geography'SRID=12345;Polygon((-127.89734578345 45.234534534,-127.89734578345 45.234534534,-127.89734578345 45.234534534,-127.89734578345 45.234534534))')");
    expect(t).not.toBeUndefined();

  });

  it('should support paser uri with geography - POLYGON', () => {

    const t = defaultParser.odataUri("/Products?$filter=geo.intersects(Location, geography'SRID=12345;POLYGON((-127.89734578345 45.234534534,-127.89734578345 45.234534534,-127.89734578345 45.234534534,-127.89734578345 45.234534534))')");
    expect(t).not.toBeUndefined();

  });
});
