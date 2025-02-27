import * as ArrayOrObject from './json';
import * as Lexer from './lexer';
import * as NameOrIdentifier from './nameOrIdentifier';
import * as PrimitiveLiteral from './primitiveLiteral';
import * as Token from './token';
import Utils, { SourceArray } from './utils';

export function commonExpr(value: SourceArray, index: number): Token.CommonExpressionToken | undefined {
  let token =
    PrimitiveLiteral.primitiveLiteral(value, index) ||
    parameterAlias(value, index) ||
    ArrayOrObject.arrayOrObject(value, index) ||
    rootExpr(value, index) ||
    methodCallExpr(value, index) ||
    firstMemberExpr(value, index) ||
    functionExpr(value, index) ||
    negateExpr(value, index) ||
    parenExpr(value, index) ||
    castExpr(value, index);

  if (!token) {
    return undefined;
  }

  const expr =
    addExpr(value, token.next) ||
    subExpr(value, token.next) ||
    mulExpr(value, token.next) ||
    divExpr(value, token.next) ||
    modExpr(value, token.next);

  if (expr) {
    token = new Token.Token({
      ...expr,
      type: expr.type,
      value: { left: Token.clone(token), right: expr.value },
      next: expr.value instanceof Token.Token ? expr.value.next : expr.next,
      raw: Utils.stringify(value, token.position, token.next)
    });
  }

  return Token.tokenize({
    ...token,
    type: 'CommonExpression',
    value: token,
    source: value
  });
}

export function boolCommonExpr(value: SourceArray, index: number): Token.IsOfExpressionToken | Token.MethodCallExpressionToken | Token.NotExpressionToken | Token.CommonExpressionToken | Token.BoolParenExpressionToken | Token.AndExpressionToken | Token.OrExpressionToken | undefined {
  let token =
    isofExpr(value, index) ||
    boolMethodCallExpr(value, index) ||
    notExpr(value, index) ||
    commonExpr(value, index) ||
    boolParenExpr(value, index);

  if (!token) {
    return undefined;
  }

  let commonMoreExpr = undefined;
  if (token.type === 'CommonExpression') {
    commonMoreExpr =
      eqExpr(value, token.next) ||
      neExpr(value, token.next) ||
      ltExpr(value, token.next) ||
      leExpr(value, token.next) ||
      gtExpr(value, token.next) ||
      geExpr(value, token.next) ||
      hasExpr(value, token.next);

    if (commonMoreExpr) {
      token = new Token.Token({
        ...token,
        type: commonMoreExpr.type,
        value: {
          left: token.value,
          right: commonMoreExpr.value
        },
        next: commonMoreExpr.value.next,
        raw: Utils.stringify(value, token.position, token.next)
      });
    }
  }

  const expr = andExpr(value, token.next) || orExpr(value, token.next);

  if (token && expr) {
    token = new Token.Token({
      ...token,
      type: expr.type,
      next: expr.value.next,
      value: { left: Token.clone(token), right: expr.value },
      raw: Utils.stringify(value, token.position, token.next)
    });

    if (
      token.type === 'AndExpression' &&
      token.value.right.type === 'OrExpression'
    ) {
      return Token.tokenize({
        type: token.value.right.type,
        value: { left: token.value.left, right: token.value.right },
        position: token.value.left.position,
        next: token.value.right.value.left.next,
        source: value
      });
    }
  }

  return token;
}

export function andExpr(value: SourceArray, index: number): Token.AndExpressionToken | undefined {
  let rws = Lexer.RWS(value, index);
  if (rws === index || !Utils.equals(value, rws, 'and')) {
    return undefined;
  }
  const start = index;
  index = rws + 3;
  rws = Lexer.RWS(value, index);
  if (rws === index) {
    return undefined;
  }
  index = rws;
  const token = boolCommonExpr(value, index);
  if (!token) {
    return undefined;
  }

  return Token.tokenize({ type: 'AndExpression', value: token, position: start, next: index, source: value });
}

export function orExpr(value: SourceArray, index: number): Token.OrExpressionToken | undefined {
  let rws = Lexer.RWS(value, index);
  if (rws === index || !Utils.equals(value, rws, 'or')) {
    return undefined;
  }
  const start = index;
  index = rws + 2;
  rws = Lexer.RWS(value, index);
  if (rws === index) {
    return undefined;
  }
  index = rws;
  const token = boolCommonExpr(value, index);
  if (!token) {
    return undefined;
  }

  return Token.tokenize({ ...token, type: 'OrExpression', value: token, source: value });
}

