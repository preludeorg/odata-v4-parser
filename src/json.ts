import * as Expressions from './expressions';
import * as Lexer from './lexer';
import * as NameOrIdentifier from './nameOrIdentifier';
import * as PrimitiveLiteral from './primitiveLiteral';
import * as Token from './token';
import Utils, { SourceArray } from './utils';

export function complexColInUri(
  value: SourceArray,
  index: number
): Token.ArrayToken | undefined {
  const begin = Lexer.beginArray(value, index);
  if (begin === index) {
    return undefined;
  }
  const start = index;
  index = begin;

  const items = [];
  let token = complexInUri(value, index);
  if (token) {
    while (token) {
      items.push(token);
      index = token.next;

      const end = Lexer.endArray(value, index);
      if (end > index) {
        index = end;
        break;
      } else {
        const separator = Lexer.valueSeparator(value, index);
        if (separator === index) {
          return undefined;
        }
        index = separator;

        token = complexInUri(value, index);
        if (!token) {
          return undefined;
        }
      }
    }
  } else {
    const end = Lexer.endArray(value, index);
    if (end === index) {
      return undefined;
    }
    index = end;
  }

  return Lexer.tokenize(value, start, index, { items }, 'Array');
}

export function complexInUri(value: SourceArray, index: number): Token.ObjectToken | undefined {
  const begin = Lexer.beginObject(value, index);
  if (begin === index) {
    return undefined;
  }
  const start = index;
  index = begin;

  const items = [];
  let token =
    annotationInUri(value, index) ||
    primitivePropertyInUri(value, index) ||
    complexPropertyInUri(value, index) ||
    collectionPropertyInUri(value, index) ||
    navigationPropertyInUri(value, index);
  if (token) {
    while (token) {
      items.push(token);
      index = token.next;

      const end = Lexer.endObject(value, index);
      if (end > index) {
        index = end;
        break;
      } else {
        const separator = Lexer.valueSeparator(value, index);
        if (separator === index) {
          return undefined;
        }
        index = separator;

        token =
          annotationInUri(value, index) ||
          primitivePropertyInUri(value, index) ||
          complexPropertyInUri(value, index) ||
          collectionPropertyInUri(value, index) ||
          navigationPropertyInUri(value, index);
        if (!token) {
          return undefined;
        }
      }
    }
  } else {
    const end = Lexer.endObject(value, index);
    if (end === index) {
      return undefined;
    }
    index = end;
  }

  return Lexer.tokenize(value, start, index, { items }, 'Object');
}

export function collectionPropertyInUri(
  value: SourceArray,
  index: number
): Token.PropertyToken | undefined {
  let mark = Lexer.quotationMark(value, index);
  if (mark === index) {
    return undefined;
  }
  const start = index;
  index = mark;

  const prop =
    NameOrIdentifier.primitiveColProperty(value, index) ||
    NameOrIdentifier.complexColProperty(value, index);

  if (!prop) {
    return undefined;
  }
  index = prop.next;

  mark = Lexer.quotationMark(value, index);
  if (mark === index) {
    return undefined;
  }
  index = mark;

  const separator = Lexer.nameSeparator(value, index);
  if (separator === index) {
    return undefined;
  }
  index = separator;

  const propValue =
    prop.type === 'PrimitiveCollectionProperty'
      ? primitiveColInUri(value, index)
      : complexColInUri(value, index);

  if (!propValue) {
    return undefined;
  }
  index = propValue.next;

  return Lexer.tokenize(
    value,
    start,
    index,
    { key: prop, value: propValue },
    'Property'
  );
}

export function primitiveColInUri(
  value: SourceArray,
  index: number
): Token.ArrayToken | undefined {
  const begin = Lexer.beginArray(value, index);
  if (begin === index) {
    return undefined;
  }
  const start = index;
  index = begin;

  const items = [];
  let token = primitiveLiteralInJSON(value, index);
  if (token) {
    while (token) {
      items.push(token);
      index = token.next;

      const end = Lexer.endArray(value, index);
      if (end > index) {
        index = end;
        break;
      } else {
        const separator = Lexer.valueSeparator(value, index);
        if (separator === index) {
          return undefined;
        }
        index = separator;

        token = primitiveLiteralInJSON(value, index);
        if (!token) {
          return undefined;
        }
      }
    }
  } else {
    const end = Lexer.endArray(value, index);
    if (end === index) {
      return undefined;
    }
    index = end;
  }

  return Lexer.tokenize(value, start, index, { items }, 'Array');
}

