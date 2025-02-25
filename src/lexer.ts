import Utils, { SourceArray } from './utils';

type BaseToken = {
  position: number;
  next: number;
  /** raw string of token */
  raw: string;
  metadata?: any;
};

type NamedValue = { name: string };
type NamespacedNameValue = { name: string; namespace?: string };

export type LiteralToken = BaseToken & { type: 'Literal'; value: string | LiteralToken | { longitude: LiteralToken, latitude: LiteralToken } };
export type ArrayOrObjectToken = BaseToken & { type: 'ArrayOrObject'; value: object | any[] };
export type ArrayToken = BaseToken & { type: 'Array'; value: any[] };
export type ObjectToken = BaseToken & { type: 'Object'; value: any[] };
export type PropertyToken = BaseToken & { type: 'Property'; value: string };
export type AnnotationToken = BaseToken & { type: 'Annotation'; value: string };
export type EnumToken = BaseToken & { type: 'Enum'; value: { name: IdentifierToken; value: EnumValueToken } };
export type EnumValueToken = BaseToken & { type: 'EnumValue'; value: { values: (EnumerationMemberToken | EnumMemberValueToken)[]} };
export type EnumMemberValueToken = BaseToken & { type: 'EnumMemberValue'; value: string };
export type IdentifierToken = BaseToken & { type: 'Identifier'; value: string };
export type QualifiedEntityTypeNameToken = BaseToken & { type: 'QualifiedEntityTypeName'; value: EntityTypeNameToken };
export type QualifiedComplexTypeNameToken = BaseToken & { type: 'QualifiedComplexTypeName'; value: ComplexTypeNameToken };
export type ODataIdentifierToken = BaseToken & { type: 'ODataIdentifier'; value: NamedValue };
export type CollectionToken = BaseToken & { type: 'Collection'; value: Token[] };
export type NamespacePartToken = BaseToken & { type: 'NamespacePart'; value: NamedValue | Token[] };
export type EntitySetNameToken = BaseToken & { type: 'EntitySetName'; value: NamedValue };
export type SingletonEntityToken = BaseToken & { type: 'SingletonEntity'; value: NamedValue };
export type EntityTypeNameToken = BaseToken & { type: 'EntityTypeName'; value: NamespacedNameValue };
export type ComplexTypeNameToken = BaseToken & { type: 'ComplexTypeName'; value: NamespacedNameValue };
export type TypeDefinitionNameToken = BaseToken & { type: 'TypeDefinitionName'; value: NamedValue };
export type EnumerationTypeNameToken = BaseToken & { type: 'EnumerationTypeName'; value: NamedValue };
export type EnumerationMemberToken = BaseToken & { type: 'EnumerationMember'; value: NamedValue };
export type TermNameToken = BaseToken & { type: 'TermName'; value: NamedValue };
export type PrimitivePropertyToken = BaseToken & { type: 'PrimitiveProperty'; value: NamedValue };
export type PrimitiveKeyPropertyToken = BaseToken & { type: 'PrimitiveKeyProperty'; value: string };
export type PrimitiveNonKeyPropertyToken = BaseToken & { type: 'PrimitiveNonKeyProperty'; value: string };
export type PrimitiveCollectionPropertyToken = BaseToken & { type: 'PrimitiveCollectionProperty'; value: NamedValue };
export type ComplexPropertyToken = BaseToken & { type: 'ComplexProperty'; value: NamedValue };
export type ComplexCollectionPropertyToken = BaseToken & { type: 'ComplexCollectionProperty'; value: NamedValue };
export type StreamPropertyToken = BaseToken & { type: 'StreamProperty'; value: NamedValue };
export type NavigationPropertyToken = BaseToken & { type: 'NavigationProperty'; value: string };
export type EntityNavigationPropertyToken = BaseToken & { type: 'EntityNavigationProperty'; value: NamedValue };
export type EntityCollectionNavigationPropertyToken = BaseToken & { type: 'EntityCollectionNavigationProperty'; value: NamedValue };
export type ActionToken = BaseToken & { type: 'Action'; value: NamedValue };
export type ActionImportToken = BaseToken & { type: 'ActionImport'; value: NamedValue };
export type FunctionToken = BaseToken & { type: 'Function'; value: string };
export type EntityFunctionToken = BaseToken & { type: 'EntityFunction'; value: NamedValue };
export type EntityCollectionFunctionToken = BaseToken & { type: 'EntityCollectionFunction'; value: NamedValue };
export type ComplexFunctionToken = BaseToken & { type: 'ComplexFunction'; value: NamedValue };
export type ComplexCollectionFunctionToken = BaseToken & { type: 'ComplexCollectionFunction'; value: NamedValue };
export type PrimitiveFunctionToken = BaseToken & { type: 'PrimitiveFunction'; value: NamedValue };
export type PrimitiveCollectionFunctionToken = BaseToken & { type: 'PrimitiveCollectionFunction'; value: NamedValue };
export type EntityFunctionImportToken = BaseToken & { type: 'EntityFunctionImport'; value: NamedValue };
export type EntityCollectionFunctionImportToken = BaseToken & { type: 'EntityCollectionFunctionImport'; value: NamedValue };
export type ComplexFunctionImportToken = BaseToken & { type: 'ComplexFunctionImport'; value: NamedValue };
export type ComplexCollectionFunctionImportToken = BaseToken & { type: 'ComplexCollectionFunctionImport'; value: NamedValue };
export type PrimitiveFunctionImportToken = BaseToken & { type: 'PrimitiveFunctionImport'; value: NamedValue };
export type PrimitiveCollectionFunctionImportToken = BaseToken & { type: 'PrimitiveCollectionFunctionImport'; value: NamedValue };
export type CommonExpressionToken = BaseToken & { type: 'CommonExpression'; value: Token };
export type AndExpressionToken = BaseToken & { type: 'AndExpression'; value: { left: Token, right: Token } };
export type OrExpressionToken = BaseToken & { type: 'OrExpression'; value: { left: Token, right: Token } };
export type EqualsExpressionToken = BaseToken & { type: 'EqualsExpression'; value: string };
export type NotEqualsExpressionToken = BaseToken & { type: 'NotEqualsExpression'; value: string };
export type LesserThanExpressionToken = BaseToken & { type: 'LesserThanExpression'; value: string };
export type LesserOrEqualsExpressionToken = BaseToken & { type: 'LesserOrEqualsExpression'; value: string };
export type GreaterThanExpressionToken = BaseToken & { type: 'GreaterThanExpression'; value: string };
export type GreaterOrEqualsExpressionToken = BaseToken & { type: 'GreaterOrEqualsExpression'; value: string };
export type HasExpressionToken = BaseToken & { type: 'HasExpression'; value: string };
export type AddExpressionToken = BaseToken & { type: 'AddExpression'; value: string };
export type SubExpressionToken = BaseToken & { type: 'SubExpression'; value: string };
export type MulExpressionToken = BaseToken & { type: 'MulExpression'; value: string };
export type DivExpressionToken = BaseToken & { type: 'DivExpression'; value: string };
export type ModExpressionToken = BaseToken & { type: 'ModExpression'; value: string };
export type NotExpressionToken = BaseToken & { type: 'NotExpression'; value: string };
export type BoolParenExpressionToken = BaseToken & { type: 'BoolParenExpression'; value: string };
export type ParenExpressionToken = BaseToken & { type: 'ParenExpression'; value: string };
export type MethodCallExpressionToken = BaseToken & { type: 'MethodCallExpression'; value: { method: string; parameters: Token[] } };
export type IsOfExpressionToken = BaseToken & { type: 'IsOfExpression'; value: string };
export type CastExpressionToken = BaseToken & { type: 'CastExpression'; value: string };
export type NegateExpressionToken = BaseToken & { type: 'NegateExpression'; value: string };
export type FirstMemberExpressionToken = BaseToken & { type: 'FirstMemberExpression'; value: string };
export type MemberExpressionToken = BaseToken & { type: 'MemberExpression'; value: string };
export type PropertyPathExpressionToken = BaseToken & { type: 'PropertyPathExpression'; value: string };
export type ImplicitVariableExpressionToken = BaseToken & { type: 'ImplicitVariableExpression'; value: string };
export type LambdaVariableToken = BaseToken & { type: 'LambdaVariable'; value: string };
export type LambdaVariableExpressionToken = BaseToken & { type: 'LambdaVariableExpression'; value: string };
export type LambdaPredicateExpressionToken = BaseToken & { type: 'LambdaPredicateExpression'; value: string };
export type AnyExpressionToken = BaseToken & { type: 'AnyExpression'; value: string };
export type AllExpressionToken = BaseToken & { type: 'AllExpression'; value: string };
export type CollectionNavigationExpressionToken = BaseToken & { type: 'CollectionNavigationExpression'; value: string };
export type SimpleKeyToken = BaseToken & { type: 'SimpleKey'; value: string };
export type CompoundKeyToken = BaseToken & { type: 'CompoundKey'; value: string };
export type KeyValuePairToken = BaseToken & { type: 'KeyValuePair'; value: string };
export type KeyPropertyValueToken = BaseToken & { type: 'KeyPropertyValue'; value: string };
export type KeyPropertyAliasToken = BaseToken & { type: 'KeyPropertyAlias'; value: string };
export type SingleNavigationExpressionToken = BaseToken & { type: 'SingleNavigationExpression'; value: string };
export type CollectionPathExpressionToken = BaseToken & { type: 'CollectionPathExpression'; value: string };
export type ComplexPathExpressionToken = BaseToken & { type: 'ComplexPathExpression'; value: string };
export type SinglePathExpressionToken = BaseToken & { type: 'SinglePathExpression'; value: string };
export type FunctionExpressionToken = BaseToken & { type: 'FunctionExpression'; value: string };
export type FunctionExpressionParametersToken = BaseToken & { type: 'FunctionExpressionParameters'; value: string };
export type FunctionExpressionParameterToken = BaseToken & { type: 'FunctionExpressionParameter'; value: string };
export type ParameterNameToken = BaseToken & { type: 'ParameterName'; value: string };
export type ParameterAliasToken = BaseToken & { type: 'ParameterAlias'; value: string };
export type ParameterValueToken = BaseToken & { type: 'ParameterValue'; value: string };
export type CountExpressionToken = BaseToken & { type: 'CountExpression'; value: string };
export type RefExpressionToken = BaseToken & { type: 'RefExpression'; value: string };
export type ValueExpressionToken = BaseToken & { type: 'ValueExpression'; value: string };
export type RootExpressionToken = BaseToken & { type: 'RootExpression'; value: string };
export type QueryOptionsToken = BaseToken & { type: 'QueryOptions'; value: string };
export type CustomQueryOptionToken = BaseToken & { type: 'CustomQueryOption'; value: { key: string; value: string } };
export type ExpandToken = BaseToken & { type: 'Expand'; value: string };
export type ExpandItemToken = BaseToken & { type: 'ExpandItem'; value: string };
export type ExpandPathToken = BaseToken & { type: 'ExpandPath'; value: string };
export type ExpandCountOptionToken = BaseToken & { type: 'ExpandCountOption'; value: string };
export type ExpandRefOptionToken = BaseToken & { type: 'ExpandRefOption'; value: string };
export type ExpandOptionToken = BaseToken & { type: 'ExpandOption'; value: string };
export type LevelsToken = BaseToken & { type: 'Levels'; value: string };
export type SearchToken = BaseToken & { type: 'Search'; value: string };
export type SearchExpressionToken = BaseToken & { type: 'SearchExpression'; value: string };
export type SearchParenExpressionToken = BaseToken & { type: 'SearchParenExpression'; value: string };
export type SearchNotExpressionToken = BaseToken & { type: 'SearchNotExpression'; value: string };
export type SearchOrExpressionToken = BaseToken & { type: 'SearchOrExpression'; value: string };
export type SearchAndExpressionToken = BaseToken & { type: 'SearchAndExpression'; value: string };
export type SearchTermToken = BaseToken & { type: 'SearchTerm'; value: string };
export type SearchPhraseToken = BaseToken & { type: 'SearchPhrase'; value: string };
export type SearchWordToken = BaseToken & { type: 'SearchWord'; value: string };
export type FilterToken = BaseToken & { type: 'Filter'; value: string };
export type OrderByToken = BaseToken & { type: 'OrderBy'; value: string };
export type OrderByItemToken = BaseToken & { type: 'OrderByItem'; value: string };
export type SkipToken = BaseToken & { type: 'Skip'; value: string };
export type TopToken = BaseToken & { type: 'Top'; value: string };
export type FormatToken = BaseToken & { type: 'Format'; value: string };
export type InlineCountToken = BaseToken & { type: 'InlineCount'; value: string };
export type SelectToken = BaseToken & { type: 'Select'; value: string };
export type SelectItemToken = BaseToken & { type: 'SelectItem'; value: string };
export type SelectPathToken = BaseToken & { type: 'SelectPath'; value: string };
export type AliasAndValueToken = BaseToken & { type: 'AliasAndValue'; value: string };
export type SkipTokenToken = BaseToken & { type: 'SkipToken'; value: string };
export type IdToken = BaseToken & { type: 'Id'; value: string };
export type CrossjoinToken = BaseToken & { type: 'Crossjoin'; value: string };
export type AllResourceToken = BaseToken & { type: 'AllResource'; value: string };
export type ActionImportCallToken = BaseToken & { type: 'ActionImportCall'; value: string };
export type FunctionImportCallToken = BaseToken & { type: 'FunctionImportCall'; value: string };
export type EntityCollectionFunctionImportCallToken = BaseToken & { type: 'EntityCollectionFunctionImportCall'; value: string };
export type EntityFunctionImportCallToken = BaseToken & { type: 'EntityFunctionImportCall'; value: string };
export type ComplexCollectionFunctionImportCallToken = BaseToken & { type: 'ComplexCollectionFunctionImportCall'; value: string };
export type ComplexFunctionImportCallToken = BaseToken & { type: 'ComplexFunctionImportCall'; value: string };
export type PrimitiveCollectionFunctionImportCallToken = BaseToken & { type: 'PrimitiveCollectionFunctionImportCall'; value: string };
export type PrimitiveFunctionImportCallToken = BaseToken & { type: 'PrimitiveFunctionImportCall'; value: string };
export type FunctionParametersToken = BaseToken & { type: 'FunctionParameters'; value: string };
export type FunctionParameterToken = BaseToken & { type: 'FunctionParameter'; value: string };
export type ResourcePathToken = BaseToken & { type: 'ResourcePath'; value: string };
export type CollectionNavigationToken = BaseToken & { type: 'CollectionNavigation'; value: string };
export type CollectionNavigationPathToken = BaseToken & { type: 'CollectionNavigationPath'; value: string };
export type SingleNavigationToken = BaseToken & { type: 'SingleNavigation'; value: string };
export type PropertyPathToken = BaseToken & { type: 'PropertyPath'; value: string };
export type ComplexPathToken = BaseToken & { type: 'ComplexPath'; value: string };
export type BoundOperationToken = BaseToken & { type: 'BoundOperation'; value: string };
export type BoundActionCallToken = BaseToken & { type: 'BoundActionCall'; value: string };
export type BoundEntityFunctionCallToken = BaseToken & { type: 'BoundEntityFunctionCall'; value: string };
export type BoundEntityCollectionFunctionCallToken = BaseToken & { type: 'BoundEntityCollectionFunctionCall'; value: string };
export type BoundComplexFunctionCallToken = BaseToken & { type: 'BoundComplexFunctionCall'; value: string };
export type BoundComplexCollectionFunctionCallToken = BaseToken & { type: 'BoundComplexCollectionFunctionCall'; value: string };
export type BoundPrimitiveFunctionCallToken = BaseToken & { type: 'BoundPrimitiveFunctionCall'; value: string };
export type BoundPrimitiveCollectionFunctionCallToken = BaseToken & { type: 'BoundPrimitiveCollectionFunctionCall'; value: string };
export type ODataUriToken = BaseToken & { type: 'ODataUri'; value: string };
export type BatchToken = BaseToken & { type: 'Batch'; value: string };
export type EntityToken = BaseToken & { type: 'Entity'; value: string };
export type MetadataToken = BaseToken & { type: 'Metadata'; value: string };

