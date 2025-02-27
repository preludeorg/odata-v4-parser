import { PrimitiveTypeEnum } from '@odata/metadata';
import * as Lexer from './lexer';
import * as NameOrIdentifier from './nameOrIdentifier';
import * as Token from './token';
import Utils, { SourceArray } from './utils';

export function nullValue(value: SourceArray, index: number): Token.LiteralToken | undefined {
  if (Utils.equals(value, index, 'null')) {
    return Token.tokenize({
      type: 'Literal',
      value: 'null',
      position: index,
      next: index + 4,
      source: value
    });
  }
}
export function booleanValue(value: SourceArray, index: number): Token.LiteralToken | undefined {
  if (Utils.equals(value, index, 'true')) {
    return Token.tokenize({
      type: 'Literal',
      value: PrimitiveTypeEnum.Boolean,
      position: index,
      next: index + 4,
      source: value
    });
  }
  if (Utils.equals(value, index, 'false')) {
    return Token.tokenize({
      type: 'Literal',
      value: PrimitiveTypeEnum.Boolean,
      position: index,
      next: index + 5,
      source: value
    });
  }
}
export function guidValue(value, index): Token.LiteralToken | undefined {
  if (
    Utils.required(value, index, Lexer.HEXDIG, 8, 8) &&
    value[index + 8] === 0x2d &&
    Utils.required(value, index + 9, Lexer.HEXDIG, 4, 4) &&
    value[index + 13] === 0x2d &&
    Utils.required(value, index + 14, Lexer.HEXDIG, 4, 4) &&
    value[index + 18] === 0x2d &&
    Utils.required(value, index + 19, Lexer.HEXDIG, 4, 4) &&
    value[index + 23] === 0x2d &&
    Utils.required(value, index + 24, Lexer.HEXDIG, 12)
  ) {
    return Token.tokenize({
      type: 'Literal',
      value: PrimitiveTypeEnum.Guid,
      position: index,
      next: index + 36,
      source: value
    });
  }
}
export function sbyteValue(value: SourceArray, index: number): Token.LiteralToken | undefined {
  const start = index;
  const sign = Lexer.SIGN(value, index);
  if (sign) {
    index = sign;
  }

  const next = Utils.required(value, index, Lexer.DIGIT, 1, 3);
  if (next) {
    if (Lexer.DIGIT(value[next])) {
      return undefined;
    }
    const val = parseInt(Utils.stringify(value, start, next), 10);
    if (val >= -128 && val <= 127) {
      return Token.tokenize({
        type: 'Literal',
        value: PrimitiveTypeEnum.SByte,
        position: start,
        next,
        source: value
      });
    }
  }
}
export function byteValue(value: SourceArray, index: number): Token.LiteralToken | undefined {
  const next = Utils.required(value, index, Lexer.DIGIT, 1, 3);
  if (next) {
    if (Lexer.DIGIT(value[next])) {
      return undefined;
    }
    const val = parseInt(Utils.stringify(value, index, next), 10);
    if (val >= 0 && val <= 255) {
      return Token.tokenize({ type: 'Literal', value: PrimitiveTypeEnum.Byte, position: index, next }, value);
    }
  }
}
export function int16Value(value: SourceArray, index: number): Token.LiteralToken | undefined {
  const start = index;
  const sign = Lexer.SIGN(value, index);
  if (sign) {
    index = sign;
  }

  const next = Utils.required(value, index, Lexer.DIGIT, 1, 5);
  if (next) {
    if (Lexer.DIGIT(value[next])) {
      return undefined;
    }
    const val = parseInt(Utils.stringify(value, start, next), 10);
    if (val >= -32768 && val <= 32767) {
      return Token.tokenize({ type: 'Literal', value: PrimitiveTypeEnum.Int16, position: start, next }, value);
    }
  }
}
export function int32Value(value: SourceArray, index: number): Token.LiteralToken | undefined {
  const start = index;
  const sign = Lexer.SIGN(value, index);
  if (sign) {
    index = sign;
  }

  const next = Utils.required(value, index, Lexer.DIGIT, 1, 10);
  if (next) {
    if (Lexer.DIGIT(value[next])) {
      return undefined;
    }
    const val = parseInt(Utils.stringify(value, start, next), 10);
    if (val >= -2147483648 && val <= 2147483647) {
      return Token.tokenize({ type: 'Literal', value: PrimitiveTypeEnum.Int32, position: start, next }, value);
    }
  }
}
export function int64Value(value: SourceArray, index: number): Token.LiteralToken | undefined {
  const start = index;
  const sign = Lexer.SIGN(value, index);
  if (sign) {
    index = sign;
  }

  const next = Utils.required(value, index, Lexer.DIGIT, 1, 19);
  if (next) {
    if (Lexer.DIGIT(value[next])) {
      return undefined;
    }
    const val = Utils.stringify(value, index, next);
    if (
      val >= '0' &&
      val <=
      (value[start] === 0x2d ? '9223372036854775808' : '9223372036854775807')
    ) {
      return Token.tokenize({ type: 'Literal', value: PrimitiveTypeEnum.Int64, position: start, next }, value);
    }
  }
}
export function decimalValue(value: SourceArray, index: number): Token.LiteralToken | undefined {
  const start = index;
  const sign = Lexer.SIGN(value, index);
  if (sign) {
    index = sign;
  }

  const intNext = Utils.required(value, index, Lexer.DIGIT, 1);
  if (!intNext) {
    return undefined;
  }

  let end = intNext;
  if (value[intNext] === 0x2e) {
    end = Utils.required(value, intNext + 1, Lexer.DIGIT, 1);
    if (!end || end === intNext + 1) {
      return undefined;
    }
  } else {
    return undefined;
  }

  // TODO: detect only decimal value, no double/single detection here
  if (value[end] === 0x65) {
    return undefined;
  }

  return Token.tokenize({ type: 'Literal', value: PrimitiveTypeEnum.Decimal, position: start, next: end }, value);
}
export function doubleValue(value: SourceArray, index: number): Token.LiteralToken | undefined {
  const start = index;
  let end = index;
  const nanInfLen = Lexer.nanInfinity(value, index);
  if (nanInfLen) {
    end += nanInfLen;
  } else {
    // TODO: use decimalValue function
    // var token = decimalValue(value, index);
    const sign = Lexer.SIGN(value, index);
    if (sign) {
      index = sign;
    }

    const intNext = Utils.required(value, index, Lexer.DIGIT, 1);
    if (!intNext) {
      return undefined;
    }

    let decimalNext = intNext;
    if (value[intNext] === 0x2e) {
      decimalNext = Utils.required(value, intNext + 1, Lexer.DIGIT, 1);
      if (decimalNext === intNext + 1) {
        return undefined;
      }
    } else {
      return undefined;
    }

    if (value[decimalNext] === 0x65) {
      let next = decimalNext + 1;
      const sign = Lexer.SIGN(value, next);
      if (sign) {
        next = sign;
      }

      const digitNext = Utils.required(value, next, Lexer.DIGIT, 1);
      if (digitNext) {
        end = digitNext;
      }
    } else {
      end = decimalNext;
    }
  }

  return Token.tokenize({ type: 'Literal', value: PrimitiveTypeEnum.Double, position: start, next: end }, value);
}
export function singleValue(value: SourceArray, index: number): Token.LiteralToken | undefined {
  const token = doubleValue(value, index);
  if (token) {
    return { ...token, value: PrimitiveTypeEnum.Single };
  }
  return token;
}
export function stringValue(value: SourceArray, index: number): Token.LiteralToken | undefined {
  // TODO: handle values with double single quote `THeo''Sun A`
  const start = index;
  let squote = Lexer.SQUOTE(value, start);
  if (squote) {
    index = squote;
    while (index < value.length) {
      squote = Lexer.SQUOTE(value, index);
      if (squote) {
        index = squote;
        squote = Lexer.SQUOTE(value, index);
        if (!squote) {
          const close = Lexer.CLOSE(value, index);
          const comma = Lexer.COMMA(value, index);
          const amp = value[index] === 0x26;
          if (
            Lexer.pcharNoSQUOTE(value, index) > index &&
            !amp &&
            !close &&
            !comma &&
            Lexer.RWS(value, index) === index
          ) {
            return undefined;
          }
          break;
        } else {
          index = squote;
        }
      } else {
        const nextIndex = Math.max(
          Lexer.RWS(value, index),
          Lexer.pcharNoSQUOTE(value, index)
        );
        if (nextIndex === index) {
          return undefined;
        }
        index = nextIndex;
      }
    }

    squote = Lexer.SQUOTE(value, index - 1) || Lexer.SQUOTE(value, index - 3);
    if (!squote) {
      return undefined;
    }
    index = squote;

    return Token.tokenize({ type: 'Literal', value: PrimitiveTypeEnum.String, position: start, next: index }, value);
  }
}
export function durationValue(value: SourceArray, index: number): Token.LiteralToken | undefined {
  if (!Utils.equals(value, index, 'duration')) {
    return undefined;
  }
  const start = index;
  index += 8;

  let squote = Lexer.SQUOTE(value, index);
  if (!squote) {
    return undefined;
  }
  index = squote;

  const sign = Lexer.SIGN(value, index);
  if (sign) {
    index = sign;
  }

  if (value[index] !== 0x50) {
    return undefined;
  }
  index++;
  const dayNext = Utils.required(value, index, Lexer.DIGIT, 1);
  if (dayNext === index && value[index + 1] !== 0x54) {
    return undefined;
  }
  index = dayNext;
  if (value[index] === 0x44) {
    index++;
  }
  let end = index;
  if (value[index] === 0x54) {
    index++;
    const parseTimeFn = function() {
      const squote = Lexer.SQUOTE(value, index);
      if (squote) {
        return index;
      }
      const digitNext = Utils.required(value, index, Lexer.DIGIT, 1);
      if (digitNext === index) {
        return undefined;
      }
      index = digitNext;
      if (value[index] === 0x53) {
        end = index + 1;
        return end;
      } else if (value[index] === 0x2e) {
        index++;
        const fractionalSecondsNext = Utils.required(
          value,
          index,
          Lexer.DIGIT,
          1
        );
        if (
          fractionalSecondsNext === index ||
          value[fractionalSecondsNext] !== 0x53
        ) {
          return undefined;
        }
        end = fractionalSecondsNext + 1;
        return end;
      } else if (value[index] === 0x48) {
        index++;
        end = index;
        return parseTimeFn();
      } else if (value[index] === 0x4d) {
        index++;
        end = index;
        return parseTimeFn();
      }
    };
    const next = parseTimeFn();
    if (!next) {
      return undefined;
    }
  }

  squote = Lexer.SQUOTE(value, end);
  if (!squote) {
    return undefined;
  }
  end = squote;

  return Token.tokenize({ type: 'Literal', value: PrimitiveTypeEnum.Duration, position: start, next: end }, value);
}
export function binaryValue(value: SourceArray, index: number): Token.LiteralToken | undefined {
  const start = index;
  if (!Utils.equals(value, index, 'binary')) {
    return undefined;
  }
  index += 6;

  let squote = Lexer.SQUOTE(value, index);
  if (!squote) {
    return undefined;
  }
  index = squote;

  const valStart = index;
  while (index < value.length && !(squote = Lexer.SQUOTE(value, index))) {
    const end = Math.max(
      Lexer.base64b16(value, index),
      Lexer.base64b8(value, index)
    );
    if (end > index) {
      index = end;
    } else if (
      Lexer.base64char(value[index]) &&
      Lexer.base64char(value[index + 1]) &&
      Lexer.base64char(value[index + 2]) &&
      Lexer.base64char(value[index + 3])
    ) {
      index += 4;
    } else {
      index++;
    }
  }
  index = squote;

  return Token.tokenize({ type: 'Literal', value: PrimitiveTypeEnum.Binary, position: start, next: index }, value);
};
export function dateValue(value: SourceArray, index: number): Token.LiteralToken | undefined {
  const yearNext = Lexer.year(value, index);
  if (yearNext === index || value[yearNext] !== 0x2d) {
    return undefined;
  }
  const monthNext = Lexer.month(value, yearNext + 1);
  if (monthNext === yearNext + 1 || value[monthNext] !== 0x2d) {
    return undefined;
  }
  const dayNext = Lexer.day(value, monthNext + 1);
  // TODO: join dateValue and dateTimeOffsetValue for optimalization
  if (dayNext === monthNext + 1 || value[dayNext] === 0x54) {
    return undefined;
  }
  return Token.tokenize({ type: 'Literal', value: PrimitiveTypeEnum.Date, position: index, next: dayNext }, value);
}
export function dateTimeOffsetValue(
  value: SourceArray,
  index: number
): Token.LiteralToken | undefined {
  const yearNext = Lexer.year(value, index);
  if (yearNext === index || value[yearNext] !== 0x2d) {
    return undefined;
  }
  const monthNext = Lexer.month(value, yearNext + 1);
  if (monthNext === yearNext + 1 || value[monthNext] !== 0x2d) {
    return undefined;
  }
  const dayNext = Lexer.day(value, monthNext + 1);
  if (dayNext === monthNext + 1 || value[dayNext] !== 0x54) {
    return undefined;
  }
  const hourNext = Lexer.hour(value, dayNext + 1);

  let colon = Lexer.COLON(value, hourNext);
  if (hourNext === colon || !colon) {
    return undefined;
  }
  const minuteNext = Lexer.minute(value, hourNext + 1);
  if (minuteNext === hourNext + 1) {
    return undefined;
  }

  let end = minuteNext;
  colon = Lexer.COLON(value, minuteNext);
  if (colon) {
    const secondNext = Lexer.second(value, colon);
    if (secondNext === colon) {
      return undefined;
    }
    if (value[secondNext] === 0x2e) {
      const fractionalSecondsNext = Lexer.fractionalSeconds(
        value,
        secondNext + 1
      );
      if (fractionalSecondsNext === secondNext + 1) {
        return undefined;
      }
      end = fractionalSecondsNext;
    } else {
      end = secondNext;
    }
  }
  const sign = Lexer.SIGN(value, end);
  if (value[end] === 0x5a) {
    end++;
  } else if (sign) {
    const zHourNext = Lexer.hour(value, sign);
    const colon = Lexer.COLON(value, zHourNext);
    if (zHourNext === sign || !colon) {
      return undefined;
    }
    const zMinuteNext = Lexer.minute(value, colon);
    if (zMinuteNext === colon) {
      return undefined;
    }
    end = zMinuteNext;
  } else {
    return undefined;
  }

  return Token.tokenize({ type: 'Literal', value: PrimitiveTypeEnum.DateTimeOffset, position: index, next: end }, value);
}
export function timeOfDayValue(value: SourceArray, index: number): Token.LiteralToken | undefined {
  const hourNext = Lexer.hour(value, index);
  let colon = Lexer.COLON(value, hourNext);
  if (hourNext === index || !colon) {
    return undefined;
  }
  const minuteNext = Lexer.minute(value, colon);
  if (minuteNext === colon) {
    return undefined;
  }

  let end = minuteNext;
  colon = Lexer.COLON(value, minuteNext);
  if (colon) {
    const secondNext = Lexer.second(value, colon);
    if (secondNext === colon) {
      return undefined;
    }
    if (value[secondNext] === 0x2e) {
      const fractionalSecondsNext = Lexer.fractionalSeconds(
        value,
        secondNext + 1
      );
      if (fractionalSecondsNext === secondNext + 1) {
        return undefined;
      }
      end = fractionalSecondsNext;
    } else {
      end = secondNext;
    }
  }

  return Token.tokenize({ type: 'Literal', value: PrimitiveTypeEnum.TimeOfDay, position: index, next: end }, value);
}

