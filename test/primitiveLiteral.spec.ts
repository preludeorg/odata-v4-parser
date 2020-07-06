// @ts-nocheck
import * as PrimitiveLiteral from '../src/primitiveLiteral';
import cases from './primitive-cases';

describe('Primitive literals from json', () => {
  cases.forEach((item, index, array) => {
    const title = `#${index} should parse ${item['-Name']}: ${item.Input}`;
    let resultName = 'result';
    if (item.result === undefined) {
      resultName = 'result_error';
      item['-FailAt'] = item['-FailAt'] || 0;
    }
    if (item[resultName] !== undefined) {
      it(title, () => {
        const source = new Uint8Array(Buffer.from(item.Input));
        if (item[resultName].next === undefined) { item[resultName].next = item.Input.length; }
        if (item[resultName].raw === undefined) { item[resultName].raw = item.Input; }

        const literalFunctionName = getLiteralFunctionName(item['-Rule'] || 'primitiveLiteral');
        const literal = (PrimitiveLiteral[literalFunctionName] || PrimitiveLiteral.primitiveLiteral)(source, 0);
        if (item['-FailAt'] !== undefined) {
          expect(literal).toBeUndefined();
          return;
        }
        // extract properties
        expect({ ...literal }).toStrictEqual(item[resultName]);
      });
    }
  });
});

function getLiteralFunctionName(itemRule) {
  switch (itemRule) {
    case 'string':
      return 'stringValue';
    case 'primitiveValue':
      return 'primitiveLiteral';
    default:
      return itemRule;
  }
}