export type Token =
  | LiteralToken
  | ArrayOrObjectToken
  | ArrayOrObjectToken
  | ArrayToken
  | ObjectToken
  | PropertyToken
  | AnnotationToken
  | EnumToken
  | EnumValueToken
  | EnumMemberValueToken
  | IdentifierToken
  | QualifiedEntityTypeNameToken
  | QualifiedComplexTypeNameToken
  | ODataIdentifierToken
  | CollectionToken
  | NamespacePartToken
  | EntitySetNameToken
  | SingletonEntityToken
  | EntityTypeNameToken
  | ComplexTypeNameToken
  | TypeDefinitionNameToken
  | EnumerationTypeNameToken
  | EnumerationMemberToken
  | TermNameToken
  | PrimitivePropertyToken
  | PrimitiveKeyPropertyToken
  | PrimitiveNonKeyPropertyToken
  | PrimitiveCollectionPropertyToken
  | ComplexPropertyToken
  | ComplexCollectionPropertyToken
  | StreamPropertyToken
  | NavigationPropertyToken
  | EntityNavigationPropertyToken
  | EntityCollectionNavigationPropertyToken
  | ActionToken
  | ActionImportToken
  | FunctionToken
  | EntityFunctionToken
  | EntityCollectionFunctionToken
  | ComplexFunctionToken
  | ComplexCollectionFunctionToken
  | PrimitiveFunctionToken
  | PrimitiveCollectionFunctionToken
  | EntityFunctionImportToken
  | EntityCollectionFunctionImportToken
  | ComplexFunctionImportToken
  | ComplexCollectionFunctionImportToken
  | PrimitiveFunctionImportToken
  | PrimitiveCollectionFunctionImportToken
  | CommonExpressionToken
  | AndExpressionToken
  | OrExpressionToken
  | EqualsExpressionToken
  | NotEqualsExpressionToken
  | LesserThanExpressionToken
  | LesserOrEqualsExpressionToken
  | GreaterThanExpressionToken
  | GreaterOrEqualsExpressionToken
  | HasExpressionToken
  | AddExpressionToken
  | SubExpressionToken
  | MulExpressionToken
  | DivExpressionToken
  | ModExpressionToken
  | NotExpressionToken
  | BoolParenExpressionToken
  | ParenExpressionToken
  | MethodCallExpressionToken
  | IsOfExpressionToken
  | CastExpressionToken
  | NegateExpressionToken
  | FirstMemberExpressionToken
  | MemberExpressionToken
  | PropertyPathExpressionToken
  | ImplicitVariableExpressionToken
  | LambdaVariableToken
  | LambdaVariableExpressionToken
  | LambdaPredicateExpressionToken
  | AnyExpressionToken
  | AllExpressionToken
  | CollectionNavigationExpressionToken
  | SimpleKeyToken
  | CompoundKeyToken
  | KeyValuePairToken
  | KeyPropertyValueToken
  | KeyPropertyAliasToken
  | SingleNavigationExpressionToken
  | CollectionPathExpressionToken
  | ComplexPathExpressionToken
  | SinglePathExpressionToken
  | FunctionExpressionToken
  | FunctionExpressionParametersToken
  | FunctionExpressionParameterToken
  | ParameterNameToken
  | ParameterAliasToken
  | ParameterValueToken
  | CountExpressionToken
  | RefExpressionToken
  | ValueExpressionToken
  | RootExpressionToken
  | QueryOptionsToken
  | CustomQueryOptionToken
  | ExpandToken
  | ExpandItemToken
  | ExpandPathToken
  | ExpandCountOptionToken
  | ExpandRefOptionToken
  | ExpandOptionToken
  | LevelsToken
  | SearchToken
  | SearchExpressionToken
  | SearchParenExpressionToken
  | SearchNotExpressionToken
  | SearchOrExpressionToken
  | SearchAndExpressionToken
  | SearchTermToken
  | SearchPhraseToken
  | SearchWordToken
  | FilterToken
  | OrderByToken
  | OrderByItemToken
  | SkipToken
  | TopToken
  | FormatToken
  | InlineCountToken
  | SelectToken
  | SelectItemToken
  | SelectPathToken
  | AliasAndValueToken
  | SkipTokenToken
  | IdToken
  | CrossjoinToken
  | AllResourceToken
  | ActionImportCallToken
  | FunctionImportCallToken
  | EntityCollectionFunctionImportCallToken
  | EntityFunctionImportCallToken
  | ComplexCollectionFunctionImportCallToken
  | ComplexFunctionImportCallToken
  | PrimitiveCollectionFunctionImportCallToken
  | PrimitiveFunctionImportCallToken
  | FunctionParametersToken
  | FunctionParameterToken
  | ResourcePathToken
  | CollectionNavigationToken
  | CollectionNavigationPathToken
  | SingleNavigationToken
  | PropertyPathToken
  | ComplexPathToken
  | BoundOperationToken
  | BoundActionCallToken
  | BoundEntityFunctionCallToken
  | BoundEntityCollectionFunctionCallToken
  | BoundComplexFunctionCallToken
  | BoundComplexCollectionFunctionCallToken
  | BoundPrimitiveFunctionCallToken
  | BoundPrimitiveCollectionFunctionCallToken
  | ODataUriToken
  | BatchToken
  | EntityToken
  | MetadataToken;

