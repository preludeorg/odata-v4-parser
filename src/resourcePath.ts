import * as Expressions from './expressions';
import * as Lexer from './lexer';
import * as NameOrIdentifier from './nameOrIdentifier';
import * as PrimitiveLiteral from './primitiveLiteral';
import * as Token from './token';
import Utils, { SourceArray } from './utils';

export function resourcePath(
  value: SourceArray,
  index: number,
  metadataContext?: any
): Token.BatchToken | Token.EntityToken | Token.MetadataToken | Token.ResourcePathToken | undefined {
  if (value[index] === 0x2f) {
    index++;
  }
  const token =
    batch(value, index) ||
    entity(value, index, metadataContext) ||
    metadata(value, index);
  if (token) {
    return token;
  }

  const resource =
    NameOrIdentifier.entitySetName(value, index, metadataContext) ||
    functionImportCall(value, index, metadataContext) ||
    crossjoin(value, index) ||
    all(value, index) ||
    actionImportCall(value, index, metadataContext) ||
    NameOrIdentifier.singletonEntity(value, index);

  if (!resource) {
    return undefined;
  }
  const start = index;
  index = resource.next;
  let navigation: Token.CollectionNavigationToken | Token.SingleNavigationToken | Token.CountExpressionToken | Token.BoundOperationToken | Token.ComplexPathToken | Token.ValueExpressionToken | Token.RefExpressionToken | undefined;

  switch (resource.type) {
    case 'EntitySetName':
      navigation = collectionNavigation(
        value,
        resource.next,
        resource.metadata
      );
      metadataContext = resource.metadata;
      delete resource.metadata;
      break;
    case 'EntityCollectionFunctionImportCall':
      navigation = collectionNavigation(
        value,
        resource.next,
        resource.value.import.metadata
      );
      metadataContext = resource.value.import.metadata;
      delete resource.value.import.metadata;
      break;
    case 'SingletonEntity':
      navigation = singleNavigation(value, resource.next, resource.metadata);
      metadataContext = resource.metadata;
      delete resource.metadata;
      break;
    case 'EntityFunctionImportCall':
      navigation = singleNavigation(
        value,
        resource.next,
        resource.value.import.metadata
      );
      metadataContext = resource.value.import.metadata;
      delete resource.value.import.metadata;
      break;
    case 'ComplexCollectionFunctionImportCall':
    case 'PrimitiveCollectionFunctionImportCall':
      navigation = collectionPath(
        value,
        resource.next,
        resource.value.import.metadata
      );
      metadataContext = resource.value.import.metadata;
      delete resource.value.import.metadata;
      break;
    case 'ComplexFunctionImportCall':
      navigation = complexPath(
        value,
        resource.next,
        resource.value.import.metadata
      );
      metadataContext = resource.value.import.metadata;
      delete resource.value.import.metadata;
      break;
    case 'PrimitiveFunctionImportCall':
      navigation = singlePath(
        value,
        resource.next,
        resource.value.import.metadata
      );
      metadataContext = resource.value.import.metadata;
      delete resource.value.import.metadata;
      break;
  }

  if (navigation) {
    index = navigation.next;
  }
  if (value[index] === 0x2f) {
    index++;
  }
  if (resource) {
    return Token.tokenize({
      type: 'ResourcePath',
      value: { resource, navigation },
      position: start,
      next: index,
      source: value,
      metadata: metadataContext
    });
  }
}

export function batch(value: SourceArray, index: number): Token.BatchToken | undefined {
  if (Utils.equals(value, index, '$batch')) {
    return Token.tokenize({
      type: 'Batch',
      value: '$batch',
      position: index,
      next: index + 6,
      source: value
    });
  }
}

export function entity(
  value: SourceArray,
  index: number,
  metadataContext?: any
): Token.EntityToken | undefined {
  if (Utils.equals(value, index, '$entity')) {
    const start = index;
    index += 7;

    let name;
    if (value[index] === 0x2f) {
      name = NameOrIdentifier.qualifiedEntityTypeName(
        value,
        index + 1,
        metadataContext
      );
      if (!name) {
        return undefined;
      }
      index = name.next;
    }

    return Token.tokenize({ type: 'Entity', value: name || '$entity', position: start, next: index, source: value });
  }
}

export function metadata(value: SourceArray, index: number): Token.MetadataToken | undefined {
  if (Utils.equals(value, index, '$metadata')) {
    return Token.tokenize({ type: 'Metadata', value: '$metadata', position: index, next: index + 9, source: value });
  }
}