export function complexPropertyInUri(
  value: SourceArray,
  index: number
): Token.PropertyToken | undefined {
  let mark = Lexer.quotationMark(value, index);
  if (mark === index) {
    return undefined;
  }
  const start = index;
  index = mark;

  const prop = NameOrIdentifier.complexProperty(value, index);
  if (!prop) {
    return undefined;
  }
  index = prop.next;

  mark = Lexer.quotationMark(value, index);
  if (mark === index) {
    return undefined;
  }
  index = mark;

  const separator = Lexer.nameSeparator(value, index);
  if (separator === index) {
    return undefined;
  }
  index = separator;

  const propValue = complexInUri(value, index);
  if (!propValue) {
    return undefined;
  }
  index = propValue.next;

  return Lexer.tokenize(
    value,
    start,
    index,
    { key: prop, value: propValue },
    'Property'
  );
}

export function annotationInUri(
  value: SourceArray,
  index: number
): Token.AnnotationToken | undefined {
  let mark = Lexer.quotationMark(value, index);
  if (mark === index) {
    return undefined;
  }
  const start = index;
  index = mark;

  const at = Lexer.AT(value, index);
  if (!at) {
    return undefined;
  }
  index = at;

  const namespaceNext = NameOrIdentifier.namespace(value, index);
  if (namespaceNext === index) {
    return undefined;
  }
  const namespaceStart = index;
  index = namespaceNext;

  if (value[index] !== 0x2e) {
    return undefined;
  }
  index++;

  const term = NameOrIdentifier.termName(value, index);
  if (!term) {
    return undefined;
  }
  index = term.next;

  mark = Lexer.quotationMark(value, index);
  if (mark === index) {
    return undefined;
  }
  index = mark;

  const separator = Lexer.nameSeparator(value, index);
  if (separator === index) {
    return undefined;
  }
  index = separator;

  const token =
    complexInUri(value, index) ||
    complexColInUri(value, index) ||
    primitiveLiteralInJSON(value, index) ||
    primitiveColInUri(value, index);
  if (!token) {
    return undefined;
  }
  index = token.next;

  return Lexer.tokenize(
    value,
    start,
    index,
    {
      key: `@${Utils.stringify(value, namespaceStart, namespaceNext)}.${
        term.raw
      }`,
      value: token
    },
    'Annotation'
  );
}

export function keyValuePairInUri(
  value: SourceArray,
  index: number,
  keyFn: Function,
  valueFn: Function
): Token.PropertyToken | undefined {
  let mark = Lexer.quotationMark(value, index);
  if (mark === index) {
    return undefined;
  }
  const start = index;
  index = mark;

  const prop = keyFn(value, index);
  if (!prop) {
    return undefined;
  }
  index = prop.next;

  mark = Lexer.quotationMark(value, index);
  if (mark === index) {
    return undefined;
  }
  index = mark;

  const separator = Lexer.nameSeparator(value, index);
  if (separator === index) {
    return undefined;
  }
  index = separator;

  const propValue = valueFn(value, index);
  if (!propValue) {
    return undefined;
  }
  index = propValue.next;

  return Lexer.tokenize(
    value,
    start,
    index,
    { key: prop, value: propValue },
    'Property'
  );
}

export function primitivePropertyInUri(
  value: SourceArray,
  index: number
): Token.PropertyToken | undefined {
  return keyValuePairInUri(
    value,
    index,
    NameOrIdentifier.primitiveProperty,
    primitiveLiteralInJSON
  );
}

export function navigationPropertyInUri(
  value: SourceArray,
  index: number
): Token.PropertyToken | undefined {
  return (
    singleNavPropInJSON(value, index) || collectionNavPropInJSON(value, index)
  );
}

export function singleNavPropInJSON(
  value: SourceArray,
  index: number
): Token.PropertyToken | undefined {
  return keyValuePairInUri(
    value,
    index,
    NameOrIdentifier.entityNavigationProperty,
    Expressions.rootExpr
  );
}

export function collectionNavPropInJSON(
  value: SourceArray,
  index: number
): Token.PropertyToken | undefined {
  return keyValuePairInUri(
    value,
    index,
    NameOrIdentifier.entityColNavigationProperty,
    rootExprCol
  );
}

