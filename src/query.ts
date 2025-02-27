import * as Expressions from './expressions';
import * as Lexer from './lexer';
import * as NameOrIdentifier from './nameOrIdentifier';
import * as PrimitiveLiteral from './primitiveLiteral';
import * as Token from './token';
import Utils, { isType, SourceArray } from './utils';

export function queryOptions(
  value: SourceArray,
  index: number,
  metadataContext?: any
): Token.QueryOptionsToken | undefined {
  if (value.length <= index) {
    return Token.tokenize({
      type: 'QueryOptions',
      value: { options: [] },
      position: index,
      next: index,
      source: value
    });
  }
  let token = queryOption(value, index, metadataContext);
  if (!token) {
    return undefined;
  }
  const start = index;
  index = token.next;

  const options: Token.QueryOption[] = [];
  while (token) {
    options.push(token);
    // &
    if (value[index] !== 0x26) {
      break;
    }
    index++;

    token = queryOption(value, index, metadataContext);
    if (!token) {
      return undefined;
    }
    index = token.next;
  }

  return Token.tokenize({ type: 'QueryOptions', value: { options }, position: start, next: index, source: value });
}

export function queryOption(
  value: SourceArray,
  index: number,
  metadataContext?: any
): Token.QueryOption | undefined {
  return (
    systemQueryOption(value, index, metadataContext) ||
    aliasAndValue(value, index) ||
    customQueryOption(value, index)
  );
}

export function systemQueryOption(
  value: SourceArray,
  index: number,
  metadataContext?: any
): Token.SystemQueryOption | undefined {
  return (
    expand(value, index, metadataContext) ||
    filter(value, index) ||
    format(value, index) ||
    id(value, index) ||
    inlinecount(value, index) ||
    orderby(value, index) ||
    search(value, index) ||
    select(value, index) ||
    skip(value, index) ||
    skiptoken(value, index) ||
    top(value, index)
  );
}

export function customQueryOption(
  value: SourceArray,
  index: number
): Token.CustomQueryOptionToken | undefined {
  const key = NameOrIdentifier.odataIdentifier(value, index);
  if (!key) {
    return undefined;
  }
  const start = index;
  index = key.next;

  const eq = Lexer.EQ(value, index);
  if (!eq) {
    return undefined;
  }
  index = eq;

  while (value[index] !== 0x26 && index < value.length) {
    index++;
  }
  if (index === eq) {
    return undefined;
  }

  return Token.tokenize({
    type: 'CustomQueryOption',
    value: { key: key.raw, value: Utils.stringify(value, eq, index) },
    position: start,
    next: index,
    source: value
  });
}

export function id(value: SourceArray, index: number): Token.IdToken | undefined {
  const start = index;
  if (Utils.equals(value, index, '%24id')) {
    index += 5;
  } else if (Utils.equals(value, index, '$id')) {
    index += 3;
  } else {
    return undefined;
  }

  const eq = Lexer.EQ(value, index);
  if (!eq) {
    return undefined;
  }
  index = eq;

  while (value[index] !== 0x26 && index < value.length) {
    index++;
  }
  if (index === eq) {
    return undefined;
  }

  return Token.tokenize({
    type: 'Id',
    value: Utils.stringify(value, eq, index),
    position: start,
    next: index,
    source: value
  });
}

export function expand(
  value: SourceArray,
  index: number,
  metadataContext?: any
): Token.ExpandToken | undefined {
  const start = index;
  if (Utils.equals(value, index, '%24expand')) {
    index += 9;
  } else if (Utils.equals(value, index, '$expand')) {
    index += 7;
  } else {
    return undefined;
  }

  const eq = Lexer.EQ(value, index);
  if (!eq) {
    return undefined;
  }
  index = eq;

  const items = [];
  let token = expandItem(value, index, metadataContext);
  if (!token) {
    return undefined;
  }
  index = token.next;

  while (token) {
    items.push(token);

    const comma = Lexer.COMMA(value, index);
    if (comma) {
      index = comma;
      token = expandItem(value, index, metadataContext);
      if (!token) {
        return undefined;
      }
      index = token.next;
    } else {
      break;
    }
  }

  return Token.tokenize({
    type: 'Expand',
    value: { items },
    position: start,
    next: index,
    source: value
  });
}

