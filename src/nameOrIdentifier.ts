import { PrimitiveTypeEnum } from '@odata/metadata';
import * as Lexer from './lexer';
import * as PrimitiveLiteral from './primitiveLiteral';
import * as Token from './token';
import Utils, { SourceArray } from './utils';

export function enumeration(value: SourceArray, index: number): Token.EnumToken | undefined {
  const type = qualifiedEnumTypeName(value, index);
  if (!type) {
    return undefined;
  }
  const start = index;
  index = type.next;

  let squote = Lexer.SQUOTE(value, index);
  if (!squote) {
    return undefined;
  }
  index = squote;

  const enumVal = enumValue(value, index);
  if (!enumVal) {
    return undefined;
  }
  index = enumVal.next;

  squote = Lexer.SQUOTE(value, index);
  if (!squote) {
    return undefined;
  }
  index = squote;

  return Token.tokenize({ type: 'Enum', value: { name: type, value: enumVal }, position: start, next: index, source: value });
}
export function enumValue(value: SourceArray, index: number): Token.EnumValueToken | undefined {
  let val = singleEnumValue(value, index);
  if (!val) {
    return undefined;
  }
  const start = index;

  const arr: (Token.EnumerationMemberToken | Token.EnumMemberValueToken)[] = [];
  while (val) {
    arr.push(val);
    index = val.next;
    const comma = Lexer.COMMA(value, val.next);
    if (comma) {
      index = comma;
      val = singleEnumValue(value, index);
    } else {
      break;
    }
  }

  return Token.tokenize({ type: 'EnumValue', value: { values: arr }, position: start, next: index, source: value });
}
export function singleEnumValue(
  value: SourceArray,
  index: number
): Token.EnumerationMemberToken | Token.EnumMemberValueToken | undefined {
  return enumerationMember(value, index) || enumMemberValue(value, index);
}
export function enumMemberValue(
  value: SourceArray,
  index: number
): Token.EnumMemberValueToken | undefined {
  const token = PrimitiveLiteral.int64Value(value, index);
  if (token) {
    return new Token.Token({ ...token, type: 'EnumMemberValue' });
  }
}
export function singleQualifiedTypeName(
  value: SourceArray,
  index: number
): Token.QualifiedEntityTypeNameToken | Token.QualifiedComplexTypeNameToken | Token.IdentifierToken | undefined {
  return (
    qualifiedEntityTypeName(value, index) ||
    qualifiedComplexTypeName(value, index) ||
    qualifiedTypeDefinitionName(value, index) ||
    qualifiedEnumTypeName(value, index) ||
    primitiveTypeName(value, index)
  );
}
export function qualifiedTypeName(
  value: SourceArray,
  index: number
): Token.CollectionToken | Token.QualifiedEntityTypeNameToken | Token.QualifiedComplexTypeNameToken | Token.IdentifierToken | undefined {
  if (Utils.equals(value, index, 'Collection')) {
    const start = index;
    index += 10;

    let squote = Lexer.SQUOTE(value, index);
    if (!squote) {
      return undefined;
    }
    index = squote;

    const token: Token.QualifiedEntityTypeNameToken | Token.QualifiedComplexTypeNameToken | Token.IdentifierToken | Token.CollectionToken | undefined =
      singleQualifiedTypeName(value, index);
    if (!token) {
      return undefined;
    }
    index = token.next;

    squote = Lexer.SQUOTE(value, index);
    if (!squote) {
      return undefined;
    }
    index = squote;

    token.position = start;
    token.next = index;
    token.raw = Utils.stringify(value, token.position, token.next);
    // TODO: fix this type error
    token.type = 'Collection';
    // TODO: should there be a return here?
  } else {
    return singleQualifiedTypeName(value, index);
  }
}
export function qualifiedEntityTypeName(
  value: SourceArray,
  index: number,
  metadataContext?: any
): Token.QualifiedEntityTypeNameToken | undefined {
  const start = index;
  const namespaceNext = namespace(value, index);

  if (namespaceNext === index || value[namespaceNext] !== 0x2e) {
    return undefined;
  }
  let schema;
  if (typeof metadataContext === 'object') {
    schema = getMetadataRoot(metadataContext).schemas.filter(
      (it) => it.namespace === Utils.stringify(value, start, namespaceNext)
    )[0];
  }
  const name = entityTypeName(value, namespaceNext + 1, schema);
  if (!name) {
    return undefined;
  }
  name.value.namespace = Utils.stringify(value, start, namespaceNext);

  return Token.tokenize({ type: 'QualifiedEntityTypeName', value: name, position: start, next: name.next, source: value });
}
export function qualifiedComplexTypeName(
  value: SourceArray,
  index: number,
  metadataContext?: any
): Token.QualifiedComplexTypeNameToken | undefined {
  const start = index;
  const namespaceNext = namespace(value, index);
  if (namespaceNext === index || value[namespaceNext] !== 0x2e) {
    return undefined;
  }
  let schema;
  if (typeof metadataContext === 'object') {
    schema = getMetadataRoot(metadataContext).schemas.filter(
      (it) => it.namespace === Utils.stringify(value, start, namespaceNext)
    )[0];
  }
  const name = complexTypeName(value, namespaceNext + 1, schema);
  if (!name) {
    return undefined;
  }
  name.value.namespace = Utils.stringify(value, start, namespaceNext);

  return Token.tokenize({ type: 'QualifiedComplexTypeName', value: name, position: start, next: name.next, source: value });
}
export function qualifiedTypeDefinitionName(
  value: SourceArray,
  index: number
): Token.IdentifierToken | undefined {
  const start = index;
  const namespaceNext = namespace(value, index);
  if (namespaceNext === index || value[namespaceNext] !== 0x2e) {
    return undefined;
  }
  const nameNext = typeDefinitionName(value, namespaceNext + 1);
  if (nameNext && nameNext.next === namespaceNext + 1) {
    return undefined;
  }

  return Token.tokenize({ type: 'Identifier', value: 'TypeDefinitionName', position: start, next: nameNext.next, source: value });
}
export function qualifiedEnumTypeName(
  value: SourceArray,
  index: number
): Token.IdentifierToken | undefined {
  const start = index;
  const namespaceNext = namespace(value, index);
  if (namespaceNext === index || value[namespaceNext] !== 0x2e) {
    return undefined;
  }
  const nameNext = enumerationTypeName(value, namespaceNext + 1);
  if (nameNext && nameNext.next === namespaceNext + 1) {
    return undefined;
  }

  return Token.tokenize({ type: 'Identifier', value: 'EnumTypeName', position: start, next: nameNext.next, source: value });
}
export function namespace(value: SourceArray, index: number): number {
  let part = namespacePart(value, index);
  while (part && part.next > index) {
    index = part.next;
    if (value[part.next] === 0x2e) {
      index++;
      part = namespacePart(value, index);
      if (part && value[part.next] !== 0x2e) {
        return index - 1;
      }
    }
  }

  return index - 1;
}
type ODataIdentifierTokenType = Token.TokenType & (
  | 'Action'
  | 'ActionImport'
  | 'ComplexCollectionFunction'
  | 'ComplexCollectionFunctionImport'
  | 'ComplexCollectionProperty'
  | 'ComplexFunction'
  | 'ComplexFunctionImport'
  | 'ComplexProperty'
  | 'ComplexTypeName'
  | 'EnumerationMember'
  | 'EnumerationTypeName'
  | 'EntityCollectionFunction'
  | 'EntityCollectionFunctionImport'
  | 'EntityCollectionNavigationProperty'
  | 'EntityFunction'
  | 'EntityFunctionImport'
  | 'EntityNavigationProperty'
  | 'EntitySetName'
  | 'EntityTypeName'
  | 'KeyPropertyAlias'
  | 'LambdaVariableExpression'
  | 'NamespacePart'
  | 'ODataIdentifier'
  | 'ParameterName'
  | 'PrimitiveCollectionFunction'
  | 'PrimitiveCollectionFunctionImport'
  | 'PrimitiveCollectionProperty'
  | 'PrimitiveFunction'
  | 'PrimitiveFunctionImport'
  | 'PrimitiveProperty'
  | 'SingletonEntity'
  | 'StreamProperty'
  | 'TermName'
  | 'TypeDefinitionName'
);
export function odataIdentifier<T extends ODataIdentifierTokenType>(
  value: SourceArray,
  index: number,
  tokenType?: T
): Token.LexerToken & { type: T } | undefined {
  const start = index;
  if (Lexer.identifierLeadingCharacter(value[index])) {
    index++;
    while (
      index < value.length &&
      index - start < 128 &&
      Lexer.identifierCharacter(value[index])
    ) {
      index++;
    }
  }

  if (index > start) {
    return Token.tokenize({
      type: tokenType,
      value: { name: Utils.stringify(value, start, index) },
      position: start,
      next: index,
      source: value
    });
  }
}
export function namespacePart(
  value: SourceArray,
  index: number
): Token.NamespacePartToken | undefined {
  return odataIdentifier(value, index, 'NamespacePart');
}
export function entitySetName(
  value: SourceArray,
  index: number,
  metadataContext?: any
): Token.EntitySetNameToken | undefined {
  const token = odataIdentifier(value, index, 'EntitySetName');
  if (!token) {
    return undefined;
  }

  if (typeof metadataContext === 'object') {
    let entitySet;
    metadataContext.dataServices.schemas.forEach((schema) =>
      schema.entityContainer.forEach((container) =>
        container.entitySets.filter((set) => {
          const eq = set.name === token.raw;
          if (eq) {
            entitySet = set;
          }
          return eq;
        })
      )
    );
    if (!entitySet) {
      return undefined;
    }

    let entityType;
    metadataContext.dataServices.schemas.forEach(
      (schema) =>
        entitySet.entityType.indexOf(`${schema.namespace}.`) === 0 &&
        schema.entityTypes.filter((type) => {
          const eq =
            type.name ===
            entitySet.entityType.replace(`${schema.namespace}.`, '');
          if (eq) {
            entityType = type;
          }
          return eq;
        })
    );
    if (!entityType) {
      return undefined;
    }

    token.metadata = entityType;
  }

  return token;
}
export function singletonEntity(
  value: SourceArray,
  index: number
): Token.SingletonEntityToken | undefined {
  return odataIdentifier(value, index, 'SingletonEntity');
}
export function entityTypeName(
  value: SourceArray,
  index: number,
  schema?: any
): Token.EntityTypeNameToken | undefined {
  const token = odataIdentifier(value, index, 'EntityTypeName');
  if (!token) {
    return undefined;
  }

  if (typeof schema === 'object') {
    const type = schema.entityTypes.filter((it) => it.name === token.raw)[0];
    if (!type) {
      return undefined;
    }
    token.metadata = type;
  }

  return token;
}
export function complexTypeName(
  value: SourceArray,
  index: number,
  schema?: any
): Token.ComplexTypeNameToken | undefined {
  const token = odataIdentifier(value, index, 'ComplexTypeName');
  if (!token) {
    return undefined;
  }

  if (typeof schema === 'object') {
    const type = schema.complexTypes.filter((it) => it.name === token.raw)[0];
    if (!type) {
      return undefined;
    }
    token.metadata = type;
  }

  return token;
}
export function typeDefinitionName(
  value: SourceArray,
  index: number
): Token.TypeDefinitionNameToken | undefined {
  return odataIdentifier(value, index, 'TypeDefinitionName');
}
export function enumerationTypeName(
  value: SourceArray,
  index: number
): Token.EnumerationTypeNameToken | undefined {
  return odataIdentifier(value, index, 'EnumerationTypeName');
}
export function enumerationMember(
  value: SourceArray,
  index: number
): Token.EnumerationMemberToken | undefined {
  return odataIdentifier(value, index, 'EnumerationMember');
}
export function termName(value: SourceArray, index: number): Token.TermNameToken | undefined {
  return odataIdentifier(value, index, 'TermName');
}
export function primitiveTypeName(
  value: SourceArray,
  index: number
): Token.IdentifierToken | undefined {
  if (!Utils.equals(value, index, 'Edm.')) {
    return undefined;
  }
  const start = index;
  index += 4;
  const end =
    index +
    (Utils.equals(value, index, 'Binary') ||
      Utils.equals(value, index, 'Boolean') ||
      Utils.equals(value, index, 'Byte') ||
      Utils.equals(value, index, 'Date') ||
      Utils.equals(value, index, 'DateTimeOffset') ||
      Utils.equals(value, index, 'Decimal') ||
      Utils.equals(value, index, 'Double') ||
      Utils.equals(value, index, 'Duration') ||
      Utils.equals(value, index, 'Guid') ||
      Utils.equals(value, index, 'Int16') ||
      Utils.equals(value, index, 'Int32') ||
      Utils.equals(value, index, 'Int64') ||
      Utils.equals(value, index, 'SByte') ||
      Utils.equals(value, index, 'Single') ||
      Utils.equals(value, index, 'Stream') ||
      Utils.equals(value, index, 'String') ||
      Utils.equals(value, index, 'TimeOfDay') ||
      Utils.equals(value, index, 'GeographyCollection') ||
      Utils.equals(value, index, 'GeographyLineString') ||
      Utils.equals(value, index, 'GeographyMultiLineString') ||
      Utils.equals(value, index, 'GeographyMultiPoint') ||
      Utils.equals(value, index, 'GeographyMultiPolygon') ||
      Utils.equals(value, index, 'GeographyPoint') ||
      Utils.equals(value, index, 'GeographyPolygon') ||
      Utils.equals(value, index, 'GeometryCollection') ||
      Utils.equals(value, index, 'GeometryLineString') ||
      Utils.equals(value, index, 'GeometryMultiLineString') ||
      Utils.equals(value, index, 'GeometryMultiPoint') ||
      Utils.equals(value, index, 'GeometryMultiPolygon') ||
      Utils.equals(value, index, 'GeometryPoint') ||
      Utils.equals(value, index, 'GeometryPolygon'));

  if (end > index) {
    return Token.tokenize({
      type: 'Identifier',
      value: 'PrimitiveTypeName',
      position: start,
      next: end,
      source: value
    });
  }
}
const primitiveTypes: string[] = Object.values(PrimitiveTypeEnum);
export function isPrimitiveTypeName(
  type: string,
  metadataContext?: any
): boolean {
  const root = getMetadataRoot(metadataContext);
  const schemas =
    root.schemas || (root.dataServices && root.dataServices.schemas) || [];
  const schema = schemas.filter(
    (it) => type.indexOf(`${it.namespace}.`) === 0
  )[0];
  if (schema) {
    return (
      ((schema.enumTypes &&
        schema.enumTypes.filter(
          (it) => it.name === type.split('.').pop()
        )[0]) ||
        (schema.typeDefinitions &&
          schema.typeDefinitions.filter(
            (it) => it.name === type.split('.').pop()
          )[0])) &&
      !(
        (schema.entityTypes &&
          schema.entityTypes.filter(
            (it) => it.name === type.split('.').pop()
          )[0]) ||
        (schema.complexTypes &&
          schema.complexTypes.filter(
            (it) => it.name === type.split('.').pop()
          )[0])
      )
    );
  }
  return primitiveTypes.indexOf(type) >= 0;
}
export function getMetadataRoot(metadataContext: any) {
  let root = metadataContext;
  while (root.parent) {
    root = root.parent;
  }
  return root.dataServices || root;
}
export function primitiveProperty(
  value: SourceArray,
  index: number,
  metadataContext?: any
): Token.PrimitivePropertyToken | Token.PrimitiveKeyPropertyToken | undefined {
  const token: Token.PrimitivePropertyToken | Token.PrimitiveKeyPropertyToken | undefined =
    odataIdentifier(value, index, 'PrimitiveProperty');

  if (!token) {
    return undefined;
  }

  if (typeof metadataContext === 'object') {
    for (let i = 0; i < metadataContext.properties.length; i++) {
      const prop = metadataContext.properties[i];
      if (prop.name === token.raw) {
        if (
          prop.type.indexOf('Collection') === 0 ||
          !isPrimitiveTypeName(prop.type, metadataContext)
        ) {
          return undefined;
        }
        token.metadata = prop;

        if (
          metadataContext.key &&
          metadataContext.key.propertyRefs.filter((it) => it.name === prop.name)
            .length > 0
        ) {
          // TODO: fix this type error
          token.type = 'PrimitiveKeyProperty';
        }

        break;
      }
    }

    if (!token.metadata) {
      return undefined;
    }
  }

  return token;
}
export function primitiveKeyProperty(
  value: SourceArray,
  index: number,
  metadataContext?: any
): Token.PrimitiveKeyPropertyToken | undefined {
  const token = primitiveProperty(value, index, metadataContext);
  if (token && token.type === 'PrimitiveKeyProperty') {
    return token;
  }
}
export function primitiveNonKeyProperty(
  value: SourceArray,
  index: number,
  metadataContext?: any
): Token.PrimitivePropertyToken | undefined {
  const token = primitiveProperty(value, index, metadataContext);
  if (token && token.type === 'PrimitiveProperty') {
    return token;
  }
}
export function primitiveColProperty(
  value: SourceArray,
  index: number,
  metadataContext?: any
): Token.PrimitiveCollectionPropertyToken | Token.PrimitiveKeyPropertyToken | undefined {
  const token: Token.PrimitiveCollectionPropertyToken | Token.PrimitiveKeyPropertyToken | undefined =
    odataIdentifier(value, index, 'PrimitiveCollectionProperty');

  if (!token) {
    return undefined;
  }

  if (typeof metadataContext === 'object') {
    for (let i = 0; i < metadataContext.properties.length; i++) {
      const prop = metadataContext.properties[i];
      if (prop.name === token.raw) {
        if (
          prop.type.indexOf('Collection') === -1 ||
          !isPrimitiveTypeName(prop.type.slice(11, -1), metadataContext)
        ) {
          return undefined;
        }
        token.metadata = prop;

        if (
          metadataContext.key.propertyRefs.filter((it) => it.name === prop.name)
            .length > 0
        ) {
          // TODO: fix this type error
          token.type = 'PrimitiveKeyProperty';
        }

        break;
      }
    }

    if (!token.metadata) {
      return undefined;
    }
  }

  return token;
}
export function complexProperty(
  value: SourceArray,
  index: number,
  metadataContext?: any
): Token.ComplexPropertyToken | undefined {
  const token = odataIdentifier(value, index, 'ComplexProperty');
  if (!token) {
    return undefined;
  }

  if (typeof metadataContext === 'object') {
    for (let i = 0; i < metadataContext.properties.length; i++) {
      const prop = metadataContext.properties[i];
      if (prop.name === token.raw) {
        if (
          prop.type.indexOf('Collection') === 0 ||
          isPrimitiveTypeName(prop.type, metadataContext)
        ) {
          return undefined;
        }
        const root = getMetadataRoot(metadataContext);
        const schema = root.schemas.filter(
          (it) => prop.type.indexOf(`${it.namespace}.`) === 0
        )[0];
        if (!schema) {
          return undefined;
        }

        const complexType = schema.complexTypes.filter(
          (it) => it.name === prop.type.split('.').pop()
        )[0];
        if (!complexType) {
          return undefined;
        }

        token.metadata = complexType;
        break;
      }
    }

    if (!token.metadata) {
      return undefined;
    }
  }

  return token;
}
export function complexColProperty(
  value: SourceArray,
  index: number,
  metadataContext?: any
): Token.ComplexCollectionPropertyToken | undefined {
  const token = odataIdentifier(value, index, 'ComplexCollectionProperty');
  if (!token) {
    return undefined;
  }

  if (typeof metadataContext === 'object') {
    for (let i = 0; i < metadataContext.properties.length; i++) {
      const prop = metadataContext.properties[i];
      if (prop.name === token.raw) {
        if (
          prop.type.indexOf('Collection') === -1 ||
          isPrimitiveTypeName(prop.type.slice(11, -1), metadataContext)
        ) {
          return undefined;
        }
        const root = getMetadataRoot(metadataContext);
        const schema = root.schemas.filter(
          (it) => prop.type.slice(11, -1).indexOf(`${it.namespace}.`) === 0
        )[0];
        if (!schema) {
          return undefined;
        }

        const complexType = schema.complexTypes.filter(
          (it) => it.name === prop.type.slice(11, -1).split('.').pop()
        )[0];
        if (!complexType) {
          return undefined;
        }

        token.metadata = complexType;
        break;
      }
    }

    if (!token.metadata) {
      return undefined;
    }
  }

  return token;
}
export function streamProperty(
  value: SourceArray,
  index: number,
  metadataContext?: any
): Token.StreamPropertyToken | undefined {
  const token = odataIdentifier(value, index, 'StreamProperty');
  if (!token) {
    return undefined;
  }

  if (typeof metadataContext === 'object') {
    for (let i = 0; i < metadataContext.properties.length; i++) {
      const prop = metadataContext.properties[i];
      if (prop.name === token.raw) {
        if (prop.type !== 'Edm.Stream') {
          return undefined;
        }
        token.metadata = prop;
        break;
      }
    }

    if (!token.metadata) {
      return undefined;
    }
  }

  return token;
}

