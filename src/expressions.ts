import * as ArrayOrObject from './json';
import * as Lexer from './lexer';
import * as NameOrIdentifier from './nameOrIdentifier';
import * as PrimitiveLiteral from './primitiveLiteral';
import * as Token from './token';
import Utils, { SourceArray } from './utils';

export function commonExpr(
  value: SourceArray,
  index: number
): Lexer.Token<Lexer.TokenType.CommonExpression> {
  let token:
    | Lexer.Token<Lexer.TokenType.Literal>
    | Lexer.Token<Lexer.TokenType.Enum>
    | Lexer.Token<Lexer.TokenType.ParameterAlias>
    | Lexer.Token<Lexer.TokenType.ArrayOrObject>
    | Lexer.Token<Lexer.TokenType.RootExpression>
    | Lexer.Token<Lexer.TokenType.MethodCallExpression>
    | Lexer.Token<Lexer.TokenType.FirstMemberExpression>
    | Lexer.Token<Lexer.TokenType.FunctionExpression>
    | Lexer.Token<Lexer.TokenType.NegateExpression>
    | Lexer.Token<Lexer.TokenType.ParenExpression>
    | Lexer.Token<Lexer.TokenType.CastExpression>
    | Lexer.Token<Lexer.TokenType.AddExpression>
    | Lexer.Token<Lexer.TokenType.SubExpression>
    | Lexer.Token<Lexer.TokenType.MulExpression>
    | Lexer.Token<Lexer.TokenType.DivExpression>
    | Lexer.Token<Lexer.TokenType.ModExpression>
    | Lexer.Token<Lexer.TokenType.AndExpression>
    | Lexer.Token<Lexer.TokenType.OrExpression> =
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
    return;
  }

  const expr =
    addExpr(value, token.next) ||
    subExpr(value, token.next) ||
    mulExpr(value, token.next) ||
    divExpr(value, token.next) ||
    modExpr(value, token.next);

  if (expr) {
    token = new Lexer.Token({
      ...token,
      type: expr.type,
      value: {
        left: Lexer.clone(token),
        right: expr.value
      },
      next: expr.value.next,
      raw: Utils.stringify(value, token.position, token.next)
    });
  }

  if (token) {
    return Lexer.tokenize(
      value,
      token.position,
      token.next,
      token,
      Lexer.TokenType.CommonExpression
    );
  }
}

export function boolCommonExpr(
  value: SourceArray,
  index: number
): Lexer.Token<Lexer.TokenType.IsOfExpression>
   | Lexer.Token<Lexer.TokenType.MethodCallExpression>
   | Lexer.Token<Lexer.TokenType.NotExpression>
   | Lexer.Token<Lexer.TokenType.CommonExpression>
   | Lexer.Token<Lexer.TokenType.BoolParenExpression>
   | Lexer.Token<Lexer.TokenType.EqualsExpression>
   | Lexer.Token<Lexer.TokenType.NotEqualsExpression>
   | Lexer.Token<Lexer.TokenType.LesserThanExpression>
   | Lexer.Token<Lexer.TokenType.LesserOrEqualsExpression>
   | Lexer.Token<Lexer.TokenType.GreaterThanExpression>
   | Lexer.Token<Lexer.TokenType.GreaterOrEqualsExpression>
   | Lexer.Token<Lexer.TokenType.HasExpression>
   | Lexer.Token<Lexer.TokenType.AndExpression>
   | Lexer.Token<Lexer.TokenType.OrExpression> {
  let token: Lexer.Token<Lexer.TokenType.IsOfExpression>
    | Lexer.Token<Lexer.TokenType.MethodCallExpression>
    | Lexer.Token<Lexer.TokenType.NotExpression>
    | Lexer.Token<Lexer.TokenType.CommonExpression>
    | Lexer.Token<Lexer.TokenType.BoolParenExpression>
    | Lexer.Token<Lexer.TokenType.EqualsExpression>
    | Lexer.Token<Lexer.TokenType.NotEqualsExpression>
    | Lexer.Token<Lexer.TokenType.LesserThanExpression>
    | Lexer.Token<Lexer.TokenType.LesserOrEqualsExpression>
    | Lexer.Token<Lexer.TokenType.GreaterThanExpression>
    | Lexer.Token<Lexer.TokenType.GreaterOrEqualsExpression>
    | Lexer.Token<Lexer.TokenType.HasExpression>
    | Lexer.Token<Lexer.TokenType.AndExpression>
    | Lexer.Token<Lexer.TokenType.OrExpression> =
    isofExpr(value, index) ||
    boolMethodCallExpr(value, index) ||
    notExpr(value, index) ||
    commonExpr(value, index) ||
    boolParenExpr(value, index);

  if (!token) {
    return;
  }

  if (token.type === Lexer.TokenType.CommonExpression) {
    const commonMoreExpr =
      eqExpr(value, token.next) ||
      neExpr(value, token.next) ||
      ltExpr(value, token.next) ||
      leExpr(value, token.next) ||
      gtExpr(value, token.next) ||
      geExpr(value, token.next) ||
      hasExpr(value, token.next);

    if (commonMoreExpr) {
      token = new Lexer.Token({
        ...token,
        type: commonMoreExpr.type,
        value: { left: token.value, right: commonMoreExpr.value },
        next: commonMoreExpr.value.next,
        raw: Utils.stringify(value, token.position, commonMoreExpr.value.next)
      });
    }
  }

  const expr = andExpr(value, token.next) || orExpr(value, token.next);

  if (expr) {
    const left = Lexer.clone(token);
    token = new Lexer.Token({
      ...token,
      type: expr.type,
      value: { left, right: expr.value },
      next: expr.value.next,
      raw: Utils.stringify(value, token.position, expr.value.next)
    });

    if (
      token.type === Lexer.TokenType.AndExpression &&
      token.value.right.type === Lexer.TokenType.OrExpression
    ) {
      const left = Lexer.tokenize(
        value,
        token.value.left.position,
        token.value.right.value.left.next,
        {
          left: token.value.left,
          right: token.value.right.value.left
        },
        token.type
      );
      const right = token.value.right.value.right;
      token = new Lexer.Token({
        ...token,
        type: token.value.right.type,
        value: { left, right }
      });
    }
  }

  return token;
}

