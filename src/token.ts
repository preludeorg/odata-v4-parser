import { PrimitiveTypeEnum } from '@odata/metadata';
import utils, { SourceArray } from './utils';

interface IToken<Type extends string = string, Value = any> {
  position: number;
  next: number;
  type: Type;
  value: Value;
  /**
   * raw string of token
   */
  raw: string;
  metadata: any;
}

export class Token<Type extends string = string, Value = any> implements IToken<Type, Value> {
  position: number;
  next: number;
  type: Type;
  value: Value;
  raw: string;
  metadata: any;

  constructor({
    type,
    value,
    position,
    next,
    raw,
    metadata
  }: {
    position: number;
    next: number;
    value: Value;
    type: Type;
    raw: string,
    metadata?: any
  }) {
    this.type = type;
    this.value = value;
    this.position = position;
    this.next = next;
    this.raw = raw;
    this.metadata = metadata;
  }
}

type Tokenize<T extends TokenType> = Pick<
  LexerToken & { type: T },
  'type' | 'value' | 'position' | 'next'
>;

type TokenizeOptions<T extends TokenType> = Tokenize<T> & {
  source: SourceArray,
  metadata?: Token
};

export const tokenize = <T extends TokenType>({
  source,
  metadata: metadataContextContainer,
  ...token
}: TokenizeOptions<T>): Token<Tokenize<T>['type'], Tokenize<T>['value']> => {
  const raw = utils.stringify(source, token.position, token.next);
  const metadata = metadataContextContainer?.metadata;

  return new Token({
    type: token.type,
    value: token.value,
    position: token.position,
    next: token.next,
    raw,
    metadata
  });
};

export const clone = <T extends LexerToken>(token: T): Token<T['type'], T['value']> =>
  new Token({
    type: token.type,
    value: token.value,
    position: token.position,
    next: token.next,
    raw: token.raw,
    metadata: token.metadata
  });

type NamedValue = { name: string };

type NamespacedNamedValue = { name: string; namespace?: string };

type LeftRightExpressionValue<
  L extends LexerToken = LexerToken,
  R extends LexerToken = LexerToken
> = { left: L; right: R };