export function expandItem(
  value: SourceArray,
  index: number,
  metadataContext?: any
): Token.ExpandItemToken | undefined {
  const start = index;
  const star = Lexer.STAR(value, index);
  if (star) {
    index = star;

    if (index == value.length) {
      return Token.tokenize({
        type: 'ExpandItem',
        value: { path: '*' },
        position: start,
        next: index,
        source: value
      });
    }

    const ref = Expressions.refExpr(value, index);
    if (ref) {
      index = ref.next;
      return Token.tokenize({
        type: 'ExpandItem',
        value: { path: '*', ref },
        position: start,
        next: index,
        source: value
      });
    }
    const open = Lexer.OPEN(value, index);
    if (open) {
      index = open;
      const token = levels(value, index);
      if (!token) {
        return undefined;
      }
      index = token.next;

      const close = Lexer.CLOSE(value, index);
      if (!close) {
        return undefined;
      }
      index = close;

      return Token.tokenize({
        type: 'ExpandItem',
        value: { path: '*', levels: token },
        position: start,
        next: index,
        source: value
      });
    }
  }

  const path = expandPath(value, index, metadataContext);
  if (!path) {
    return undefined;
  }
  index = path.next;

  const tokenValue: any = { path };

  const ref = Expressions.refExpr(value, index);
  if (ref) {
    index = ref.next;
    tokenValue.ref = ref;

    const open = Lexer.OPEN(value, index);
    if (open) {
      index = open;

      let option = expandRefOption(value, index);
      if (!option) {
        return undefined;
      }

      const refOptions = [];
      while (option) {
        refOptions.push(option);
        index = option.next;

        const semi = Lexer.SEMI(value, index);
        if (semi) {
          index = semi;

          option = expandRefOption(value, index);
          if (!option) {
            return undefined;
          }
        } else {
          break;
        }
      }

      const close = Lexer.CLOSE(value, index);
      if (!close) {
        return undefined;
      }
      index = close;

      tokenValue.options = refOptions;
    }
  } else {
    const count = Expressions.countExpr(value, index);
    if (count) {
      index = count.next;
      tokenValue.count = count;

      const open = Lexer.OPEN(value, index);
      if (open) {
        index = open;

        let option = expandCountOption(value, index);
        if (!option) {
          return undefined;
        }

        const countOptions = [];
        while (option) {
          countOptions.push(option);
          index = option.next;

          const semi = Lexer.SEMI(value, index);
          if (semi) {
            index = semi;

            option = expandCountOption(value, index);
            if (!option) {
              return undefined;
            }
          } else {
            break;
          }
        }

        const close = Lexer.CLOSE(value, index);
        if (!close) {
          return undefined;
        }
        index = close;
        tokenValue.options = countOptions;
      }
    } else {
      const open = Lexer.OPEN(value, index);
      if (open) {
        index = open;

        let option = expandOption(value, index);
        if (!option) {
          return undefined;
        }

        const options = [];
        while (option) {
          options.push(option);
          index = option.next;

          const semi = Lexer.SEMI(value, index);
          if (semi) {
            index = semi;

            option = expandOption(value, index);
            if (!option) {
              return undefined;
            }
          } else {
            break;
          }
        }

        const close = Lexer.CLOSE(value, index);
        if (!close) {
          return undefined;
        }
        index = close;
        tokenValue.options = options;
      }
    }
  }

  return Token.tokenize({
    type: 'ExpandItem',
    value: tokenValue,
    position: start,
    next: index,
    source: value
  });
}

export function expandCountOption(
  value: SourceArray,
  index: number
): Token.FilterToken | Token.SearchToken | undefined {
  return filter(value, index) || search(value, index);
}