interface InternalAndOrExpression<T extends Lexer.TokenType.AndExpression | Lexer.TokenType.OrExpression> {
  type: T;
  value: Token.TokenTypeValue<T>['right'];
  position: number;
  next: number;
  raw: string;
}

interface InternalLeftRightExpression<T extends InternalLeftRightTokenType> {
  type: T;
  value: Token.TokenTypeValue<T>['right'];
  position: number;
  next: number;
  raw: string;
}

type InternalLeftRightTokenType =
  | Lexer.TokenType.EqualsExpression
  | Lexer.TokenType.NotEqualsExpression
  | Lexer.TokenType.LesserThanExpression
  | Lexer.TokenType.LesserOrEqualsExpression
  | Lexer.TokenType.GreaterThanExpression
  | Lexer.TokenType.GreaterOrEqualsExpression
  | Lexer.TokenType.HasExpression
  | Lexer.TokenType.AddExpression
  | Lexer.TokenType.SubExpression
  | Lexer.TokenType.MulExpression
  | Lexer.TokenType.DivExpression
  | Lexer.TokenType.ModExpression;

export function andExpr(value: SourceArray, index: number): InternalAndOrExpression<Lexer.TokenType.AndExpression> {
  let rws = Lexer.RWS(value, index);
  if (rws === index || !Utils.equals(value, rws, 'and')) {
    return;
  }
  const start = index;
  index = rws + 3;
  rws = Lexer.RWS(value, index);
  if (rws === index) {
    return;
  }
  index = rws;
  const token = boolCommonExpr(value, index);
  if (!token) {
    return;
  }

  return {
    type: Lexer.TokenType.AndExpression,
    value: token,
    position: start,
    next: index,
    raw: Utils.stringify(value, start, index)
  };
}

export function orExpr(value: SourceArray, index: number): InternalAndOrExpression<Lexer.TokenType.OrExpression> {
  let rws = Lexer.RWS(value, index);
  if (rws === index || !Utils.equals(value, rws, 'or')) {
    return;
  }
  const start = index;
  index = rws + 2;
  rws = Lexer.RWS(value, index);
  if (rws === index) {
    return;
  }
  index = rws;
  const token = boolCommonExpr(value, index);
  if (!token) {
    return;
  }

  return {
    type: Lexer.TokenType.OrExpression,
    value: token,
    position: start,
    next: index,
    raw: Utils.stringify(value, start, index)
  };
}

export function leftRightExpr<T extends InternalLeftRightTokenType>(
  value: SourceArray,
  index: number,
  expr: string,
  tokenType: T
): InternalLeftRightExpression<T> {
  let rws = Lexer.RWS(value, index);
  if (rws === index) {
    return;
  }
  const start = index;
  index = rws;
  if (!Utils.equals(value, index, expr)) {
    return;
  }
  index += expr.length;
  rws = Lexer.RWS(value, index);
  if (rws === index) {
    return;
  }
  index = rws;
  const token = commonExpr(value, index);
  if (!token) {
    return;
  }

  return {
    type: tokenType,
    value: token.value,
    position: start,
    next: index,
    raw: Utils.stringify(value, start, index)
  };
}
export function eqExpr(value: SourceArray, index: number): InternalLeftRightExpression<Lexer.TokenType.EqualsExpression> {
  return leftRightExpr(value, index, 'eq', Lexer.TokenType.EqualsExpression);
}
export function neExpr(value: SourceArray, index: number): InternalLeftRightExpression<Lexer.TokenType.NotEqualsExpression> {
  return leftRightExpr(value, index, 'ne', Lexer.TokenType.NotEqualsExpression);
}
export function ltExpr(value: SourceArray, index: number): InternalLeftRightExpression<Lexer.TokenType.LesserThanExpression> {
  return leftRightExpr(
    value,
    index,
    'lt',
    Lexer.TokenType.LesserThanExpression
  );
}
export function leExpr(value: SourceArray, index: number): InternalLeftRightExpression<Lexer.TokenType.LesserOrEqualsExpression> {
  return leftRightExpr(
    value,
    index,
    'le',
    Lexer.TokenType.LesserOrEqualsExpression
  );
}
export function gtExpr(value: SourceArray, index: number): InternalLeftRightExpression<Lexer.TokenType.GreaterThanExpression> {
  return leftRightExpr(
    value,
    index,
    'gt',
    Lexer.TokenType.GreaterThanExpression
  );
}
export function geExpr(value: SourceArray, index: number): InternalLeftRightExpression<Lexer.TokenType.GreaterOrEqualsExpression> {
  return leftRightExpr(
    value,
    index,
    'ge',
    Lexer.TokenType.GreaterOrEqualsExpression
  );
}
export function hasExpr(value: SourceArray, index: number): InternalLeftRightExpression<Lexer.TokenType.HasExpression> {
  return leftRightExpr(value, index, 'has', Lexer.TokenType.HasExpression);
}

