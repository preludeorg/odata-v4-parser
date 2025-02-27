import * as Query from './query';
import * as ResourcePath from './resourcePath';
import * as Token from './token';
import { SourceArray } from './utils';

export function odataUri(
  value: SourceArray,
  index: number,
  metadataContext?: any
): Token.ODataUriToken | undefined {
  let resource = ResourcePath.resourcePath(value, index, metadataContext);
  while (!resource && index < value.length) {
    while (value[++index] !== 0x2f && index < value.length) {}
    resource = ResourcePath.resourcePath(value, index, metadataContext);
  }
  if (!resource) {
    return undefined;
  }
  const start = index;
  index = resource.next;
  metadataContext = resource.metadata;

  let query;
  if (value[index] === 0x3f) {
    query = Query.queryOptions(value, index + 1, metadataContext);
    if (!query) {
      return undefined;
    }
    index = query.next;
    delete resource.metadata;
  }

  return Token.tokenize({ type: 'ODataUri', value: { resource, query }, position: start, next: index, source: value, metadata: metadataContext });
}