export function rootExprCol(value: SourceArray, index: number): Token.ArrayToken | undefined {
  const begin = Lexer.beginArray(value, index);
  if (begin === index) {
    return undefined;
  }
  const start = index;
  index = begin;

  const items = [];
  let token = Expressions.rootExpr(value, index);
  if (token) {
    while (token) {
      items.push(token);
      index = token.next;

      const end = Lexer.endArray(value, index);
      if (end > index) {
        index = end;
        break;
      } else {
        const separator = Lexer.valueSeparator(value, index);
        if (separator === index) {
          return undefined;
        }
        index = separator;

        token = Expressions.rootExpr(value, index);
        if (!token) {
          return undefined;
        }
      }
    }
  } else {
    const end = Lexer.endArray(value, index);
    if (end === index) {
      return undefined;
    }
    index = end;
  }

  return Lexer.tokenize(value, start, index, { items }, 'Array');
}

export function primitiveLiteralInJSON(
  value: SourceArray,
  index: number
): Token.LiteralToken | undefined {
  return (
    stringInJSON(value, index) ||
    numberInJSON(value, index) ||
    booleanInJSON(value, index) ||
    nullInJSON(value, index)
  );
}

export function stringInJSON(value: SourceArray, index: number): Token.LiteralToken | undefined {
  let mark = Lexer.quotationMark(value, index);
  if (mark === index) {
    return undefined;
  }
  const start = index;
  index = mark;

  let char = charInJSON(value, index);
  while (char > index) {
    index = char;
    char = charInJSON(value, index);
  }

  mark = Lexer.quotationMark(value, index);
  if (mark === index) {
    return undefined;
  }
  index = mark;

  return Lexer.tokenize(value, start, index, 'string', 'Literal');
}

export function charInJSON(value: SourceArray, index: number): number {
  const escape = Lexer.escape(value, index);
  if (escape > index) {
    if (Utils.equals(value, escape, '%2F')) {
      return escape + 3;
    }
    if (
      Utils.equals(value, escape, '/') ||
      Utils.equals(value, escape, 'b') ||
      Utils.equals(value, escape, 'f') ||
      Utils.equals(value, escape, 'n') ||
      Utils.equals(value, escape, 'r') ||
      Utils.equals(value, escape, 't')
    ) {
      return escape + 1;
    }
    if (
      Utils.equals(value, escape, 'u') &&
      Utils.required(value, escape + 1, Lexer.HEXDIG, 4, 4)
    ) {
      return escape + 5;
    }
    const escapeNext = Lexer.escape(value, escape);
    if (escapeNext > escape) {
      return escapeNext;
    }
    const mark = Lexer.quotationMark(value, escape);
    if (mark > escape) {
      return mark;
    }
  } else {
    const mark = Lexer.quotationMark(value, index);
    if (mark === index) {
      return index + 1;
    }
  }
}

export function numberInJSON(value: SourceArray, index: number): Token.LiteralToken | undefined {
  const token =
    PrimitiveLiteral.doubleValue(value, index) ||
    PrimitiveLiteral.int64Value(value, index);
  if (token) {
    token.value = 'number';
    return token;
  }
}

export function booleanInJSON(value: SourceArray, index: number): Token.LiteralToken | undefined {
  if (Utils.equals(value, index, 'true')) {
    return Lexer.tokenize(
      value,
      index,
      index + 4,
      'boolean',
      'Literal'
    );
  }
  if (Utils.equals(value, index, 'false')) {
    return Lexer.tokenize(
      value,
      index,
      index + 5,
      'boolean',
      'Literal'
    );
  }
}

export function nullInJSON(value: SourceArray, index: number): Token.LiteralToken | undefined {
  if (Utils.equals(value, index, 'null')) {
    return Lexer.tokenize(
      value,
      index,
      index + 4,
      'null',
      'Literal'
    );
  }
}

export function arrayOrObject(value: SourceArray, index: number): Token.ArrayOrObjectToken | undefined {
  const token =
    complexColInUri(value, index) ||
    complexInUri(value, index) ||
    rootExprCol(value, index) ||
    primitiveColInUri(value, index);

  if (token) {
    return Lexer.tokenize(
      value,
      index,
      token.next,
      token,
      'ArrayOrObject'
    );
  }
}