export function leftRightExpr<T extends Token.TokenType>(
  value: SourceArray,
  index: number,
  expr: string,
  tokenType: T
): Token.LexerToken & { type: T } | undefined {
  let rws = Lexer.RWS(value, index);
  if (rws === index) {
    return undefined;
  }
  const start = index;
  index = rws;
  if (!Utils.equals(value, index, expr)) {
    return undefined;
  }
  index += expr.length;
  rws = Lexer.RWS(value, index);
  if (rws === index) {
    return undefined;
  }
  index = rws;
  const token = commonExpr(value, index);
  if (!token) {
    return undefined;
  }

  return Token.tokenize({
    type: tokenType,
    value: token.value,
    position: start,
    next: index,
    source: value
  });
}
export function eqExpr(value: SourceArray, index: number): Token.EqualsExpressionToken | undefined {
  return leftRightExpr(value, index, 'eq', 'EqualsExpression');
}
export function neExpr(value: SourceArray, index: number): Token.NotEqualsExpressionToken | undefined {
  return leftRightExpr(value, index, 'ne', 'NotEqualsExpression');
}
export function ltExpr(value: SourceArray, index: number): Token.LesserThanExpressionToken | undefined {
  return leftRightExpr(
    value,
    index,
    'lt',
    'LesserThanExpression'
  );
}
export function leExpr(value: SourceArray, index: number): Token.LesserOrEqualsExpressionToken | undefined {
  return leftRightExpr(
    value,
    index,
    'le',
    'LesserOrEqualsExpression'
  );
}
export function gtExpr(value: SourceArray, index: number): Token.GreaterThanExpressionToken | undefined {
  return leftRightExpr(
    value,
    index,
    'gt',
    'GreaterThanExpression'
  );
}
export function geExpr(value: SourceArray, index: number): Token.GreaterOrEqualsExpressionToken | undefined {
  return leftRightExpr(
    value,
    index,
    'ge',
    'GreaterOrEqualsExpression'
  );
}
export function hasExpr(value: SourceArray, index: number): Token.HasExpressionToken | undefined {
  return leftRightExpr(value, index, 'has', 'HasExpression');
}

export function addExpr(value: SourceArray, index: number): Token.AddExpressionToken | undefined {
  return leftRightExpr(value, index, 'add', 'AddExpression');
}
export function subExpr(value: SourceArray, index: number): Token.SubExpressionToken | undefined {
  return leftRightExpr(value, index, 'sub', 'SubExpression');
}
export function mulExpr(value: SourceArray, index: number): Token.MulExpressionToken | undefined {
  return leftRightExpr(value, index, 'mul', 'MulExpression');
}
export function divExpr(value: SourceArray, index: number): Token.DivExpressionToken | undefined {
  return leftRightExpr(value, index, 'div', 'DivExpression');
}
export function modExpr(value: SourceArray, index: number): Token.ModExpressionToken | undefined {
  return leftRightExpr(value, index, 'mod', 'ModExpression');
}

export function notExpr(value: SourceArray, index: number): Token.NotExpressionToken | undefined {
  if (!Utils.equals(value, index, 'not')) {
    return undefined;
  }
  const start = index;
  index += 3;
  const rws = Lexer.RWS(value, index);
  if (rws === index) {
    return undefined;
  }
  index = rws;
  const token = boolCommonExpr(value, index);
  if (!token) {
    return undefined;
  }

  return Token.tokenize({ type: 'NotExpression', value: token, position: start, next: token.next, source: value });
}

export function boolParenExpr(value: SourceArray, index: number): Token.BoolParenExpressionToken | undefined {
  const open = Lexer.OPEN(value, index);
  if (!open) {
    return undefined;
  }
  const start = index;
  index = open;
  index = Lexer.BWS(value, index);
  const token = boolCommonExpr(value, index);
  if (!token) {
    return undefined;
  }
  index = Lexer.BWS(value, token.next);
  const close = Lexer.CLOSE(value, index);
  if (!close) {
    return undefined;
  }
  index = close;

  return Token.tokenize({ type: 'BoolParenExpression', value: token, position: start, next: index, source: value });
}
export function parenExpr(value: SourceArray, index: number): Token.ParenExpressionToken | undefined {
  const open = Lexer.OPEN(value, index);
  if (!open) {
    return undefined;
  }
  const start = index;
  index = open;
  index = Lexer.BWS(value, index);
  const token = commonExpr(value, index);
  if (!token) {
    return undefined;
  }
  index = Lexer.BWS(value, token.next);
  const close = Lexer.CLOSE(value, index);
  if (!close) {
    return undefined;
  }
  index = close;

  return Token.tokenize({ type: 'ParenExpression', value: token.value, position: start, next: index, source: value });
}