export function collectionNavigation(
  value: SourceArray,
  index: number,
  metadataContext?: any
): Token.CollectionNavigationToken | undefined {
  const start = index;
  let name;
  if (value[index] === 0x2f) {
    name = NameOrIdentifier.qualifiedEntityTypeName(
      value,
      index + 1,
      metadataContext
    );
    if (name) {
      index = name.next;
      metadataContext = name.value.metadata;
      delete name.value.metadata;
    }
  }

  const path = collectionNavigationPath(value, index, metadataContext);
  if (path) {
    index = path.next;
  }

  if (!name && !path) {
    return undefined;
  }

  return Token.tokenize({
    type: 'CollectionNavigation',
    value: { name, path },
    position: start,
    next: index,
    source: value,
    metadata: path || name
  });
}

export function collectionNavigationPath(
  value: SourceArray,
  index: number,
  metadataContext?: any
): Token.RefExpressionToken | Token.CountExpressionToken | Token.BoundOperationToken | Token.CollectionNavigationPathToken | undefined {
  const start = index;
  const token =
    collectionPath(value, index, metadataContext) ||
    Expressions.refExpr(value, index);
  if (token) {
    return token;
  }

  const predicate = Expressions.keyPredicate(value, index, metadataContext);
  if (predicate) {
    let tokenValue: any = { predicate };
    index = predicate.next;

    const navigation = singleNavigation(value, index, metadataContext);
    if (navigation) {
      tokenValue = { predicate, navigation };
      index = navigation.next;
    }

    return Token.tokenize({
      type: 'CollectionNavigationPath',
      value: tokenValue,
      position: start,
      next: index,
      source: value,
      metadata: metadataContext
    });
  }
}

export function singleNavigation(
  value: SourceArray,
  index: number,
  metadataContext?: any
): Token.RefExpressionToken | Token.ValueExpressionToken | Token.BoundOperationToken | Token.SingleNavigationToken | undefined {
  let token: Token.RefExpressionToken | Token.ValueExpressionToken | Token.BoundOperationToken | Token.PropertyPathToken | undefined =
    boundOperation(value, index, false, metadataContext) ||
    Expressions.refExpr(value, index) ||
    Expressions.valueExpr(value, index);
  if (token) {
    return token;
  }

  const start = index;
  let name;

  if (value[index] === 0x2f) {
    name = NameOrIdentifier.qualifiedEntityTypeName(
      value,
      index + 1,
      metadataContext
    );
    if (name) {
      index = name.next;
      metadataContext = name.value.metadata;
      delete name.value.metadata;
    }
  }

  if (value[index] === 0x2f) {
    token = propertyPath(value, index + 1, metadataContext);
    if (token) {
      index = token.next;
    }
  }

  if (!name && !token) {
    return undefined;
  }

  return Token.tokenize({
    type: 'SingleNavigation',
    value: { name, path: token },
    position: start,
    next: index,
    source: value,
    metadata: token
  });
}

export function propertyPath(
  value: SourceArray,
  index: number,
  metadataContext?: any
): Token.PropertyPathToken | undefined {
  const token =
    NameOrIdentifier.entityColNavigationProperty(
      value,
      index,
      metadataContext
    ) ||
    NameOrIdentifier.entityNavigationProperty(value, index, metadataContext) ||
    NameOrIdentifier.complexColProperty(value, index, metadataContext) ||
    NameOrIdentifier.complexProperty(value, index, metadataContext) ||
    NameOrIdentifier.primitiveColProperty(value, index, metadataContext) ||
    NameOrIdentifier.primitiveProperty(value, index, metadataContext) ||
    NameOrIdentifier.streamProperty(value, index, metadataContext);

  if (!token) {
    return undefined;
  }
  const start = index;
  index = token.next;

  let navigation;
  switch (token.type) {
    case 'EntityCollectionNavigationProperty':
      navigation = collectionNavigation(value, index, token.metadata);
      delete token.metadata;
      break;
    case 'EntityNavigationProperty':
      navigation = singleNavigation(value, index, token.metadata);
      delete token.metadata;
      break;
    case 'ComplexCollectionProperty':
      navigation = collectionPath(value, index, token.metadata);
      delete token.metadata;
      break;
    case 'ComplexProperty':
      navigation = complexPath(value, index, token.metadata);
      delete token.metadata;
      break;
    case 'PrimitiveCollectionProperty':
      navigation = collectionPath(value, index, token.metadata);
      delete token.metadata;
      break;
    case 'PrimitiveKeyProperty':
    case 'PrimitiveProperty':
      navigation = singlePath(value, index, token.metadata);
      delete token.metadata;
      break;
    case 'StreamProperty':
      navigation = boundOperation(value, index, token.metadata);
      delete token.metadata;
      break;
  }

  if (navigation) {
    index = navigation.next;
  }

  return Token.tokenize({
    type: 'PropertyPath',
    value: { path: token, navigation },
    position: start,
    next: index,
    source: value,
    metadata: navigation
  });
}

