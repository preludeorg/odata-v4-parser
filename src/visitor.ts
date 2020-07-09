import { TokenType, Token } from './lexer';
import { isPlainObject } from '@newdash/newdash/isPlainObject';
import { forEach } from '@newdash/newdash/forEach';
import { isArray } from '@newdash/newdash/isArray';

/**
 * AST Traverser
 */
export type Traverser = { [key in TokenType]?: (token: Token, parent?: Token) => void }

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
export function traverseAst(traverser: Traverser, node: Token, parent?: Token): void {

  if (node instanceof Token) {
    if (node.type in traverser) {
      traverser[node.type](node, parent);
    }
  }

  if (isArray(node.value) || isPlainObject(node.value)) {
    forEach(node.value, (item) => {
      if (item instanceof Token) {
        traverseAst(traverser, item, node);
      }
    });
  }

  if (isArray(node.value?.options)) {
    forEach(node.value?.options, (item) => {
      if (item instanceof Token) {
        traverseAst(traverser, item, node);
      }
    });
  }

  if (isArray(node.value?.items)) {
    forEach(node.value?.items, (item) => {
      if (item instanceof Token) {
        traverseAst(traverser, item, node);
      }
    });
  }

  if (node.value instanceof Token) {
    traverseAst(traverser, node.value, node);
  }

}

/**
 * Traverse AST with traverser (Deep First)
 *
 * @param traverser
 * @param node
 * @param parent
 */
export function traverseAstDeepFirst(traverser: Traverser, node: Token, parent?: Token): void {

  if (isArray(node.value) || isPlainObject(node.value)) {
    forEach(node.value, (item) => {
      if (item instanceof Token) {
        traverseAstDeepFirst(traverser, item, node);
      }
    });
  }

  if (node.value instanceof Token) {
    traverseAstDeepFirst(traverser, node.value, node);
  }

  if (isArray(node.value?.options)) {
    forEach(node.value?.options, (item) => {
      if (item instanceof Token) {
        traverseAstDeepFirst(traverser, item, node);
      }
    });
  }

  if (isArray(node.value?.items)) {
    forEach(node.value?.items, (item) => {
      if (item instanceof Token) {
        traverseAstDeepFirst(traverser, item, node);
      }
    });
  }

  if (node instanceof Token) {
    if (node.type in traverser) {
      traverser[node.type](node, parent);
    }
  }

}

export function createTraverser(traverser: Traverser, deepFirst = false) {
  return (node: Token): void => {
    if (deepFirst) {
      traverseAstDeepFirst(traverser, node);
    } else {
      traverseAst(traverser, node);
    }
  };
}
