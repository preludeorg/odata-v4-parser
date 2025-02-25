import * as Lexer from './lexer';
import * as PrimitiveLiteral from './primitiveLiteral';
import Utils, { SourceArray } from './utils';

export function enumeration(value: SourceArray, index: number): Lexer.EnumToken | undefined {
  const type = qualifiedEnumTypeName(value, index);
  if (!type) {
    return;
  }
  const start = index;
  index = type.next;

  let squote = Lexer.SQUOTE(value, index);
  if (!squote) {
    return;
  }
  index = squote;

  const enumVal = enumValue(value, index);
  if (!enumVal) {
    return;
  }
  index = enumVal.next;

  squote = Lexer.SQUOTE(value, index);
  if (!squote) {
    return;
  }
  index = squote;

  return Lexer.tokenize({ type: 'Enum', value: { name: type, value: enumVal }, position: start, next: index }, value);
}
export function enumValue(value: SourceArray, index: number): Lexer.EnumValueToken | undefined {
  let val = singleEnumValue(value, index);
  if (!val) {
    return;
  }
  const start = index;

  const arr: (Lexer.EnumerationMemberToken | Lexer.EnumMemberValueToken)[] = [];
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

  return Lexer.tokenize({ type: 'EnumValue', value: { values: arr }, position: start, next: index }, value);
}
export function singleEnumValue(
  value: SourceArray,
  index: number
): Lexer.EnumerationMemberToken | Lexer.EnumMemberValueToken | undefined {
  return enumerationMember(value, index) || enumMemberValue(value, index);
}
export function enumMemberValue(
  value: SourceArray,
  index: number
): Lexer.EnumMemberValueToken {
  const token = PrimitiveLiteral.int64Value(value, index);
  const tokenValue = token?.value;
  if (typeof tokenValue === 'string') {
    return { ...token, type: 'EnumMemberValue', value: tokenValue };
  }
}
export function singleQualifiedTypeName(
  value: SourceArray,
  index: number
): Lexer.QualifiedEntityTypeNameToken | Lexer.QualifiedComplexTypeNameToken | Lexer.IdentifierToken | undefined {
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
): Lexer.CollectionToken | Lexer.QualifiedEntityTypeNameToken | Lexer.QualifiedComplexTypeNameToken | Lexer.IdentifierToken | undefined {
  if (Utils.equals(value, index, 'Collection')) {
    const start = index;
    index += 10;

    let squote = Lexer.SQUOTE(value, index);
    if (!squote) {
      return;
    }
    index = squote;

    const token: Lexer.QualifiedEntityTypeNameToken | Lexer.QualifiedComplexTypeNameToken | Lexer.IdentifierToken | Lexer.CollectionToken =
      singleQualifiedTypeName(value, index);
    if (!token) {
      return;
    }
    index = token.next;

    squote = Lexer.SQUOTE(value, index);
    if (!squote) {
      return;
    }
    index = squote;

    token.position = start;
    token.next = index;
    token.raw = Utils.stringify(value, token.position, token.next);
    token.type = 'Collection';
  } else {
    return singleQualifiedTypeName(value, index);
  }
}
export function qualifiedEntityTypeName(
  value: SourceArray,
  index: number,
  metadataContext?: any
): Lexer.QualifiedEntityTypeNameToken | undefined {
  const start = index;
  const namespaceNext = namespace(value, index);

  if (namespaceNext === index || value[namespaceNext] !== 0x2e) {
    return;
  }
  let schema;
  if (typeof metadataContext === 'object') {
    schema = getMetadataRoot(metadataContext).schemas.filter(
      (it) => it.namespace === Utils.stringify(value, start, namespaceNext)
    )[0];
  }
  const name = entityTypeName(value, namespaceNext + 1, schema);
  if (!name) {
    return;
  }
  name.value.namespace = Utils.stringify(value, start, namespaceNext);

  return Lexer.tokenize({ type: 'QualifiedEntityTypeName', value: name, position: start, next: name.next }, value);
}
export function qualifiedComplexTypeName(
  value: SourceArray,
  index: number,
  metadataContext?: any
): Lexer.QualifiedComplexTypeNameToken | undefined {
  const start = index;
  const namespaceNext = namespace(value, index);
  if (namespaceNext === index || value[namespaceNext] !== 0x2e) {
    return;
  }
  let schema;
  if (typeof metadataContext === 'object') {
    schema = getMetadataRoot(metadataContext).schemas.filter(
      (it) => it.namespace === Utils.stringify(value, start, namespaceNext)
    )[0];
  }
  const name = complexTypeName(value, namespaceNext + 1, schema);
  if (!name) {
    return;
  }
  name.value.namespace = Utils.stringify(value, start, namespaceNext);

  return Lexer.tokenize({ type: 'QualifiedComplexTypeName', value: name, position: start, next: name.next }, value);
}
export function qualifiedTypeDefinitionName(
  value: SourceArray,
  index: number
): Lexer.IdentifierToken | undefined {
  const start = index;
  const namespaceNext = namespace(value, index);
  if (namespaceNext === index || value[namespaceNext] !== 0x2e) {
    return;
  }
  const nameNext = typeDefinitionName(value, namespaceNext + 1);
  if (nameNext && nameNext.next === namespaceNext + 1) {
    return;
  }

  return Lexer.tokenize({ type: 'Identifier', value: 'TypeDefinitionName', position: start, next: nameNext.next }, value);
}
export function qualifiedEnumTypeName(
  value: SourceArray,
  index: number
): Lexer.IdentifierToken | undefined {
  const start = index;
  const namespaceNext = namespace(value, index);
  if (namespaceNext === index || value[namespaceNext] !== 0x2e) {
    return;
  }
  const nameNext = enumerationTypeName(value, namespaceNext + 1);
  if (nameNext && nameNext.next === namespaceNext + 1) {
    return;
  }

  return Lexer.tokenize({ type: 'Identifier', value: 'EnumTypeName', position: start, next: nameNext.next }, value);
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
type ODataIdentifierTokenType = Lexer.TokenType & (
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
  | 'NamespacePart'
  | 'ODataIdentifier'
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
): Lexer.Token & { type: T } {
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
    const token: Lexer.PartialToken & { type: T } = {
      type: tokenType,
      value: { name: Utils.stringify(value, start, index) },
      position: start,
      next: index
    };
    return Lexer.tokenize(token, value);
  }
}
export function namespacePart(
  value: SourceArray,
  index: number
): Lexer.NamespacePartToken | undefined {
  return odataIdentifier(value, index, 'NamespacePart');
}
export function entitySetName(
  value: SourceArray,
  index: number,
  metadataContext?: any
): Lexer.EntitySetNameToken | undefined {
  const token = odataIdentifier(value, index, 'EntitySetName');
  if (!token) {
    return;
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
      return;
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
      return;
    }

    token.metadata = entityType;
  }

  return token;
}
export function singletonEntity(
  value: SourceArray,
  index: number
): Lexer.SingletonEntityToken | undefined {
  return odataIdentifier(value, index, 'SingletonEntity');
}
export function entityTypeName(
  value: SourceArray,
  index: number,
  schema?: any
): Lexer.EntityTypeNameToken | undefined {
  const token = odataIdentifier(value, index, 'EntityTypeName');
  if (!token) {
    return;
  }

  if (typeof schema === 'object') {
    const type = schema.entityTypes.filter((it) => it.name === token.raw)[0];
    if (!type) {
      return;
    }
    token.metadata = type;
  }

  return token;
}
export function complexTypeName(
  value: SourceArray,
  index: number,
  schema?: any
): Lexer.ComplexTypeNameToken | undefined {
  const token = odataIdentifier(value, index, 'ComplexTypeName');
  if (!token) {
    return;
  }

  if (typeof schema === 'object') {
    const type = schema.complexTypes.filter((it) => it.name === token.raw)[0];
    if (!type) {
      return;
    }
    token.metadata = type;
  }

  return token;
}
export function typeDefinitionName(
  value: SourceArray,
  index: number
): Lexer.TypeDefinitionNameToken | undefined {
  return odataIdentifier(value, index, 'TypeDefinitionName');
}
export function enumerationTypeName(
  value: SourceArray,
  index: number
): Lexer.EnumerationTypeNameToken | undefined {
  return odataIdentifier(value, index, 'EnumerationTypeName');
}
export function enumerationMember(
  value: SourceArray,
  index: number
): Lexer.EnumerationMemberToken | undefined {
  return odataIdentifier(value, index, 'EnumerationMember');
}
export function termName(value: SourceArray, index: number): Lexer.TermNameToken {
  return odataIdentifier(value, index, 'TermName');
}
export function primitiveTypeName(
  value: SourceArray,
  index: number
): Lexer.IdentifierToken | undefined {
  if (!Utils.equals(value, index, 'Edm.')) {
    return;
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
    return Lexer.tokenize({ type: 'Identifier', value: 'PrimitiveTypeName', position: start, next: end }, value);
  }
}
const primitiveTypes: string[] = [
  'Edm.Binary',
  'Edm.Boolean',
  'Edm.Byte',
  'Edm.Date',
  'Edm.DateTimeOffset',
  'Edm.Decimal',
  'Edm.Double',
  'Edm.Duration',
  'Edm.Guid',
  'Edm.Int16',
  'Edm.Int32',
  'Edm.Int64',
  'Edm.SByte',
  'Edm.Single',
  'Edm.Stream',
  'Edm.String',
  'Edm.TimeOfDay',
  'Edm.GeographyCollection',
  'Edm.GeographyLineString',
  'Edm.GeographyMultiLineString',
  'Edm.GeographyMultiPoint',
  'Edm.GeographyMultiPolygon',
  'Edm.GeographyPoint',
  'Edm.GeographyPolygon',
  'Edm.GeometryCollection',
  'Edm.GeometryLineString',
  'Edm.GeometryMultiLineString',
  'Edm.GeometryMultiPoint',
  'Edm.GeometryMultiPolygon',
  'Edm.GeometryPoint',
  'Edm.GeometryPolygon'
];
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
): Lexer.PrimitivePropertyToken | Lexer.PrimitiveKeyPropertyToken | undefined {
  const token: Lexer.PrimitivePropertyToken | Lexer.PrimitiveKeyPropertyToken | undefined =
    odataIdentifier(value, index, 'PrimitiveProperty');

  if (!token) {
    return;
  }

  if (typeof metadataContext === 'object') {
    for (let i = 0; i < metadataContext.properties.length; i++) {
      const prop = metadataContext.properties[i];
      if (prop.name === token.raw) {
        if (
          prop.type.indexOf('Collection') === 0 ||
          !isPrimitiveTypeName(prop.type, metadataContext)
        ) {
          return;
        }
        token.metadata = prop;

        if (
          metadataContext.key &&
          metadataContext.key.propertyRefs.filter((it) => it.name === prop.name)
            .length > 0
        ) {
          token.type = 'PrimitiveKeyProperty';
        }

        break;
      }
    }

    if (!token.metadata) {
      return;
    }
  }

  return token;
}
export function primitiveKeyProperty(
  value: SourceArray,
  index: number,
  metadataContext?: any
): Lexer.PrimitiveKeyPropertyToken | undefined {
  const token = primitiveProperty(value, index, metadataContext);
  if (token && token.type === 'PrimitiveKeyProperty') {
    return token;
  }
}
export function primitiveNonKeyProperty(
  value: SourceArray,
  index: number,
  metadataContext?: any
): Lexer.PrimitivePropertyToken | undefined {
  const token = primitiveProperty(value, index, metadataContext);
  if (token && token.type === 'PrimitiveProperty') {
    return token;
  }
}
export function primitiveColProperty(
  value: SourceArray,
  index: number,
  metadataContext?: any
): Lexer.PrimitiveCollectionPropertyToken | Lexer.PrimitiveKeyPropertyToken | undefined {
  const token: Lexer.PrimitiveCollectionPropertyToken | Lexer.PrimitiveKeyPropertyToken | undefined =
    odataIdentifier(value, index, 'PrimitiveCollectionProperty');

  if (!token) {
    return;
  }

  if (typeof metadataContext === 'object') {
    for (let i = 0; i < metadataContext.properties.length; i++) {
      const prop = metadataContext.properties[i];
      if (prop.name === token.raw) {
        if (
          prop.type.indexOf('Collection') === -1 ||
          !isPrimitiveTypeName(prop.type.slice(11, -1), metadataContext)
        ) {
          return;
        }
        token.metadata = prop;

        if (
          metadataContext.key.propertyRefs.filter((it) => it.name === prop.name)
            .length > 0
        ) {
          token.type = 'PrimitiveKeyProperty';
        }

        break;
      }
    }

    if (!token.metadata) {
      return;
    }
  }

  return token;
}
export function complexProperty(
  value: SourceArray,
  index: number,
  metadataContext?: any
): Lexer.ComplexPropertyToken | undefined {
  const token = odataIdentifier(value, index, 'ComplexProperty');
  if (!token) {
    return;
  }

  if (typeof metadataContext === 'object') {
    for (let i = 0; i < metadataContext.properties.length; i++) {
      const prop = metadataContext.properties[i];
      if (prop.name === token.raw) {
        if (
          prop.type.indexOf('Collection') === 0 ||
          isPrimitiveTypeName(prop.type, metadataContext)
        ) {
          return;
        }
        const root = getMetadataRoot(metadataContext);
        const schema = root.schemas.filter(
          (it) => prop.type.indexOf(`${it.namespace}.`) === 0
        )[0];
        if (!schema) {
          return;
        }

        const complexType = schema.complexTypes.filter(
          (it) => it.name === prop.type.split('.').pop()
        )[0];
        if (!complexType) {
          return;
        }

        token.metadata = complexType;
        break;
      }
    }

    if (!token.metadata) {
      return;
    }
  }

  return token;
}
export function complexColProperty(
  value: SourceArray,
  index: number,
  metadataContext?: any
): Lexer.ComplexCollectionPropertyToken | undefined {
  const token = odataIdentifier(value, index, 'ComplexCollectionProperty');
  if (!token) {
    return;
  }

  if (typeof metadataContext === 'object') {
    for (let i = 0; i < metadataContext.properties.length; i++) {
      const prop = metadataContext.properties[i];
      if (prop.name === token.raw) {
        if (
          prop.type.indexOf('Collection') === -1 ||
          isPrimitiveTypeName(prop.type.slice(11, -1), metadataContext)
        ) {
          return;
        }
        const root = getMetadataRoot(metadataContext);
        const schema = root.schemas.filter(
          (it) => prop.type.slice(11, -1).indexOf(`${it.namespace}.`) === 0
        )[0];
        if (!schema) {
          return;
        }

        const complexType = schema.complexTypes.filter(
          (it) => it.name === prop.type.slice(11, -1).split('.').pop()
        )[0];
        if (!complexType) {
          return;
        }

        token.metadata = complexType;
        break;
      }
    }

    if (!token.metadata) {
      return;
    }
  }

  return token;
}
export function streamProperty(
  value: SourceArray,
  index: number,
  metadataContext?: any
): Lexer.StreamPropertyToken | undefined {
  const token = odataIdentifier(value, index, 'StreamProperty');
  if (!token) {
    return;
  }

  if (typeof metadataContext === 'object') {
    for (let i = 0; i < metadataContext.properties.length; i++) {
      const prop = metadataContext.properties[i];
      if (prop.name === token.raw) {
        if (prop.type !== 'Edm.Stream') {
          return;
        }
        token.metadata = prop;
        break;
      }
    }

    if (!token.metadata) {
      return;
    }
  }

  return token;
}