export function expandRefOption(
  value: SourceArray,
  index: number
): Token.ExpandRef | undefined {
  return (
    expandCountOption(value, index) ||
    orderby(value, index) ||
    skip(value, index) ||
    top(value, index) ||
    inlinecount(value, index)
  );
}

export function expandOption(value: SourceArray, index: number): Token.ExpandRef | Token.SelectToken | Token.ExpandToken | Token.LevelsToken | undefined {
  return (
    expandRefOption(value, index) ||
    select(value, index) ||
    expand(value, index) ||
    levels(value, index)
  );
}

export function expandPath(
  value: SourceArray,
  index: number,
  metadataContext?: any
): Token.ExpandPathToken | undefined {
  const start = index;
  const path: Token.ExpandPathToken['value'] = [];

  const token =
    NameOrIdentifier.qualifiedEntityTypeName(value, index, metadataContext) ||
    NameOrIdentifier.qualifiedComplexTypeName(value, index, metadataContext);

  if (token) {
    index = token.next;
    path.push(token);
    if (value[index] !== 0x2f) {
      return undefined;
    }
    index++;
    metadataContext = token.value.metadata;
    delete token.value.metadata;
  }

  let complex =
    NameOrIdentifier.complexProperty(value, index, metadataContext) ||
    NameOrIdentifier.complexColProperty(value, index, metadataContext);
  while (complex) {
    if (value[complex.next] === 0x2f) {
      index = complex.next + 1;
      path.push(complex);

      const complexTypeName = NameOrIdentifier.qualifiedComplexTypeName(
        value,
        index,
        metadataContext
      );
      if (complexTypeName) {
        if (value[complexTypeName.next] === 0x2f) {
          index = complexTypeName.next + 1;
          path.push(complexTypeName);
        }
        metadataContext = complexTypeName.value.metadata;
        delete complexTypeName.value.metadata;
      }

      complex =
        NameOrIdentifier.complexProperty(value, index, metadataContext) ||
        NameOrIdentifier.complexColProperty(value, index, metadataContext);
    } else {
      break;
    }
  }

  const nav = NameOrIdentifier.navigationProperty(
    value,
    index,
    metadataContext
  );

  if (!nav) {
    return undefined;
  }
  index = nav.next;
  path.push(nav);
  metadataContext = nav.metadata;
  delete nav.metadata;

  if (value[index] === 0x2f) {
    const typeName = NameOrIdentifier.qualifiedEntityTypeName(
      value,
      index + 1,
      metadataContext
    );
    if (typeName) {
      index = typeName.next;
      path.push(typeName);
      metadataContext = typeName.value.metadata;
      delete typeName.value.metadata;
    }
  }

  return Token.tokenize({
    type: 'ExpandPath',
    value: path,
    position: start,
    next: index,
    source: value
  });
}

export function search(value: SourceArray, index: number): Token.SearchToken | undefined {
  const start = index;
  if (Utils.equals(value, index, '%24search')) {
    index += 9;
  } else if (Utils.equals(value, index, '$search')) {
    index += 7;
  } else {
    return undefined;
  }

  const eq = Lexer.EQ(value, index);
  if (!eq) {
    return undefined;
  }
  index = eq;

  const expr = searchExpr(value, index);
  if (!expr) {
    return undefined;
  }
  index = expr.next;

  return Token.tokenize({
    type: 'Search',
    value: expr,
    position: start,
    next: index,
    source: value
  });
}