export function navigationProperty(
  value: SourceArray,
  index: number,
  metadataContext?: any
): Token.EntityNavigationPropertyToken | Token.EntityCollectionNavigationPropertyToken | undefined {
  return (
    entityNavigationProperty(value, index, metadataContext) ||
    entityColNavigationProperty(value, index, metadataContext)
  );
}
export function entityNavigationProperty(
  value: SourceArray,
  index: number,
  metadataContext?: any
): Token.EntityNavigationPropertyToken | undefined {
  const token = odataIdentifier(value, index, 'EntityNavigationProperty');
  if (!token) {
    return undefined;
  }

  if (typeof metadataContext === 'object') {
    for (let i = 0; i < metadataContext.navigationProperties.length; i++) {
      const prop = metadataContext.navigationProperties[i];
      if (
        prop.name === token.raw &&
        prop.type.indexOf('Collection') === -1 &&
        !isPrimitiveTypeName(prop.type.slice(11, -1), metadataContext)
      ) {
        const root = getMetadataRoot(metadataContext);
        const schema = root.schemas.filter(
          (it) => prop.type.indexOf(`${it.namespace}.`) === 0
        )[0];
        if (!schema) {
          return undefined;
        }

        const entityType = schema.entityTypes.filter(
          (it) => it.name === prop.type.split('.').pop()
        )[0];
        if (!entityType) {
          return undefined;
        }

        token.metadata = entityType;
      }
    }
    if (!token.metadata) {
      return undefined;
    }
  }

  return token;
}
export function entityColNavigationProperty(
  value: SourceArray,
  index: number,
  metadataContext?: any
): Token.EntityCollectionNavigationPropertyToken | undefined {
  const token = odataIdentifier(value, index, 'EntityCollectionNavigationProperty');
  if (!token) {
    return undefined;
  }

  if (typeof metadataContext === 'object') {
    for (let i = 0; i < metadataContext.navigationProperties.length; i++) {
      const prop = metadataContext.navigationProperties[i];
      if (
        prop.name === token.raw &&
        prop.type.indexOf('Collection') === 0 &&
        !isPrimitiveTypeName(prop.type.slice(11, -1), metadataContext)
      ) {
        const root = getMetadataRoot(metadataContext);
        const schema = root.schemas.filter(
          (it) => prop.type.slice(11, -1).indexOf(`${it.namespace}.`) === 0
        )[0];
        if (!schema) {
          return undefined;
        }

        const entityType = schema.entityTypes.filter(
          (it) => it.name === prop.type.slice(11, -1).split('.').pop()
        )[0];
        if (!entityType) {
          return undefined;
        }

        token.metadata = entityType;
      }
    }
    if (!token.metadata) {
      return undefined;
    }
  }

  return token;
}