export function boolMethodCallExpr(
  value: SourceArray,
  index: number
): Token.MethodCallExpressionToken | undefined {
  return (
    endsWithMethodCallExpr(value, index) ||
    startsWithMethodCallExpr(value, index) ||
    containsMethodCallExpr(value, index) ||
    matchesPatternMethodCallExpr(value, index) ||
    intersectsMethodCallExpr(value, index)
  );
}
export function methodCallExpr(value: SourceArray, index: number): Token.MethodCallExpressionToken | undefined {
  return (
    indexOfMethodCallExpr(value, index) ||
    toLowerMethodCallExpr(value, index) ||
    toUpperMethodCallExpr(value, index) ||
    trimMethodCallExpr(value, index) ||
    substringMethodCallExpr(value, index) ||
    substringOfMethodCallExpr(value, index) ||
    concatMethodCallExpr(value, index) ||
    lengthMethodCallExpr(value, index) ||
    yearMethodCallExpr(value, index) ||
    monthMethodCallExpr(value, index) ||
    dayMethodCallExpr(value, index) ||
    hourMethodCallExpr(value, index) ||
    minuteMethodCallExpr(value, index) ||
    secondMethodCallExpr(value, index) ||
    fractionalsecondsMethodCallExpr(value, index) ||
    totalsecondsMethodCallExpr(value, index) ||
    dateMethodCallExpr(value, index) ||
    timeMethodCallExpr(value, index) ||
    roundMethodCallExpr(value, index) ||
    floorMethodCallExpr(value, index) ||
    ceilingMethodCallExpr(value, index) ||
    distanceMethodCallExpr(value, index) ||
    geoLengthMethodCallExpr(value, index) ||
    totalOffsetMinutesMethodCallExpr(value, index) ||
    minDateTimeMethodCallExpr(value, index) ||
    maxDateTimeMethodCallExpr(value, index) ||
    nowMethodCallExpr(value, index)
  );
}
export function methodCallExprFactory(
  value: SourceArray,
  index: number,
  method: string,
  min?: number,
  max?: number
): Token.MethodCallExpressionToken | undefined {
  if (typeof min === 'undefined') {
    min = 0;
  }
  if (typeof max === 'undefined') {
    max = min;
  }

  if (!Utils.equals(value, index, method)) {
    return undefined;
  }
  const start = index;
  index += method.length;
  const open = Lexer.OPEN(value, index);
  if (!open) {
    return undefined;
  }
  index = open;
  index = Lexer.BWS(value, index);
  const parameters: Token.Token[] = [];
  if (min > 0) {
    while (parameters.length < max) {
      const expr = commonExpr(value, index);
      if (parameters.length < min && !expr) {
        return undefined;
      } else if (expr) {
        parameters.push(expr.value);
        index = expr.next;
        index = Lexer.BWS(value, index);
        const comma = Lexer.COMMA(value, index);
        if (parameters.length < min && !comma) {
          return undefined;
        }
        if (comma) {
          index = comma;
        } else {
          break;
        }
        index = Lexer.BWS(value, index);
      } else {
        break;
      }
    }
  }
  index = Lexer.BWS(value, index);
  const close = Lexer.CLOSE(value, index);
  if (!close) {
    return undefined;
  }
  index = close;

  return Token.tokenize({
    type: 'MethodCallExpression',
    value: { method, parameters },
    position: start,
    next: index,
    source: value
  });
}
export function containsMethodCallExpr(
  value: SourceArray,
  index: number
): Token.MethodCallExpressionToken | undefined {
  return methodCallExprFactory(value, index, 'contains', 2);
}
export function startsWithMethodCallExpr(
  value: SourceArray,
  index: number
): Token.MethodCallExpressionToken | undefined {
  return methodCallExprFactory(value, index, 'startswith', 2);
}
export function endsWithMethodCallExpr(
  value: SourceArray,
  index: number
): Token.MethodCallExpressionToken | undefined {
  return methodCallExprFactory(value, index, 'endswith', 2);
}
export function matchesPatternMethodCallExpr(
  value: SourceArray,
  index: number
): Token.MethodCallExpressionToken | undefined {
  return methodCallExprFactory(value, index, 'matchespattern', 2);
}
export function lengthMethodCallExpr(
  value: SourceArray,
  index: number
): Token.MethodCallExpressionToken | undefined {
  return methodCallExprFactory(value, index, 'length', 1);
}
export function indexOfMethodCallExpr(
  value: SourceArray,
  index: number
): Token.MethodCallExpressionToken | undefined {
  return methodCallExprFactory(value, index, 'indexof', 2);
}
export function substringMethodCallExpr(
  value: SourceArray,
  index: number
): Token.MethodCallExpressionToken | undefined {
  return methodCallExprFactory(value, index, 'substring', 2, 3);
}
export function substringOfMethodCallExpr(
  value: SourceArray,
  index: number
): Token.MethodCallExpressionToken | undefined {
  return methodCallExprFactory(value, index, 'substringof', 2);
}
export function toLowerMethodCallExpr(
  value: SourceArray,
  index: number
): Token.MethodCallExpressionToken | undefined {
  return methodCallExprFactory(value, index, 'tolower', 1);
}
export function toUpperMethodCallExpr(
  value: SourceArray,
  index: number
): Token.MethodCallExpressionToken | undefined {
  return methodCallExprFactory(value, index, 'toupper', 1);
}
export function trimMethodCallExpr(
  value: SourceArray,
  index: number
): Token.MethodCallExpressionToken | undefined {
  return methodCallExprFactory(value, index, 'trim', 1);
}
export function concatMethodCallExpr(
  value: SourceArray,
  index: number
): Token.MethodCallExpressionToken | undefined {
  return methodCallExprFactory(value, index, 'concat', 2);
}