export function navigationProperty(
  value: SourceArray,
  index: number,
  metadataContext?: any
): Lexer.EntityNavigationPropertyToken | Lexer.EntityCollectionNavigationPropertyToken | undefined {
  return (
    entityNavigationProperty(value, index, metadataContext) ||
    entityColNavigationProperty(value, index, metadataContext)
  );
}
export function entityNavigationProperty(
  value: SourceArray,
  index: number,
  metadataContext?: any
): Lexer.EntityNavigationPropertyToken | undefined {
  const token = odataIdentifier(value, index, 'EntityNavigationProperty');
  if (!token) {
    return;
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
          return;
        }

        const entityType = schema.entityTypes.filter(
          (it) => it.name === prop.type.split('.').pop()
        )[0];
        if (!entityType) {
          return;
        }

        token.metadata = entityType;
      }
    }
    if (!token.metadata) {
      return;
    }
  }

  return token;
}
export function entityColNavigationProperty(
  value: SourceArray,
  index: number,
  metadataContext?: any
): Lexer.EntityCollectionNavigationPropertyToken | undefined {
  const token = odataIdentifier(value, index, 'EntityCollectionNavigationProperty');
  if (!token) {
    return;
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
          return;
        }

        const entityType = schema.entityTypes.filter(
          (it) => it.name === prop.type.slice(11, -1).split('.').pop()
        )[0];
        if (!entityType) {
          return;
        }

        token.metadata = entityType;
      }
    }
    if (!token.metadata) {
      return;
    }
  }

  return token;
}

