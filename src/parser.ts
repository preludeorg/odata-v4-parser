import * as Expressions from './expressions';
import * as ArrayOrObject from './json';
import * as Lexer from './lexer';
import * as ODataUri from './odataUri';
import * as PrimitiveLiteral from './primitiveLiteral';
import * as Query from './query';
import * as ResourcePath from './resourcePath';
import * as Token from './token';
import { SourceArray } from './utils';

interface Options {
  metadata?: Lexer.MetadataContext;
}

type ParserFn<T extends Lexer.TokenType> = (
  value: SourceArray,
  index: number,
  metadataContext?: Lexer.MetadataContext
) => Token.TokenOfType<T> | undefined;

export const parserFactory = function<T extends Lexer.TokenType>(fn: ParserFn<T>) {
  return function(source: string, options: Options = {}) {
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
  odataUri(source: string, options?: Options): Lexer.Token<Lexer.TokenType.ODataUri> {
    return parserFactory(ODataUri.odataUri)(source, options);
  }
  resourcePath(source: string, options?: Options): Token.TokenOfType<
    | Lexer.TokenType.Batch
    | Lexer.TokenType.Entity
    | Lexer.TokenType.Metadata
    | Lexer.TokenType.ResourcePath
  > {
    return parserFactory(ResourcePath.resourcePath)(source, options);
  }
  query(source: string, options?: Options): Lexer.Token<Lexer.TokenType.QueryOptions> {
    return parserFactory(Query.queryOptions)(source, options);
  }
  filter(source: string, options?: Options): Token.TokenOfType<
    | Lexer.TokenType.IsOfExpression
    | Lexer.TokenType.MethodCallExpression
    | Lexer.TokenType.NotExpression
    | Lexer.TokenType.CommonExpression
    | Lexer.TokenType.BoolParenExpression
    | Lexer.TokenType.EqualsExpression
    | Lexer.TokenType.NotEqualsExpression
    | Lexer.TokenType.LesserThanExpression
    | Lexer.TokenType.LesserOrEqualsExpression
    | Lexer.TokenType.GreaterThanExpression
    | Lexer.TokenType.GreaterOrEqualsExpression
    | Lexer.TokenType.HasExpression
    | Lexer.TokenType.AndExpression
    | Lexer.TokenType.OrExpression
  > {
    return parserFactory(Expressions.boolCommonExpr)(source, options);
  }
  keys(source: string, options?: Options): Token.TokenOfType<
    | Lexer.TokenType.SimpleKey
    | Lexer.TokenType.CompoundKey
  > {
    return parserFactory(Expressions.keyPredicate)(source, options);
  }
  literal(source: string, options?: Options): Token.TokenOfType<
    | Lexer.TokenType.Literal
    | Lexer.TokenType.Enum
  > {
    return parserFactory(PrimitiveLiteral.primitiveLiteral)(source, options);
  }
  arrayOrObject(source: string, options?: Options): Lexer.Token<Lexer.TokenType.ArrayOrObject> {
    return parserFactory(ArrayOrObject.arrayOrObject)(source, options);
  }
}

export function odataUri(source: string, options?: Options): Lexer.Token<Lexer.TokenType.ODataUri> {
  return parserFactory(ODataUri.odataUri)(source, options);
}
export function resourcePath(source: string, options?: Options): Token.TokenOfType<
  | Lexer.TokenType.Batch
  | Lexer.TokenType.Entity
  | Lexer.TokenType.Metadata
  | Lexer.TokenType.ResourcePath
> {
  return parserFactory(ResourcePath.resourcePath)(source, options);
}
export function query(source: string, options?: Options): Lexer.Token<Lexer.TokenType.QueryOptions> {
  return parserFactory(Query.queryOptions)(source, options);
}
export function filter(source: string, options?: Options): Token.TokenOfType<
  | Lexer.TokenType.IsOfExpression
  | Lexer.TokenType.MethodCallExpression
  | Lexer.TokenType.NotExpression
  | Lexer.TokenType.CommonExpression
  | Lexer.TokenType.BoolParenExpression
  | Lexer.TokenType.EqualsExpression
  | Lexer.TokenType.NotEqualsExpression
  | Lexer.TokenType.LesserThanExpression
  | Lexer.TokenType.LesserOrEqualsExpression
  | Lexer.TokenType.GreaterThanExpression
  | Lexer.TokenType.GreaterOrEqualsExpression
  | Lexer.TokenType.HasExpression
  | Lexer.TokenType.AndExpression
  | Lexer.TokenType.OrExpression
> {
  return parserFactory(Expressions.boolCommonExpr)(source, options);
}
export function keys(source: string, options?: Options): Token.TokenOfType<
  | Lexer.TokenType.SimpleKey
  | Lexer.TokenType.CompoundKey
> {
  return parserFactory(Expressions.keyPredicate)(source, options);
}
export function literal(source: string, options?: Options): Token.TokenOfType<
  | Lexer.TokenType.Literal
  | Lexer.TokenType.Enum
> {
  return parserFactory(PrimitiveLiteral.primitiveLiteral)(source, options);
}