export function yearMethodCallExpr(
  value: SourceArray,
  index: number
): Token.MethodCallExpressionToken | undefined {
  return methodCallExprFactory(value, index, 'year', 1);
}
export function monthMethodCallExpr(
  value: SourceArray,
  index: number
): Token.MethodCallExpressionToken | undefined {
  return methodCallExprFactory(value, index, 'month', 1);
}
export function dayMethodCallExpr(
  value: SourceArray,
  index: number
): Token.MethodCallExpressionToken | undefined {
  return methodCallExprFactory(value, index, 'day', 1);
}
export function hourMethodCallExpr(
  value: SourceArray,
  index: number
): Token.MethodCallExpressionToken | undefined {
  return methodCallExprFactory(value, index, 'hour', 1);
}
export function minuteMethodCallExpr(
  value: SourceArray,
  index: number
): Token.MethodCallExpressionToken | undefined {
  return methodCallExprFactory(value, index, 'minute', 1);
}
export function secondMethodCallExpr(
  value: SourceArray,
  index: number
): Token.MethodCallExpressionToken | undefined {
  return methodCallExprFactory(value, index, 'second', 1);
}
export function fractionalsecondsMethodCallExpr(
  value: SourceArray,
  index: number
): Token.MethodCallExpressionToken | undefined {
  return methodCallExprFactory(value, index, 'fractionalseconds', 1);
}
export function totalsecondsMethodCallExpr(
  value: SourceArray,
  index: number
): Token.MethodCallExpressionToken | undefined {
  return methodCallExprFactory(value, index, 'totalseconds', 1);
}
export function dateMethodCallExpr(
  value: SourceArray,
  index: number
): Token.MethodCallExpressionToken | undefined {
  return methodCallExprFactory(value, index, 'date', 1);
}
export function timeMethodCallExpr(
  value: SourceArray,
  index: number
): Token.MethodCallExpressionToken | undefined {
  return methodCallExprFactory(value, index, 'time', 1);
}
export function totalOffsetMinutesMethodCallExpr(
  value: SourceArray,
  index: number
): Token.MethodCallExpressionToken | undefined {
  return methodCallExprFactory(value, index, 'totaloffsetminutes', 1);
}

export function minDateTimeMethodCallExpr(
  value: SourceArray,
  index: number
): Token.MethodCallExpressionToken | undefined {
  return methodCallExprFactory(value, index, 'mindatetime', 0);
}
export function maxDateTimeMethodCallExpr(
  value: SourceArray,
  index: number
): Token.MethodCallExpressionToken | undefined {
  return methodCallExprFactory(value, index, 'maxdatetime', 0);
}
export function nowMethodCallExpr(
  value: SourceArray,
  index: number
): Token.MethodCallExpressionToken | undefined {
  return methodCallExprFactory(value, index, 'now', 0);
}

export function roundMethodCallExpr(
  value: SourceArray,
  index: number
): Token.MethodCallExpressionToken | undefined {
  return methodCallExprFactory(value, index, 'round', 1);
}
export function floorMethodCallExpr(
  value: SourceArray,
  index: number
): Token.MethodCallExpressionToken | undefined {
  return methodCallExprFactory(value, index, 'floor', 1);
}
export function ceilingMethodCallExpr(
  value: SourceArray,
  index: number
): Token.MethodCallExpressionToken | undefined {
  return methodCallExprFactory(value, index, 'ceiling', 1);
}

export function distanceMethodCallExpr(
  value: SourceArray,
  index: number
): Token.MethodCallExpressionToken | undefined {
  return methodCallExprFactory(value, index, 'geo.distance', 2);
}
export function geoLengthMethodCallExpr(
  value: SourceArray,
  index: number
): Token.MethodCallExpressionToken | undefined {
  return methodCallExprFactory(value, index, 'geo.length', 1);
}
export function intersectsMethodCallExpr(
  value: SourceArray,
  index: number
): Token.MethodCallExpressionToken | undefined {
  return methodCallExprFactory(value, index, 'geo.intersects', 2);
}