export type TokenType = Token['type'];

export type LexerToken = Token;

export type PartialToken = {
  [P in Token['type']]: Pick<Extract<Token, { type: P }>, 'type' | 'value' | 'position' | 'next'>;
}[Token['type']];

export function tokenize<T extends TokenType>(
  token: PartialToken & { type: T },
  source: SourceArray,
  metadataContextContainer?: Token
): Token & { type: T } {
  const raw = Utils.stringify(source, token.position, token.next);
  const metadata = metadataContextContainer?.metadata;
  return { ...token, raw, metadata };
}

export function clone(token): Token {
  return {
    position: token.position,
    next: token.next,
    value: token.value,
    type: token.type,
    raw: token.raw
  };
}

// core definitions
export function ALPHA(value: number): boolean {
  return (
    (value >= 0x41 && value <= 0x5a) ||
    (value >= 0x61 && value <= 0x7a) ||
    value >= 0x80
  );
}
export function DIGIT(value: number): boolean {
  return value >= 0x30 && value <= 0x39;
}
export function HEXDIG(value: number): boolean {
  return DIGIT(value) || AtoF(value);
}
export function AtoF(value: number): boolean {
  return (value >= 0x41 && value <= 0x46) || (value >= 0x61 && value <= 0x66);
}
export function DQUOTE(value: number): boolean {
  return value === 0x22;
}
export function SP(value: number): boolean {
  return value === 0x20;
}
export function HTAB(value: number): boolean {
  return value === 0x09;
}
export function VCHAR(value: number): boolean {
  return value >= 0x21 && value <= 0x7e;
}