export function searchExpr(value: SourceArray, index: number): Token.SearchPhraseToken | Token.SearchWordToken | Token.SearchNotExpressionToken | Token.SearchParenExpressionToken | undefined {
  const token = searchParenExpr(value, index) || searchTerm(value, index);

  if (!token) {
    return undefined;
  }
  const start = index;
  index = token.next;

  const expr = searchAndExpr(value, index) || searchOrExpr(value, index);

  if (expr) {
    const left = Token.clone(token);
    const newToken = new Token.Token({
      ...token,
      type: expr.type,
      value: { left, right: expr.value },
      next: expr.value.next,
      raw: Utils.stringify(value, token.position, token.next)
    });

    if (
      isType(newToken, 'SearchAndExpression')
      // && isType(newToken.value.right.type, 'SearchOrExpression')
    ) {
      console.log(newToken.type);
      newToken.value.left = Token.tokenize({
        type: newToken.type,
        value: { left: newToken.value.left, right: newToken.value.right.value.left },
        position: newToken.value.left.position,
        next: newToken.value.right.value.left.next,
        source: value,
      });
      token.type = token.value.right.type;
      token.value.right = token.value.right.value.right;
    }
  }

  return token;
}

export function searchTerm(value: SourceArray, index: number): Token.SearchNotExpressionToken | Token.SearchPhraseToken | Token.SearchWordToken | undefined {
  return (
    searchNotExpr(value, index) ||
    searchPhrase(value, index) ||
    searchWord(value, index)
  );
}

export function searchNotExpr(value: SourceArray, index: number): Token.SearchNotExpressionToken | undefined {
  let rws = Lexer.RWS(value, index);
  if (!Utils.equals(value, rws, 'NOT')) {
    return undefined;
  }
  const start = index;
  index = rws + 3;
  rws = Lexer.RWS(value, index);
  if (rws === index) {
    return undefined;
  }
  index = rws;
  const expr = searchPhrase(value, index) || searchWord(value, index);
  if (!expr) {
    return undefined;
  }
  index = expr.next;

  return Token.tokenize({
    type: 'SearchNotExpression',
    value: expr,
    position: start,
    next: index,
    source: value
  });
}

export function searchOrExpr(value: SourceArray, index: number): Token.SearchOrExpressionToken | undefined {
  let rws = Lexer.RWS(value, index);
  if (rws === index || !Utils.equals(value, rws, 'OR')) {
    return undefined;
  }
  const start = index;
  index = rws + 2;
  rws = Lexer.RWS(value, index);
  if (rws === index) {
    return undefined;
  }
  index = rws;
  const token = searchExpr(value, index);
  if (!token) {
    return undefined;
  }
  index = token.next;

  return Token.tokenize({
    type: 'SearchOrExpression',
    value: token,
    position: start,
    next: index,
    source: value
  });
}

export function searchAndExpr(value: SourceArray, index: number): Token.SearchAndExpressionToken | undefined {
  let rws = Lexer.RWS(value, index);
  if (rws === index || !Utils.equals(value, rws, 'AND')) {
    return undefined;
  }
  const start = index;
  index = rws + 3;
  rws = Lexer.RWS(value, index);
  if (rws === index) {
    return undefined;
  }
  index = rws;
  const token = searchExpr(value, index);
  if (!token) {
    return undefined;
  }
  index = token.next;

  return Token.tokenize({
    type: 'SearchAndExpression',
    value: token,
    position: start,
    next: index,
    source: value
  });
}

export function searchPhrase(value: SourceArray, index: number): Token.SearchPhraseToken | undefined {
  let mark = Lexer.quotationMark(value, index);
  if (mark === index) {
    return undefined;
  }
  const start = index;
  index = mark;

  const valueStart = index;
  let ch = Lexer.qcharNoAMPDQUOTE(value, index);
  while (
    ch > index &&
    !Lexer.OPEN(value, index) &&
    !Lexer.CLOSE(value, index)
  ) {
    index = ch;
    ch = Lexer.qcharNoAMPDQUOTE(value, index);
  }
  const valueEnd = index;

  mark = Lexer.quotationMark(value, index);
  if (!mark) {
    return undefined;
  }
  index = mark;

  return Token.tokenize({
    type: 'SearchPhrase',
    value: Utils.stringify(value, valueStart, valueEnd),
    position: start,
    next: index,
    source: value
  });
}