export function isofExpr(value: SourceArray, index: number): Token.IsOfExpressionToken | undefined {
  if (!Utils.equals(value, index, 'isof')) {
    return undefined;
  }
  const start = index;
  index += 4;
  const open = Lexer.OPEN(value, index);
  if (!open) {
    return undefined;
  }
  index = open;
  index = Lexer.BWS(value, index);
  const expr = commonExpr(value, index);
  if (expr) {
    index = expr.next;
    index = Lexer.BWS(value, index);
    const comma = Lexer.COMMA(value, index);
    if (!comma) {
      return undefined;
    }
    index = comma;
    index = Lexer.BWS(value, index);
  }
  const typeName = NameOrIdentifier.qualifiedTypeName(value, index);
  if (!typeName) {
    return undefined;
  }
  index = typeName.next;
  index = Lexer.BWS(value, index);
  const close = Lexer.CLOSE(value, index);
  if (!close) {
    return undefined;
  }
  index = close;

  return Token.tokenize({ type: 'IsOfExpression', value: { target: expr, typename: typeName }, position: start, next: index, source: value });
}
export function castExpr(value: SourceArray, index: number): Token.CastExpressionToken | undefined {
  if (!Utils.equals(value, index, 'cast')) {
    return undefined;
  }
  const start = index;
  index += 4;
  const open = Lexer.OPEN(value, index);
  if (!open) {
    return undefined;
  }
  index = open;
  index = Lexer.BWS(value, index);
  const expr = commonExpr(value, index);
  if (expr) {
    index = expr.next;
    index = Lexer.BWS(value, index);
    const comma = Lexer.COMMA(value, index);
    if (!comma) {
      return undefined;
    }
    index = comma;
    index = Lexer.BWS(value, index);
  }
  const typeName = NameOrIdentifier.qualifiedTypeName(value, index);
  if (!typeName) {
    return undefined;
  }
  index = typeName.next;
  index = Lexer.BWS(value, index);
  const close = Lexer.CLOSE(value, index);
  if (!close) {
    return undefined;
  }
  index = close;

  return Token.tokenize({ type: 'CastExpression', value: { target: expr, typename: typeName }, position: start, next: index, source: value });
}

export function negateExpr(value: SourceArray, index: number): Token.NegateExpressionToken | undefined {
  if (value[index] !== 0x2d) {
    return undefined;
  }
  const start = index;
  index++;
  index = Lexer.BWS(value, index);
  const expr = commonExpr(value, index);
  if (!expr) {
    return undefined;
  }

  return Token.tokenize({ type: 'NegateExpression', value: expr, position: start, next: expr.next, source: value });
}

export function firstMemberExpr(
  value: SourceArray,
  index: number
): Token.FirstMemberExpressionToken | undefined {
  const token = inscopeVariableExpr(value, index);
  let member: Token.MemberExpressionToken | undefined;
  const start = index;

  if (token) {
    if (value[token.next] === 0x2f) {
      index = token.next + 1;
      const member = memberExpr(value, index);
      if (!member) {
        return undefined;
      }

      return Token.tokenize({ type: 'FirstMemberExpression', value: [token, member], position: start, next: member.next, source: value });
    }
  } else {
    member = memberExpr(value, index);
  }

  const newToken = token || member;
  if (!newToken) {
    return undefined;
  }

  return Token.tokenize({ type: 'FirstMemberExpression', value: newToken, position: start, next: newToken.next, source: value });
}
export function memberExpr(value: SourceArray, index: number): Token.MemberExpressionToken | undefined {
  const start = index;
  const token = NameOrIdentifier.qualifiedEntityTypeName(value, index);

  if (token) {
    if (value[token.next] !== 0x2f) {
      return undefined;
    }
    index = token.next + 1;
  }

  const next =
    propertyPathExpr(value, index) || boundFunctionExpr(value, index);

  if (!next) {
    return undefined;
  }
  return Token.tokenize({
    type: 'MemberExpression',
    value: token ? { name: token, value: next } : next,
    position: start,
    next: next.next,
    source: value
  });
}
export function propertyPathExpr(
  value: SourceArray,
  index: number
): Token.PropertyPathExpressionToken | undefined {
  let token = NameOrIdentifier.odataIdentifier(value, index);
  const start = index;
  if (token) {
    index = token.next;
    const nav =
      collectionPathExpr(value, token.next) ||
      collectionNavigationExpr(value, token.next) ||
      singleNavigationExpr(value, token.next) ||
      complexPathExpr(value, token.next) ||
      singlePathExpr(value, token.next);

    if (nav) {
      index = nav.next;
      token = {
        current: Token.clone(token),
        next: nav
      };
    }
  } else if (!token) {
    token = NameOrIdentifier.streamProperty(value, index);
    if (token) {
      index = token.next;
    }
  }

  if (!token) {
    return undefined;
  }
  return Token.tokenize({ type: 'PropertyPathExpression', value: token, position: start, next: index, source: value });
}

let isLambdaPredicate = false;
export function inscopeVariableExpr(
  value: SourceArray,
  index: number
): Token.ImplicitVariableExpressionToken | Token.LambdaVariableExpressionToken | undefined {
  return (
    implicitVariableExpr(value, index) ||
    (isLambdaPredicate ? lambdaVariableExpr(value, index) : undefined)
  );
}

