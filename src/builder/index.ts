import { ODataFilter } from './filter';
import { ODataParam } from './param';

export { Edm } from '@odata/metadata';
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
