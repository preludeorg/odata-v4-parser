import { Parser } from '../src/parser';


describe('Filter Test Suite', () => {

  const parser = new Parser();

  it('should support simple eq', () => {
    parser.query('$format=json&$filter=A eq 2');
  });

  it('should support complex query', () => {
    parser.query('$format=json&$filter=(A eq 2) and (B eq 3 or B eq 4)');
  });

});
