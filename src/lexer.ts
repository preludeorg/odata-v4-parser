import Utils, { SourceArray } from './utils';

type BaseToken = {
  position: number;
  next: number;
  /** raw string of token */
  raw: string;
  metadata?: any;
};

type LiteralToken = BaseToken & { type: 'Literal'; value: string };
type ArrayOrObjectToken = BaseToken & { type: 'ArrayOrObject'; value: object | any[] };
type ArrayToken = BaseToken & { type: 'Array'; value: any[] };
type ObjectToken = BaseToken & { type: 'Object'; value: any[] };
type PropertyToken = BaseToken & { type: 'Property'; value: string };
type AnnotationToken = BaseToken & { type: 'Annotation'; value: string };
type EnumToken = BaseToken & { type: 'Enum'; value: string };
type EnumValueToken = BaseToken & { type: 'EnumValue'; value: string };
type EnumMemberValueToken = BaseToken & { type: 'EnumMemberValue'; value: string };
type IdentifierToken = BaseToken & { type: 'Identifier'; value: string };
type QualifiedEntityTypeNameToken = BaseToken & { type: 'QualifiedEntityTypeName'; value: string };
type QualifiedComplexTypeNameToken = BaseToken & { type: 'QualifiedComplexTypeName'; value: string };
type ODataIdentifierToken = BaseToken & { type: 'ODataIdentifier'; value: string };
type CollectionToken = BaseToken & { type: 'Collection'; value: Token[] };
type NamespacePartToken = BaseToken & { type: 'NamespacePart'; value: Token[] };
type EntitySetNameToken = BaseToken & { type: 'EntitySetName'; value: string };
type SingletonEntityToken = BaseToken & { type: 'SingletonEntity'; value: string };
type ComplexTypeNameToken = BaseToken & { type: 'ComplexTypeName'; value: string };
type TypeDefinitionNameToken = BaseToken & { type: 'TypeDefinitionName'; value: string };
type EnumerationTypeNameToken = BaseToken & { type: 'EnumerationTypeName'; value: string };
type EnumerationMemberToken = BaseToken & { type: 'EnumerationMember'; value: string };
type TermNameToken = BaseToken & { type: 'TermName'; value: string };
type PrimitivePropertyToken = BaseToken & { type: 'PrimitiveProperty'; value: string };
type PrimitiveKeyPropertyToken = BaseToken & { type: 'PrimitiveKeyProperty'; value: string };
type PrimitiveNonKeyPropertyToken = BaseToken & { type: 'PrimitiveNonKeyProperty'; value: string };
type PrimitiveCollectionPropertyToken = BaseToken & { type: 'PrimitiveCollectionProperty'; value: string };
type ComplexPropertyToken = BaseToken & { type: 'ComplexProperty'; value: string };
type StreamPropertyToken = BaseToken & { type: 'StreamProperty'; value: string };
type NavigationPropertyToken = BaseToken & { type: 'NavigationProperty'; value: string };
type EntityNavigationPropertyToken = BaseToken & { type: 'EntityNavigationProperty'; value: string };
type EntityCollectionNavigationPropertyToken = BaseToken & { type: 'EntityCollectionNavigationProperty'; value: string };
type ActionToken = BaseToken & { type: 'Action'; value: string };
type ActionImportToken = BaseToken & { type: 'ActionImport'; value: string };
type FunctionToken = BaseToken & { type: 'Function'; value: string };
type EntityFunctionToken = BaseToken & { type: 'EntityFunction'; value: string };
type EntityCollectionFunctionToken = BaseToken & { type: 'EntityCollectionFunction'; value: string };
type ComplexFunctionToken = BaseToken & { type: 'ComplexFunction'; value: string };
type ComplexCollectionFunctionToken = BaseToken & { type: 'ComplexCollectionFunction'; value: string };
type PrimitiveFunctionToken = BaseToken & { type: 'PrimitiveFunction'; value: string };
type PrimitiveCollectionFunctionToken = BaseToken & { type: 'PrimitiveCollectionFunction'; value: string };
type ComplexCollectionFunctionImportToken = BaseToken & { type: 'ComplexCollectionFunctionImport'; value: string };
type PrimitiveFunctionImportToken = BaseToken & { type: 'PrimitiveFunctionImport'; value: string };
type CommonExpressionToken = BaseToken & { type: 'CommonExpression'; value: string };
type AndExpressionToken = BaseToken & { type: 'AndExpression'; value: { left: Token, right: Token } };
type OrExpressionToken = BaseToken & { type: 'OrExpression'; value: { left: Token, right: Token } };
type EqualsExpressionToken = BaseToken & { type: 'EqualsExpression'; value: string };
type NotEqualsExpressionToken = BaseToken & { type: 'NotEqualsExpression'; value: string };
type LesserThanExpressionToken = BaseToken & { type: 'LesserThanExpression'; value: string };
type LesserOrEqualsExpressionToken = BaseToken & { type: 'LesserOrEqualsExpression'; value: string };
type GreaterThanExpressionToken = BaseToken & { type: 'GreaterThanExpression'; value: string };
type GreaterOrEqualsExpressionToken = BaseToken & { type: 'GreaterOrEqualsExpression'; value: string };
type HasExpressionToken = BaseToken & { type: 'HasExpression'; value: string };
type AddExpressionToken = BaseToken & { type: 'AddExpression'; value: string };
type SubExpressionToken = BaseToken & { type: 'SubExpression'; value: string };
type MulExpressionToken = BaseToken & { type: 'MulExpression'; value: string };
type DivExpressionToken = BaseToken & { type: 'DivExpression'; value: string };
type ModExpressionToken = BaseToken & { type: 'ModExpression'; value: string };
type NotExpressionToken = BaseToken & { type: 'NotExpression'; value: string };
type BoolParenExpressionToken = BaseToken & { type: 'BoolParenExpression'; value: string };
type ParenExpressionToken = BaseToken & { type: 'ParenExpression'; value: string };
type MethodCallExpressionToken = BaseToken & { type: 'MethodCallExpression'; value: string };
type IsOfExpressionToken = BaseToken & { type: 'IsOfExpression'; value: string };
type CastExpressionToken = BaseToken & { type: 'CastExpression'; value: string };
type NegateExpressionToken = BaseToken & { type: 'NegateExpression'; value: string };
type FirstMemberExpressionToken = BaseToken & { type: 'FirstMemberExpression'; value: string };
type MemberExpressionToken = BaseToken & { type: 'MemberExpression'; value: string };
type PropertyPathExpressionToken = BaseToken & { type: 'PropertyPathExpression'; value: string };
type ImplicitVariableExpressionToken = BaseToken & { type: 'ImplicitVariableExpression'; value: string };
type LambdaVariableToken = BaseToken & { type: 'LambdaVariable'; value: string };
type LambdaVariableExpressionToken = BaseToken & { type: 'LambdaVariableExpression'; value: string };
type LambdaPredicateExpressionToken = BaseToken & { type: 'LambdaPredicateExpression'; value: string };
type AnyExpressionToken = BaseToken & { type: 'AnyExpression'; value: string };
type AllExpressionToken = BaseToken & { type: 'AllExpression'; value: string };
type CollectionNavigationExpressionToken = BaseToken & { type: 'CollectionNavigationExpression'; value: string };
type SimpleKeyToken = BaseToken & { type: 'SimpleKey'; value: string };
type CompoundKeyToken = BaseToken & { type: 'CompoundKey'; value: string };
type KeyValuePairToken = BaseToken & { type: 'KeyValuePair'; value: string };
type KeyPropertyValueToken = BaseToken & { type: 'KeyPropertyValue'; value: string };
type KeyPropertyAliasToken = BaseToken & { type: 'KeyPropertyAlias'; value: string };
type SingleNavigationExpressionToken = BaseToken & { type: 'SingleNavigationExpression'; value: string };
type CollectionPathExpressionToken = BaseToken & { type: 'CollectionPathExpression'; value: string };
type ComplexPathExpressionToken = BaseToken & { type: 'ComplexPathExpression'; value: string };
type SinglePathExpressionToken = BaseToken & { type: 'SinglePathExpression'; value: string };
type FunctionExpressionToken = BaseToken & { type: 'FunctionExpression'; value: string };
type FunctionExpressionParametersToken = BaseToken & { type: 'FunctionExpressionParameters'; value: string };
type FunctionExpressionParameterToken = BaseToken & { type: 'FunctionExpressionParameter'; value: string };
type ParameterNameToken = BaseToken & { type: 'ParameterName'; value: string };
type ParameterAliasToken = BaseToken & { type: 'ParameterAlias'; value: string };
type ParameterValueToken = BaseToken & { type: 'ParameterValue'; value: string };
type CountExpressionToken = BaseToken & { type: 'CountExpression'; value: string };
type RefExpressionToken = BaseToken & { type: 'RefExpression'; value: string };
type ValueExpressionToken = BaseToken & { type: 'ValueExpression'; value: string };
type RootExpressionToken = BaseToken & { type: 'RootExpression'; value: string };
type QueryOptionsToken = BaseToken & { type: 'QueryOptions'; value: string };
type CustomQueryOptionToken = BaseToken & { type: 'CustomQueryOption'; value: string };
type ExpandToken = BaseToken & { type: 'Expand'; value: string };
type ExpandItemToken = BaseToken & { type: 'ExpandItem'; value: string };
type ExpandPathToken = BaseToken & { type: 'ExpandPath'; value: string };
type ExpandCountOptionToken = BaseToken & { type: 'ExpandCountOption'; value: string };
type ExpandRefOptionToken = BaseToken & { type: 'ExpandRefOption'; value: string };
type ExpandOptionToken = BaseToken & { type: 'ExpandOption'; value: string };
type LevelsToken = BaseToken & { type: 'Levels'; value: string };
type SearchToken = BaseToken & { type: 'Search'; value: string };
type SearchExpressionToken = BaseToken & { type: 'SearchExpression'; value: string };
type SearchParenExpressionToken = BaseToken & { type: 'SearchParenExpression'; value: string };
type SearchNotExpressionToken = BaseToken & { type: 'SearchNotExpression'; value: string };
type SearchOrExpressionToken = BaseToken & { type: 'SearchOrExpression'; value: string };
type SearchAndExpressionToken = BaseToken & { type: 'SearchAndExpression'; value: string };
type SearchTermToken = BaseToken & { type: 'SearchTerm'; value: string };
type SearchPhraseToken = BaseToken & { type: 'SearchPhrase'; value: string };
type SearchWordToken = BaseToken & { type: 'SearchWord'; value: string };
type FilterToken = BaseToken & { type: 'Filter'; value: string };
type OrderByToken = BaseToken & { type: 'OrderBy'; value: string };
type OrderByItemToken = BaseToken & { type: 'OrderByItem'; value: string };
type SkipToken = BaseToken & { type: 'Skip'; value: string };
type TopToken = BaseToken & { type: 'Top'; value: string };
type FormatToken = BaseToken & { type: 'Format'; value: string };
type InlineCountToken = BaseToken & { type: 'InlineCount'; value: string };
type SelectToken = BaseToken & { type: 'Select'; value: string };
type SelectItemToken = BaseToken & { type: 'SelectItem'; value: string };
type SelectPathToken = BaseToken & { type: 'SelectPath'; value: string };
type AliasAndValueToken = BaseToken & { type: 'AliasAndValue'; value: string };
type SkipTokenToken = BaseToken & { type: 'SkipToken'; value: string };
type IdToken = BaseToken & { type: 'Id'; value: string };
type CrossjoinToken = BaseToken & { type: 'Crossjoin'; value: string };
type AllResourceToken = BaseToken & { type: 'AllResource'; value: string };
type ActionImportCallToken = BaseToken & { type: 'ActionImportCall'; value: string };
type FunctionImportCallToken = BaseToken & { type: 'FunctionImportCall'; value: string };
type EntityCollectionFunctionImportCallToken = BaseToken & { type: 'EntityCollectionFunctionImportCall'; value: string };
type EntityFunctionImportCallToken = BaseToken & { type: 'EntityFunctionImportCall'; value: string };
type ComplexCollectionFunctionImportCallToken = BaseToken & { type: 'ComplexCollectionFunctionImportCall'; value: string };
type ComplexFunctionImportCallToken = BaseToken & { type: 'ComplexFunctionImportCall'; value: string };
type PrimitiveCollectionFunctionImportCallToken = BaseToken & { type: 'PrimitiveCollectionFunctionImportCall'; value: string };
type PrimitiveFunctionImportCallToken = BaseToken & { type: 'PrimitiveFunctionImportCall'; value: string };
type FunctionParametersToken = BaseToken & { type: 'FunctionParameters'; value: string };
type FunctionParameterToken = BaseToken & { type: 'FunctionParameter'; value: string };
type ResourcePathToken = BaseToken & { type: 'ResourcePath'; value: string };
type CollectionNavigationToken = BaseToken & { type: 'CollectionNavigation'; value: string };
type CollectionNavigationPathToken = BaseToken & { type: 'CollectionNavigationPath'; value: string };
type SingleNavigationToken = BaseToken & { type: 'SingleNavigation'; value: string };
type PropertyPathToken = BaseToken & { type: 'PropertyPath'; value: string };
type ComplexPathToken = BaseToken & { type: 'ComplexPath'; value: string };
type BoundOperationToken = BaseToken & { type: 'BoundOperation'; value: string };
type BoundActionCallToken = BaseToken & { type: 'BoundActionCall'; value: string };
type BoundEntityFunctionCallToken = BaseToken & { type: 'BoundEntityFunctionCall'; value: string };
type BoundEntityCollectionFunctionCallToken = BaseToken & { type: 'BoundEntityCollectionFunctionCall'; value: string };
type BoundComplexFunctionCallToken = BaseToken & { type: 'BoundComplexFunctionCall'; value: string };
type BoundComplexCollectionFunctionCallToken = BaseToken & { type: 'BoundComplexCollectionFunctionCall'; value: string };
type BoundPrimitiveFunctionCallToken = BaseToken & { type: 'BoundPrimitiveFunctionCall'; value: string };
type BoundPrimitiveCollectionFunctionCallToken = BaseToken & { type: 'BoundPrimitiveCollectionFunctionCall'; value: string };
type ODataUriToken = BaseToken & { type: 'ODataUri'; value: string };
type BatchToken = BaseToken & { type: 'Batch'; value: string };
type EntityToken = BaseToken & { type: 'Entity'; value: string };
type MetadataToken = BaseToken & { type: 'Metadata'; value: string };

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
  | ComplexCollectionFunctionImportToken
  | PrimitiveFunctionImportToken
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

type PartialToken = {
  [P in Token['type']]: Pick<Extract<Token, { type: P }>, 'type' | 'value' | 'position' | 'next'>;
}[Token['type']];

export function tokenize(
  token: PartialToken,
  source: SourceArray,
  metadataContextContainer?: Token
): Token {
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
