import { map } from '@newdash/newdash/map';
import { Token, TokenType } from './lexer';
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
  node: Token<any>,
  type: T
): node is Token<T> {
  return node?.type == type;
}

export function assertType<T extends TokenType>(
  token: any,
  tokenType: T
): asserts token is Token<T> {
  if (!(token instanceof Token) || !isType(token, tokenType)) {
    const received = token instanceof Token
      ? `token of type ${token.type}`
      : `object: ${JSON.stringify(token)}`;
    throw new Error(`Expected token of type ${tokenType}, received ${received}`);
  }
}


/**
 * find one node in ast node by type
 *
 * @param node
 * @param type
 */
export function findOne<T extends TokenType>(node: Token<any>, type: T): Token<T> {
  let rt: Token<T>;
  createTraverser({
    [type]: (v: Token<T>) => {
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
export function findAll<T extends TokenType>(node: Token<any>, type: T): Array<Token<T>> {
  const rt: Array<Token<T>> = [];
  createTraverser({
    [type]: (v: Token<T>) => {
      rt.push(v);
    }
  })(node);
  return rt;
}

export default { stringify, is, equals, required };