// geography and geometry literals
export function positionLiteral(
  value: SourceArray,
  index: number
): Token.LiteralToken | undefined {
  const longitude = doubleValue(value, index);
  if (!longitude) {
    return undefined;
  }

  const next = Lexer.RWS(value, longitude.next);
  if (next === longitude.next) {
    return undefined;
  }

  const latitude = doubleValue(value, next);
  if (!latitude) {
    return undefined;
  }

  return Token.tokenize({ type: 'Literal', value: { longitude, latitude }, position: index, next: latitude.next }, value);
}
export function pointData(value: SourceArray, index: number): Token.LiteralToken | undefined {
  const open = Lexer.OPEN(value, index);
  if (!open) {
    return undefined;
  }
  const start = index;
  index = open;

  const position = positionLiteral(value, index);
  if (!position) {
    return undefined;
  }
  index = position.next;

  const close = Lexer.CLOSE(value, index);
  if (!close) {
    return undefined;
  }
  index = close;

  return Token.tokenize({ type: 'Literal', value: position, position: start, next: index }, value);
}
export function lineStringData(value: SourceArray, index: number): Token.LiteralToken | undefined {
  return multiGeoLiteralFactory(value, index, '', positionLiteral);
}

export function ringLiteral(value: SourceArray, index: number): Token.LiteralToken | undefined {
  return multiGeoLiteralFactory(value, index, '', positionLiteral);
  // Within each ringLiteral, the first and last positionLiteral elements MUST be an exact syntactic match to each other.
  // Within the polygonData, the ringLiterals MUST specify their points in appropriate winding order.
  // In order of traversal, points to the left side of the ring are interpreted as being in the polygon.
}