export function searchWord(value: SourceArray, index: number): Token.SearchWordToken | undefined {
  const next = Utils.required(value, index, Lexer.ALPHA, 1);
  if (!next) {
    return undefined;
  }
  const start = index;
  index = next;

  const token = Token.tokenize({
    type: 'SearchWord',
    value: '',
    position: start,
    next: index,
    source: value
  });
  token.value = token.raw;
  return token;
}

export function searchParenExpr(
  value: SourceArray,
  index: number
): Token.SearchParenExpressionToken | undefined {
  const open = Lexer.OPEN(value, index);
  if (!open) {
    return undefined;
  }
  const start = index;
  index = open;
  index = Lexer.BWS(value, index);

  const expr = searchExpr(value, index);
  if (!expr) {
    return undefined;
  }
  index = expr.next;

  index = Lexer.BWS(value, index);
  const close = Lexer.CLOSE(value, index);
  if (!close) {
    return undefined;
  }
  index = close;

  return Token.tokenize({
    type: 'SearchParenExpression',
    value: expr,
    position: start,
    next: index,
    source: value
  });
}

export function levels(value: SourceArray, index: number): Token.LevelsToken | undefined {
  const start = index;
  if (Utils.equals(value, index, '%24levels')) {
    index += 9;
  } else if (Utils.equals(value, index, '$levels')) {
    index += 7;
  } else {
    return undefined;
  }

  const eq = Lexer.EQ(value, index);
  if (!eq) {
    return undefined;
  }
  index = eq;

  let level;
  if (Utils.equals(value, index, 'max')) {
    level = 'max';
    index += 3;
  } else {
    const token = PrimitiveLiteral.int32Value(value, index);
    if (!token) {
      return undefined;
    }
    level = token.raw;
    index = token.next;
  }

  return Token.tokenize({
    type: 'Levels',
    value: level,
    position: start,
    next: index,
    source: value
  });
}

export function filter(value: SourceArray, index: number): Token.FilterToken | undefined {
  const start = index;
  if (Utils.equals(value, index, '%24filter')) {
    index += 9;
  } else if (Utils.equals(value, index, '$filter')) {
    index += 7;
  } else {
    return undefined;
  }

  const eq = Lexer.EQ(value, index);
  if (!eq) {
    return undefined;
  }
  index = eq;

  const expr = Expressions.boolCommonExpr(value, index);
  if (!expr) {
    return undefined;
  }
  index = expr.next;

  return Token.tokenize({
    type: 'Filter',
    value: expr,
    position: start,
    next: index,
    source: value
  });
}

export function orderby(value: SourceArray, index: number): Token.OrderByToken | undefined {
  const start = index;
  if (Utils.equals(value, index, '%24orderby')) {
    index += 10;
  } else if (Utils.equals(value, index, '$orderby')) {
    index += 8;
  } else {
    return undefined;
  }

  const eq = Lexer.EQ(value, index);
  if (!eq) {
    return undefined;
  }
  index = eq;

  const items = [];
  let token = orderbyItem(value, index);
  if (!token) {
    return undefined;
  }
  index = token.next;

  while (token) {
    items.push(token);

    const comma = Lexer.COMMA(value, index);
    if (comma) {
      index = comma;
      const space = Lexer.OWS(value, index);
      if (space) {
        index = space;
      }
      token = orderbyItem(value, index);
      if (!token) {
        return undefined;
      }
      index = token.next;
    } else {
      break;
    }
  }

  return Token.tokenize({
    type: 'OrderBy',
    value: { items },
    position: start,
    next: index,
    source: value
  });
}

export function orderbyItem(value: SourceArray, index: number): Token.OrderByItemToken | undefined {
  const expr = Expressions.commonExpr(value, index);
  if (!expr) {
    return undefined;
  }
  const start = index;
  index = expr.next;

  let direction = 1;
  const rws = Lexer.RWS(value, index);
  if (rws > index) {
    index = rws;
    if (Utils.equals(value, index, 'asc')) {
      index += 3;
    } else if (Utils.equals(value, index, 'desc')) {
      index += 4;
      direction = -1;
    } else {
      return undefined;
    }
  }

  return Token.tokenize({
    type: 'OrderByItem',
    value: { expr, direction },
    position: start,
    next: index,
    source: value
  });
}

