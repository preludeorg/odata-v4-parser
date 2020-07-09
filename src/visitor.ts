import { TokenType, Token } from './lexer';
import { isPlainObject } from '@newdash/newdash/isPlainObject';
import { forEach } from '@newdash/newdash/forEach';
import { isArray } from '@newdash/newdash/isArray';

/**
 * AST Traverser
 */
export type Traverser = { [key in TokenType]?: (token: Token) => void }

/**
 * AST Visitor
 *
 * @alias Traverser
 */
export type Visitor = Traverser

/**
 * Traverse AST with traverser
 *
 * @param traverser
 * @param node
 */
export function traverseAst(traverser: Traverser, node: Token | Array<any> | Object): void {

  if (node instanceof Token) {
    if (node.type in traverser) {
      traverser[node.type](node);
    }
  }

  if (isPlainObject(node) || isArray(node) || node instanceof Token) {
    // @ts-ignore
    forEach(node, (item) => {
      traverseAst(traverser, item);
    });
  }

}

export function traverseAstDeepFirst(traverser: Traverser, node: Token | Array<any> | Object): void {

  if (isPlainObject(node) || isArray(node) || node instanceof Token) {
    // @ts-ignore
    forEach(node, (item) => {
      traverseAstDeepFirst(traverser, item);
    });
  }

  if (node instanceof Token) {
    if (node.type in traverser) {
      traverser[node.type](node);
    }
  }

}

export function createTraverser(traverser: Traverser, deepFirst = false) {
  return (node: Token | Array<any> | Object): void => {
    if (deepFirst) {
      traverseAstDeepFirst(traverser, node);
    } else {
      traverseAst(traverser, node);
    }
  };
}