export function polygonData(value: SourceArray, index: number): Token.LiteralToken | undefined {
  return multiGeoLiteralFactory(value, index, '', ringLiteral);
}
export function sridLiteral(value: SourceArray, index: number): Token.LiteralToken | undefined {
  if (!Utils.equals(value, index, 'SRID')) {
    return undefined;
  }
  const start = index;
  index += 4;

  const eq = Lexer.EQ(value, index);
  if (!eq) {
    return undefined;
  }
  index++;

  const digit = Utils.required(value, index, Lexer.DIGIT, 1, 5);
  if (!digit) {
    return undefined;
  }
  index = digit;

  const semi = Lexer.SEMI(value, index);
  if (!semi) {
    return undefined;
  }
  index = semi;

  return Token.tokenize(value, start, index, 'SRID', Lexer.TokenType.Literal);
}
export function pointLiteral(value: SourceArray, index: number): Token.LiteralToken | undefined {
  if (
    !(
      Utils.equals(value, index, 'Point') ||
      Utils.equals(value, index, 'POINT')
    )
  ) {
    return undefined;
  }
  const start = index;
  index += 5;

  const data = pointData(value, index);
  if (!data) {
    return undefined;
  }

  return Token.tokenize(value, start, data.next, data, Lexer.TokenType.Literal);
}
export function polygonLiteral(value: SourceArray, index: number): Token.LiteralToken | undefined {
  if (
    !(
      Utils.equals(value, index, 'Polygon') ||
      Utils.equals(value, index, 'POLYGON')
    )
  ) {
    return undefined;
  }

  const start = index;
  index += 7;

  const data = polygonData(value, index);
  if (!data) {
    return undefined;
  }

  return Token.tokenize(value, start, data.next, data, Lexer.TokenType.Literal);
}
export function collectionLiteral(
  value: SourceArray,
  index: number
): Token.LiteralToken | undefined {
  return multiGeoLiteralFactory(value, index, 'Collection', geoLiteral);
}
export function lineStringLiteral(
  value: SourceArray,
  index: number
): Token.LiteralToken | undefined {
  if (!Utils.equals(value, index, 'LineString')) {
    return undefined;
  }
  const start = index;
  index += 10;

  const data = lineStringData(value, index);
  if (!data) {
    return undefined;
  }
  index = data.next;

  return Token.tokenize(value, start, index, data, Lexer.TokenType.Literal);
}
export function multiLineStringLiteral(
  value: SourceArray,
  index: number
): Token.LiteralToken | undefined {
  return multiGeoLiteralOptionalFactory(
    value,
    index,
    'MultiLineString',
    lineStringData
  );
}
export function multiPointLiteral(
  value: SourceArray,
  index: number
): Token.LiteralToken | undefined {
  return multiGeoLiteralOptionalFactory(value, index, 'MultiPoint', pointData);
}
export function multiPolygonLiteral(
  value: SourceArray,
  index: number
): Token.LiteralToken | undefined {
  return multiGeoLiteralOptionalFactory(
    value,
    index,
    'MultiPolygon',
    polygonData
  );
}
export function multiGeoLiteralFactory(
  value: SourceArray,
  index: number,
  prefix: string,
  itemLiteral: Function
): Token.LiteralToken | undefined {
  if (!Utils.equals(value, index, `${prefix}(`)) {
    return undefined;
  }
  const start = index;
  index += prefix.length + 1;

  const items = [];
  let geo = itemLiteral(value, index);
  if (!geo) {
    return undefined;
  }
  index = geo.next;

  while (geo) {
    items.push(geo);

    const close = Lexer.CLOSE(value, index);
    if (close) {
      index = close;
      break;
    }

    const comma = Lexer.COMMA(value, index);
    if (!comma) {
      return undefined;
    }
    index = comma;

    geo = itemLiteral(value, index);
    if (!geo) {
      return undefined;
    }
    index = geo.next;
  }

  return Token.tokenize({ type: 'Literal', value: { items }, position: start, next: index }, value);
}
export function multiGeoLiteralOptionalFactory(
  value: SourceArray,
  index: number,
  prefix: string,
  itemLiteral: Function
): Token.LiteralToken | undefined {
  if (!Utils.equals(value, index, `${prefix}(`)) {
    return undefined;
  }
  const start = index;
  index += prefix.length + 1;

  const items = [];
  let close = Lexer.CLOSE(value, index);
  if (!close) {
    let geo = itemLiteral(value, index);
    if (!geo) {
      return undefined;
    }
    index = geo.next;

    while (geo) {
      items.push(geo);

      close = Lexer.CLOSE(value, index);
      if (close) {
        index = close;
        break;
      }

      const comma = Lexer.COMMA(value, index);
      if (!comma) {
        return undefined;
      }
      index = comma;

      geo = itemLiteral(value, index);
      if (!geo) {
        return undefined;
      }
      index = geo.next;
    }
  } else {
    index++;
  }

  return Token.tokenize(
    value,
    start,
    index,
    { items },
    Lexer.TokenType.Literal
  );
}
export function geoLiteral(value: SourceArray, index: number): Token.LiteralToken | undefined {
  return (
    collectionLiteral(value, index) ||
    lineStringLiteral(value, index) ||
    multiPointLiteral(value, index) ||
    multiLineStringLiteral(value, index) ||
    multiPolygonLiteral(value, index) ||
    pointLiteral(value, index) ||
    polygonLiteral(value, index)
  );
}
export function fullPointLiteral(
  value: SourceArray,
  index: number
): Token.LiteralToken | undefined {
  return fullGeoLiteralFactory(value, index, pointLiteral);
}
export function fullCollectionLiteral(
  value: SourceArray,
  index: number
): Token.LiteralToken | undefined {
  return fullGeoLiteralFactory(value, index, collectionLiteral);
}
export function fullLineStringLiteral(
  value: SourceArray,
  index: number
): Token.LiteralToken | undefined {
  return fullGeoLiteralFactory(value, index, lineStringLiteral);
}
export function fullMultiLineStringLiteral(
  value: SourceArray,
  index: number
): Token.LiteralToken | undefined {
  return fullGeoLiteralFactory(value, index, multiLineStringLiteral);
}
export function fullMultiPointLiteral(
  value: SourceArray,
  index: number
): Token.LiteralToken | undefined {
  return fullGeoLiteralFactory(value, index, multiPointLiteral);
}
export function fullMultiPolygonLiteral(
  value: SourceArray,
  index: number
): Token.LiteralToken | undefined {
  return fullGeoLiteralFactory(value, index, multiPolygonLiteral);
}
export function fullPolygonLiteral(
  value: SourceArray,
  index: number
): Token.LiteralToken | undefined {
  return fullGeoLiteralFactory(value, index, polygonLiteral);
}
export function fullGeoLiteralFactory(
  value: SourceArray,
  index: number,
  literal: Function
): Token.LiteralToken | undefined {
  const srid = sridLiteral(value, index);
  if (!srid) {
    return undefined;
  }

  const token = literal(value, srid.next);
  if (!token) {
    return undefined;
  }

  return Token.tokenize(
    value,
    index,
    token.next,
    { srid, value: token },
    Lexer.TokenType.Literal
  );
}