export function collectionPath(
  value: SourceArray,
  index: number,
  metadataContext?: any
): Token.CountExpressionToken | Token.BoundOperationToken | undefined {
  return (
    Expressions.countExpr(value, index) ||
    boundOperation(value, index, true, metadataContext)
  );
}

export function singlePath(
  value: SourceArray,
  index: number,
  metadataContext?: any
): Token.ValueExpressionToken | Token.BoundOperationToken | undefined {
  return (
    Expressions.valueExpr(value, index) ||
    boundOperation(value, index, false, metadataContext)
  );
}

export function complexPath(
  value: SourceArray,
  index: number,
  metadataContext?: any
): Token.ComplexPathToken | undefined {
  const start = index;
  let name, token;
  if (value[index] === 0x2f) {
    name = NameOrIdentifier.qualifiedComplexTypeName(
      value,
      index + 1,
      metadataContext
    );
    if (name) {
      index = name.next;
    }
  }

  if (value[index] === 0x2f) {
    token = propertyPath(value, index + 1, metadataContext);
    if (!token) {
      return undefined;
    }
    index = token.next;
  } else {
    token = boundOperation(value, index, false, metadataContext);
  }

  if (!name && !token) {
    return undefined;
  }

  return Token.tokenize({
    type: 'ComplexPath',
    value: { name, path: token },
    position: start,
    next: index,
    source: value,
    metadata: token
  });
}

export function boundOperation(
  value: SourceArray,
  index: number,
  isCollection: boolean,
  metadataContext?: any
): Token.BoundOperationToken | undefined {
  if (value[index] !== 0x2f) {
    return undefined;
  }
  const start = index;
  index++;

  const operation: Token.BoundActionCallToken | Token.BoundEntityFunctionCallToken | Token.BoundEntityCollectionFunctionCallToken | Token.BoundComplexFunctionCallToken | Token.BoundComplexCollectionFunctionCallToken | Token.BoundPrimitiveFunctionCallToken | Token.BoundPrimitiveCollectionFunctionCallToken | undefined =
    boundEntityColFuncCall(value, index, isCollection, metadataContext) ||
    boundEntityFuncCall(value, index, isCollection, metadataContext) ||
    boundComplexColFuncCall(value, index, isCollection, metadataContext) ||
    boundComplexFuncCall(value, index, isCollection, metadataContext) ||
    boundPrimitiveColFuncCall(value, index, isCollection, metadataContext) ||
    boundPrimitiveFuncCall(value, index, isCollection, metadataContext) ||
    boundActionCall(value, index, isCollection, metadataContext);
  if (!operation) {
    return undefined;
  }
  index = operation.next;

  let name, navigation;
  switch (operation.type) {
    case 'BoundActionCall':
      break;
    case 'BoundEntityCollectionFunctionCall':
      navigation = collectionNavigation(
        value,
        index,
        operation.value.call.metadata
      );
      delete operation.metadata;
      break;
    case 'BoundEntityFunctionCall':
      navigation = singleNavigation(
        value,
        index,
        operation.value.call.metadata
      );
      delete operation.metadata;
      break;
    case 'BoundComplexCollectionFunctionCall':
      if (value[index] === 0x2f) {
        name = NameOrIdentifier.qualifiedComplexTypeName(
          value,
          index + 1,
          operation.value.call.metadata
        );
        if (name) {
          index = name.next;
        }
      }
      navigation = collectionPath(value, index, operation.value.call.metadata);
      delete operation.metadata;
      break;
    case 'BoundComplexFunctionCall':
      navigation = complexPath(value, index, operation.value.call.metadata);
      delete operation.metadata;
      break;
    case 'BoundPrimitiveCollectionFunctionCall':
      navigation = collectionPath(value, index, operation.value.call.metadata);
      delete operation.metadata;
      break;
    case 'BoundPrimitiveFunctionCall':
      navigation = singlePath(value, index, operation.value.call.metadata);
      delete operation.metadata;
      break;
  }

  if (navigation) {
    index = navigation.next;
  }

  return Token.tokenize({
    type: 'BoundOperation',
    value: { operation, name, navigation },
    position: start,
    next: index,
    source: value,
    metadata: navigation
  });
}