export function addExpr(value: SourceArray, index: number): InternalLeftRightExpression<Lexer.TokenType.AddExpression> {
  return leftRightExpr(value, index, 'add', Lexer.TokenType.AddExpression);
}
export function subExpr(value: SourceArray, index: number): InternalLeftRightExpression<Lexer.TokenType.SubExpression> {
  return leftRightExpr(value, index, 'sub', Lexer.TokenType.SubExpression);
}
export function mulExpr(value: SourceArray, index: number): InternalLeftRightExpression<Lexer.TokenType.MulExpression> {
  return leftRightExpr(value, index, 'mul', Lexer.TokenType.MulExpression);
}
export function divExpr(value: SourceArray, index: number): InternalLeftRightExpression<Lexer.TokenType.DivExpression> {
  return leftRightExpr(value, index, 'div', Lexer.TokenType.DivExpression);
}
export function modExpr(value: SourceArray, index: number): InternalLeftRightExpression<Lexer.TokenType.ModExpression> {
  return leftRightExpr(value, index, 'mod', Lexer.TokenType.ModExpression);
}

export function notExpr(value: SourceArray, index: number): Lexer.Token<Lexer.TokenType.NotExpression> {
  if (!Utils.equals(value, index, 'not')) {
    return;
  }
  const start = index;
  index += 3;
  const rws = Lexer.RWS(value, index);
  if (rws === index) {
    return;
  }
  index = rws;
  const token = boolCommonExpr(value, index);
  if (!token) {
    return;
  }

  return Lexer.tokenize(
    value,
    start,
    token.next,
    token,
    Lexer.TokenType.NotExpression
  );
}

export function boolParenExpr(value: SourceArray, index: number): Lexer.Token<Lexer.TokenType.BoolParenExpression> {
  const open = Lexer.OPEN(value, index);
  if (!open) {
    return;
  }
  const start = index;
  index = open;
  index = Lexer.BWS(value, index);
  const token = boolCommonExpr(value, index);
  if (!token) {
    return;
  }
  index = Lexer.BWS(value, token.next);
  const close = Lexer.CLOSE(value, index);
  if (!close) {
    return;
  }
  index = close;

  return Lexer.tokenize(
    value,
    start,
    index,
    token,
    Lexer.TokenType.BoolParenExpression
  );
}
export function parenExpr(value: SourceArray, index: number): Lexer.Token<Lexer.TokenType.ParenExpression> {
  const open = Lexer.OPEN(value, index);
  if (!open) {
    return;
  }
  const start = index;
  index = open;
  index = Lexer.BWS(value, index);
  const token = commonExpr(value, index);
  if (!token) {
    return;
  }
  index = Lexer.BWS(value, token.next);
  const close = Lexer.CLOSE(value, index);
  if (!close) {
    return;
  }
  index = close;

  return Lexer.tokenize(
    value,
    start,
    index,
    token.value,
    Lexer.TokenType.ParenExpression
  );
}