// punctuation
export function whitespaceLength(value, index) {
  if (Utils.equals(value, index, '%20') || Utils.equals(value, index, '%09')) {
    return 3;
  } else if (
    SP(value[index]) ||
    HTAB(value[index]) ||
    value[index] === 0x20 ||
    value[index] === 0x09
  ) {
    return 1;
  }
}

export function OWS(value: SourceArray, index: number): number {
  index = index || 0;
  let inc = whitespaceLength(value, index);
  while (inc) {
    index += inc;
    inc = whitespaceLength(value, index);
  }
  return index;
}
export function RWS(value: SourceArray, index: number): number {
  return OWS(value, index);
}
export function BWS(value: SourceArray, index: number): number {
  return OWS(value, index);
}

export function AT(value: SourceArray, index: number): number {
  if (value[index] === 0x40) {
    return index + 1;
  } else if (Utils.equals(value, index, '%40')) {
    return index + 3;
  }
}
export function COLON(value: SourceArray, index: number): number {
  if (value[index] === 0x3a) {
    return index + 1;
  } else if (Utils.equals(value, index, '%3A')) {
    return index + 3;
  }
}
export function COMMA(value: SourceArray, index: number): number {
  if (value[index] === 0x2c) {
    return index + 1;
  } else if (Utils.equals(value, index, '%2C')) {
    return index + 3;
  }
}
export function EQ(value: SourceArray, index: number): number {
  if (value[index] === 0x3d) {
    return index + 1;
  }
}
export function SIGN(value: SourceArray, index: number): number {
  if (value[index] === 0x2b || value[index] === 0x2d) {
    return index + 1;
  } else if (Utils.equals(value, index, '%2B')) {
    return index + 3;
  }
}
export function SEMI(value: SourceArray, index: number): number {
  if (value[index] === 0x3b) {
    return index + 1;
  } else if (Utils.equals(value, index, '%3B')) {
    return index + 3;
  }
}
export function STAR(value: SourceArray, index: number): number {
  if (value[index] === 0x2a) {
    return index + 1;
  } else if (Utils.equals(value, index, '%2A')) {
    return index + 3;
  }
}
export function SQUOTE(value: SourceArray, index: number): number {
  if (value[index] === 0x27) {
    return index + 1;
  } else if (Utils.equals(value, index, '%27')) {
    return index + 3;
  }
}
export function OPEN(value: SourceArray, index: number): number {
  if (value[index] === 0x28) {
    return index + 1;
  } else if (Utils.equals(value, index, '%28')) {
    return index + 3;
  }
}
export function CLOSE(value: SourceArray, index: number): number {
  if (value[index] === 0x29) {
    return index + 1;
  } else if (Utils.equals(value, index, '%29')) {
    return index + 3;
  }
}
// unreserved ALPHA / DIGIT / "-" / "." / "_" / "~"
export function unreserved(value: number): boolean {
  return (
    ALPHA(value) ||
    DIGIT(value) ||
    value === 0x2d ||
    value === 0x2e ||
    value === 0x5f ||
    value === 0x7e
  );
}
// other-delims "!" /                   "(" / ")" / "*" / "+" / "," / ";"
export function otherDelims(value: SourceArray, index: number): number {
  if (value[index] === 0x21 || value[index] === 0x2b) {
    return index + 1;
  }
  return (
    OPEN(value, index) ||
    CLOSE(value, index) ||
    STAR(value, index) ||
    COMMA(value, index) ||
    SEMI(value, index)
  );
}
// sub-delims     =       "$" / "&" / "'" /                                     "=" / other-delims
export function subDelims(value: SourceArray, index: number): number {
  if (value[index] === 0x24 || value[index] === 0x26) {
    return index + 1;
  }
  return SQUOTE(value, index) || EQ(value, index) || otherDelims(value, index);
}
export function pctEncoded(value: SourceArray, index: number): number {
  if (
    value[index] !== 0x25 ||
    !HEXDIG(value[index + 1]) ||
    !HEXDIG(value[index + 2])
  ) {
    return index;
  }
  return index + 3;
}
// pct-encoded-no-SQUOTE = "%" ( "0" / "1" /   "3" / "4" / "5" / "6" / "8" / "9" / A-to-F ) HEXDIG
//                       / "%" "2" ( "0" / "1" / "2" / "3" / "4" / "5" / "6" /   "8" / "9" / A-to-F )
export function pctEncodedNoSQUOTE(value: SourceArray, index: number): number {
  if (Utils.equals(value, index, '%27')) {
    return index;
  }
  return pctEncoded(value, index);
}
export function pctEncodedUnescaped(value: SourceArray, index: number): number {
  if (
    Utils.equals(value, index, '%22') ||
    Utils.equals(value, index, '%3') ||
    Utils.equals(value, index, '%4') ||
    Utils.equals(value, index, '%5C')
  ) {
    return index;
  }
  return pctEncoded(value, index);
}
export function pchar(value: SourceArray, index: number): number {
  if (unreserved(value[index])) {
    return index + 1;
  }
  return (
    subDelims(value, index) ||
    COLON(value, index) ||
    AT(value, index) ||
    pctEncoded(value, index) ||
    index
  );
}