export function implicitVariableExpr(
  value: SourceArray,
  index: number
): Token.ImplicitVariableExpressionToken | undefined {
  if (Utils.equals(value, index, '$it')) {
    return Token.tokenize({ type: 'ImplicitVariableExpression', value: '$it', position: index, next: index + 3, source: value });
  }
}
let hasLambdaVariableExpr = false;
export function lambdaVariableExpr(
  value: SourceArray,
  index: number
): Token.LambdaVariableExpressionToken | undefined {
  const token = NameOrIdentifier.odataIdentifier(
    value,
    index,
    'LambdaVariableExpression'
  );
  if (token) {
    hasLambdaVariableExpr = true;
    return token;
  }
}
export function lambdaPredicateExpr(
  value: SourceArray,
  index: number
): Token.LambdaPredicateExpressionToken | undefined {
  isLambdaPredicate = true;
  const token = boolCommonExpr(value, index);
  isLambdaPredicate = false;
  if (token && hasLambdaVariableExpr) {
    hasLambdaVariableExpr = false;
    return Token.tokenize({ type: 'LambdaPredicateExpression', value: token, position: token.position, next: token.next, source: value });
  }
}
export function anyExpr(value: SourceArray, index: number): Token.AnyExpressionToken | undefined {
  if (!Utils.equals(value, index, 'any')) {
    return undefined;
  }
  const start = index;
  index += 3;
  const open = Lexer.OPEN(value, index);
  if (!open) {
    return undefined;
  }
  index = open;
  index = Lexer.BWS(value, index);
  const variable = lambdaVariableExpr(value, index);
  let predicate;
  if (variable) {
    index = variable.next;
    index = Lexer.BWS(value, index);
    const colon = Lexer.COLON(value, index);
    if (!colon) {
      return undefined;
    }
    index = colon;
    index = Lexer.BWS(value, index);
    predicate = lambdaPredicateExpr(value, index);
    if (!predicate) {
      return undefined;
    }
    index = predicate.next;
  }
  index = Lexer.BWS(value, index);
  const close = Lexer.CLOSE(value, index);
  if (!close) {
    return undefined;
  }
  index = close;

  return Token.tokenize({ type: 'AnyExpression', value: { variable, predicate }, position: start, next: index, source: value });
}
export function allExpr(value: SourceArray, index: number): Token.AllExpressionToken | undefined {
  if (!Utils.equals(value, index, 'all')) {
    return undefined;
  }
  const start = index;
  index += 3;

  const open = Lexer.OPEN(value, index);
  if (!open) {
    return undefined;
  }
  index = open;

  index = Lexer.BWS(value, index);
  const variable = lambdaVariableExpr(value, index);
  if (!variable) {
    return undefined;
  }
  index = variable.next;

  index = Lexer.BWS(value, index);

  const colon = Lexer.COLON(value, index);
  if (!colon) {
    return undefined;
  }
  index = colon;

  index = Lexer.BWS(value, index);

  const predicate = lambdaPredicateExpr(value, index);
  if (!predicate) {
    return undefined;
  }
  index = predicate.next;

  index = Lexer.BWS(value, index);

  const close = Lexer.CLOSE(value, index);
  if (!close) {
    return undefined;
  }
  index = close;

  return Token.tokenize({ type: 'AllExpression', value: { variable, predicate }, position: start, next: index, source: value });
}

export function collectionNavigationExpr(
  value: SourceArray,
  index: number
): Token.CollectionNavigationExpressionToken | undefined {
  const start = index;
  let entity, navigation, path;
  if (value[index] === 0x2f) {
    index++;
    entity = NameOrIdentifier.qualifiedEntityTypeName(value, index);
    if (!entity) {
      return undefined;
    }
    index = entity.next;
  }

  const predicate = keyPredicate(value, index);

  if (predicate) {
    index = predicate.next;
    navigation = singleNavigationExpr(value, index);
    if (navigation) {
      index = navigation.next;
    }
  } else {
    path = collectionPathExpr(value, index);
    if (path) {
      index = path.next;
    }
  }

  if (index > start) {
    return Token.tokenize({
      type: 'CollectionNavigationExpression',
      value: { entity, predicate, navigation, path },
      position: start,
      next: index,
      source: value
    });
  }
}
export function keyPredicate(
  value: SourceArray,
  index: number,
  metadataContext?: any
): Token.SimpleKeyToken | Token.CompoundKeyToken | undefined {
  return simpleKey(value, index, metadataContext) || compoundKey(value, index);
}
export function simpleKey(
  value: SourceArray,
  index: number,
  metadataContext?: any
): Token.SimpleKeyToken | undefined {
  const open = Lexer.OPEN(value, index);
  if (!open) {
    return undefined;
  }
  const start = index;
  index = open;

  const token = keyPropertyValue(value, index);
  if (!token) {
    return undefined;
  }

  const close = Lexer.CLOSE(value, token.next);
  if (!close) {
    return undefined;
  }

  const key = String(metadataContext?.key?.propertyRefs?.[0]?.[0].name ?? '');

  return Token.tokenize({
    type: 'SimpleKey',
    value: { key, value: token },
    position: start,
    next: close,
    source: value
  });
}
export function compoundKey(value: SourceArray, index: number): Token.CompoundKeyToken | undefined {
  const open = Lexer.OPEN(value, index);
  if (!open) {
    return undefined;
  }
  const start = index;
  index = open;

  let pair: Token.KeyValuePairToken | undefined = keyValuePair(value, index);
  if (!pair) {
    return undefined;
  }

  const keys: Token.KeyValuePairToken[] = [];
  while (pair) {
    keys.push(pair);
    const comma = Lexer.COMMA(value, pair.next);
    if (comma) {
      pair = keyValuePair(value, comma);
    } else {
      pair = undefined;
    }
  }

  index = keys[keys.length - 1].next;
  const close = Lexer.CLOSE(value, index);
  if (!close) {
    return undefined;
  }
  index = close;

  return Token.tokenize({
    type: 'CompoundKey',
    value: keys,
    position: start,
    next: index,
    source: value
  });
}
export function keyValuePair(value: SourceArray, index: number): Token.KeyValuePairToken | undefined {
  const prop =
    NameOrIdentifier.primitiveKeyProperty(value, index) ||
    keyPropertyAlias(value, index);

  if (!prop) {
    return undefined;
  }
  const eq = Lexer.EQ(value, prop.next);
  if (!eq) {
    return undefined;
  }

  const val = keyPropertyValue(value, eq);
  if (val) {
    return Token.tokenize({
      type: 'KeyValuePair',
      value: { key: prop, value: val },
      position: index,
      next: val.next,
      source: value
    });
  }
}
export function keyPropertyValue(
  value: SourceArray,
  index: number
): Token.KeyPropertyValueToken | undefined {
  const token = PrimitiveLiteral.primitiveLiteral(value, index);
  if (token) {
    return Token.clone({ ...token, type: 'KeyPropertyValue' });
  }
}
export function keyPropertyAlias(
  value: SourceArray,
  index: number
): Token.KeyPropertyAliasToken | undefined {
  return NameOrIdentifier.odataIdentifier(
    value,
    index,
    'KeyPropertyAlias'
  );
}