export function action(
  value: SourceArray,
  index: number,
  isCollection: boolean = false,
  metadataContext?: any
): Token.ActionToken | undefined {
  const token = odataIdentifier(value, index, 'Action');
  if (!token) {
    return undefined;
  }

  if (typeof metadataContext === 'object') {
    const type = getOperationType(
      'action',
      metadataContext,
      token,
      isCollection,
      false,
      false,
      'entityTypes'
    );
    if (!type) {
      return undefined;
    }
  }

  return token;
}
export function actionImport(
  value: SourceArray,
  index: number,
  metadataContext?: any
): Token.ActionImportToken | undefined {
  const token = odataIdentifier(value, index, 'ActionImport');
  if (!token) {
    return undefined;
  }

  if (typeof metadataContext === 'object') {
    const type = getOperationImportType('action', metadataContext, token);
    if (!type) {
      return undefined;
    }
  }

  return token;
}

export function odataFunction(
  value: SourceArray,
  index: number
): Token.EntityFunctionToken | Token.EntityCollectionFunctionToken | Token.ComplexFunctionToken | Token.ComplexCollectionFunctionToken | Token.PrimitiveFunctionToken | Token.PrimitiveCollectionFunctionToken | undefined {
  return (
    entityFunction(value, index) ||
    entityColFunction(value, index) ||
    complexFunction(value, index) ||
    complexColFunction(value, index) ||
    primitiveFunction(value, index) ||
    primitiveColFunction(value, index)
  );
}

