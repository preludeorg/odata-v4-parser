import { Parser } from '../src/parser';
import { findAll, findOne } from '../src/utils';
import { TokenType } from '../src/lexer';


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

    expect(findOne(parser.resourcePath('Categories(123)/A'), TokenType.KeyPropertyValue).raw)
      .toEqual('123');

    parser.resourcePath('/Categories(123)/A');
    parser.resourcePath('/Categories(0)/$ref');
    parser.resourcePath('/Categories(0)/Product/$ref');

  });

  it('should parse function call', () => {

    // function call is similar to collection resource

    parser.resourcePath('/ProductsByCategoryId(categoryId=2)');

    parser.resourcePath('/ProductsByCategoryId');

  });


});
