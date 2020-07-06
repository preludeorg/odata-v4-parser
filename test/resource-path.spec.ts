import { Parser } from '../src/parser';


describe('ResourcePath Test Suite', () => {

  const parser = new Parser();

  it('should parse $metadata', () => {

    parser.resourcePath('$metadata');
    parser.resourcePath('/$metadata');

  });

  it('should parse collection with parameter', () => {

    parser.resourcePath('Categories(123)');
    parser.resourcePath('/Categories(123)');
    parser.resourcePath('/Categories(A=123)');
    parser.resourcePath("/Categories('123')");

  });

  it('should parse collection with navigation', () => {

    parser.resourcePath('Categories(1)/Product(2)');
    parser.resourcePath('/Categories(2)/Product(ID=3)');

  });


  it('should parse collection with path', () => {

    parser.resourcePath('Categories(123)/A');
    parser.resourcePath('/Categories(123)/A');
    parser.resourcePath('/Categories(0)/$ref');
    parser.resourcePath('/Categories(0)/Product/$ref');

  });


});