export function action(
  value: SourceArray,
  index: number,
  isCollection?: boolean,
  metadataContext?: any
): Lexer.ActionToken | undefined {
  const token = odataIdentifier(value, index, 'Action');
  if (!token) {
    return;
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
      return;
    }
  }

  return token;
}
export function actionImport(
  value: SourceArray,
  index: number,
  metadataContext?: any
): Lexer.ActionImportToken | undefined {
  const token = odataIdentifier(value, index, 'ActionImport');
  if (!token) {
    return;
  }

  if (typeof metadataContext === 'object') {
    const type = getOperationImportType('action', metadataContext, token);
    if (!type) {
      return;
    }
  }

  return token;
}

export function odataFunction(
  value: SourceArray,
  index: number
): Lexer.EntityFunctionToken | Lexer.EntityCollectionFunctionToken | Lexer.ComplexFunctionToken | Lexer.ComplexCollectionFunctionToken | Lexer.PrimitiveFunctionToken | Lexer.PrimitiveCollectionFunctionToken | undefined {
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
  token: Lexer.Token,
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
    return;
  }

  if (operation === 'action') {
    return fnDef;
  }

  if (fnDef.returnType.type.indexOf('Collection') === isCollection ? -1 : 0) {
    return;
  }
  const elementType = isCollection
    ? fnDef.returnType.type.slice(11, -1)
    : fnDef.returnType.type;
  if (isPrimitiveTypeName(elementType, metadataContext) && !isPrimitive) {
    return;
  }
  if (!isPrimitiveTypeName(elementType, metadataContext) && isPrimitive) {
    return;
  }
  if (isPrimitive) {
    return elementType;
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
  isCollection?: boolean,
  metadataContext?: any
): Lexer.EntityFunctionToken | undefined {
  const token = odataIdentifier(value, index, 'EntityFunction');
  if (!token) {
    return;
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
      return;
    }
    token.metadata = type;
  }

  return token;
}
export function entityColFunction(
  value: SourceArray,
  index: number,
  isCollection?: boolean,
  metadataContext?: any
): Lexer.EntityCollectionFunctionToken | undefined {
  const token = odataIdentifier(value, index, 'EntityCollectionFunction');
  if (!token) {
    return;
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
      return;
    }
    token.metadata = type;
  }

  return token;
}
export function complexFunction(
  value: SourceArray,
  index: number,
  isCollection?: boolean,
  metadataContext?: any
): Lexer.ComplexFunctionToken | undefined {
  const token = odataIdentifier(value, index, 'ComplexFunction');
  if (!token) {
    return;
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
      return;
    }
    token.metadata = type;
  }

  return token;
}
export function complexColFunction(
  value: SourceArray,
  index: number,
  isCollection?: boolean,
  metadataContext?: any
): Lexer.ComplexCollectionFunctionToken | undefined {
  const token = odataIdentifier(value, index, 'ComplexCollectionFunction');
  if (!token) {
    return;
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
      return;
    }
    token.metadata = type;
  }

  return token;
}
export function primitiveFunction(
  value: SourceArray,
  index: number,
  isCollection?: boolean,
  metadataContext?: any
): Lexer.PrimitiveFunctionToken | undefined {
  const token = odataIdentifier(value, index, 'PrimitiveFunction');
  if (!token) {
    return;
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
      return;
    }
    token.metadata = type;
  }

  return token;
}
export function primitiveColFunction(
  value: SourceArray,
  index: number,
  isCollection?: boolean,
  metadataContext?: any
): Lexer.PrimitiveCollectionFunctionToken | undefined {
  const token = odataIdentifier(value, index, 'PrimitiveCollectionFunction');
  if (!token) {
    return;
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
      return;
    }
    token.metadata = type;
  }

  return token;
}