export function geographyCollection(
  value: SourceArray,
  index: number
): Token.LiteralToken | undefined {
  const prefix = Lexer.geographyPrefix(value, index);
  if (prefix === index) {
    return undefined;
  }
  const start = index;
  index = prefix;

  let squote = Lexer.SQUOTE(value, index);
  if (!squote) {
    return undefined;
  }
  index = squote;

  const point = fullCollectionLiteral(value, index);
  if (!point) {
    return undefined;
  }
  index = point.next;

  squote = Lexer.SQUOTE(value, index);
  if (!squote) {
    return undefined;
  }
  index = squote;

  return Token.tokenize(
    value,
    start,
    index,
    PrimitiveTypeEnum.GeographyCollection,
    Lexer.TokenType.Literal
  );
}
export function geographyLineString(
  value: SourceArray,
  index: number
): Token.LiteralToken | undefined {
  return geoLiteralFactory(
    value,
    index,
    PrimitiveTypeEnum.GeographyLineString,
    Lexer.geographyPrefix,
    fullLineStringLiteral
  );
}
export function geographyMultiLineString(
  value: SourceArray,
  index: number
): Token.LiteralToken | undefined {
  return geoLiteralFactory(
    value,
    index,
    PrimitiveTypeEnum.GeographyMultiLineString,
    Lexer.geographyPrefix,
    fullMultiLineStringLiteral
  );
}
export function geographyMultiPoint(
  value: SourceArray,
  index: number
): Token.LiteralToken | undefined {
  return geoLiteralFactory(
    value,
    index,
    PrimitiveTypeEnum.GeographyMultiPoint,
    Lexer.geographyPrefix,
    fullMultiPointLiteral
  );
}
export function geographyMultiPolygon(
  value: SourceArray,
  index: number
): Token.LiteralToken | undefined {
  return geoLiteralFactory(
    value,
    index,
    PrimitiveTypeEnum.GeographyMultiPolygon,
    Lexer.geographyPrefix,
    fullMultiPolygonLiteral
  );
}
export function geographyPoint(value: SourceArray, index: number): Token.LiteralToken | undefined {
  return geoLiteralFactory(value, index, PrimitiveTypeEnum.GeographyPoint, Lexer.geographyPrefix, fullPointLiteral)
    || geoLiteralFactory(value, index, PrimitiveTypeEnum.GeographyPoint, Lexer.geographyPrefix, pointLiteral);
}
export function geographyPolygon(
  value: SourceArray,
  index: number
): Token.LiteralToken | undefined {
  return geoLiteralFactory(
    value,
    index,
    PrimitiveTypeEnum.GeographyPolygon,
    Lexer.geographyPrefix,
    fullPolygonLiteral
  );
}
export function geometryCollection(
  value: SourceArray,
  index: number
): Token.LiteralToken | undefined {
  return geoLiteralFactory(
    value,
    index,
    PrimitiveTypeEnum.GeometryCollection,
    Lexer.geometryPrefix,
    fullCollectionLiteral
  );
}
export function geometryLineString(
  value: SourceArray,
  index: number
): Token.LiteralToken | undefined {
  return geoLiteralFactory(
    value,
    index,
    PrimitiveTypeEnum.GeometryLineString,
    Lexer.geometryPrefix,
    fullLineStringLiteral
  );
}
export function geometryMultiLineString(
  value: SourceArray,
  index: number
): Token.LiteralToken | undefined {
  return geoLiteralFactory(
    value,
    index,
    PrimitiveTypeEnum.GeometryMultiLineString,
    Lexer.geometryPrefix,
    fullMultiLineStringLiteral
  );
}
export function geometryMultiPoint(
  value: SourceArray,
  index: number
): Token.LiteralToken | undefined {
  return geoLiteralFactory(
    value,
    index,
    PrimitiveTypeEnum.GeometryMultiPoint,
    Lexer.geometryPrefix,
    fullMultiPointLiteral
  );
}
export function geometryMultiPolygon(
  value: SourceArray,
  index: number
): Token.LiteralToken | undefined {
  return geoLiteralFactory(
    value,
    index,
    PrimitiveTypeEnum.GeometryMultiPolygon,
    Lexer.geometryPrefix,
    fullMultiPolygonLiteral
  );
}
export function geometryPoint(value: SourceArray, index: number): Token.LiteralToken | undefined {
  return geoLiteralFactory(
    value,
    index,
    PrimitiveTypeEnum.GeometryPoint,
    Lexer.geometryPrefix,
    fullPointLiteral
  );
}
export function geometryPolygon(
  value: SourceArray,
  index: number
): Token.LiteralToken | undefined {
  return geoLiteralFactory(
    value,
    index,
    PrimitiveTypeEnum.GeometryPolygon,
    Lexer.geometryPrefix,
    fullPolygonLiteral
  );
}
export function geoLiteralFactory(
  value: SourceArray,
  index: number,
  type: PrimitiveTypeEnum,
  prefix: Function,
  literal: Function
): Token.LiteralToken | undefined {
  const prefixNext = prefix(value, index);
  if (prefixNext === index) {
    return undefined;
  }
  const start = index;
  index = prefixNext;

  let squote = Lexer.SQUOTE(value, index);
  if (!squote) {
    return undefined;
  }
  index = squote;

  const data = literal(value, index);
  if (!data) {
    return undefined;
  }
  index = data.next;

  squote = Lexer.SQUOTE(value, index);
  if (!squote) {
    return undefined;
  }
  index = squote;

  return Token.tokenize({ type: 'Literal', value: type, position: start, next: index }, value);
}

