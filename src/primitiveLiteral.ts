import * as Lexer from './lexer';
import * as NameOrIdentifier from './nameOrIdentifier';
import Utils, { SourceArray } from './utils';

export function nullValue(value: SourceArray, index: number): Lexer.Token {
  if (Utils.equals(value, index, 'null')) {
    return Lexer.tokenize(
      value,
      index,
      index + 4,
      'null',
      Lexer.TokenType.Literal
    );
  }
}
export function booleanValue(value: SourceArray, index: number): Lexer.Token {
  if (Utils.equals(value, index, 'true')) {
    return Lexer.tokenize(
      value,
      index,
      index + 4,
      'Edm.Boolean',
      Lexer.TokenType.Literal
    );
  }
  if (Utils.equals(value, index, 'false')) {
    return Lexer.tokenize(
      value,
      index,
      index + 5,
      'Edm.Boolean',
      Lexer.TokenType.Literal
    );
  }
}
export function guidValue(value, index): Lexer.Token {
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
    return Lexer.tokenize(
      value,
      index,
      index + 36,
      'Edm.Guid',
      Lexer.TokenType.Literal
    );
  }
}
export function sbyteValue(value: SourceArray, index: number): Lexer.Token {
  const start = index;
  const sign = Lexer.SIGN(value, index);
  if (sign) {
    index = sign;
  }

  const next = Utils.required(value, index, Lexer.DIGIT, 1, 3);
  if (next) {
    if (Lexer.DIGIT(value[next])) {
      return;
    }
    const val = parseInt(Utils.stringify(value, start, next), 10);
    if (val >= -128 && val <= 127) {
      return Lexer.tokenize(
        value,
        start,
        next,
        'Edm.SByte',
        Lexer.TokenType.Literal
      );
    }
  }
}
export function byteValue(value: SourceArray, index: number): Lexer.Token {
  const next = Utils.required(value, index, Lexer.DIGIT, 1, 3);
  if (next) {
    if (Lexer.DIGIT(value[next])) {
      return;
    }
    const val = parseInt(Utils.stringify(value, index, next), 10);
    if (val >= 0 && val <= 255) {
      return Lexer.tokenize(
        value,
        index,
        next,
        'Edm.Byte',
        Lexer.TokenType.Literal
      );
    }
  }
}
export function int16Value(value: SourceArray, index: number): Lexer.Token {
  const start = index;
  const sign = Lexer.SIGN(value, index);
  if (sign) {
    index = sign;
  }

  const next = Utils.required(value, index, Lexer.DIGIT, 1, 5);
  if (next) {
    if (Lexer.DIGIT(value[next])) {
      return;
    }
    const val = parseInt(Utils.stringify(value, start, next), 10);
    if (val >= -32768 && val <= 32767) {
      return Lexer.tokenize(
        value,
        start,
        next,
        'Edm.Int16',
        Lexer.TokenType.Literal
      );
    }
  }
}
export function int32Value(value: SourceArray, index: number): Lexer.Token {
  const start = index;
  const sign = Lexer.SIGN(value, index);
  if (sign) {
    index = sign;
  }

  const next = Utils.required(value, index, Lexer.DIGIT, 1, 10);
  if (next) {
    if (Lexer.DIGIT(value[next])) {
      return;
    }
    const val = parseInt(Utils.stringify(value, start, next), 10);
    if (val >= -2147483648 && val <= 2147483647) {
      return Lexer.tokenize(
        value,
        start,
        next,
        'Edm.Int32',
        Lexer.TokenType.Literal
      );
    }
  }
}
export function int64Value(value: SourceArray, index: number): Lexer.Token {
  const start = index;
  const sign = Lexer.SIGN(value, index);
  if (sign) {
    index = sign;
  }

  const next = Utils.required(value, index, Lexer.DIGIT, 1, 19);
  if (next) {
    if (Lexer.DIGIT(value[next])) {
      return;
    }
    const val = Utils.stringify(value, index, next);
    if (
      val >= '0' &&
      val <=
      (value[start] === 0x2d ? '9223372036854775808' : '9223372036854775807')
    ) {
      return Lexer.tokenize(
        value,
        start,
        next,
        'Edm.Int64',
        Lexer.TokenType.Literal
      );
    }
  }
}
export function decimalValue(value: SourceArray, index: number): Lexer.Token {
  const start = index;
  const sign = Lexer.SIGN(value, index);
  if (sign) {
    index = sign;
  }

  const intNext = Utils.required(value, index, Lexer.DIGIT, 1);
  if (!intNext) {
    return;
  }

  let end = intNext;
  if (value[intNext] === 0x2e) {
    end = Utils.required(value, intNext + 1, Lexer.DIGIT, 1);
    if (!end || end === intNext + 1) {
      return;
    }
  } else {
    return;
  }

  // TODO: detect only decimal value, no double/single detection here
  if (value[end] === 0x65) {
    return;
  }

  return Lexer.tokenize(
    value,
    start,
    end,
    'Edm.Decimal',
    Lexer.TokenType.Literal
  );
}
export function doubleValue(value: SourceArray, index: number): Lexer.Token {
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
      return;
    }

    let decimalNext = intNext;
    if (value[intNext] === 0x2e) {
      decimalNext = Utils.required(value, intNext + 1, Lexer.DIGIT, 1);
      if (decimalNext === intNext + 1) {
        return;
      }
    } else {
      return;
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

  return Lexer.tokenize(
    value,
    start,
    end,
    'Edm.Double',
    Lexer.TokenType.Literal
  );
}
export function singleValue(value: SourceArray, index: number): Lexer.Token {
  const token = doubleValue(value, index);
  if (token) {
    token.value = 'Edm.Single';
  }
  return token;
}
export function stringValue(value: SourceArray, index: number): Lexer.Token {
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
            return;
          }
          break;
        } else {
          index = squote;
        }
      } else {
        const nextIndex = Math.max(
          Lexer.RWS(value, index),
          Lexer.pcharNoSQUOTE(value, index),
        );
        if (nextIndex === index) {
          return;
        }
        index = nextIndex;
      }
    }

    squote = Lexer.SQUOTE(value, index - 1) || Lexer.SQUOTE(value, index - 3);
    if (!squote) {
      return;
    }
    index = squote;

    return Lexer.tokenize(
      value,
      start,
      index,
      'Edm.String',
      Lexer.TokenType.Literal
    );
  }
}
export function durationValue(value: SourceArray, index: number): Lexer.Token {
  if (!Utils.equals(value, index, 'duration')) {
    return;
  }
  const start = index;
  index += 8;

  let squote = Lexer.SQUOTE(value, index);
  if (!squote) {
    return;
  }
  index = squote;

  const sign = Lexer.SIGN(value, index);
  if (sign) {
    index = sign;
  }

  if (value[index] !== 0x50) {
    return;
  }
  index++;
  const dayNext = Utils.required(value, index, Lexer.DIGIT, 1);
  if (dayNext === index && value[index + 1] !== 0x54) {
    return;
  }
  index = dayNext;
  if (value[index] === 0x44) {
    index++;
  }
  let end = index;
  if (value[index] === 0x54) {
    index++;
    const parseTimeFn = function () {
      const squote = Lexer.SQUOTE(value, index);
      if (squote) {
        return index;
      }
      const digitNext = Utils.required(value, index, Lexer.DIGIT, 1);
      if (digitNext === index) {
        return;
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
          return;
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
      return;
    }
  }

  squote = Lexer.SQUOTE(value, end);
  if (!squote) {
    return;
  }
  end = squote;

  return Lexer.tokenize(
    value,
    start,
    end,
    'Edm.Duration',
    Lexer.TokenType.Literal
  );
}
export function binaryValue(value: SourceArray, index: number): Lexer.Token {
  const start = index;
  if (!Utils.equals(value, index, 'binary')) {
    return;
  }
  index += 6;

  let squote = Lexer.SQUOTE(value, index);
  if (!squote) {
    return;
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

  return Lexer.tokenize(
    value,
    start,
    index,
    'Edm.Binary',
    Lexer.TokenType.Literal
  );
}
export function dateValue(value: SourceArray, index: number): Lexer.Token {
  const yearNext = Lexer.year(value, index);
  if (yearNext === index || value[yearNext] !== 0x2d) {
    return;
  }
  const monthNext = Lexer.month(value, yearNext + 1);
  if (monthNext === yearNext + 1 || value[monthNext] !== 0x2d) {
    return;
  }
  const dayNext = Lexer.day(value, monthNext + 1);
  // TODO: join dateValue and dateTimeOffsetValue for optimalization
  if (dayNext === monthNext + 1 || value[dayNext] === 0x54) {
    return;
  }
  return Lexer.tokenize(
    value,
    index,
    dayNext,
    'Edm.Date',
    Lexer.TokenType.Literal
  );
}
export function dateTimeOffsetValue(
  value: SourceArray,
  index: number
): Lexer.Token {
  const yearNext = Lexer.year(value, index);
  if (yearNext === index || value[yearNext] !== 0x2d) {
    return;
  }
  const monthNext = Lexer.month(value, yearNext + 1);
  if (monthNext === yearNext + 1 || value[monthNext] !== 0x2d) {
    return;
  }
  const dayNext = Lexer.day(value, monthNext + 1);
  if (dayNext === monthNext + 1 || value[dayNext] !== 0x54) {
    return;
  }
  const hourNext = Lexer.hour(value, dayNext + 1);

  let colon = Lexer.COLON(value, hourNext);
  if (hourNext === colon || !colon) {
    return;
  }
  const minuteNext = Lexer.minute(value, hourNext + 1);
  if (minuteNext === hourNext + 1) {
    return;
  }

  let end = minuteNext;
  colon = Lexer.COLON(value, minuteNext);
  if (colon) {
    const secondNext = Lexer.second(value, colon);
    if (secondNext === colon) {
      return;
    }
    if (value[secondNext] === 0x2e) {
      const fractionalSecondsNext = Lexer.fractionalSeconds(
        value,
        secondNext + 1
      );
      if (fractionalSecondsNext === secondNext + 1) {
        return;
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
      return;
    }
    const zMinuteNext = Lexer.minute(value, colon);
    if (zMinuteNext === colon) {
      return;
    }
    end = zMinuteNext;
  } else {
    return;
  }

  return Lexer.tokenize(
    value,
    index,
    end,
    'Edm.DateTimeOffset',
    Lexer.TokenType.Literal
  );
}
export function timeOfDayValue(value: SourceArray, index: number): Lexer.Token {
  const hourNext = Lexer.hour(value, index);
  let colon = Lexer.COLON(value, hourNext);
  if (hourNext === index || !colon) {
    return;
  }
  const minuteNext = Lexer.minute(value, colon);
  if (minuteNext === colon) {
    return;
  }

  let end = minuteNext;
  colon = Lexer.COLON(value, minuteNext);
  if (colon) {
    const secondNext = Lexer.second(value, colon);
    if (secondNext === colon) {
      return;
    }
    if (value[secondNext] === 0x2e) {
      const fractionalSecondsNext = Lexer.fractionalSeconds(
        value,
        secondNext + 1
      );
      if (fractionalSecondsNext === secondNext + 1) {
        return;
      }
      end = fractionalSecondsNext;
    } else {
      end = secondNext;
    }
  }

  return Lexer.tokenize(
    value,
    index,
    end,
    'Edm.TimeOfDay',
    Lexer.TokenType.Literal
  );
}

// geography and geometry literals
export function positionLiteral(
  value: SourceArray,
  index: number
): Lexer.Token {
  const longitude = doubleValue(value, index);
  if (!longitude) {
    return;
  }

  const next = Lexer.RWS(value, longitude.next);
  if (next === longitude.next) {
    return;
  }

  const latitude = doubleValue(value, next);
  if (!latitude) {
    return;
  }

  return Lexer.tokenize(
    value,
    index,
    latitude.next,
    { longitude, latitude },
    Lexer.TokenType.Literal
  );
}
export function pointData(value: SourceArray, index: number): Lexer.Token {
  const open = Lexer.OPEN(value, index);
  if (!open) {
    return;
  }
  const start = index;
  index = open;

  const position = positionLiteral(value, index);
  if (!position) {
    return;
  }
  index = position.next;

  const close = Lexer.CLOSE(value, index);
  if (!close) {
    return;
  }
  index = close;

  return Lexer.tokenize(value, start, index, position, Lexer.TokenType.Literal);
}
export function lineStringData(value: SourceArray, index: number): Lexer.Token {
  return multiGeoLiteralFactory(value, index, '', positionLiteral);
}

export function ringLiteral(value: SourceArray, index: number): Lexer.Token {
  return multiGeoLiteralFactory(value, index, '', positionLiteral);
  // Within each ringLiteral, the first and last positionLiteral elements MUST be an exact syntactic match to each other.
  // Within the polygonData, the ringLiterals MUST specify their points in appropriate winding order.
  // In order of traversal, points to the left side of the ring are interpreted as being in the polygon.
}

export function polygonData(value: SourceArray, index: number): Lexer.Token {
  return multiGeoLiteralFactory(value, index, '', ringLiteral);
}
export function sridLiteral(value: SourceArray, index: number): Lexer.Token {
  if (!Utils.equals(value, index, 'SRID')) {
    return;
  }
  const start = index;
  index += 4;

  const eq = Lexer.EQ(value, index);
  if (!eq) {
    return;
  }
  index++;

  const digit = Utils.required(value, index, Lexer.DIGIT, 1, 5);
  if (!digit) {
    return;
  }
  index = digit;

  const semi = Lexer.SEMI(value, index);
  if (!semi) {
    return;
  }
  index = semi;

  return Lexer.tokenize(value, start, index, 'SRID', Lexer.TokenType.Literal);
}
export function pointLiteral(value: SourceArray, index: number): Lexer.Token {
  if (
    !(
      Utils.equals(value, index, 'Point') ||
      Utils.equals(value, index, 'POINT')
    )
  ) {
    return;
  }
  const start = index;
  index += 5;

  const data = pointData(value, index);
  if (!data) {
    return;
  }

  return Lexer.tokenize(value, start, data.next, data, Lexer.TokenType.Literal);
}
export function polygonLiteral(value: SourceArray, index: number): Lexer.Token {
  if (
    !(
      Utils.equals(value, index, 'Polygon') ||
      Utils.equals(value, index, 'POLYGON')
    )
  ) {
    return;
  }

  const start = index;
  index += 7;

  const data = polygonData(value, index);
  if (!data) {
    return;
  }

  return Lexer.tokenize(value, start, data.next, data, Lexer.TokenType.Literal);
}
export function collectionLiteral(
  value: SourceArray,
  index: number
): Lexer.Token {
  return multiGeoLiteralFactory(value, index, 'Collection', geoLiteral);
}
export function lineStringLiteral(
  value: SourceArray,
  index: number
): Lexer.Token {
  if (!Utils.equals(value, index, 'LineString')) {
    return;
  }
  const start = index;
  index += 10;

  const data = lineStringData(value, index);
  if (!data) {
    return;
  }
  index = data.next;

  return Lexer.tokenize(value, start, index, data, Lexer.TokenType.Literal);
}
export function multiLineStringLiteral(
  value: SourceArray,
  index: number
): Lexer.Token {
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
): Lexer.Token {
  return multiGeoLiteralOptionalFactory(value, index, 'MultiPoint', pointData);
}
export function multiPolygonLiteral(
  value: SourceArray,
  index: number
): Lexer.Token {
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
): Lexer.Token {
  if (!Utils.equals(value, index, `${prefix}(`)) {
    return;
  }
  const start = index;
  index += prefix.length + 1;

  const items = [];
  let geo = itemLiteral(value, index);
  if (!geo) {
    return;
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
      return;
    }
    index = comma;

    geo = itemLiteral(value, index);
    if (!geo) {
      return;
    }
    index = geo.next;
  }

  return Lexer.tokenize(
    value,
    start,
    index,
    { items },
    Lexer.TokenType.Literal
  );
}
export function multiGeoLiteralOptionalFactory(
  value: SourceArray,
  index: number,
  prefix: string,
  itemLiteral: Function
): Lexer.Token {
  if (!Utils.equals(value, index, `${prefix}(`)) {
    return;
  }
  const start = index;
  index += prefix.length + 1;

  const items = [];
  let close = Lexer.CLOSE(value, index);
  if (!close) {
    let geo = itemLiteral(value, index);
    if (!geo) {
      return;
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
        return;
      }
      index = comma;

      geo = itemLiteral(value, index);
      if (!geo) {
        return;
      }
      index = geo.next;
    }
  } else {
    index++;
  }

  return Lexer.tokenize(
    value,
    start,
    index,
    { items },
    Lexer.TokenType.Literal
  );
}
export function geoLiteral(value: SourceArray, index: number): Lexer.Token {
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
): Lexer.Token {
  return fullGeoLiteralFactory(value, index, pointLiteral);
}
export function fullCollectionLiteral(
  value: SourceArray,
  index: number
): Lexer.Token {
  return fullGeoLiteralFactory(value, index, collectionLiteral);
}
export function fullLineStringLiteral(
  value: SourceArray,
  index: number
): Lexer.Token {
  return fullGeoLiteralFactory(value, index, lineStringLiteral);
}
export function fullMultiLineStringLiteral(
  value: SourceArray,
  index: number
): Lexer.Token {
  return fullGeoLiteralFactory(value, index, multiLineStringLiteral);
}
export function fullMultiPointLiteral(
  value: SourceArray,
  index: number
): Lexer.Token {
  return fullGeoLiteralFactory(value, index, multiPointLiteral);
}
export function fullMultiPolygonLiteral(
  value: SourceArray,
  index: number
): Lexer.Token {
  return fullGeoLiteralFactory(value, index, multiPolygonLiteral);
}
export function fullPolygonLiteral(
  value: SourceArray,
  index: number
): Lexer.Token {
  return fullGeoLiteralFactory(value, index, polygonLiteral);
}
export function fullGeoLiteralFactory(
  value: SourceArray,
  index: number,
  literal: Function
): Lexer.Token {
  const srid = sridLiteral(value, index);
  if (!srid) {
    return;
  }

  const token = literal(value, srid.next);
  if (!token) {
    return;
  }

  return Lexer.tokenize(
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
): Lexer.Token {
  const prefix = Lexer.geographyPrefix(value, index);
  if (prefix === index) {
    return;
  }
  const start = index;
  index = prefix;

  let squote = Lexer.SQUOTE(value, index);
  if (!squote) {
    return;
  }
  index = squote;

  const point = fullCollectionLiteral(value, index);
  if (!point) {
    return;
  }
  index = point.next;

  squote = Lexer.SQUOTE(value, index);
  if (!squote) {
    return;
  }
  index = squote;

  return Lexer.tokenize(
    value,
    start,
    index,
    'Edm.GeographyCollection',
    Lexer.TokenType.Literal
  );
}
export function geographyLineString(
  value: SourceArray,
  index: number
): Lexer.Token {
  return geoLiteralFactory(
    value,
    index,
    'Edm.GeographyLineString',
    Lexer.geographyPrefix,
    fullLineStringLiteral
  );
}
export function geographyMultiLineString(
  value: SourceArray,
  index: number
): Lexer.Token {
  return geoLiteralFactory(
    value,
    index,
    'Edm.GeographyMultiLineString',
    Lexer.geographyPrefix,
    fullMultiLineStringLiteral
  );
}
export function geographyMultiPoint(
  value: SourceArray,
  index: number
): Lexer.Token {
  return geoLiteralFactory(
    value,
    index,
    'Edm.GeographyMultiPoint',
    Lexer.geographyPrefix,
    fullMultiPointLiteral
  );
}
export function geographyMultiPolygon(
  value: SourceArray,
  index: number
): Lexer.Token {
  return geoLiteralFactory(
    value,
    index,
    'Edm.GeographyMultiPolygon',
    Lexer.geographyPrefix,
    fullMultiPolygonLiteral
  );
}
export function geographyPoint(value: SourceArray, index: number): Lexer.Token {
  return geoLiteralFactory(value, index, 'Edm.GeographyPoint', Lexer.geographyPrefix, fullPointLiteral)
    || geoLiteralFactory(value, index, 'Edm.GeographyPoint', Lexer.geographyPrefix, pointLiteral);
}
export function geographyPolygon(
  value: SourceArray,
  index: number
): Lexer.Token {
  return geoLiteralFactory(
    value,
    index,
    'Edm.GeographyPolygon',
    Lexer.geographyPrefix,
    fullPolygonLiteral
  );
}
export function geometryCollection(
  value: SourceArray,
  index: number
): Lexer.Token {
  return geoLiteralFactory(
    value,
    index,
    'Edm.GeometryCollection',
    Lexer.geometryPrefix,
    fullCollectionLiteral
  );
}
export function geometryLineString(
  value: SourceArray,
  index: number
): Lexer.Token {
  return geoLiteralFactory(
    value,
    index,
    'Edm.GeometryLineString',
    Lexer.geometryPrefix,
    fullLineStringLiteral
  );
}
export function geometryMultiLineString(
  value: SourceArray,
  index: number
): Lexer.Token {
  return geoLiteralFactory(
    value,
    index,
    'Edm.GeometryMultiLineString',
    Lexer.geometryPrefix,
    fullMultiLineStringLiteral
  );
}
export function geometryMultiPoint(
  value: SourceArray,
  index: number
): Lexer.Token {
  return geoLiteralFactory(
    value,
    index,
    'Edm.GeometryMultiPoint',
    Lexer.geometryPrefix,
    fullMultiPointLiteral
  );
}
export function geometryMultiPolygon(
  value: SourceArray,
  index: number
): Lexer.Token {
  return geoLiteralFactory(
    value,
    index,
    'Edm.GeometryMultiPolygon',
    Lexer.geometryPrefix,
    fullMultiPolygonLiteral
  );
}
export function geometryPoint(value: SourceArray, index: number): Lexer.Token {
  return geoLiteralFactory(
    value,
    index,
    'Edm.GeometryPoint',
    Lexer.geometryPrefix,
    fullPointLiteral
  );
}
export function geometryPolygon(
  value: SourceArray,
  index: number
): Lexer.Token {
  return geoLiteralFactory(
    value,
    index,
    'Edm.GeometryPolygon',
    Lexer.geometryPrefix,
    fullPolygonLiteral
  );
}
export function geoLiteralFactory(
  value: SourceArray,
  index: number,
  type: string,
  prefix: Function,
  literal: Function
): Lexer.Token {
  const prefixNext = prefix(value, index);
  if (prefixNext === index) {
    return;
  }
  const start = index;
  index = prefixNext;

  let squote = Lexer.SQUOTE(value, index);
  if (!squote) {
    return;
  }
  index = squote;

  const data = literal(value, index);
  if (!data) {
    return;
  }
  index = data.next;

  squote = Lexer.SQUOTE(value, index);
  if (!squote) {
    return;
  }
  index = squote;

  return Lexer.tokenize(value, start, index, type, Lexer.TokenType.Literal);
}

export function primitiveLiteral(
  value: SourceArray,
  index: number
): Lexer.Token {
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