export type LiteralToken = IToken<'Literal', PrimitiveTypeEnum | string>;
export type ArrayOrObjectToken = IToken<'ArrayOrObject', object | any[]>;
export type ArrayToken = IToken<'Array', any[]>;
export type ObjectToken = IToken<'Object', any[]>;
export type PropertyToken = IToken<'Property', string>;
export type AnnotationToken = IToken<'Annotation', string>;
export type EnumToken = IToken<'Enum', { name: IdentifierToken; value: EnumValueToken }>;
export type EnumValueToken = IToken<'EnumValue', { values: (EnumerationMemberToken | EnumMemberValueToken)[]}>;
export type EnumMemberValueToken = IToken<'EnumMemberValue', string>;
export type IdentifierToken = IToken<'Identifier', string>;
export type QualifiedEntityTypeNameToken = IToken<'QualifiedEntityTypeName', EntityTypeNameToken>;
export type QualifiedComplexTypeNameToken = IToken<'QualifiedComplexTypeName', ComplexTypeNameToken>;
export type ODataIdentifierToken = IToken<'ODataIdentifier', NamedValue>;
export type CollectionToken = IToken<'Collection', IToken<string, unknown>[]>;
export type NamespacePartToken = IToken<'NamespacePart', NamedValue | IToken<string, unknown>[]>;
export type EntitySetNameToken = IToken<'EntitySetName', NamedValue>;
export type SingletonEntityToken = IToken<'SingletonEntity', NamedValue>;
export type EntityTypeNameToken = IToken<'EntityTypeName', NamespacedNamedValue>;
export type ComplexTypeNameToken = IToken<'ComplexTypeName', NamespacedNamedValue>;
export type TypeDefinitionNameToken = IToken<'TypeDefinitionName', NamedValue>;
export type EnumerationTypeNameToken = IToken<'EnumerationTypeName', NamedValue>;
export type EnumerationMemberToken = IToken<'EnumerationMember', NamedValue>;
export type TermNameToken = IToken<'TermName', NamedValue>;
export type PrimitivePropertyToken = IToken<'PrimitiveProperty', NamedValue>;
export type PrimitiveKeyPropertyToken = IToken<'PrimitiveKeyProperty', string>;
export type PrimitiveNonKeyPropertyToken = IToken<'PrimitiveNonKeyProperty', string>;
export type PrimitiveCollectionPropertyToken = IToken<'PrimitiveCollectionProperty', NamedValue>;
export type ComplexPropertyToken = IToken<'ComplexProperty', NamedValue>;
export type ComplexCollectionPropertyToken = IToken<'ComplexCollectionProperty', NamedValue>;
export type StreamPropertyToken = IToken<'StreamProperty', NamedValue>;
export type NavigationPropertyToken = IToken<'NavigationProperty', string>;
export type EntityNavigationPropertyToken = IToken<'EntityNavigationProperty', NamedValue>;
export type EntityCollectionNavigationPropertyToken = IToken<'EntityCollectionNavigationProperty', NamedValue>;
export type ActionToken = IToken<'Action', ActionToken | NamespacedNamedValue>;
export type ActionImportToken = IToken<'ActionImport', NamedValue>;
export type FunctionToken = IToken<'Function', { name: EntityFunctionToken | EntityCollectionFunctionToken | ComplexFunctionToken | ComplexCollectionFunctionToken | PrimitiveFunctionToken | PrimitiveCollectionFunctionToken; parameters: ParameterNameToken[] }>;
export type EntityFunctionToken = IToken<'EntityFunction', NamespacedNamedValue>;
export type EntityCollectionFunctionToken = IToken<'EntityCollectionFunction', NamespacedNamedValue>;
export type ComplexFunctionToken = IToken<'ComplexFunction', NamespacedNamedValue>;
export type ComplexCollectionFunctionToken = IToken<'ComplexCollectionFunction', NamespacedNamedValue>;
export type PrimitiveFunctionToken = IToken<'PrimitiveFunction', NamespacedNamedValue>;
export type PrimitiveCollectionFunctionToken = IToken<'PrimitiveCollectionFunction', NamespacedNamedValue>;
export type EntityFunctionImportToken = IToken<'EntityFunctionImport', NamedValue>;
export type EntityCollectionFunctionImportToken = IToken<'EntityCollectionFunctionImport', NamedValue>;
export type ComplexFunctionImportToken = IToken<'ComplexFunctionImport', NamedValue>;
export type ComplexCollectionFunctionImportToken = IToken<'ComplexCollectionFunctionImport', NamedValue>;
export type PrimitiveFunctionImportToken = IToken<'PrimitiveFunctionImport', NamedValue>;
export type PrimitiveCollectionFunctionImportToken = IToken<'PrimitiveCollectionFunctionImport', NamedValue>;
export type CommonExpressionToken = IToken<'CommonExpression', IToken>;
export type AndExpressionToken = IToken<'AndExpression', LeftRightExpressionValue>;
export type OrExpressionToken = IToken<'OrExpression', LeftRightExpressionValue>;
export type EqualsExpressionToken = IToken<'EqualsExpression', LeftRightExpressionValue>;
export type NotEqualsExpressionToken = IToken<'NotEqualsExpression', string>;
export type LesserThanExpressionToken = IToken<'LesserThanExpression', string>;
export type LesserOrEqualsExpressionToken = IToken<'LesserOrEqualsExpression', string>;
export type GreaterThanExpressionToken = IToken<'GreaterThanExpression', string>;
export type GreaterOrEqualsExpressionToken = IToken<'GreaterOrEqualsExpression', string>;
export type HasExpressionToken = IToken<'HasExpression', LeftRightExpressionValue>;
export type AddExpressionToken = IToken<'AddExpression', LeftRightExpressionValue>;
export type SubExpressionToken = IToken<'SubExpression', LeftRightExpressionValue>;
export type MulExpressionToken = IToken<'MulExpression', LeftRightExpressionValue>;
export type DivExpressionToken = IToken<'DivExpression', LeftRightExpressionValue>;
export type ModExpressionToken = IToken<'ModExpression', LeftRightExpressionValue>;
export type NotExpressionToken = IToken<'NotExpression', IToken>;
export type BoolParenExpressionToken = IToken<'BoolParenExpression', IToken>;
export type ParenExpressionToken = IToken<'ParenExpression', IToken>;
export type MethodCallExpressionToken = IToken<'MethodCallExpression', { method: string; parameters: IToken[] }>;
export type IsOfExpressionToken = IToken<'IsOfExpression', { target: CommonExpressionToken | undefined; typename: IdentifierToken | QualifiedEntityTypeNameToken | QualifiedComplexTypeNameToken | CollectionToken }>;
export type CastExpressionToken = IToken<'CastExpression', { target: CommonExpressionToken | undefined; typename: IdentifierToken | QualifiedEntityTypeNameToken | QualifiedComplexTypeNameToken | CollectionToken }>;
export type NegateExpressionToken = IToken<'NegateExpression', CommonExpressionToken>;
export type FirstMemberExpressionToken = IToken<'FirstMemberExpression', [ImplicitVariableExpressionToken | LambdaVariableExpressionToken, MemberExpressionToken] | ImplicitVariableExpressionToken | LambdaVariableExpressionToken | MemberExpressionToken>;
export type MemberExpressionToken = IToken<'MemberExpression', { name: QualifiedEntityTypeNameToken; value: FunctionExpressionToken | PropertyPathExpressionToken } | FunctionExpressionToken | PropertyPathExpressionToken>;
export type PropertyPathExpressionToken = IToken<'PropertyPathExpression', string>;
export type ImplicitVariableExpressionToken = IToken<'ImplicitVariableExpression', string>;
export type LambdaVariableToken = IToken<'LambdaVariable', string>;
export type LambdaVariableExpressionToken = IToken<'LambdaVariableExpression', string>;
export type LambdaPredicateExpressionToken = IToken<'LambdaPredicateExpression', CommonExpressionToken | AndExpressionToken | OrExpressionToken | NotExpressionToken | BoolParenExpressionToken | MethodCallExpressionToken | IsOfExpressionToken>;
export type AnyExpressionToken = IToken<'AnyExpression', { variable: LambdaVariableExpressionToken | undefined; predicate: LambdaPredicateExpressionToken | undefined }>;
export type AllExpressionToken = IToken<'AllExpression', { variable: LambdaVariableExpressionToken | undefined; predicate: LambdaPredicateExpressionToken | undefined }>;
export type CollectionNavigationExpressionToken = IToken<'CollectionNavigationExpression', { entity: QualifiedEntityTypeNameToken | undefined; predicate: SimpleKeyToken | CompoundKeyToken | undefined; navigation: SingleNavigationExpressionToken | undefined; path: CollectionPathExpressionToken | undefined }>;
export type SimpleKeyToken = IToken<'SimpleKey', { key: string; value: KeyPropertyValueToken }>;
export type CompoundKeyToken = IToken<'CompoundKey', KeyValuePairToken[]>;
export type KeyValuePairToken = IToken<'KeyValuePair', { key: PrimitiveKeyPropertyToken | KeyPropertyAliasToken, value: KeyPropertyValueToken }>;
export type KeyPropertyValueToken = IToken<'KeyPropertyValue', string>;
export type KeyPropertyAliasToken = IToken<'KeyPropertyAlias', string>;
export type SingleNavigationExpressionToken = IToken<'SingleNavigationExpression', MemberExpressionToken>;
export type CollectionPathExpressionToken = IToken<'CollectionPathExpression', AnyExpressionToken | AllExpressionToken | FunctionExpressionToken | CountExpressionToken>;
export type ComplexPathExpressionToken = IToken<'ComplexPathExpression', string>;
export type SinglePathExpressionToken = IToken<'SinglePathExpression', FunctionExpressionToken>;
export type FunctionExpressionToken = IToken<'FunctionExpression', string>;
export type FunctionExpressionParametersToken = IToken<'FunctionExpressionParameters', FunctionExpressionParameterToken[]>;
export type FunctionExpressionParameterToken = IToken<'FunctionExpressionParameter', { name: ParameterNameToken; value: ParameterAliasToken | ParameterValueToken }>;
export type ParameterNameToken = IToken<'ParameterName', string>;
export type ParameterAliasToken = IToken<'ParameterAlias', string>;
export type ParameterValueToken = IToken<'ParameterValue', string>;
export type CountExpressionToken = IToken<'CountExpression', string>;
export type RefExpressionToken = IToken<'RefExpression', string>;
export type ValueExpressionToken = IToken<'ValueExpression', string>;
export type RootExpressionToken = IToken<'RootExpression', { current: { entity: SingletonEntityToken } | { entitySet: EntitySetNameToken; keys: SimpleKeyToken | CompoundKeyToken }; next: SingleNavigationExpressionToken | undefined }>;
export type QueryOptionsToken = IToken<'QueryOptions', { options: QueryOption[] }>;
export type CustomQueryOptionToken = IToken<'CustomQueryOption', { key: string; value: string /* any */ }>;
export type ExpandToken = IToken<'Expand', { items: IToken[] }>;
export type ExpandItemToken = IToken<'ExpandItem', { path: string; levels?: LevelsToken; ref?: RefExpressionToken }>;
export type ExpandPathToken = IToken<'ExpandPath', (QualifiedEntityTypeNameToken | QualifiedComplexTypeNameToken | ComplexPropertyToken | ComplexCollectionPropertyToken | EntityNavigationPropertyToken | EntityCollectionNavigationPropertyToken)[]>;
export type ExpandCountOptionToken = IToken<'ExpandCountOption', string>;
export type ExpandRefOptionToken = IToken<'ExpandRefOption', string>;
export type ExpandOptionToken = IToken<'ExpandOption', string>;
export type LevelsToken = IToken<'Levels', string>;
export type SearchToken = IToken<'Search', SearchPhraseToken | SearchWordToken | SearchNotExpressionToken | SearchParenExpressionToken>;
export type SearchExpressionToken = IToken<'SearchExpression', string>;
export type SearchParenExpressionToken = IToken<'SearchParenExpression', SearchNotExpressionToken | SearchPhraseToken | SearchWordToken | SearchParenExpressionToken>;
export type SearchNotExpressionToken = IToken<'SearchNotExpression', SearchPhraseToken | SearchWordToken>;
export type SearchOrExpressionToken = IToken<'SearchOrExpression', SearchAndExpressionToken | SearchOrExpressionToken | SearchNotExpressionToken | SearchPhraseToken | SearchWordToken | SearchParenExpressionToken>;
export type SearchAndExpressionToken = IToken<'SearchAndExpression', SearchAndExpressionToken | SearchOrExpressionToken | SearchNotExpressionToken | SearchPhraseToken | SearchWordToken | SearchParenExpressionToken>;
export type SearchTermToken = IToken<'SearchTerm', string>;
export type SearchPhraseToken = IToken<'SearchPhrase', string>;
export type SearchWordToken = IToken<'SearchWord', string>;
export type FilterToken = IToken<'Filter', IsOfExpressionToken | MethodCallExpressionToken | NotExpressionToken | CommonExpressionToken | BoolParenExpressionToken | EqualsExpressionToken | OrExpressionToken | AndExpressionToken>;
export type OrderByToken = IToken<'OrderBy', { items: OrderByItemToken[] }>;
export type OrderByItemToken = IToken<'OrderByItem', { expr: CommonExpressionToken; direction: number }>;
export type SkipToken = IToken<'Skip', LiteralToken>;
export type TopToken = IToken<'Top', LiteralToken>;
export type FormatToken = IToken<'Format', { format: string }>;
export type InlineCountToken = IToken<'InlineCount', LiteralToken>;
export type SelectToken = IToken<'Select', { items: SelectItemToken[] }>;
export type SelectItemToken = IToken<'SelectItem', PrimitivePropertyToken | PrimitiveKeyPropertyToken | PrimitiveCollectionPropertyToken | EntityNavigationPropertyToken | EntityCollectionNavigationPropertyToken | ActionToken | FunctionToken | SelectPathToken | { value: string } | { namespace: string; value: string } | { name: QualifiedEntityTypeNameToken | QualifiedComplexTypeNameToken; value: PrimitivePropertyToken | PrimitiveKeyPropertyToken | PrimitiveCollectionPropertyToken | EntityNavigationPropertyToken | EntityCollectionNavigationPropertyToken | ActionToken | FunctionToken | SelectPathToken }>;
export type SelectPathToken = IToken<'SelectPath', string>;
export type AliasAndValueToken = IToken<'AliasAndValue', { alias: ParameterAliasToken; value: ParameterValueToken }>;
export type SkipTokenToken = IToken<'SkipToken', string>;
export type IdToken = IToken<'Id', string>;
export type CrossjoinToken = IToken<'Crossjoin', { names: EntitySetNameToken[] }>;
export type AllResourceToken = IToken<'AllResource', string>;
export type ActionImportCallToken = IToken<'ActionImportCall', ActionImportToken>;
export type FunctionImportCallToken = IToken<'FunctionImportCall', string>;
export type EntityCollectionFunctionImportCallToken = IToken<'EntityCollectionFunctionImportCall', FunctionImportValue>;
export type EntityFunctionImportCallToken = IToken<'EntityFunctionImportCall', FunctionImportValue>;
export type ComplexCollectionFunctionImportCallToken = IToken<'ComplexCollectionFunctionImportCall', FunctionImportValue>;
export type ComplexFunctionImportCallToken = IToken<'ComplexFunctionImportCall', FunctionImportValue>;
export type PrimitiveCollectionFunctionImportCallToken = IToken<'PrimitiveCollectionFunctionImportCall', FunctionImportValue>;
export type PrimitiveFunctionImportCallToken = IToken<'PrimitiveFunctionImportCall', FunctionImportValue>;
export type FunctionParametersToken = IToken<'FunctionParameters', FunctionParameterToken[]>;
export type FunctionParameterToken = IToken<'FunctionParameter', { name: ParameterNameToken; value: LiteralToken | EnumToken | ParameterAliasToken }>;
export type ResourcePathToken = IToken<'ResourcePath', { resource: EntitySetNameToken | EntityCollectionFunctionImportCallToken | SingletonEntityToken | EntityFunctionImportCallToken | ComplexCollectionFunctionImportCallToken | PrimitiveCollectionFunctionImportCallToken | ComplexFunctionImportCallToken | PrimitiveFunctionImportCallToken | CrossjoinToken | AllResourceToken | ActionImportCallToken; navigation: CollectionNavigationToken | SingleNavigationToken | CountExpressionToken | BoundOperationToken | ComplexPathToken | ValueExpressionToken | RefExpressionToken | undefined }>;
export type CollectionNavigationToken = IToken<'CollectionNavigation', { name: QualifiedEntityTypeNameToken | undefined; path: RefExpressionToken | CountExpressionToken | BoundOperationToken | CollectionNavigationPathToken | undefined }>;
export type CollectionNavigationPathToken = IToken<'CollectionNavigationPath', string>;
export type SingleNavigationToken = IToken<'SingleNavigation', { name: QualifiedEntityTypeNameToken | undefined; path: PropertyPathToken | undefined }>;
export type PropertyPathToken = IToken<'PropertyPath', { path: PrimitivePropertyToken | PrimitiveKeyPropertyToken | PrimitiveCollectionPropertyToken | EntityNavigationPropertyToken | EntityCollectionNavigationPropertyToken | ComplexPropertyToken | ComplexCollectionPropertyToken | StreamPropertyToken; navigation: RefExpressionToken | CollectionNavigationToken | SingleNavigationToken | CountExpressionToken | BoundOperationToken | ComplexPathToken | ValueExpressionToken | undefined }>;
export type ComplexPathToken = IToken<'ComplexPath', { name: QualifiedComplexTypeNameToken | undefined; path: BoundOperationToken | PropertyPathToken | undefined }>;
export type BoundOperationToken = IToken<'BoundOperation', { operation: BoundActionCallToken | BoundEntityFunctionCallToken | BoundEntityCollectionFunctionCallToken | BoundComplexFunctionCallToken | BoundComplexCollectionFunctionCallToken | BoundPrimitiveFunctionCallToken | BoundPrimitiveCollectionFunctionCallToken; name: QualifiedComplexTypeNameToken | undefined; navigation: RefExpressionToken | CollectionNavigationToken | SingleNavigationToken | CountExpressionToken | BoundOperationToken | ComplexPathToken | ValueExpressionToken | undefined }>;
export type BoundActionCallToken = IToken<'BoundActionCall', ActionToken>;
export type BoundEntityFunctionCallToken = IToken<'BoundEntityFunctionCall', EntityFunctionToken>;
export type BoundEntityCollectionFunctionCallToken = IToken<'BoundEntityCollectionFunctionCall', EntityCollectionFunctionToken>;
export type BoundComplexFunctionCallToken = IToken<'BoundComplexFunctionCall', ComplexFunctionToken>;
export type BoundComplexCollectionFunctionCallToken = IToken<'BoundComplexCollectionFunctionCall', ComplexCollectionFunctionToken>;
export type BoundPrimitiveFunctionCallToken = IToken<'BoundPrimitiveFunctionCall', PrimitiveFunctionToken>;
export type BoundPrimitiveCollectionFunctionCallToken = IToken<'BoundPrimitiveCollectionFunctionCall', PrimitiveCollectionFunctionToken>;
export type ODataUriToken = IToken<'ODataUri', { resource: ResourcePathToken; query: QueryOptionsToken | undefined; }>;
export type BatchToken = IToken<'Batch', string>;
export type EntityToken = IToken<'Entity', string | QualifiedEntityTypeNameToken>;
export type MetadataToken = IToken<'Metadata', string>;

export type LexerToken =
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

export type TokenType = LexerToken['type'];

export type SystemQueryOption = ExpandToken | FilterToken | FormatToken | IdToken | InlineCountToken | OrderByToken | SearchToken | SelectToken | SkipToken | SkipTokenToken | TopToken;

export type QueryOption = SystemQueryOption | AliasAndValueToken | CustomQueryOptionToken;

export type ExpandRef = FilterToken | SearchToken | OrderByToken | SkipToken | TopToken | InlineCountToken;

export type FunctionImportValue = {
  import: EntityFunctionImportToken | EntityCollectionFunctionImportToken | ComplexFunctionImportToken | ComplexCollectionFunctionImportToken | PrimitiveFunctionImportToken | PrimitiveCollectionFunctionImportToken;
  params: FunctionParameterToken[];
};

export type CallValue = {
  call: EntityFunctionToken | EntityCollectionFunctionToken | ComplexFunctionToken | ComplexCollectionFunctionToken | PrimitiveFunctionToken | PrimitiveCollectionFunctionToken;
  params: FunctionParametersToken;
};