export function primitiveLiteral(
  value: SourceArray,
  index: number
): Token.LiteralToken | Token.EnumToken | undefined {
  return (
    nullValue(value, index) ||
    booleanValue(value, index) ||
    guidValue(value, index) ||
    dateValue(value, index) ||
    dateTimeOffsetValue(value, index) ||
    timeOfDayValue(value, index) ||
    decimalValue(value, index) ||
    doubleValue(value, index) ||
    singleValue(value, index) ||
    sbyteValue(value, index) ||
    byteValue(value, index) ||
    int16Value(value, index) ||
    int32Value(value, index) ||
    int64Value(value, index) ||
    stringValue(value, index) ||
    durationValue(value, index) ||
    binaryValue(value, index) ||
    NameOrIdentifier.enumeration(value, index) ||
    geographyCollection(value, index) ||
    geographyLineString(value, index) ||
    geographyMultiLineString(value, index) ||
    geographyMultiPoint(value, index) ||
    geographyMultiPolygon(value, index) ||
    geographyPoint(value, index) ||
    geographyPolygon(value, index) ||
    geometryCollection(value, index) ||
    geometryLineString(value, index) ||
    geometryMultiLineString(value, index) ||
    geometryMultiPoint(value, index) ||
    geometryMultiPolygon(value, index) ||
    geometryPoint(value, index) ||
    geometryPolygon(value, index)
  );
}