export function skip(value: SourceArray, index: number): Token.SkipToken | undefined {
  const start = index;
  if (Utils.equals(value, index, '%24skip')) {
    index += 7;
  } else if (Utils.equals(value, index, '$skip')) {
    index += 5;
  } else {
    return undefined;
  }

  const eq = Lexer.EQ(value, index);
  if (!eq) {
    return undefined;
  }
  index = eq;

  const token = PrimitiveLiteral.int32Value(value, index);
  if (!token) {
    return undefined;
  }
  index = token.next;

  return Token.tokenize({
    type: 'Skip',
    value: token,
    position: start,
    next: index,
    source: value
  });
}

export function top(value: SourceArray, index: number): Token.TopToken | undefined {
  const start = index;
  if (Utils.equals(value, index, '%24top')) {
    index += 6;
  } else if (Utils.equals(value, index, '$top')) {
    index += 4;
  } else {
    return undefined;
  }

  const eq = Lexer.EQ(value, index);
  if (!eq) {
    return undefined;
  }
  index = eq;

  const token = PrimitiveLiteral.int32Value(value, index);
  if (!token) {
    return undefined;
  }
  index = token.next;

  return Token.tokenize({
    type: 'Top',
    value: token,
    position: start,
    next: index,
    source: value
  });
}

export function format(value: SourceArray, index: number): Token.FormatToken | undefined {
  const start = index;
  if (Utils.equals(value, index, '%24format')) {
    index += 9;
  } else if (Utils.equals(value, index, '$format')) {
    index += 7;
  } else {
    return undefined;
  }

  const eq = Lexer.EQ(value, index);
  if (!eq) {
    return undefined;
  }
  index = eq;

  let format;
  if (Utils.equals(value, index, 'atom')) {
    format = 'atom';
    index += 4;
  } else if (Utils.equals(value, index, 'json')) {
    format = 'json';
    index += 4;
  } else if (Utils.equals(value, index, 'JSON')) {
    format = 'json';
    index += 4;
  } else if (Utils.equals(value, index, 'xml')) {
    format = 'xml';
    index += 3;
  } else if (Utils.equals(value, index, 'text/html')) {
    format = 'xml';
    index += 9;
  }

  if (format) {
    return Token.tokenize({
      type: 'Format',
      value: { format },
      position: start,
      next: index,
      source: value
    });
  }
}

export function inlinecount(value: SourceArray, index: number): Token.InlineCountToken | undefined {
  const start = index;
  if (Utils.equals(value, index, '%24count')) {
    index += 8;
  } else if (Utils.equals(value, index, '$count')) {
    index += 6;
  } else {
    return undefined;
  }

  const eq = Lexer.EQ(value, index);
  if (!eq) {
    return undefined;
  }
  index = eq;

  const token = PrimitiveLiteral.booleanValue(value, index);
  if (!token) {
    return undefined;
  }
  index = token.next;

  return Token.tokenize({
    type: 'InlineCount',
    value: token,
    position: start,
    next: index,
    source: value
  });
}

export function select(value: SourceArray, index: number): Token.SelectToken | undefined {
  const start = index;
  if (Utils.equals(value, index, '%24select')) {
    index += 9;
  } else if (Utils.equals(value, index, '$select')) {
    index += 7;
  } else {
    return undefined;
  }

  const eq = Lexer.EQ(value, index);
  if (!eq) {
    return undefined;
  }
  index = eq;

  const items = [];
  let token = selectItem(value, index);
  if (!token) {
    return undefined;
  }
  while (token) {
    items.push(token);
    index = token.next;

    const comma = Lexer.COMMA(value, index);
    if (comma) {
      index = comma;
      const space = Lexer.OWS(value, index);
      if (space) {
        index = space;
      }
      token = selectItem(value, index);
      if (!token) {
        return undefined;
      }
    } else {
      break;
    }
  }

  return Token.tokenize({
    type: 'Select',
    value: { items },
    position: start,
    next: index,
    source: value
  });
}