export function getOperationType(
  operation: string,
  metadataContext: any,
  token: Token.Token,
  isBoundCollection: boolean,
  isCollection: boolean,
  isPrimitive: boolean,
  types?: string
) {
  let bindingParameterType = `${metadataContext.parent.namespace}.${metadataContext.name}`;
  if (isBoundCollection) {
    bindingParameterType = `Collection(${bindingParameterType})`;
  }

  let fnDef;
  const root = getMetadataRoot(metadataContext);
  for (let i = 0; i < root.schemas.length; i++) {
    const schema = root.schemas[i];
    for (let j = 0; j < schema[`${operation}s`].length; j++) {
      const fn = schema[`${operation}s`][j];
      if (fn.name === token.raw && fn.isBound) {
        for (let k = 0; k < fn.parameters.length; k++) {
          const param = fn.parameters[k];
          if (
            param.name === 'bindingParameter' &&
            param.type === bindingParameterType
          ) {
            fnDef = fn;
            break;
          }
        }
      }
      if (fnDef) {
        break;
      }
    }
    if (fnDef) {
      break;
    }
  }
  if (!fnDef) {
    return undefined;
  }

  if (operation === 'action') {
    return fnDef;
  }

  if (fnDef.returnType.type.indexOf('Collection') === isCollection ? -1 : 0) {
    return undefined;
  }
  const elementType = isCollection
    ? fnDef.returnType.type.slice(11, -1)
    : fnDef.returnType.type;
  if (isPrimitiveTypeName(elementType, metadataContext) && !isPrimitive) {
    return undefined;
  }
  if (!isPrimitiveTypeName(elementType, metadataContext) && isPrimitive) {
    return undefined;
  }
  if (isPrimitive) {
    return elementType;
  }
  if (!types) {
    return undefined;
  }

  let type;
  for (let i = 0; i < root.schemas.length; i++) {
    const schema = root.schemas[i];
    if (elementType.indexOf(`${schema.namespace}.`) === 0) {
      for (let j = 0; j < schema[types].length; j++) {
        const it = schema[types][j];
        if (`${schema.namespace}.${it.name}` === elementType) {
          type = it;
          break;
        }
      }
    }
    if (type) {
      break;
    }
  }

  return type;
}
export function entityFunction(
  value: SourceArray,
  index: number,
  isCollection: boolean = false,
  metadataContext?: any
): Token.EntityFunctionToken | undefined {
  const token = odataIdentifier(value, index, 'EntityFunction');
  if (!token) {
    return undefined;
  }

  if (typeof metadataContext === 'object') {
    const type = getOperationType(
      'function',
      metadataContext,
      token,
      isCollection,
      false,
      false,
      'entityTypes'
    );
    if (!type) {
      return undefined;
    }
    token.metadata = type;
  }

  return token;
}
export function entityColFunction(
  value: SourceArray,
  index: number,
  isCollection: boolean = false,
  metadataContext?: any
): Token.EntityCollectionFunctionToken | undefined {
  const token = odataIdentifier(value, index, 'EntityCollectionFunction');
  if (!token) {
    return undefined;
  }

  if (typeof metadataContext === 'object') {
    const type = getOperationType(
      'function',
      metadataContext,
      token,
      isCollection,
      true,
      false,
      'entityTypes'
    );
    if (!type) {
      return undefined;
    }
    token.metadata = type;
  }

  return token;
}
export function complexFunction(
  value: SourceArray,
  index: number,
  isCollection: boolean = false,
  metadataContext?: any
): Token.ComplexFunctionToken | undefined {
  const token = odataIdentifier(value, index, 'ComplexFunction');
  if (!token) {
    return undefined;
  }

  if (typeof metadataContext === 'object') {
    const type = getOperationType(
      'function',
      metadataContext,
      token,
      isCollection,
      false,
      false,
      'complexTypes'
    );
    if (!type) {
      return undefined;
    }
    token.metadata = type;
  }

  return token;
}
export function complexColFunction(
  value: SourceArray,
  index: number,
  isCollection: boolean = false,
  metadataContext?: any
): Token.ComplexCollectionFunctionToken | undefined {
  const token = odataIdentifier(value, index, 'ComplexCollectionFunction');
  if (!token) {
    return undefined;
  }

  if (typeof metadataContext === 'object') {
    const type = getOperationType(
      'function',
      metadataContext,
      token,
      isCollection,
      true,
      false,
      'complexTypes'
    );
    if (!type) {
      return undefined;
    }
    token.metadata = type;
  }

  return token;
}
export function primitiveFunction(
  value: SourceArray,
  index: number,
  isCollection: boolean = false,
  metadataContext?: any
): Token.PrimitiveFunctionToken | undefined {
  const token = odataIdentifier(value, index, 'PrimitiveFunction');
  if (!token) {
    return undefined;
  }

  if (typeof metadataContext === 'object') {
    const type = getOperationType(
      'function',
      metadataContext,
      token,
      isCollection,
      false,
      true
    );
    if (!type) {
      return undefined;
    }
    token.metadata = type;
  }

  return token;
}
export function primitiveColFunction(
  value: SourceArray,
  index: number,
  isCollection: boolean = false,
  metadataContext?: any
): Token.PrimitiveCollectionFunctionToken | undefined {
  const token = odataIdentifier(value, index, 'PrimitiveCollectionFunction');
  if (!token) {
    return undefined;
  }

  if (typeof metadataContext === 'object') {
    const type = getOperationType(
      'function',
      metadataContext,
      token,
      isCollection,
      true,
      true
    );
    if (!type) {
      return undefined;
    }
    token.metadata = type;
  }

  return token;
}