export function boundActionCall(
  value: SourceArray,
  index: number,
  isCollection: boolean,
  metadataContext?: any
): Token.BoundActionCallToken | undefined {
  const namespaceNext = NameOrIdentifier.namespace(value, index);
  if (namespaceNext === index) {
    return undefined;
  }
  const start = index;
  index = namespaceNext;

  if (value[index] !== 0x2e) {
    return undefined;
  }
  index++;

  const action = NameOrIdentifier.action(
    value,
    index,
    isCollection,
    metadataContext
  );
  if (!action) {
    return undefined;
  }
  action.value.namespace = Utils.stringify(value, start, namespaceNext);

  return Token.tokenize({
    type: 'BoundActionCall',
    value: action,
    position: start,
    next: action.next,
    source: value,
    metadata: action
  });
}

type BoundFunctionCallTokenType = Token.TokenType & (Token.BoundEntityFunctionCallToken | Token.BoundEntityCollectionFunctionCallToken | Token.BoundComplexFunctionCallToken | Token.BoundComplexCollectionFunctionCallToken | Token.BoundPrimitiveFunctionCallToken | Token.BoundPrimitiveCollectionFunctionCallToken)['type'];
export function boundFunctionCall<T extends BoundFunctionCallTokenType>(
  value: SourceArray,
  index: number,
  odataFunction: (
    value: SourceArray,
    index: number,
    isCollection?: boolean,
    metadataContext?: any
  ) => ((Token.LexerToken & { type: T })['value']) | undefined,
  tokenType: T,
  isCollection: boolean,
  metadataContext?: any
): (Token.LexerToken & { type: T }) | undefined {
  const namespaceNext = NameOrIdentifier.namespace(value, index);
  if (namespaceNext === index) {
    return undefined;
  }
  const start = index;
  index = namespaceNext;

  if (value[index] !== 0x2e) {
    return undefined;
  }
  index++;

  const call = odataFunction(value, index, isCollection, metadataContext);
  if (!call) {
    return undefined;
  }
  call.value.namespace = Utils.stringify(value, start, namespaceNext);
  index = call.next;

  const params = functionParameters(value, index);
  if (!params) {
    return undefined;
  }
  index = params.next;

  return Token.tokenize({
    type: tokenType,
    value: { call, params },
    position: start,
    next: index,
    source: value,
    metadata: call
  });
}

export function boundEntityFuncCall(
  value: SourceArray,
  index: number,
  isCollection: boolean,
  metadataContext?: any
): Token.BoundEntityFunctionCallToken | undefined {
  return boundFunctionCall(
    value,
    index,
    NameOrIdentifier.entityFunction,
    'BoundEntityFunctionCall',
    isCollection,
    metadataContext
  );
}
export function boundEntityColFuncCall(
  value: SourceArray,
  index: number,
  isCollection: boolean,
  metadataContext?: any
): Token.BoundEntityCollectionFunctionCallToken | undefined {
  return boundFunctionCall(
    value,
    index,
    NameOrIdentifier.entityColFunction,
    'BoundEntityCollectionFunctionCall',
    isCollection,
    metadataContext
  );
}
export function boundComplexFuncCall(
  value: SourceArray,
  index: number,
  isCollection: boolean,
  metadataContext?: any
): Token.BoundComplexFunctionCallToken | undefined {
  return boundFunctionCall(
    value,
    index,
    NameOrIdentifier.complexFunction,
    'BoundComplexFunctionCall',
    isCollection,
    metadataContext
  );
}
export function boundComplexColFuncCall(
  value: SourceArray,
  index: number,
  isCollection: boolean,
  metadataContext?: any
): Token.BoundComplexCollectionFunctionCallToken | undefined {
  return boundFunctionCall(
    value,
    index,
    NameOrIdentifier.complexColFunction,
    'BoundComplexCollectionFunctionCall',
    isCollection,
    metadataContext
  );
}
export function boundPrimitiveFuncCall(
  value: SourceArray,
  index: number,
  isCollection: boolean,
  metadataContext?: any
): Token.BoundPrimitiveFunctionCallToken | undefined {
  return boundFunctionCall(
    value,
    index,
    NameOrIdentifier.primitiveFunction,
    'BoundPrimitiveFunctionCall',
    isCollection,
    metadataContext
  );
}
export function boundPrimitiveColFuncCall(
  value: SourceArray,
  index: number,
  isCollection: boolean,
  metadataContext?: any
): Token.BoundPrimitiveCollectionFunctionCallToken | undefined {
  return boundFunctionCall(
    value,
    index,
    NameOrIdentifier.primitiveColFunction,
    'BoundPrimitiveCollectionFunctionCall',
    isCollection,
    metadataContext
  );
}