export function selectItem(value: SourceArray, index: number): Token.SelectItemToken | undefined {
  const start = index;
  let item: { namespace?: string, value?: string, name?: Token.QualifiedEntityTypeNameToken | Token.QualifiedComplexTypeNameToken };
  const op = allOperationsInSchema(value, index);
  const star = Lexer.STAR(value, index);
  if (op > index) {
    item = { namespace: Utils.stringify(value, index, op - 2), value: '*' };
    index = op;
  } else if (star) {
    item = { value: '*' };
    index = star;
  } else {
    item = {};
    const name =
      NameOrIdentifier.qualifiedEntityTypeName(value, index) ||
      NameOrIdentifier.qualifiedComplexTypeName(value, index);

    if (name && value[name.next] !== 0x2f) {
      return undefined;
    } else if (name && value[name.next] === 0x2f) {
      index++;
      item.name = name;
    }

    const select =
      selectProperty(value, index) ||
      qualifiedActionName(value, index) ||
      qualifiedFunctionName(value, index);
    if (!select) {
      return undefined;
    }
    index = select.next;

    item = name ? { name, select } : select;
  }

  if (index > start) {
    return Token.tokenize({
      type: 'SelectItem',
      value: { item },
      position: start,
      next: index,
      source: value
    });
  }
}

export function allOperationsInSchema(
  value: SourceArray,
  index: number
): number {
  const namespaceNext = NameOrIdentifier.namespace(value, index);
  const star = Lexer.STAR(value, namespaceNext + 1);
  if (namespaceNext > index && value[namespaceNext] === 0x2e && star) {
    return star;
  }
  return index;
}

export function selectProperty(value: SourceArray, index: number): Token.PrimitivePropertyToken | Token.PrimitiveKeyPropertyToken | Token.PrimitiveCollectionPropertyToken | Token.EntityNavigationPropertyToken | Token.EntityCollectionNavigationPropertyToken | Token.SelectPathToken | undefined {
  const token =
    selectPath(value, index) ||
    NameOrIdentifier.primitiveProperty(value, index) ||
    NameOrIdentifier.primitiveColProperty(value, index) ||
    NameOrIdentifier.navigationProperty(value, index);
  if (!token) {
    return undefined;
  }
  const start = index;
  index = token.next;

  if (token.type === 'SelectPath') {
    if (value[index] === 0x2f) {
      index++;
      const prop = selectProperty(value, index);

      if (!prop) {
        return undefined;
      }
      const path = Token.clone(token);
      token.next = prop.next;
      token.raw = Utils.stringify(value, start, token.next);
      token.value = { path, next: prop };
    }
  }

  return token;
}

export function selectPath(value: SourceArray, index: number): Token.SelectPathToken | undefined {
  const token =
    NameOrIdentifier.complexProperty(value, index) ||
    NameOrIdentifier.complexColProperty(value, index);

  if (!token) {
    return undefined;
  }
  const start = index;
  index = token.next;

  let tokenValue: any = token;
  if (value[index] === 0x2f) {
    const name = NameOrIdentifier.qualifiedComplexTypeName(value, index + 1);
    if (name) {
      index = name.next;
      tokenValue = { prop: token, name };
    }
  }

  return Token.tokenize({
    type: 'SelectPath',
    value: tokenValue,
    position: start,
    next: index,
    source: value
  });
}