export function getOperationImportType(
  operation: string,
  metadataContext: any,
  token: Lexer.Token,
  isCollection?: boolean,
  isPrimitive?: boolean,
  types?: string
): any {
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
    return;
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
    return;
  }

  if (operation === 'action') {
    return fn;
  }
  if (fn.returnType.type.indexOf('Collection') === isCollection ? -1 : 0) {
    return;
  }
  const elementType = isCollection
    ? fn.returnType.type.slice(11, -1)
    : fn.returnType.type;
  if (isPrimitiveTypeName(elementType, metadataContext) && !isPrimitive) {
    return;
  }
  if (!isPrimitiveTypeName(elementType, metadataContext) && isPrimitive) {
    return;
  }
  if (isPrimitive) {
    return elementType;
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
): Lexer.EntityFunctionImportToken | undefined {
  const token = odataIdentifier(value, index, 'EntityFunctionImport');
  if (!token) {
    return;
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
      return;
    }
    token.metadata = type;
  }

  return token;
}
export function entityColFunctionImport(
  value: SourceArray,
  index: number,
  metadataContext?: any
): Lexer.EntityCollectionFunctionImportToken | undefined {
  const token = odataIdentifier(value, index, 'EntityCollectionFunctionImport');
  if (!token) {
    return;
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
      return;
    }
    token.metadata = type;
  }

  return token;
}
export function complexFunctionImport(
  value: SourceArray,
  index: number,
  metadataContext?: any
): Lexer.ComplexFunctionImportToken | undefined {
  const token = odataIdentifier(value, index, 'ComplexFunctionImport');
  if (!token) {
    return;
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
      return;
    }
    token.metadata = type;
  }

  return token;
}
export function complexColFunctionImport(
  value: SourceArray,
  index: number,
  metadataContext?: any
): Lexer.ComplexCollectionFunctionImportToken | undefined {
  const token = odataIdentifier(value, index, 'ComplexCollectionFunctionImport');
  if (!token) {
    return;
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
      return;
    }
    token.metadata = type;
  }

  return token;
}
export function primitiveFunctionImport(
  value: SourceArray,
  index: number,
  metadataContext?: any
): Lexer.PrimitiveFunctionImportToken | undefined {
  const token = odataIdentifier(value, index, 'PrimitiveFunctionImport');
  if (!token) {
    return;
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
      return;
    }
    token.metadata = type;
  }

  return token;
}
export function primitiveColFunctionImport(
  value: SourceArray,
  index: number,
  metadataContext?: any
): Lexer.PrimitiveCollectionFunctionImportToken | undefined {
  const token = odataIdentifier(value, index, 'PrimitiveCollectionFunctionImport');
  if (!token) {
    return;
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
      return;
    }
    token.metadata = type;
  }

  return token;
}