export function boolMethodCallExpr(
  value: SourceArray,
  index: number
): Lexer.Token<Lexer.TokenType.MethodCallExpression> {
  return (
    endsWithMethodCallExpr(value, index) ||
    startsWithMethodCallExpr(value, index) ||
    containsMethodCallExpr(value, index) ||
    matchesPatternMethodCallExpr(value, index) ||
    intersectsMethodCallExpr(value, index)
  );
}
export function methodCallExpr(
  value: SourceArray,
  index: number
): Lexer.Token<Lexer.TokenType.MethodCallExpression> {
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
): Lexer.Token<Lexer.TokenType.MethodCallExpression> {
  if (typeof min === 'undefined') {
    min = 0;
  }
  if (typeof max === 'undefined') {
    max = min;
  }

  if (!Utils.equals(value, index, method)) {
    return;
  }
  const start = index;
  index += method.length;
  const open = Lexer.OPEN(value, index);
  if (!open) {
    return;
  }
  index = open;
  index = Lexer.BWS(value, index);
  let parameters;
  if (min > 0) {
    parameters = [];
    while (parameters.length < max) {
      const expr = commonExpr(value, index);
      if (parameters.length < min && !expr) {
        return;
      } else if (expr) {
        parameters.push(expr.value);
        index = expr.next;
        index = Lexer.BWS(value, index);
        const comma = Lexer.COMMA(value, index);
        if (parameters.length < min && !comma) {
          return;
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
    return;
  }
  index = close;

  return Lexer.tokenize(
    value,
    start,
    index,
    {
      method,
      parameters
    },
    Lexer.TokenType.MethodCallExpression
  );
}
export function containsMethodCallExpr(
  value: SourceArray,
  index: number
): Lexer.Token<Lexer.TokenType.MethodCallExpression> {
  return methodCallExprFactory(value, index, 'contains', 2);
}
export function startsWithMethodCallExpr(
  value: SourceArray,
  index: number
): Lexer.Token<Lexer.TokenType.MethodCallExpression> {
  return methodCallExprFactory(value, index, 'startswith', 2);
}
export function endsWithMethodCallExpr(
  value: SourceArray,
  index: number
): Lexer.Token<Lexer.TokenType.MethodCallExpression> {
  return methodCallExprFactory(value, index, 'endswith', 2);
}
export function matchesPatternMethodCallExpr(
  value: SourceArray,
  index: number
): Lexer.Token<Lexer.TokenType.MethodCallExpression> {
  return methodCallExprFactory(value, index, 'matchespattern', 2);
}
export function lengthMethodCallExpr(
  value: SourceArray,
  index: number
): Lexer.Token<Lexer.TokenType.MethodCallExpression> {
  return methodCallExprFactory(value, index, 'length', 1);
}
export function indexOfMethodCallExpr(
  value: SourceArray,
  index: number
): Lexer.Token<Lexer.TokenType.MethodCallExpression> {
  return methodCallExprFactory(value, index, 'indexof', 2);
}
export function substringMethodCallExpr(
  value: SourceArray,
  index: number
): Lexer.Token<Lexer.TokenType.MethodCallExpression> {
  return methodCallExprFactory(value, index, 'substring', 2, 3);
}
export function substringOfMethodCallExpr(
  value: SourceArray,
  index: number
): Lexer.Token<Lexer.TokenType.MethodCallExpression> {
  return methodCallExprFactory(value, index, 'substringof', 2);
}
export function toLowerMethodCallExpr(
  value: SourceArray,
  index: number
): Lexer.Token<Lexer.TokenType.MethodCallExpression> {
  return methodCallExprFactory(value, index, 'tolower', 1);
}
export function toUpperMethodCallExpr(
  value: SourceArray,
  index: number
): Lexer.Token<Lexer.TokenType.MethodCallExpression> {
  return methodCallExprFactory(value, index, 'toupper', 1);
}
export function trimMethodCallExpr(
  value: SourceArray,
  index: number
): Lexer.Token<Lexer.TokenType.MethodCallExpression> {
  return methodCallExprFactory(value, index, 'trim', 1);
}
export function concatMethodCallExpr(
  value: SourceArray,
  index: number
): Lexer.Token<Lexer.TokenType.MethodCallExpression> {
  return methodCallExprFactory(value, index, 'concat', 2);
}

export function yearMethodCallExpr(
  value: SourceArray,
  index: number
): Lexer.Token<Lexer.TokenType.MethodCallExpression> {
  return methodCallExprFactory(value, index, 'year', 1);
}
export function monthMethodCallExpr(
  value: SourceArray,
  index: number
): Lexer.Token<Lexer.TokenType.MethodCallExpression> {
  return methodCallExprFactory(value, index, 'month', 1);
}
export function dayMethodCallExpr(
  value: SourceArray,
  index: number
): Lexer.Token<Lexer.TokenType.MethodCallExpression> {
  return methodCallExprFactory(value, index, 'day', 1);
}
export function hourMethodCallExpr(
  value: SourceArray,
  index: number
): Lexer.Token<Lexer.TokenType.MethodCallExpression> {
  return methodCallExprFactory(value, index, 'hour', 1);
}
export function minuteMethodCallExpr(
  value: SourceArray,
  index: number
): Lexer.Token<Lexer.TokenType.MethodCallExpression> {
  return methodCallExprFactory(value, index, 'minute', 1);
}
export function secondMethodCallExpr(
  value: SourceArray,
  index: number
): Lexer.Token<Lexer.TokenType.MethodCallExpression> {
  return methodCallExprFactory(value, index, 'second', 1);
}
export function fractionalsecondsMethodCallExpr(
  value: SourceArray,
  index: number
): Lexer.Token<Lexer.TokenType.MethodCallExpression> {
  return methodCallExprFactory(value, index, 'fractionalseconds', 1);
}
export function totalsecondsMethodCallExpr(
  value: SourceArray,
  index: number
): Lexer.Token<Lexer.TokenType.MethodCallExpression> {
  return methodCallExprFactory(value, index, 'totalseconds', 1);
}
export function dateMethodCallExpr(
  value: SourceArray,
  index: number
): Lexer.Token<Lexer.TokenType.MethodCallExpression> {
  return methodCallExprFactory(value, index, 'date', 1);
}
export function timeMethodCallExpr(
  value: SourceArray,
  index: number
): Lexer.Token<Lexer.TokenType.MethodCallExpression> {
  return methodCallExprFactory(value, index, 'time', 1);
}
export function totalOffsetMinutesMethodCallExpr(
  value: SourceArray,
  index: number
): Lexer.Token<Lexer.TokenType.MethodCallExpression> {
  return methodCallExprFactory(value, index, 'totaloffsetminutes', 1);
}

export function minDateTimeMethodCallExpr(
  value: SourceArray,
  index: number
): Lexer.Token<Lexer.TokenType.MethodCallExpression> {
  return methodCallExprFactory(value, index, 'mindatetime', 0);
}
export function maxDateTimeMethodCallExpr(
  value: SourceArray,
  index: number
): Lexer.Token<Lexer.TokenType.MethodCallExpression> {
  return methodCallExprFactory(value, index, 'maxdatetime', 0);
}
export function nowMethodCallExpr(
  value: SourceArray,
  index: number
): Lexer.Token<Lexer.TokenType.MethodCallExpression> {
  return methodCallExprFactory(value, index, 'now', 0);
}

export function roundMethodCallExpr(
  value: SourceArray,
  index: number
): Lexer.Token<Lexer.TokenType.MethodCallExpression> {
  return methodCallExprFactory(value, index, 'round', 1);
}
export function floorMethodCallExpr(
  value: SourceArray,
  index: number
): Lexer.Token<Lexer.TokenType.MethodCallExpression> {
  return methodCallExprFactory(value, index, 'floor', 1);
}
export function ceilingMethodCallExpr(
  value: SourceArray,
  index: number
): Lexer.Token<Lexer.TokenType.MethodCallExpression> {
  return methodCallExprFactory(value, index, 'ceiling', 1);
}

export function distanceMethodCallExpr(
  value: SourceArray,
  index: number
): Lexer.Token<Lexer.TokenType.MethodCallExpression> {
  return methodCallExprFactory(value, index, 'geo.distance', 2);
}
export function geoLengthMethodCallExpr(
  value: SourceArray,
  index: number
): Lexer.Token<Lexer.TokenType.MethodCallExpression> {
  return methodCallExprFactory(value, index, 'geo.length', 1);
}
export function intersectsMethodCallExpr(
  value: SourceArray,
  index: number
): Lexer.Token<Lexer.TokenType.MethodCallExpression> {
  return methodCallExprFactory(value, index, 'geo.intersects', 2);
}

export function isofExpr(value: SourceArray, index: number): Lexer.Token<Lexer.TokenType.IsOfExpression> {
  if (!Utils.equals(value, index, 'isof')) {
    return;
  }
  const start = index;
  index += 4;
  const open = Lexer.OPEN(value, index);
  if (!open) {
    return;
  }
  index = open;
  index = Lexer.BWS(value, index);
  const expr = commonExpr(value, index);
  if (expr) {
    index = expr.next;
    index = Lexer.BWS(value, index);
    const comma = Lexer.COMMA(value, index);
    if (!comma) {
      return;
    }
    index = comma;
    index = Lexer.BWS(value, index);
  }
  const typeName = NameOrIdentifier.qualifiedTypeName(value, index);
  if (!typeName) {
    return;
  }
  index = typeName.next;
  index = Lexer.BWS(value, index);
  const close = Lexer.CLOSE(value, index);
  if (!close) {
    return;
  }
  index = close;

  return Lexer.tokenize(
    value,
    start,
    index,
    {
      target: expr,
      typename: typeName
    },
    Lexer.TokenType.IsOfExpression
  );
}
export function castExpr(value: SourceArray, index: number): Lexer.Token<Lexer.TokenType.CastExpression> {
  if (!Utils.equals(value, index, 'cast')) {
    return;
  }
  const start = index;
  index += 4;
  const open = Lexer.OPEN(value, index);
  if (!open) {
    return;
  }
  index = open;
  index = Lexer.BWS(value, index);
  const expr = commonExpr(value, index);
  if (expr) {
    index = expr.next;
    index = Lexer.BWS(value, index);
    const comma = Lexer.COMMA(value, index);
    if (!comma) {
      return;
    }
    index = comma;
    index = Lexer.BWS(value, index);
  }
  const typeName = NameOrIdentifier.qualifiedTypeName(value, index);
  if (!typeName) {
    return;
  }
  index = typeName.next;
  index = Lexer.BWS(value, index);
  const close = Lexer.CLOSE(value, index);
  if (!close) {
    return;
  }
  index = close;

  return Lexer.tokenize(
    value,
    start,
    index,
    {
      target: expr,
      typename: typeName
    },
    Lexer.TokenType.CastExpression
  );
}

export function negateExpr(value: SourceArray, index: number): Lexer.Token<Lexer.TokenType.NegateExpression> {
  if (value[index] !== 0x2d) {
    return;
  }
  const start = index;
  index++;
  index = Lexer.BWS(value, index);
  const expr = commonExpr(value, index);
  if (!expr) {
    return;
  }

  return Lexer.tokenize(
    value,
    start,
    expr.next,
    expr,
    Lexer.TokenType.NegateExpression
  );
}

export function firstMemberExpr(
  value: SourceArray,
  index: number
): Lexer.Token<Lexer.TokenType.FirstMemberExpression> {
  const token = inscopeVariableExpr(value, index);
  let member: Lexer.Token<Lexer.TokenType.MemberExpression>;
  const start = index;

  if (token) {
    if (value[token.next] === 0x2f) {
      index = token.next + 1;
      member = memberExpr(value, index);
      if (!member) {
        return;
      }

      return Lexer.tokenize(
        value,
        start,
        member.next,
        [token, member],
        Lexer.TokenType.FirstMemberExpression
      );
    }
  } else {
    member = memberExpr(value, index);
  }

  const firstToken = token || member;
  if (!firstToken) {
    return;
  }

  return Lexer.tokenize(
    value,
    start,
    firstToken.next,
    firstToken,
    Lexer.TokenType.FirstMemberExpression
  );
}
export function memberExpr(value: SourceArray, index: number): Lexer.Token<Lexer.TokenType.MemberExpression> {
  const start = index;
  const token = NameOrIdentifier.qualifiedEntityTypeName(value, index);

  if (token) {
    if (value[token.next] !== 0x2f) {
      return;
    }
    index = token.next + 1;
  }

  const next =
    propertyPathExpr(value, index) || boundFunctionExpr(value, index);

  if (!next) {
    return;
  }
  return Lexer.tokenize(
    value,
    start,
    next.next,
    token ? { name: token, value: next } : next,
    Lexer.TokenType.MemberExpression
  );
}
export function propertyPathExpr(
  value: SourceArray,
  index: number
): Lexer.Token<Lexer.TokenType.PropertyPathExpression> {
  let token: Token.PropertyPathExpressionToken['value'] = NameOrIdentifier.odataIdentifier(
    value,
    index,
    Lexer.TokenType.ODataIdentifier
  );
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
        current: Lexer.clone(token),
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
    return;
  }
  return Lexer.tokenize(
    value,
    start,
    index,
    token,
    Lexer.TokenType.PropertyPathExpression
  );
}
export function inscopeVariableExpr(
  value: SourceArray,
  index: number
): Lexer.Token<Lexer.TokenType.ImplicitVariableExpression> | Lexer.Token<Lexer.TokenType.LambdaVariableExpression> | Lexer.Token<Lexer.TokenType.ODataIdentifier> {
  return (
    implicitVariableExpr(value, index) ||
    (isLambdaPredicate ? lambdaVariableExpr(value, index) : undefined)
  );
}
export function implicitVariableExpr(
  value: SourceArray,
  index: number
): Lexer.Token<Lexer.TokenType.ImplicitVariableExpression> {
  if (Utils.equals(value, index, '$it')) {
    return Lexer.tokenize(
      value,
      index,
      index + 3,
      '$it',
      Lexer.TokenType.ImplicitVariableExpression
    );
  }
}
let isLambdaPredicate = false;
let hasLambdaVariableExpr = false;
export function lambdaVariableExpr(
  value: SourceArray,
  index: number
): Lexer.Token<Lexer.TokenType.LambdaVariableExpression> {
  const token = NameOrIdentifier.odataIdentifier(
    value,
    index,
    Lexer.TokenType.LambdaVariableExpression
  );
  if (token) {
    hasLambdaVariableExpr = true;
    return token;
  }
}
export function lambdaPredicateExpr(
  value: SourceArray,
  index: number
): Lexer.Token<Lexer.TokenType.LambdaPredicateExpression> {
  isLambdaPredicate = true;
  const token = boolCommonExpr(value, index);
  isLambdaPredicate = false;
  if (token && hasLambdaVariableExpr) {
    hasLambdaVariableExpr = false;
    return Lexer.tokenize(
      value,
      token.position,
      token.next,
      token,
      Lexer.TokenType.LambdaPredicateExpression
    );
  }
}
export function anyExpr(value: SourceArray, index: number): Lexer.Token<Lexer.TokenType.AnyExpression> {
  if (!Utils.equals(value, index, 'any')) {
    return;
  }
  const start = index;
  index += 3;
  const open = Lexer.OPEN(value, index);
  if (!open) {
    return;
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
      return;
    }
    index = colon;
    index = Lexer.BWS(value, index);
    predicate = lambdaPredicateExpr(value, index);
    if (!predicate) {
      return;
    }
    index = predicate.next;
  }
  index = Lexer.BWS(value, index);
  const close = Lexer.CLOSE(value, index);
  if (!close) {
    return;
  }
  index = close;

  return Lexer.tokenize(
    value,
    start,
    index,
    {
      variable,
      predicate
    },
    Lexer.TokenType.AnyExpression
  );
}
export function allExpr(value: SourceArray, index: number): Lexer.Token<Lexer.TokenType.AllExpression> {
  if (!Utils.equals(value, index, 'all')) {
    return;
  }
  const start = index;
  index += 3;

  const open = Lexer.OPEN(value, index);
  if (!open) {
    return;
  }
  index = open;

  index = Lexer.BWS(value, index);
  const variable = lambdaVariableExpr(value, index);
  if (!variable) {
    return;
  }
  index = variable.next;

  index = Lexer.BWS(value, index);

  const colon = Lexer.COLON(value, index);
  if (!colon) {
    return;
  }
  index = colon;

  index = Lexer.BWS(value, index);

  const predicate = lambdaPredicateExpr(value, index);
  if (!predicate) {
    return;
  }
  index = predicate.next;

  index = Lexer.BWS(value, index);

  const close = Lexer.CLOSE(value, index);
  if (!close) {
    return;
  }
  index = close;

  return Lexer.tokenize(
    value,
    start,
    index,
    {
      variable,
      predicate
    },
    Lexer.TokenType.AllExpression
  );
}

export function collectionNavigationExpr(
  value: SourceArray,
  index: number
): Lexer.Token<Lexer.TokenType.CollectionNavigationExpression> {
  const start = index;
  let entity, navigation, path;
  if (value[index] === 0x2f) {
    index++;
    entity = NameOrIdentifier.qualifiedEntityTypeName(value, index);
    if (!entity) {
      return;
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
    return Lexer.tokenize(
      value,
      start,
      index,
      {
        entity,
        predicate,
        navigation,
        path
      },
      Lexer.TokenType.CollectionNavigationExpression
    );
  }
}
export function keyPredicate(
  value: SourceArray,
  index: number,
  metadataContext?: Lexer.MetadataContext
): Lexer.Token<Lexer.TokenType.SimpleKey> | Lexer.Token<Lexer.TokenType.CompoundKey> {
  return simpleKey(value, index, metadataContext) || compoundKey(value, index);
}
export function simpleKey(
  value: SourceArray,
  index: number,
  metadataContext?: Lexer.MetadataContext
): Lexer.Token<Lexer.TokenType.SimpleKey> {
  const open = Lexer.OPEN(value, index);
  if (!open) {
    return;
  }
  const start = index;
  index = open;

  const token = keyPropertyValue(value, index);
  if (!token) {
    return;
  }

  const close = Lexer.CLOSE(value, token.next);
  if (!close) {
    return;
  }

  const key = metadataContext?.key?.propertyRefs?.[0]?.name;

  return Lexer.tokenize(
    value,
    start,
    close,
    { key, value: token },
    Lexer.TokenType.SimpleKey
  );
}
export function compoundKey(value: SourceArray, index: number): Lexer.Token<Lexer.TokenType.CompoundKey> {
  const open = Lexer.OPEN(value, index);
  if (!open) {
    return;
  }
  const start = index;
  index = open;

  let pair = keyValuePair(value, index);
  if (!pair) {
    return;
  }

  const keys = [];
  while (pair) {
    keys.push(pair);
    const comma = Lexer.COMMA(value, pair.next);
    if (comma) {
      pair = keyValuePair(value, comma);
    } else {
      pair = null;
    }
  }

  index = keys[keys.length - 1].next;
  const close = Lexer.CLOSE(value, index);
  if (!close) {
    return;
  }
  index = close;

  return Lexer.tokenize(value, start, index, keys, Lexer.TokenType.CompoundKey);
}
export function keyValuePair(value: SourceArray, index: number): Lexer.Token<Lexer.TokenType.KeyValuePair> {
  const prop =
    NameOrIdentifier.primitiveKeyProperty(value, index) ||
    keyPropertyAlias(value, index);

  if (!prop) {
    return;
  }
  const eq = Lexer.EQ(value, prop.next);
  if (!eq) {
    return;
  }

  const val = keyPropertyValue(value, eq);
  if (val) {
    return Lexer.tokenize(
      value,
      index,
      val.next,
      {
        key: prop,
        value: val
      },
      Lexer.TokenType.KeyValuePair
    );
  }
}
export function keyPropertyValue(
  value: SourceArray,
  index: number
): Lexer.Token<Lexer.TokenType.KeyPropertyValue> {
  const token = PrimitiveLiteral.primitiveLiteral(value, index);
  if (token) {
    return new Lexer.Token({
      ...token,
      type: Lexer.TokenType.KeyPropertyValue,
      value: String(token.value)
    });
  }
}
export function keyPropertyAlias(
  value: SourceArray,
  index: number
): Lexer.Token<Lexer.TokenType.KeyPropertyAlias> {
  return NameOrIdentifier.odataIdentifier(
    value,
    index,
    Lexer.TokenType.KeyPropertyAlias
  );
}

export function singleNavigationExpr(
  value: SourceArray,
  index: number
): Lexer.Token<Lexer.TokenType.SingleNavigationExpression> {
  if (value[index] !== 0x2f) {
    return;
  }
  const member = memberExpr(value, index + 1);
  if (member) {
    return Lexer.tokenize(
      value,
      index,
      member.next,
      member,
      Lexer.TokenType.SingleNavigationExpression
    );
  }
}
export function collectionPathExpr(
  value: SourceArray,
  index: number
): Lexer.Token<Lexer.TokenType.CollectionPathExpression> {
  let token:
    | Lexer.Token<Lexer.TokenType.CountExpression>
    | Lexer.Token<Lexer.TokenType.FunctionExpression>
    | Lexer.Token<Lexer.TokenType.AnyExpression>
    | Lexer.Token<Lexer.TokenType.AllExpression> = countExpr(value, index);
  if (!token) {
    if (value[index] === 0x2f) {
      token =
        boundFunctionExpr(value, index + 1) ||
        anyExpr(value, index + 1) ||
        allExpr(value, index + 1);
    }
  }

  if (token) {
    return Lexer.tokenize(
      value,
      index,
      token.next,
      token,
      Lexer.TokenType.CollectionPathExpression
    );
  }
}
export function complexPathExpr(
  value: SourceArray,
  index: number
): Lexer.Token<Lexer.TokenType.ComplexPathExpression> {
  if (value[index] !== 0x2f) {
    return;
  }
  const start = index;
  index++;
  const token = NameOrIdentifier.qualifiedComplexTypeName(value, index);
  if (token) {
    if (value[token.next] !== 0x2f) {
      return;
    }
    index = token.next + 1;
  }

  const expr =
    propertyPathExpr(value, index) || boundFunctionExpr(value, index);

  if (expr) {
    return Lexer.tokenize(
      value,
      start,
      expr.next,
      token ? [token, expr] : [expr],
      Lexer.TokenType.ComplexPathExpression
    );
  }
}
export function singlePathExpr(value: SourceArray, index: number): Lexer.Token<Lexer.TokenType.SinglePathExpression> {
  if (value[index] !== 0x2f) {
    return;
  }
  const boundFunction = boundFunctionExpr(value, index + 1);
  if (boundFunction) {
    return Lexer.tokenize(
      value,
      index,
      boundFunction.next,
      boundFunction,
      Lexer.TokenType.SinglePathExpression
    );
  }
}
export function functionExpr(value: SourceArray, index: number): Lexer.Token<Lexer.TokenType.FunctionExpression> {
  const namespaceNext = NameOrIdentifier.namespace(value, index);
  if (namespaceNext === index || value[namespaceNext] !== 0x2e) {
    return;
  }
  const start = index;
  index = namespaceNext + 1;

  const token = NameOrIdentifier.odataIdentifier(
    value,
    index,
    Lexer.TokenType.ODataIdentifier
  );

  if (!token) {
    return;
  }
  token.position = start;
  token.value.namespace = Utils.stringify(value, start, namespaceNext);
  token.raw = Utils.stringify(value, start, token.next);

  index = token.next;
  const params = functionExprParameters(value, index);

  if (!params) {
    return;
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

  return Lexer.tokenize(
    value,
    start,
    index,
    { fn: token, params, expression: expr },
    Lexer.TokenType.FunctionExpression
  );
}
export function boundFunctionExpr(
  value: SourceArray,
  index: number
): Lexer.Token<Lexer.TokenType.FunctionExpression> {
  return functionExpr(value, index);
}

export function functionExprParameters(
  value: SourceArray,
  index: number
): Lexer.Token<Lexer.TokenType.FunctionExpressionParameters> {
  const open = Lexer.OPEN(value, index);
  if (!open) {
    return;
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
        return;
      }
    } else {
      index = expr.next;
      expr = null;
    }
  }

  const close = Lexer.CLOSE(value, index);
  if (!close) {
    return;
  }
  index = close;

  return Lexer.tokenize(
    value,
    start,
    index,
    params,
    Lexer.TokenType.FunctionExpressionParameters
  );
}
export function functionExprParameter(
  value: SourceArray,
  index: number
): Lexer.Token<Lexer.TokenType.FunctionExpressionParameter> {
  const name = parameterName(value, index);
  if (!name) {
    return;
  }
  const eq = Lexer.EQ(value, name.next);
  if (!name || !eq) {
    return;
  }

  const start = index;
  index = eq;

  const param = parameterAlias(value, index) || parameterValue(value, index);

  if (!param) {
    return;
  }
  return Lexer.tokenize(
    value,
    start,
    param.next,
    {
      name,
      value: param
    },
    Lexer.TokenType.FunctionExpressionParameter
  );
}
export function parameterName(value: SourceArray, index: number): Lexer.Token<Lexer.TokenType.ParameterName> {
  return NameOrIdentifier.odataIdentifier(
    value,
    index,
    Lexer.TokenType.ParameterName
  );
}
export function parameterAlias(value: SourceArray, index: number): Lexer.Token<Lexer.TokenType.ParameterAlias> {
  const at = Lexer.AT(value, index);
  if (!at) {
    return;
  }
  const id = NameOrIdentifier.odataIdentifier(value, at, Lexer.TokenType.ODataIdentifier);
  if (id) {
    return Lexer.tokenize(
      value,
      index,
      id.next,
      id.value,
      Lexer.TokenType.ParameterAlias
    );
  }
}
export function parameterValue(value: SourceArray, index: number): Lexer.Token<Lexer.TokenType.ParameterValue> {
  const token =
    ArrayOrObject.arrayOrObject(value, index) || commonExpr(value, index);
  if (token) {
    return Lexer.tokenize(
      value,
      index,
      token.next,
      token.value,
      Lexer.TokenType.ParameterValue
    );
  }
}

export function countExpr(value: SourceArray, index: number): Lexer.Token<Lexer.TokenType.CountExpression> {
  if (Utils.equals(value, index, '/$count')) {
    return Lexer.tokenize(
      value,
      index,
      index + 7,
      '/$count',
      Lexer.TokenType.CountExpression
    );
  }
}
export function refExpr(value: SourceArray, index: number): Lexer.Token<Lexer.TokenType.RefExpression> {
  if (Utils.equals(value, index, '/$ref')) {
    return Lexer.tokenize(
      value,
      index,
      index + 5,
      '/$ref',
      Lexer.TokenType.RefExpression
    );
  }
}
export function valueExpr(value: SourceArray, index: number): Lexer.Token<Lexer.TokenType.ValueExpression> {
  if (Utils.equals(value, index, '/$value')) {
    return Lexer.tokenize(
      value,
      index,
      index + 7,
      '/$value',
      Lexer.TokenType.ValueExpression
    );
  }
}

export function rootExpr(value: SourceArray, index: number): Lexer.Token<Lexer.TokenType.RootExpression> {
  if (!Utils.equals(value, index, '$root/')) {
    return;
  }
  const start = index;
  index += 6;

  const entitySet = NameOrIdentifier.entitySetName(value, index);
  let predicate, entity, token;
  if (entitySet) {
    predicate = keyPredicate(value, entitySet.next);
  }
  if (!(entitySet && predicate)) {
    entity = NameOrIdentifier.singletonEntity(value, index);
    if (!entity) {
      return;
    }
    token = {
      entity
    };
  } else {
    token = {
      entitySet,
      keys: predicate
    };
  }

  index = (predicate || entity).next;
  const nav = singleNavigationExpr(value, index);
  if (nav) {
    index = nav.next;
  }

  return Lexer.tokenize(
    value,
    start,
    index,
    {
      current: token,
      next: nav
    },
    Lexer.TokenType.RootExpression
  );
}