export function qualifiedActionName(
  value: SourceArray,
  index: number
): Token.ActionToken | undefined {
  const namespaceNext = NameOrIdentifier.namespace(value, index);
  if (namespaceNext === index || value[namespaceNext] !== 0x2e) {
    return undefined;
  }
  const start = index;
  index = namespaceNext + 1;

  const action = NameOrIdentifier.action(value, index);
  if (!action) {
    return undefined;
  }
  // TODO: This was always setting a namespace, even if the `value` was an `ActionToken` rather than
  //       a `NamespacedNamedValue`.  Do we need to add `namespace` to the token class?  Or do we need
  //       to assign the namespace to the nested Action value (recursively)?  Or do we need to only
  //       set it if the value is not an `Token`?
  // if (!(action instanceof Token.Token)) {
  action.value.namespace = Utils.stringify(value, start, namespaceNext);
  // }

  return Token.tokenize({
    type: 'Action',
    value: action, // TODO: should Action tokens be allowed to have another Action token as a value?
    position: start,
    next: action.next,
    source: value
  });
}

export function qualifiedFunctionName(
  value: SourceArray,
  index: number
): Token.FunctionToken | undefined {
  const namespaceNext = NameOrIdentifier.namespace(value, index);
  if (namespaceNext === index || value[namespaceNext] !== 0x2e) {
    return undefined;
  }
  const start = index;
  index = namespaceNext + 1;

  const fn = NameOrIdentifier.odataFunction(value, index);
  if (!fn) {
    return undefined;
  }
  fn.value.namespace = Utils.stringify(value, start, namespaceNext);
  index = fn.next;
  const tokenValue: {
    name: Token.EntityFunctionToken | Token.EntityCollectionFunctionToken | Token.ComplexFunctionToken | Token.ComplexCollectionFunctionToken | Token.PrimitiveFunctionToken | Token.PrimitiveCollectionFunctionToken;
    parameters: Token.ParameterNameToken[]
  } = { name: fn, parameters: [] };

  const open = Lexer.OPEN(value, index);
  if (open) {
    index = open;
    const param = Expressions.parameterName(value, index);
    if (!param) {
      return undefined;
    }

    while (param) {
      index = param.next;
      tokenValue.parameters.push(param);

      const comma = Lexer.COMMA(value, index);
      if (comma) {
        index = comma;
        const param = Expressions.parameterName(value, index);
        if (!param) {
          return undefined;
        }
      } else {
        break;
      }
    }

    const close = Lexer.CLOSE(value, index);
    if (!close) {
      return undefined;
    }
    index = close;
  }

  return Token.tokenize({
    type: 'Function',
    value: tokenValue,
    position: start,
    next: index,
    source: value
  });
}

export function skiptoken(value: SourceArray, index: number): Token.SkipTokenToken | undefined {
  const start = index;
  if (Utils.equals(value, index, '%24skiptoken')) {
    index += 12;
  } else if (Utils.equals(value, index, '$skiptoken')) {
    index += 10;
  } else {
    return undefined;
  }

  const eq = Lexer.EQ(value, index);
  if (!eq) {
    return undefined;
  }
  index = eq;

  let ch = Lexer.qcharNoAMP(value, index);
  if (!ch) {
    return undefined;
  }
  const valueStart = index;

  while (ch > index) {
    index = ch;
    ch = Lexer.qcharNoAMP(value, index);
  }

  return Token.tokenize({
    type: 'SkipToken',
    value: Utils.stringify(value, valueStart, index),
    position: start,
    next: index,
    source: value
  });
}

export function aliasAndValue(value: SourceArray, index: number): Token.AliasAndValueToken | undefined {
  const alias = Expressions.parameterAlias(value, index);
  if (!alias) {
    return undefined;
  }
  const start = index;
  index = alias.next;

  const eq = Lexer.EQ(value, index);
  if (!eq) {
    return undefined;
  }
  index = eq;

  const paramValue = Expressions.parameterValue(value, index);
  if (!paramValue) {
    return undefined;
  }
  index = paramValue.next;

  return Token.tokenize({
    type: 'AliasAndValue',
    value: { alias, value: paramValue },
    position: start,
    next: index,
    source: value
  });
}
