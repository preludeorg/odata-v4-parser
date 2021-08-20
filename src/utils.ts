import { map } from '@newdash/newdash/map';
import { Token, TokenType } from './lexer';
import {
  CustomQueryOptionToken,
  ExpandToken,
  FormatToken,
  SearchToken,
  SkipToken,
  TopToken
} from './token';
import { createTraverser } from './visitor';

export type SourceArray = number[] | Uint16Array;

export function stringify(
  value: SourceArray,
  index: number,
  next: number
): string {
  return map(value.slice(index, next), (ch) => String.fromCharCode(ch)).join(
    ''
  );
}

export function is(value: number, compare: string) {
  for (let i = 0; i < compare.length; i++) {
    if (value === compare.charCodeAt(i)) {
      return true;
    }
  }

  return false;
}

export function equals(value: SourceArray, index: number, compare: string) {
  let i = 0;
  while (value[index + i] === compare.charCodeAt(i) && i < compare.length) {
    i++;
  }
  return i === compare.length ? i : 0;
}

export function required(
  value: SourceArray,
  index: number,
  comparer: Function,
  min?: number,
  max?: number
) {
  let i = 0;

  max = max || value.length - index;
  while (i < max && comparer(value[index + i])) {
    i++;
  }

  return i >= (min || 0) && i <= max ? index + i : 0;
}

export function isType(
  node: Token,
  type: TokenType.CustomQueryOption
): node is CustomQueryOptionToken;
export function isType(node: Token, type: TokenType.Skip): node is SkipToken;
export function isType(node: Token, type: TokenType.Top): node is TopToken;
export function isType(node: Token, type: TokenType): boolean {
  return node?.type == type;
}

/**
 * find one node in ast node by type
 *
 * @param node
 * @param type
 */
export function findOne(node: Token, type: TokenType.Top): TopToken;
export function findOne(node: Token, type: TokenType.Skip): SkipToken;
export function findOne(node: Token, type: TokenType.Expand): ExpandToken;
export function findOne(node: Token, type: TokenType.Format): FormatToken;
export function findOne(node: Token, type: TokenType.Search): SearchToken;
export function findOne(node: Token, type: TokenType): Token;
export function findOne(node: Token, type: any): Token {
  let rt: Token;
  createTraverser({
    [type]: (v: Token) => {
      rt = v;
    }
  })(node);
  return rt;
}

/**
 * find all nodes in ast node by type
 *
 * @param node
 * @param type
 */
export function findAll(node: Token, type: TokenType): Array<Token> {
  const rt: Array<Token> = [];
  createTraverser({
    [type]: (v: Token) => {
      rt.push(v);
    }
  })(node);
  return rt;
}

export default { stringify, is, equals, required };