export function pcharNoSQUOTE(value: SourceArray, index: number): number {
  if (
    unreserved(value[index]) ||
    value[index] === 0x24 ||
    value[index] === 0x26
  ) {
    return index + 1;
  }
  return VCHAR(value[index]) === true ? index + 1 : index;
}
export function qcharNoAMP(value: SourceArray, index: number): number {
  if (
    unreserved(value[index]) ||
    value[index] === 0x3a ||
    value[index] === 0x40 ||
    value[index] === 0x2f ||
    value[index] === 0x3f ||
    value[index] === 0x24 ||
    value[index] === 0x27 ||
    value[index] === 0x3d
  ) {
    return index + 1;
  }
  return pctEncoded(value, index) || otherDelims(value, index) || index;
}
export function qcharNoAMPDQUOTE(value: SourceArray, index: number): number {
  index = BWS(value, index);
  if (
    unreserved(value[index]) ||
    value[index] === 0x3a ||
    value[index] === 0x40 ||
    value[index] === 0x2f ||
    value[index] === 0x3f ||
    value[index] === 0x24 ||
    value[index] === 0x27 ||
    value[index] === 0x3d
  ) {
    return index + 1;
  }
  return otherDelims(value, index) || pctEncodedUnescaped(value, index);
}
// export function pchar(value:number):boolean { return unreserved(value) || otherDelims(value) || value == 0x24 || value == 0x26 || EQ(value) || COLON(value) || AT(value); }
export function base64char(value: number): boolean {
  return ALPHA(value) || DIGIT(value) || value === 0x2d || value === 0x5f;
}
export function base64b16(value: SourceArray, index: number): number {
  const start = index;
  if (!base64char(value[index]) && !base64char(value[index + 1])) {
    return start;
  }
  index += 2;

  if (!Utils.is(value[index], 'AEIMQUYcgkosw048')) {
    return start;
  }
  index++;

  if (value[index] === 0x3d) {
    index++;
  }
  return index;
}
export function base64b8(value: SourceArray, index: number): number {
  const start = index;
  if (!base64char(value[index])) {
    return start;
  }
  index++;

  if (
    value[index] !== 0x41 ||
    value[index] !== 0x51 ||
    value[index] !== 0x67 ||
    value[index] !== 0x77
  ) {
    return start;
  }
  index++;

  if (value[index] === 0x3d && value[index + 1] === 0x3d) {
    index += 2;
  }
  return index;
}
export function nanInfinity(value: SourceArray, index: number): number {
  return (
    Utils.equals(value, index, 'NaN') ||
    Utils.equals(value, index, '-INF') ||
    Utils.equals(value, index, 'INF')
  );
}
export function oneToNine(value: number): boolean {
  return value !== 0x30 && DIGIT(value);
}
export function zeroToFiftyNine(value: SourceArray, index: number): number {
  if (value[index] >= 0x30 && value[index] <= 0x35 && DIGIT(value[index + 1])) {
    return index + 2;
  }
  return index;
}
export function year(value: SourceArray, index: number): number {
  const start = index;
  let end = index;
  if (value[index] === 0x2d) {
    index++;
  }
  if (
    (value[index] === 0x30 &&
      (end = Utils.required(value, index + 1, DIGIT, 3, 3))) ||
    (oneToNine(value[index]) &&
      (end = Utils.required(value, index + 1, DIGIT, 3)))
  ) {
    return end;
  }
  return start;
}
export function month(value: SourceArray, index: number): number {
  if (
    (value[index] === 0x30 && oneToNine(value[index + 1])) ||
    (value[index] === 0x31 &&
      value[index + 1] >= 0x30 &&
      value[index + 1] <= 0x32)
  ) {
    return index + 2;
  }
  return index;
}
export function day(value: SourceArray, index: number): number {
  if (
    (value[index] === 0x30 && oneToNine(value[index + 1])) ||
    ((value[index] === 0x31 || value[index] === 0x32) &&
      DIGIT(value[index + 1])) ||
    (value[index] === 0x33 &&
      (value[index + 1] === 0x30 || value[index + 1] === 0x31))
  ) {
    return index + 2;
  }
  return index;
}
export function hour(value: SourceArray, index: number): number {
  if (
    ((value[index] === 0x30 || value[index] === 0x31) &&
      DIGIT(value[index + 1])) ||
    (value[index] === 0x32 &&
      (value[index + 1] === 0x30 ||
        value[index + 1] === 0x31 ||
        value[index + 1] === 0x32 ||
        value[index + 1] === 0x33))
  ) {
    return index + 2;
  }
  return index;
}
export function minute(value: SourceArray, index: number): number {
  return zeroToFiftyNine(value, index);
}
export function second(value: SourceArray, index: number): number {
  return zeroToFiftyNine(value, index);
}
export function fractionalSeconds(value: SourceArray, index: number): number {
  return Utils.required(value, index, DIGIT, 1, 12);
}
export function geographyPrefix(value: SourceArray, index: number): number {
  return Utils.equals(value, index, 'geography') ? index + 9 : index;
}
export function geometryPrefix(value: SourceArray, index: number): number {
  return Utils.equals(value, index, 'geometry') ? index + 8 : index;
}
export function identifierLeadingCharacter(value: number): boolean {
  return ALPHA(value) || value === 0x5f;
}
export function identifierCharacter(value: number): boolean {
  return identifierLeadingCharacter(value) || DIGIT(value);
}
export function beginObject(value: SourceArray, index: number): number {
  let bws = BWS(value, index);
  const start = index;
  index = bws;
  if (Utils.equals(value, index, '{')) {
    index++;
  } else if (Utils.equals(value, index, '%7B')) {
    index += 3;
  }
  if (index === bws) {
    return start;
  }

  bws = BWS(value, index);
  return bws;
}
export function endObject(value: SourceArray, index: number): number {
  let bws = BWS(value, index);
  const start = index;
  index = bws;
  if (Utils.equals(value, index, '}')) {
    index++;
  } else if (Utils.equals(value, index, '%7D')) {
    index += 3;
  }
  if (index === bws) {
    return start;
  }

  bws = BWS(value, index);
  return bws;
}
export function beginArray(value: SourceArray, index: number): number {
  let bws = BWS(value, index);
  const start = index;
  index = bws;
  if (Utils.equals(value, index, '[')) {
    index++;
  } else if (Utils.equals(value, index, '%5B')) {
    index += 3;
  }
  if (index === bws) {
    return start;
  }

  bws = BWS(value, index);
  return bws;
}
export function endArray(value: SourceArray, index: number): number {
  let bws = BWS(value, index);
  const start = index;
  index = bws;
  if (Utils.equals(value, index, ']')) {
    index++;
  } else if (Utils.equals(value, index, '%5D')) {
    index += 3;
  }
  if (index === bws) {
    return start;
  }

  bws = BWS(value, index);
  return bws;
}
export function quotationMark(value: SourceArray, index: number): number {
  if (DQUOTE(value[index])) {
    return index + 1;
  }
  if (Utils.equals(value, index, '%22')) {
    return index + 3;
  }
  return index;
}
export function nameSeparator(value: SourceArray, index: number): number {
  let bws = BWS(value, index);
  const start = index;
  index = bws;
  const colon = COLON(value, index);
  if (!colon) {
    return start;
  }
  index = colon;
  bws = BWS(value, index);
  return bws;
}
export function valueSeparator(value: SourceArray, index: number): number {
  let bws = BWS(value, index);
  const start = index;
  index = bws;
  const comma = COMMA(value, index);
  if (!comma) {
    return start;
  }
  index = comma;
  bws = BWS(value, index);
  return bws;
}
export function escape(value: SourceArray, index: number): number {
  if (Utils.equals(value, index, '\\')) {
    return index + 1;
  }
  if (Utils.equals(value, index, '%5C')) {
    return index + 3;
  }
  return index;
}
