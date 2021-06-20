import { Edm } from '@odata/metadata';
import { ODataFilter } from './filter';
import { ODataParam } from './param';

export * from './batch';
export * from './filter';
export * from './param';
export * from './types';

export function param() {
  return ODataParam.New();
}

export function filter(obj?: Record<string, any>) {
  return ODataFilter.New(obj);
}

/**
 * edm primitive literal value creators
 */
export const literalValues = {
  Binary: (value: any) => Edm.Binary.createValue(value),
  Boolean: (value: any) => Edm.Boolean.createValue(value),
  Byte: (value: any) => Edm.Byte.createValue(value),
  Date: (value: any) => Edm.Date.createValue(value),
  DateTimeOffset: (value: any) => Edm.DateTimeOffset.createValue(value),
  Decimal: (value: any) => Edm.Decimal.createValue(value),
  Double: (value: any) => Edm.Double.createValue(value),
  Duration: (value: any) => Edm.Duration.createValue(value),
  Guid: (value: any) => Edm.Guid.createValue(value),
  Int16: (value: any) => Edm.Int16.createValue(value),
  Int32: (value: any) => Edm.Int32.createValue(value),
  Int64: (value: any) => Edm.Int64.createValue(value),
  SByte: (value: any) => Edm.SByte.createValue(value),
  Single: (value: any) => Edm.Single.createValue(value),
  Stream: (value: any) => Edm.Stream.createValue(value),
  String: (value: any) => Edm.String.createValue(value),
  TimeOfDay: (value: any) => Edm.TimeOfDay.createValue(value),
  Geography: (value: any) => Edm.Geography.createValue(value),
  GeographyPoint: (value: any) => Edm.GeographyPoint.createValue(value),
  GeographyLineString: (value: any) => Edm.GeographyLineString.createValue(value),
  GeographyPolygon: (value: any) => Edm.GeographyPolygon.createValue(value),
  GeographyMultiPoint: (value: any) => Edm.GeographyMultiPoint.createValue(value),
  GeographyMultiLineString: (value: any) => Edm.GeographyMultiLineString.createValue(value),
  GeographyMultiPolygon: (value: any) => Edm.GeographyMultiPolygon.createValue(value),
  GeographyCollection: (value: any) => Edm.GeographyCollection.createValue(value),
  Geometry: (value: any) => Edm.Geometry.createValue(value),
  GeometryPoint: (value: any) => Edm.GeometryPoint.createValue(value),
  GeometryLineString: (value: any) => Edm.GeometryLineString.createValue(value),
  GeometryPolygon: (value: any) => Edm.GeometryPolygon.createValue(value),
  GeometryMultiPoint: (value: any) => Edm.GeometryMultiPoint.createValue(value),
  GeometryMultiLineString: (value: any) => Edm.GeometryMultiLineString.createValue(value),
  GeometryMultiPolygon: (value: any) => Edm.GeometryMultiPolygon.createValue(value),
  GeometryCollection: (value: any) => Edm.GeometryCollection.createValue(value),
}