import { defaultParser, createTraverser } from '../src';

describe('Visitor Parse Suite', () => {

  const createSeqTokenProcessor = (key: string, arr: Array<any>) => () => arr.push(key);

  const createSeqTraverser = (deepFirst = false) => {
    const visitSequence = [];

    const visit = createTraverser({
      Top: createSeqTokenProcessor('param:top', visitSequence),
      Skip: createSeqTokenProcessor('param:skip', visitSequence),
      Filter: createSeqTokenProcessor('param:filter', visitSequence),
      OrderBy: createSeqTokenProcessor('param:orderby', visitSequence),
      Format: createSeqTokenProcessor('param:format', visitSequence),
      Search: createSeqTokenProcessor('param:search', visitSequence),
      InlineCount: createSeqTokenProcessor('param:inlinecount', visitSequence),

      AndExpression: createSeqTokenProcessor('and', visitSequence),
      BoolParenExpression: createSeqTokenProcessor('paren', visitSequence),
      EqualsExpression: createSeqTokenProcessor('eq', visitSequence),
      OrExpression: createSeqTokenProcessor('or', visitSequence),
      Literal: createSeqTokenProcessor('lit', visitSequence)
    }, deepFirst);

    return { visit, visitSequence };
  };


  it('should visit filter', () => {

    const expectedSeq = ['and', 'paren', 'eq', 'lit', 'paren', 'eq', 'lit'];

    const { visit, visitSequence } = createSeqTraverser();

    const node = defaultParser.filter('(A eq 2) and (V eq 3)');

    visit(node);

    expect(visitSequence).toEqual(expectedSeq);

  });

  it('should visit filter deep first', () => {

    const expectedSeq = ['lit', 'eq', 'lit', 'eq', 'or', 'paren', 'lit', 'eq', 'paren', 'and'];

    const { visit, visitSequence } = createSeqTraverser(true);

    const node = defaultParser.filter('(A eq 2 or A eq 3) and (V eq 3)');

    visit(node);

    expect(visitSequence).toEqual(expectedSeq);

  });

  it('should support visit undefined', () => {
    const { visit, visitSequence } = createSeqTraverser(true);
    visit(undefined);
  });

});
