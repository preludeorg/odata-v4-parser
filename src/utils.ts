import { map } from '@newdash/newdash/map';
import {
  ExpandToken,
  FormatToken,
  LexerToken,
  SearchToken,
  SkipToken,
  Token,
  TokenType,
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

export function isType<T extends TokenType>(
  node: Token | undefined,
  type: T
): node is LexerToken & { type: T } {
  return node?.type == type;
}

/**
 * find one node in ast node by type
 *
 * @param node
 * @param type
 */
export function findOne(node: Token | undefined, type: TopToken['type']): TopToken | undefined;
export function findOne(node: Token | undefined, type: SkipToken['type']): SkipToken | undefined;
export function findOne(node: Token | undefined, type: ExpandToken['type']): ExpandToken | undefined;
export function findOne(node: Token | undefined, type: FormatToken['type']): FormatToken | undefined;
export function findOne(node: Token | undefined, type: SearchToken['type']): SearchToken | undefined;
export function findOne(node: Token | undefined, type: TokenType): Token | undefined;
export function findOne(node: Token | undefined, type: any): Token | undefined {
  if (!node) {
    return undefined;
  }
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
export function findAll(node: Token | undefined, type: TokenType): Array<Token> {
  if (!node) {
    return undefined;
  }
  const rt: Array<Token> = [];
  createTraverser({
    [type]: (v: Token) => {
      rt.push(v);
    }
  })(node);
  return rt;
}

export default { stringify, is, equals, required };