export function singleNavigationExpr(
  value: SourceArray,
  index: number
): Token.SingleNavigationExpressionToken | undefined {
  if (value[index] !== 0x2f) {
    return undefined;
  }
  const member = memberExpr(value, index + 1);
  if (member) {
    return Token.tokenize({
      type: 'SingleNavigationExpression',
      value: member,
      position: index,
      next: member.next,
      source: value
    });
  }
}
export function collectionPathExpr(
  value: SourceArray,
  index: number
): Token.CollectionPathExpressionToken | undefined {
  let token: Token.CountExpressionToken | Token.FunctionExpressionToken | Token.AnyExpressionToken | Token.AllExpressionToken | undefined = countExpr(value, index);
  if (!token) {
    if (value[index] === 0x2f) {
      token =
        boundFunctionExpr(value, index + 1) ||
        anyExpr(value, index + 1) ||
        allExpr(value, index + 1);
    }
  }

  if (token) {
    return Token.tokenize({
      type: 'CollectionPathExpression',
      value: token,
      position: index,
      next: token.next,
      source: value
    });
  }
}
export function complexPathExpr(
  value: SourceArray,
  index: number
): Token.ComplexPathExpressionToken | undefined {
  if (value[index] !== 0x2f) {
    return undefined;
  }
  const start = index;
  index++;
  const token = NameOrIdentifier.qualifiedComplexTypeName(value, index);
  if (token) {
    if (value[token.next] !== 0x2f) {
      return undefined;
    }
    index = token.next + 1;
  }

  const expr =
    propertyPathExpr(value, index) || boundFunctionExpr(value, index);

  if (expr) {
    return Token.tokenize({
      type: 'ComplexPathExpression',
      value: token ? [token, expr] : [expr],
      position: start,
      next: expr.next,
      source: value
    });
  }
}
export function singlePathExpr(value: SourceArray, index: number): Token.SinglePathExpressionToken | undefined {
  if (value[index] !== 0x2f) {
    return undefined;
  }
  const boundFunction = boundFunctionExpr(value, index + 1);
  if (boundFunction) {
    return Token.tokenize({
      type: 'SinglePathExpression',
      value: boundFunction,
      position: index,
      next: boundFunction.next,
      source: value
    });
  }
}
export function functionExpr(value: SourceArray, index: number): Token.FunctionExpressionToken | undefined {
  const namespaceNext = NameOrIdentifier.namespace(value, index);
  if (namespaceNext === index || value[namespaceNext] !== 0x2e) {
    return undefined;
  }
  const start = index;
  index = namespaceNext + 1;

  const token = NameOrIdentifier.odataIdentifier(value, index);

  if (!token) {
    return undefined;
  }
  token.position = start;
  token.value.namespace = Utils.stringify(value, start, namespaceNext);
  token.raw = Utils.stringify(value, start, token.next);

  index = token.next;
  const params = functionExprParameters(value, index);

  if (!params) {
    return undefined;
  }

  index = params.next;
  const expr =
    collectionPathExpr(value, index) ||
    collectionNavigationExpr(value, index) ||
    singleNavigationExpr(value, index) ||
    complexPathExpr(value, index) ||
    singlePathExpr(value, index);

  if (expr) {
    index = expr.next;
  }

  return Token.tokenize({
    type: 'FunctionExpression',
    value: { fn: token, params, expression: expr },
    position: start,
    next: index,
    source: value
  });
}
export function boundFunctionExpr(
  value: SourceArray,
  index: number
): Token.FunctionExpressionToken | undefined {
  return functionExpr(value, index);
}

