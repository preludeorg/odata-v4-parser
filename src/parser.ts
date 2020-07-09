import * as Lexer from './lexer';
import * as PrimitiveLiteral from './primitiveLiteral';
import * as Expressions from './expressions';
import * as Query from './query';
import * as ResourcePath from './resourcePath';
import * as ODataUri from './odataUri';
import * as ArrayOrObject from './json';

export const parserFactory = function(fn) {
  return function(source, options) {
    options = options || {};
    const raw = new Uint16Array(source.length);
    const pos = 0;
    for (let i = 0; i < source.length; i++) {
      raw[i] = source.charCodeAt(i);
    }
    const result = fn(raw, pos, options.metadata);
    if (!result) { throw new Error(`Fail at ${pos}`); }
    if (result.next < raw.length) { throw new Error(`Unexpected character at ${result.next}`); }
    return result;
  };
};

export class Parser {
  odataUri(source: string, options?: any): Lexer.Token {
    return parserFactory(ODataUri.odataUri)(source, options);
  }
  resourcePath(source: string, options?: any): Lexer.Token {
    return parserFactory(ResourcePath.resourcePath)(source, options);
  }
  query(source: string, options?: any): Lexer.Token {
    return parserFactory(Query.queryOptions)(source, options);
  }
  filter(source: string, options?: any): Lexer.Token {
    return parserFactory(Expressions.boolCommonExpr)(source, options);
  }
  keys(source: string, options?: any): Lexer.Token {
    return parserFactory(Expressions.keyPredicate)(source, options);
  }
  literal(source: string, options?: any): Lexer.Token {
    return parserFactory(PrimitiveLiteral.primitiveLiteral)(source, options);
  }
  arrayOrObject(source: string, index?: number): Lexer.Token {
    return parserFactory(ArrayOrObject.arrayOrObject)(source, index);
  }
}

export function odataUri(source: string, options?: any): Lexer.Token {
  return parserFactory(ODataUri.odataUri)(source, options);
}
export function resourcePath(source: string, options?: any): Lexer.Token {
  return parserFactory(ResourcePath.resourcePath)(source, options);
}
export function query(source: string, options?: any): Lexer.Token {
  return parserFactory(Query.queryOptions)(source, options);
}
export function filter(source: string, options?: any): Lexer.Token {
  return parserFactory(Expressions.boolCommonExpr)(source, options);
}
export function keys(source: string, options?: any): Lexer.Token {
  return parserFactory(Expressions.keyPredicate)(source, options);
}
export function literal(source: string, options?: any): Lexer.Token {
  return parserFactory(PrimitiveLiteral.primitiveLiteral)(source, options);
}

export * from './types';