export function getOperationImportType(
  operation: string,
  metadataContext: any,
  token: Token.Token,
  isCollection: boolean = false,
  isPrimitive?: boolean,
  types?: string
): any { // TODO: return type
  let fnImport;

  for (let i = 0; i < metadataContext.dataServices.schemas.length; i++) {
    const schema = metadataContext.dataServices.schemas[i];
    for (let j = 0; j < schema.entityContainer.length; j++) {
      const container = schema.entityContainer[j];
      for (let k = 0; k < container[`${operation}Imports`].length; k++) {
        const it = container[`${operation}Imports`][k];
        if (it.name === token.raw) {
          fnImport = it;
          break;
        }
      }
      if (fnImport) {
        break;
      }
    }
    if (fnImport) {
      break;
    }
  }
  if (!fnImport) {
    return undefined;
  }

  let fn;
  for (let i = 0; i < metadataContext.dataServices.schemas.length; i++) {
    const schema = metadataContext.dataServices.schemas[i];
    if (fnImport[operation].indexOf(`${schema.namespace}.`) === 0) {
      for (let j = 0; j < schema[`${operation}s`].length; j++) {
        const it = schema[`${operation}s`][j];
        if (it.name === fnImport.name) {
          fn = it;
          break;
        }
      }
    }
    if (fn) {
      break;
    }
  }
  if (!fn) {
    return undefined;
  }

  if (operation === 'action') {
    return fn;
  }
  if (fn.returnType.type.indexOf('Collection') === isCollection ? -1 : 0) {
    return undefined;
  }
  const elementType = isCollection
    ? fn.returnType.type.slice(11, -1)
    : fn.returnType.type;
  if (isPrimitiveTypeName(elementType, metadataContext) && !isPrimitive) {
    return undefined;
  }
  if (!isPrimitiveTypeName(elementType, metadataContext) && isPrimitive) {
    return undefined;
  }
  if (isPrimitive) {
    return elementType;
  }
  if (!types) {
    return undefined;
  }

  let type;
  for (let i = 0; i < metadataContext.dataServices.schemas.length; i++) {
    const schema = metadataContext.dataServices.schemas[i];
    if (elementType.indexOf(`${schema.namespace}.`) === 0) {
      for (let j = 0; j < schema[types].length; j++) {
        const it = schema[types][j];
        if (`${schema.namespace}.${it.name}` === elementType) {
          type = it;
          break;
        }
      }
    }
    if (type) {
      break;
    }
  }

  return type;
}
export function entityFunctionImport(
  value: SourceArray,
  index: number,
  metadataContext?: any
): Token.EntityFunctionImportToken | undefined {
  const token = odataIdentifier(value, index, 'EntityFunctionImport');
  if (!token) {
    return undefined;
  }

  if (typeof metadataContext === 'object') {
    const type = getOperationImportType(
      'function',
      metadataContext,
      token,
      false,
      false,
      'entityTypes'
    );
    if (!type) {
      return undefined;
    }
    token.metadata = type;
  }

  return token;
}
export function entityColFunctionImport(
  value: SourceArray,
  index: number,
  metadataContext?: any
): Token.EntityCollectionFunctionImportToken | undefined {
  const token = odataIdentifier(value, index, 'EntityCollectionFunctionImport');
  if (!token) {
    return undefined;
  }

  if (typeof metadataContext === 'object') {
    const type = getOperationImportType(
      'function',
      metadataContext,
      token,
      true,
      false,
      'entityTypes'
    );
    if (!type) {
      return undefined;
    }
    token.metadata = type;
  }

  return token;
}
export function complexFunctionImport(
  value: SourceArray,
  index: number,
  metadataContext?: any
): Token.ComplexFunctionImportToken | undefined {
  const token = odataIdentifier(value, index, 'ComplexFunctionImport');
  if (!token) {
    return undefined;
  }

  if (typeof metadataContext === 'object') {
    const type = getOperationImportType(
      'function',
      metadataContext,
      token,
      false,
      false,
      'complexTypes'
    );
    if (!type) {
      return undefined;
    }
    token.metadata = type;
  }

  return token;
}
export function complexColFunctionImport(
  value: SourceArray,
  index: number,
  metadataContext?: any
): Token.ComplexCollectionFunctionImportToken | undefined {
  const token = odataIdentifier(value, index, 'ComplexCollectionFunctionImport');
  if (!token) {
    return undefined;
  }

  if (typeof metadataContext === 'object') {
    const type = getOperationImportType(
      'function',
      metadataContext,
      token,
      true,
      false,
      'complexTypes'
    );
    if (!type) {
      return undefined;
    }
    token.metadata = type;
  }

  return token;
}
export function primitiveFunctionImport(
  value: SourceArray,
  index: number,
  metadataContext?: any
): Token.PrimitiveFunctionImportToken | undefined {
  const token = odataIdentifier(value, index, 'PrimitiveFunctionImport');
  if (!token) {
    return undefined;
  }

  if (typeof metadataContext === 'object') {
    const type = getOperationImportType(
      'function',
      metadataContext,
      token,
      false,
      true
    );
    if (!type) {
      return undefined;
    }
    token.metadata = type;
  }

  return token;
}
export function primitiveColFunctionImport(
  value: SourceArray,
  index: number,
  metadataContext?: any
): Token.PrimitiveCollectionFunctionImportToken | undefined {
  const token = odataIdentifier(value, index, 'PrimitiveCollectionFunctionImport');
  if (!token) {
    return undefined;
  }

  if (typeof metadataContext === 'object') {
    const type = getOperationImportType(
      'function',
      metadataContext,
      token,
      true,
      true
    );
    if (!type) {
      return undefined;
    }
    token.metadata = type;
  }

  return token;
}
