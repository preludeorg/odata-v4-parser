import { SourceArray } from './utils';
import * as Lexer from './lexer';
import * as Query from './query';
import * as ResourcePath from './resourcePath';

export function odataUri(value: SourceArray, index: number, metadataContext?: any): Lexer.Token {
  let resource = ResourcePath.resourcePath(value, index, metadataContext);
  while (!resource && index < value.length) {
    while (value[++index] !== 0x2f && index < value.length) { ; }
    resource = ResourcePath.resourcePath(value, index, metadataContext);
  }
  if (!resource) { return; }
  const start = index;
  index = resource.next;
  metadataContext = resource.metadata;

  let query;
  if (value[index] === 0x3f) {
    query = Query.queryOptions(value, index + 1, metadataContext);
    if (!query) { return; }
    index = query.next;
    delete resource.metadata;
  }

  return Lexer.tokenize(value, start, index, { resource, query }, Lexer.TokenType.ODataUri, <any>{ metadata: metadataContext });
}