export function actionImportCall(
  value: SourceArray,
  index: number,
  metadataContext?: any
): Token.ActionImportCallToken | undefined {
  const action = NameOrIdentifier.actionImport(value, index, metadataContext);
  if (action) {
    return Token.tokenize({
      type: 'ActionImportCall',
      value: action,
      position: index,
      next: action.next,
      source: value,
      metadata: action
    });
  }
}

export function functionImportCall(
  value: SourceArray,
  index: number,
  metadataContext?: any
): Token.EntityCollectionFunctionImportCallToken | Token.EntityFunctionImportCallToken | Token.ComplexCollectionFunctionImportCallToken | Token.ComplexFunctionImportCallToken | Token.PrimitiveCollectionFunctionImportCallToken | Token.PrimitiveFunctionImportCallToken | undefined {
  const fnImport =
    NameOrIdentifier.entityFunctionImport(value, index, metadataContext) ||
    NameOrIdentifier.entityColFunctionImport(value, index, metadataContext) ||
    NameOrIdentifier.complexFunctionImport(value, index, metadataContext) ||
    NameOrIdentifier.complexColFunctionImport(value, index, metadataContext) ||
    NameOrIdentifier.primitiveFunctionImport(value, index, metadataContext) ||
    NameOrIdentifier.primitiveColFunctionImport(value, index, metadataContext);

  if (!fnImport) {
    return undefined;
  }
  const start = index;
  index = fnImport.next;

  const params = functionParameters(value, index);
  if (!params) {
    return undefined;
  }
  index = params.next;

  return Token.tokenize({
    type: `${fnImport.type}Call`,
    value: { import: fnImport, params: params.value },
    position: start,
    next: index,
    source: value,
    metadata: fnImport
  });
}

export function functionParameters(
  value: SourceArray,
  index: number,
  metadataContext?: any
): Token.FunctionParametersToken | undefined {
  const open = Lexer.OPEN(value, index);
  if (!open) {
    return undefined;
  }
  const start = index;
  index = open;

  const params: Token.FunctionParameterToken[] = [];
  let token = functionParameter(value, index);
  while (token) {
    params.push(token);
    index = token.next;

    const comma = Lexer.COMMA(value, index);
    if (comma) {
      index = comma;
      token = functionParameter(value, index);
      if (!token) {
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

  return Token.tokenize({
    type: 'FunctionParameters',
    value: params,
    position: start,
    next: index,
    source: value
  });
}

export function functionParameter(
  value: SourceArray,
  index: number,
  metadataContext?: any
): Token.FunctionParameterToken | undefined {
  const name = Expressions.parameterName(value, index);
  if (!name) {
    return undefined;
  }
  const start = index;
  index = name.next;

  const eq = Lexer.EQ(value, index);
  if (!eq) {
    return undefined;
  }
  index = eq;

  const token =
    Expressions.parameterAlias(value, index) ||
    PrimitiveLiteral.primitiveLiteral(value, index);

  if (!token) {
    return undefined;
  }
  index = token.next;

  return Token.tokenize({
    type: 'FunctionParameter',
    value: { name, value: token },
    position: start,
    next: index,
    source: value
  });
}

export function crossjoin(
  value: SourceArray,
  index: number,
  metadataContext?: any
): Token.CrossjoinToken | undefined {
  if (!Utils.equals(value, index, '$crossjoin')) {
    return undefined;
  }
  const start = index;
  index += 10;

  const open = Lexer.OPEN(value, index);
  if (!open) {
    return undefined;
  }
  index = open;

  const names: Token.EntitySetNameToken[] = [];
  let token = NameOrIdentifier.entitySetName(value, index, metadataContext);
  if (!token) {
    return undefined;
  }

  while (token) {
    names.push(token);
    index = token.next;

    const comma = Lexer.COMMA(value, index);
    if (comma) {
      index = comma;
      token = NameOrIdentifier.entitySetName(value, index, metadataContext);
      if (!token) {
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

  return Token.tokenize({
    type: 'Crossjoin',
    value: { names },
    position: start,
    next: index,
    source: value
  });
}

export function all(value: SourceArray, index: number): Token.AllResourceToken | undefined {
  if (Utils.equals(value, index, '$all')) {
    return Token.tokenize({
      type: 'AllResource',
      value: '$all',
      position: index,
      next: index + 4,
      source: value
    });
  }
}
