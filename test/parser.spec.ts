import { defaultParser, Token, TokenType } from '../src';
import { Parser } from '../src/parser';
import { assertType, isType } from '../src/utils';

describe('Parser', () => {
  it('should instantiate odata parser', () => {
    const parser = new Parser();
    const ast = parser.filter("Categories/all(d:d/Title eq 'alma')");
    expect(ast).toMatchSnapshot();
  });

  it('should parse query string', () => {
    const parser = new Parser();
    const ast = parser.query("$filter=Title eq 'alma'");
    expect(ast.value.options[0].type).toEqual('Filter');
  });

  it('should parse functions with parameters', () => {
    const parser = new Parser();
    const ast = parser.filter("matchespattern(Title, '^foo.+')");
    assertType(ast, TokenType.MethodCallExpression);
    expect(ast.type).toEqual('MethodCallExpression');
    expect(ast.value.method).toEqual('matchespattern');
    expect(ast.value.parameters[0].raw).toEqual('Title');
    expect(ast.value.parameters[1].raw).toEqual("'^foo.+'");
    expect(ast.value.parameters[1].value).toEqual('Edm.String');
  });

  it('should parse multiple orderby params', () => {
    const parser = new Parser();
    const ast = parser.query('$orderby=foo,bar');
    assertItems(ast.value.options[0]);
    expect(ast.value.options[0].value.items[0].raw).toEqual('foo');
    expect(ast.value.options[0].value.items[1].raw).toEqual('bar');
  });

  it('should parse multiple orderby params with optional space', () => {
    const parser = new Parser();
    const ast = parser.query('$orderby=foo, bar');
    assertItems(ast.value.options[0]);
    expect(ast.value.options[0].value.items[0].raw).toEqual('foo');
    expect(ast.value.options[0].value.items[1].raw).toEqual('bar');
  });

  it('should parse custom query options', () => {
    const parser = new Parser();
    const ast = parser.query('foo=123&bar=foobar');

    expect(ast.value.options[0].type).toBe(TokenType.CustomQueryOption);
    expect(ast.value.options[1].type).toBe(TokenType.CustomQueryOption);

    if (isType(ast.value.options[0],TokenType.CustomQueryOption)) {
      expect(ast.value.options[0].value.key).toEqual('foo');
      expect(ast.value.options[0].value.value).toEqual('123');
    }

    if (isType(ast.value.options[1],TokenType.CustomQueryOption)) {
      expect(ast.value.options[1].value.key).toEqual('bar');
      expect(ast.value.options[1].value.value).toEqual('foobar');
    }
  });

  it('should throw error parsing invalid custom query options', () => {
    expect(() => {defaultParser.query('$foo=123');}).toThrow();
  });
});

function assertItems<T extends TokenType>(
  token: Token<T>
): asserts token is Token<T> & { value: { items: Token[] } } {
  if (typeof token.value !== 'object' || !('items' in token.value)) {
    throw new Error();
  }
}
