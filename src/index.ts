import { Parser } from './parser';

export * from './parser';
export * from './lexer';
export * from './visitor';
export * from './builder';

export const defaultParser = new Parser();