export function functionExprParameters(
  value: SourceArray,
  index: number
): Token.FunctionExpressionParametersToken | undefined {
  const open = Lexer.OPEN(value, index);
  if (!open) {
    return undefined;
  }
  const start = index;
  index = open;

  const params = [];
  let expr = functionExprParameter(value, index);
  while (expr) {
    params.push(expr);
    const comma = Lexer.COMMA(value, expr.next);
    if (comma) {
      index = comma;
      expr = functionExprParameter(value, index);
      if (!expr) {
        return undefined;
      }
    } else {
      index = expr.next;
      expr = undefined;
    }
  }

  const close = Lexer.CLOSE(value, index);
  if (!close) {
    return undefined;
  }
  index = close;

  return Token.tokenize({
    type: 'FunctionExpressionParameters',
    value: params,
    position: start,
    next: index,
    source: value
  });
}
export function functionExprParameter(
  value: SourceArray,
  index: number
): Token.FunctionExpressionParameterToken | undefined {
  const name = parameterName(value, index);
  if (!name) {
    return undefined;
  }
  const eq = Lexer.EQ(value, name.next);
  if (!name || !eq) {
    return undefined;
  }

  const start = index;
  index = eq;

  const param = parameterAlias(value, index) || parameterValue(value, index);

  if (!param) {
    return undefined;
  }
  return Token.tokenize({
    type: 'FunctionExpressionParameter',
    value: { name, value: param },
    position: start,
    next: param.next,
    source: value
  });
}
export function parameterName(value: SourceArray, index: number): Token.ParameterNameToken | undefined {
  return NameOrIdentifier.odataIdentifier(
    value,
    index,
    'ParameterName'
  );
}
export function parameterAlias(value: SourceArray, index: number): Token.ParameterAliasToken | undefined {
  const at = Lexer.AT(value, index);
  if (!at) {
    return undefined;
  }
  const id = NameOrIdentifier.odataIdentifier(value, at);
  if (id) {
    return Token.tokenize({
      type: 'ParameterAlias',
      value: id.value,
      position: index,
      next: id.next,
      source: value
    });
  }
}
export function parameterValue(value: SourceArray, index: number): Token.ParameterValueToken | undefined {
  const token =
    ArrayOrObject.arrayOrObject(value, index) || commonExpr(value, index);
  if (token) {
    return Token.tokenize({
      type: 'ParameterValue',
      value: token.value,
      position: index,
      next: token.next,
      source: value
    });
  }
}

export function countExpr(value: SourceArray, index: number): Token.CountExpressionToken | undefined {
  if (Utils.equals(value, index, '/$count')) {
    return Token.tokenize({
      type: 'CountExpression',
      value: '/$count',
      position: index,
      next: index + 7,
      source: value
    });
  }
}
export function refExpr(value: SourceArray, index: number): Token.RefExpressionToken | undefined {
  if (Utils.equals(value, index, '/$ref')) {
    return Token.tokenize({
      type: 'RefExpression',
      value: '/$ref',
      position: index,
      next: index + 5,
      source: value
    });
  }
}
export function valueExpr(value: SourceArray, index: number): Token.ValueExpressionToken | undefined {
  if (Utils.equals(value, index, '/$value')) {
    return Token.tokenize({
      type: 'ValueExpression',
      value: '/$value',
      position: index,
      next: index + 7,
      source: value
    });
  }
}

export function rootExpr(value: SourceArray, index: number): Token.RootExpressionToken | undefined {
  if (!Utils.equals(value, index, '$root/')) {
    return undefined;
  }
  const start = index;
  index += 6;

  const entitySet = NameOrIdentifier.entitySetName(value, index);
  let predicate: Token.SimpleKeyToken | Token.CompoundKeyToken | undefined,
    entity: Token.SingletonEntityToken | undefined,
    token;
  if (entitySet) {
    predicate = keyPredicate(value, entitySet.next);
  }
  if (!(entitySet && predicate)) {
    entity = NameOrIdentifier.singletonEntity(value, index);
    if (!entity) {
      return undefined;
    }
    token = { entity };
  } else {
    token = { entitySet, keys: predicate };
  }

  index = (predicate || entity)!.next;
  const nav = singleNavigationExpr(value, index);
  if (nav) {
    index = nav.next;
  }

  return Token.tokenize({
    type: 'RootExpression',
    value: { current: token, next: nav },
    position: start,
    next: index,
    source: value
  });
}
