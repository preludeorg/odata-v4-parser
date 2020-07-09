import { defaultParser, createTraverser } from '../src';

describe('Visitor Parse Suite', () => {

  const createSeqTokenProcessor = (key: string, arr: Array<any>) => () => arr.push(key);

  const createSeqTraverser = () => {
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
      Literal: createSeqTokenProcessor('lit', visitSequence),
      FirstMemberExpression: createSeqTokenProcessor('mem', visitSequence)
    });

    return { visit, visitSequence };
  };


  it('should visit filter', () => {

    const expectedSeq = ['and', 'paren', 'eq', 'mem', 'lit', 'paren', 'eq', 'mem', 'lit'];

    const { visit, visitSequence } = createSeqTraverser();

    const node = defaultParser.filter('(A eq 2) and (V eq 3)');

    visit(node);

    expect(visitSequence).toEqual(expectedSeq);

  });

});
