import * as Expressions from './expressions';
import * as ArrayOrObject from './json';
import * as ODataUri from './odataUri';
import * as PrimitiveLiteral from './primitiveLiteral';
import * as Query from './query';
import * as ResourcePath from './resourcePath';
import * as Token from './token';
import { SourceArray } from './utils';

export const parserFactory = function<T extends Token.LexerToken>(
  fn: (value: SourceArray, index: number, metadataContext?: any) => T | undefined
) {
  return function(source: string, options: any) {
    options = options || {};
    const raw = new Uint16Array(source.length);
    const pos = 0;
    for (let i = 0; i < source.length; i++) {
      raw[i] = source.charCodeAt(i);
    }
    const result = fn(raw, pos, options.metadata);
    if (!result) {
      throw new Error(`Fail at ${pos}`);
    }
    if (result.next < raw.length) {
      throw new Error(`Unexpected character at ${result.next}`);
    }
    return result;
  };
};

/**
 * odata uri parser
 */
export class Parser {
  /**
   * parser ast node with full odata uri
   *
   * @param source
   * @param options
   */
  odataUri(source: string, options?: any): Token.ODataUriToken | undefined {
    return parserFactory(ODataUri.odataUri)(source, options);
  }
  resourcePath(source: string, options?: any): Token.BatchToken | Token.EntityToken | Token.MetadataToken | Token.ResourcePathToken | undefined {
    return parserFactory(ResourcePath.resourcePath)(source, options);
  }
  query(source: string, options?: any): Token.QueryOptionsToken | undefined {
    return parserFactory(Query.queryOptions)(source, options);
  }
  filter(source: string, options?: any): Token.IsOfExpressionToken | Token.MethodCallExpressionToken | Token.NotExpressionToken | Token.CommonExpressionToken | Token.BoolParenExpressionToken | Token.AndExpressionToken | Token.OrExpressionToken | undefined {
    return parserFactory(Expressions.boolCommonExpr)(source, options);
  }
  keys(source: string, options?: any): Token.SimpleKeyToken | Token.CompoundKeyToken | undefined {
    return parserFactory(Expressions.keyPredicate)(source, options);
  }
  literal(source: string, options?: any): Token.LiteralToken | Token.EnumToken | undefined {
    return parserFactory(PrimitiveLiteral.primitiveLiteral)(source, options);
  }
  arrayOrObject(source: string, index?: number): Token.ArrayOrObjectToken | undefined {
    return parserFactory(ArrayOrObject.arrayOrObject)(source, index);
  }
}

export function odataUri(source: string, options?: any): Token.ODataUriToken | undefined {
  return parserFactory(ODataUri.odataUri)(source, options);
}
export function resourcePath(source: string, options?: any): Token.BatchToken | Token.EntityToken | Token.MetadataToken | Token.ResourcePathToken | undefined {
  return parserFactory(ResourcePath.resourcePath)(source, options);
}
export function query(source: string, options?: any): Token.QueryOptionsToken | undefined {
  return parserFactory(Query.queryOptions)(source, options);
}
export function filter(source: string, options?: any): Token.IsOfExpressionToken | Token.MethodCallExpressionToken | Token.NotExpressionToken | Token.CommonExpressionToken | Token.BoolParenExpressionToken | Token.AndExpressionToken | Token.OrExpressionToken | undefined {
  return parserFactory(Expressions.boolCommonExpr)(source, options);
}
export function keys(source: string, options?: any): Token.SimpleKeyToken | Token.CompoundKeyToken | undefined {
  return parserFactory(Expressions.keyPredicate)(source, options);
}
export function literal(source: string, options?: any): Token.LiteralToken | Token.EnumToken | undefined {
  return parserFactory(PrimitiveLiteral.primitiveLiteral)(source, options);
}
