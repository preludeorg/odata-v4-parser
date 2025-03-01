import { PrimitiveTypeEnum } from '@odata/metadata';
import { Token, TokenType } from './lexer';

type NamedValue = { name: string };

type NamespacedNamedValue = { name: string; namespace?: string };

type LeftRightExpressionValue<L, R> = { left: L; right: R };

type LeftRightExpressionTokenValue =
  | Token<TokenType.ArrayOrObject>
  | Token<TokenType.RootExpression>
  | Token<TokenType.FirstMemberExpression>
  | Token<TokenType.NegateExpression>
  | Token<TokenType.ParenExpression>
  | Token<TokenType.CastExpression>
  | Token<TokenType.Literal>
  | Token<TokenType.Enum>
  | Token<TokenType.Identifier>
  | Token<TokenType.IsOfExpression>
  | Token<TokenType.FunctionExpression>
  | Token<TokenType.ParameterAlias>
  | Token<TokenType.MethodCallExpression>
  | Token<TokenType.NotExpression>
  | Token<TokenType.CommonExpression>
  | Token<TokenType.BoolParenExpression>
  | Token<TokenType.EqualsExpression>
  | Token<TokenType.NotEqualsExpression>
  | Token<TokenType.LesserThanExpression>
  | Token<TokenType.LesserOrEqualsExpression>
  | Token<TokenType.GreaterThanExpression>
  | Token<TokenType.GreaterOrEqualsExpression>
  | Token<TokenType.HasExpression>
  | Token<TokenType.AndExpression>
  | Token<TokenType.OrExpression>
  | Token<TokenType.AddExpression>
  | Token<TokenType.SubExpression>
  | Token<TokenType.MulExpression>
  | Token<TokenType.DivExpression>
  | Token<TokenType.ModExpression>;

type SystemQueryOption =
  | Token<TokenType.Expand>
  | Token<TokenType.Filter>
  | Token<TokenType.Format>
  | Token<TokenType.Id>
  | Token<TokenType.InlineCount>
  | Token<TokenType.OrderBy>
  | Token<TokenType.Search>
  | Token<TokenType.Select>
  | Token<TokenType.Skip>
  | Token<TokenType.SkipToken>
  | Token<TokenType.Top>;

type QueryOption =
  | SystemQueryOption
  | Token<TokenType.AliasAndValue>
  | Token<TokenType.CustomQueryOption>;

type FunctionImportValue<T extends TokenType> = {
  import: TokenOfType<T>;
  params: Token<TokenType.FunctionParameter>[];
};

export interface QueryOptionsToken {
  type: TokenType.QueryOptions;
  value: {
    options: QueryOption[];
  };
}

export interface CustomQueryOptionToken {
  type: TokenType.CustomQueryOption;
  value: {
    key: string;
    value: string;
  };
}

export interface LiteralToken {
  type: TokenType.Literal;
  /**
   * edm type
   */
  value:
    | PrimitiveTypeEnum
    | Token<TokenType.Literal>
    | 'SRID'
    | 'string'
    | 'number'
    | 'boolean'
    | 'null'
    | {
        srid: Token<TokenType.Literal>;
        value: Token<TokenType.Literal>;
      }
    | {
        longitude: Token<TokenType.Literal>;
        latitude: Token<TokenType.Literal>;
      }
    | {
        items: Token<TokenType.Literal>[];
      };
}

export interface SkipToken {
  type: TokenType.Skip;
  value: Token<TokenType.Literal>;
}

export interface TopToken {
  type: TokenType.Top;
  value: Token<TokenType.Literal>;
}

export interface FormatToken {
  type: TokenType.Format;
  value: {
    format: string;
  };
}

export interface FilterToken {
  type: TokenType.Filter;
  value:
    | Token<TokenType.IsOfExpression>
    | Token<TokenType.MethodCallExpression>
    | Token<TokenType.NotExpression>
    | Token<TokenType.CommonExpression>
    | Token<TokenType.BoolParenExpression>
    | Token<TokenType.EqualsExpression>
    | Token<TokenType.NotEqualsExpression>
    | Token<TokenType.LesserThanExpression>
    | Token<TokenType.LesserOrEqualsExpression>
    | Token<TokenType.GreaterThanExpression>
    | Token<TokenType.GreaterOrEqualsExpression>
    | Token<TokenType.HasExpression>
    | Token<TokenType.OrExpression>
    | Token<TokenType.AndExpression>;
}

export interface ExpandToken {
  type: TokenType.Expand;
  value: {
    items: Token[];
  };
}

export interface SearchToken {
  type: TokenType.Search;
  value:
    | Token<TokenType.SearchPhrase>
    | Token<TokenType.SearchTerm>
    | Token<TokenType.SearchWord>
    | Token<TokenType.SearchNotExpression>
    | Token<TokenType.SearchParenExpression>
    | Token<TokenType.SearchAndExpression>
    | Token<TokenType.SearchOrExpression>;
}

export interface SearchWordToken {
  type: TokenType.SearchWord;
  value: string;
}

export interface LeftRightExpressionToken {
  value: {
    left: Token;
    right: Token;
  };
}

export interface MemberExpressionToken {
  type: TokenType.MemberExpression;
  value:
    | Token<TokenType.PropertyPathExpression>
    | Token<TokenType.FunctionExpression>
    | {
        name: Token<TokenType.QualifiedEntityTypeName>;
        value:
          | Token<TokenType.PropertyPathExpression>
          | Token<TokenType.FunctionExpression>;
      };
}

export interface FirstMemberExpressionToken {
  type: TokenType.FirstMemberExpression;
  value:
    | Token<TokenType.LambdaVariableExpression>
    | Token<TokenType.ImplicitVariableExpression>
    | Token<TokenType.ODataIdentifier>
    | Token<TokenType.MemberExpression>
    | [
        Token<TokenType.LambdaVariableExpression> | Token<TokenType.ImplicitVariableExpression> | Token<TokenType.ODataIdentifier>,
        Token<TokenType.MemberExpression>
      ];
}

export interface AndExpressionToken {
  type: TokenType.AndExpression;
  value: LeftRightExpressionValue<
    Token,
    | Token<TokenType.CommonExpression>
    | Token<TokenType.NotExpression>
    | Token<TokenType.BoolParenExpression>
    | Token<TokenType.MethodCallExpression>
    | Token<TokenType.IsOfExpression>
    | Token<TokenType.EqualsExpression>
    | Token<TokenType.NotEqualsExpression>
    | Token<TokenType.LesserThanExpression>
    | Token<TokenType.LesserOrEqualsExpression>
    | Token<TokenType.GreaterThanExpression>
    | Token<TokenType.GreaterOrEqualsExpression>
    | Token<TokenType.HasExpression>
    | Token<TokenType.AndExpression>
    | Token<TokenType.OrExpression>
  >;
}

export interface OrExpressionToken {
  type: TokenType.OrExpression;
  value: LeftRightExpressionValue<
    Token,
    | Token<TokenType.CommonExpression>
    | Token<TokenType.NotExpression>
    | Token<TokenType.BoolParenExpression>
    | Token<TokenType.MethodCallExpression>
    | Token<TokenType.IsOfExpression>
    | Token<TokenType.EqualsExpression>
    | Token<TokenType.NotEqualsExpression>
    | Token<TokenType.LesserThanExpression>
    | Token<TokenType.LesserOrEqualsExpression>
    | Token<TokenType.GreaterThanExpression>
    | Token<TokenType.GreaterOrEqualsExpression>
    | Token<TokenType.HasExpression>
    | Token<TokenType.AndExpression>
    | Token<TokenType.OrExpression>
  >;
}

export interface EqualsExpressionToken {
  type: TokenType.EqualsExpression;
  value: LeftRightExpressionValue<Token, LeftRightExpressionTokenValue>;
}

export interface ArrayOrObjectToken {
  type: TokenType.ArrayOrObject;
  value: Token<TokenType.Object> | Token<TokenType.Array>;
}

export interface ArrayToken {
  type: TokenType.Array;
  value: {
    items: Token<TokenType.Object>[];
  };
}

export interface ObjectToken {
  type: TokenType.Object;
  value: {
    items: (Token<TokenType.Annotation> | Token<TokenType.Property>)[];
  };
}

export interface PropertyToken {
  type: TokenType.Property;
  value: {
    key:
      | Token<TokenType.PrimitiveKeyProperty>
      | Token<TokenType.PrimitiveCollectionProperty>
      | Token<TokenType.ComplexCollectionProperty>
      | Token<TokenType.ComplexProperty>;
    value: Token<TokenType.Array> | Token<TokenType.Object>;
  };
}

export interface AnnotationToken {
  type: TokenType.Annotation;
  value: {
    key: string;
    value: Token<TokenType.Literal> | Token<TokenType.Object> | Token<TokenType.Array>;
  };
}

export interface EnumToken {
  type: TokenType.Enum;
  value: {
    name: Token<TokenType.Identifier>;
    value: Token<TokenType.EnumValue>;
  };
}

export interface EnumValueToken {
  type: TokenType.EnumValue;
  value: {
    values: Token<TokenType.EnumerationMember | TokenType.EnumMemberValue>[];
  };
}

export interface EnumMemberValueToken {
  type: TokenType.EnumMemberValue;
  value: string;
}

export interface IdentifierToken {
  type: TokenType.Identifier;
  value: string;
}

export interface QualifiedEntityTypeNameToken {
  type: TokenType.QualifiedEntityTypeName;
  value: Token<TokenType.EntityTypeName>;
}

export interface QualifiedComplexTypeNameToken {
  type: TokenType.QualifiedComplexTypeName;
  value: Token<TokenType.ComplexTypeName>;
}

export interface ODataIdentifierToken {
  type: TokenType.ODataIdentifier;
  value: NamespacedNamedValue;
}

export interface CollectionToken {
  type: TokenType.Collection;
  value: Token[];
}

export interface NamespacePartToken {
  type: TokenType.NamespacePart;
  value: NamedValue | Token[];
}

export interface EntitySetNameToken {
  type: TokenType.EntitySetName;
  value: NamedValue;
}

export interface SingletonEntityToken {
  type: TokenType.SingletonEntity;
  value: NamedValue;
}

export interface EntityTypeNameToken {
  type: TokenType.EntityTypeName;
  value: NamespacedNamedValue;
}

export interface ComplexTypeNameToken {
  type: TokenType.ComplexTypeName;
  value: NamespacedNamedValue;
}

export interface TypeDefinitionNameToken {
  type: TokenType.TypeDefinitionName;
  value: NamedValue;
}

export interface EnumerationTypeNameToken {
  type: TokenType.EnumerationTypeName;
  value: NamedValue;
}

export interface EnumerationMemberToken {
  type: TokenType.EnumerationMember;
  value: NamedValue;
}

export interface TermNameToken {
  type: TokenType.TermName;
  value: NamedValue;
}

export interface PrimitivePropertyToken {
  type: TokenType.PrimitiveProperty;
  value: NamedValue;
}

export interface PrimitiveKeyPropertyToken {
  type: TokenType.PrimitiveKeyProperty;
  value: NamedValue;
}

export interface PrimitiveNonKeyPropertyToken {
  type: TokenType.PrimitiveNonKeyProperty;
  value: string;
}

export interface PrimitiveCollectionPropertyToken {
  type: TokenType.PrimitiveCollectionProperty;
  value: NamedValue;
}

export interface ComplexPropertyToken {
  type: TokenType.ComplexProperty;
  value: NamedValue;
}

export interface ComplexCollectionPropertyToken {
  type: TokenType.ComplexCollectionProperty;
  value: NamedValue;
}

export interface StreamPropertyToken {
  type: TokenType.StreamProperty;
  value: NamedValue;
}

export interface NavigationPropertyToken {
  type: TokenType.NavigationProperty;
  value: string;
}

export interface EntityNavigationPropertyToken {
  type: TokenType.EntityNavigationProperty;
  value: NamedValue;
}

export interface EntityCollectionNavigationPropertyToken {
  type: TokenType.EntityCollectionNavigationProperty;
  value: NamedValue;
}

export interface ActionToken {
  type: TokenType.Action;
  value: NamespacedNamedValue | Token<TokenType.Action>;
}

export interface ActionImportToken {
  type: TokenType.ActionImport;
  value: NamedValue;
}

export interface FunctionToken {
  type: TokenType.Function;
  value: {
    name: Token<
      | TokenType.EntityFunction
      | TokenType.EntityCollectionFunction
      | TokenType.ComplexFunction
      | TokenType.ComplexCollectionFunction
      | TokenType.PrimitiveFunction
      | TokenType.PrimitiveCollectionFunction
    >;
    parameters: Token<TokenType.ParameterName>[];
  };
}

export interface EntityFunctionToken {
  type: TokenType.EntityFunction;
  value: NamespacedNamedValue;
}

export interface EntityCollectionFunctionToken {
  type: TokenType.EntityCollectionFunction;
  value: NamespacedNamedValue;
}

export interface ComplexFunctionToken {
  type: TokenType.ComplexFunction;
  value: NamespacedNamedValue;
}

export interface ComplexCollectionFunctionToken {
  type: TokenType.ComplexCollectionFunction;
  value: NamespacedNamedValue;
}

export interface PrimitiveFunctionToken {
  type: TokenType.PrimitiveFunction;
  value: NamespacedNamedValue;
}

export interface PrimitiveCollectionFunctionToken {
  type: TokenType.PrimitiveCollectionFunction;
  value: NamespacedNamedValue;
}

export interface EntityFunctionImportToken {
  type: TokenType.EntityFunctionImport;
  value: NamedValue;
}

export interface EntityCollectionFunctionImportToken {
  type: TokenType.EntityCollectionFunctionImport;
  value: NamedValue;
}

export interface ComplexFunctionImportToken {
  type: TokenType.ComplexFunctionImport;
  value: NamedValue;
}

export interface ComplexCollectionFunctionImportToken {
  type: TokenType.ComplexCollectionFunctionImport;
  value: NamedValue;
}

export interface PrimitiveFunctionImportToken {
  type: TokenType.PrimitiveFunctionImport;
  value: NamedValue;
}

export interface PrimitiveCollectionFunctionImportToken {
  type: TokenType.PrimitiveCollectionFunctionImport;
  value: NamedValue;
}

export interface CommonExpressionToken {
  type: TokenType.CommonExpression;
  value:
    | Token<TokenType.Identifier>
    | Token<TokenType.Literal>
    | Token<TokenType.Enum>
    | Token<TokenType.ParameterAlias>
    | Token<TokenType.ArrayOrObject>
    | Token<TokenType.RootExpression>
    | Token<TokenType.FirstMemberExpression>
    | Token<TokenType.FunctionExpression>
    | Token<TokenType.NegateExpression>
    | Token<TokenType.MethodCallExpression>
    | Token<TokenType.ParenExpression>
    | Token<TokenType.CastExpression>
    | Token<TokenType.AddExpression>
    | Token<TokenType.AddExpression>
    | Token<TokenType.SubExpression>
    | Token<TokenType.MulExpression>
    | Token<TokenType.DivExpression>
    | Token<TokenType.ModExpression>
    | Token<TokenType.AndExpression>
    | Token<TokenType.OrExpression>;
}

export interface NotEqualsExpressionToken {
  type: TokenType.NotEqualsExpression;
  value: LeftRightExpressionValue<Token, LeftRightExpressionTokenValue>;
}

export interface LesserThanExpressionToken {
  type: TokenType.LesserThanExpression;
  value: LeftRightExpressionValue<Token, LeftRightExpressionTokenValue>;
}

export interface LesserOrEqualsExpressionToken {
  type: TokenType.LesserOrEqualsExpression;
  value: LeftRightExpressionValue<Token, LeftRightExpressionTokenValue>;
}

export interface GreaterThanExpressionToken {
  type: TokenType.GreaterThanExpression;
  value: LeftRightExpressionValue<Token, LeftRightExpressionTokenValue>;
}

export interface GreaterOrEqualsExpressionToken {
  type: TokenType.GreaterOrEqualsExpression;
  value: LeftRightExpressionValue<Token, LeftRightExpressionTokenValue>;
}

export interface HasExpressionToken {
  type: TokenType.HasExpression;
  value: LeftRightExpressionValue<Token, LeftRightExpressionTokenValue>;
}

export interface AddExpressionToken {
  type: TokenType.AddExpression;
  value: LeftRightExpressionValue<Token, LeftRightExpressionTokenValue>;
}

export interface SubExpressionToken {
  type: TokenType.SubExpression;
  value: LeftRightExpressionValue<Token, LeftRightExpressionTokenValue>;
}

export interface MulExpressionToken {
  type: TokenType.MulExpression;
  value: LeftRightExpressionValue<Token, LeftRightExpressionTokenValue>;
}

export interface DivExpressionToken {
  type: TokenType.DivExpression;
  value: LeftRightExpressionValue<Token, LeftRightExpressionTokenValue>;
}

export interface ModExpressionToken {
  type: TokenType.ModExpression;
  value: LeftRightExpressionValue<Token, LeftRightExpressionTokenValue>;
}

export interface NotExpressionToken {
  type: TokenType.NotExpression;
  value:
    | Token<TokenType.IsOfExpression>
    | Token<TokenType.MethodCallExpression>
    | Token<TokenType.NotExpression>
    | Token<TokenType.CommonExpression>
    | Token<TokenType.BoolParenExpression>
    | Token<TokenType.EqualsExpression>
    | Token<TokenType.NotEqualsExpression>
    | Token<TokenType.LesserThanExpression>
    | Token<TokenType.LesserOrEqualsExpression>
    | Token<TokenType.GreaterThanExpression>
    | Token<TokenType.GreaterOrEqualsExpression>
    | Token<TokenType.HasExpression>
    | Token<TokenType.AndExpression>
    | Token<TokenType.OrExpression>;
  // value: LeftRightExpressionValue<Token, Token<TokenType.CommonExpression>>;
}

export interface BoolParenExpressionToken {
  type: TokenType.BoolParenExpression;
  value:
     | Token<TokenType.IsOfExpression>
     | Token<TokenType.MethodCallExpression>
     | Token<TokenType.NotExpression>
     | Token<TokenType.CommonExpression>
     | Token<TokenType.BoolParenExpression>
     | Token<TokenType.EqualsExpression>
     | Token<TokenType.NotEqualsExpression>
     | Token<TokenType.LesserThanExpression>
     | Token<TokenType.LesserOrEqualsExpression>
     | Token<TokenType.GreaterThanExpression>
     | Token<TokenType.GreaterOrEqualsExpression>
     | Token<TokenType.HasExpression>
     | Token<TokenType.AndExpression>
     | Token<TokenType.OrExpression>;
}

export interface ParenExpressionToken {
  type: TokenType.ParenExpression;
  value: Token;
}

export interface MethodCallExpressionToken {
  type: TokenType.MethodCallExpression;
  value: {
    method: string;
    parameters: Token[];
  };
}

export interface IsOfExpressionToken {
  type: TokenType.IsOfExpression;
  value: {
    target: Token<TokenType.CommonExpression>;
    typename:
      | Token<TokenType.Identifier>
      | Token<TokenType.QualifiedEntityTypeName>
      | Token<TokenType.QualifiedComplexTypeName>
      | Token<TokenType.Collection>;
  };
}

export interface CastExpressionToken {
  type: TokenType.CastExpression;
  value: {
    target: Token<TokenType.CommonExpression>;
    typename:
      | Token<TokenType.Identifier>
      | Token<TokenType.QualifiedEntityTypeName>
      | Token<TokenType.QualifiedComplexTypeName>
      | Token<TokenType.Collection>;
  };
}

export interface NegateExpressionToken {
  type: TokenType.NegateExpression;
  value: Token<TokenType.CommonExpression>;
}

export interface PropertyPathExpressionToken {
  type: TokenType.PropertyPathExpression;
  value:
    | TokenOfType<TokenType.ODataIdentifier | TokenType.StreamProperty>
    | {
        current: Token<TokenType.ODataIdentifier>;
        next: TokenOfType<
          | TokenType.SingleNavigationExpression
          | TokenType.CollectionPathExpression
          | TokenType.CollectionNavigationExpression
          | TokenType.ComplexPathExpression
          | TokenType.SinglePathExpression
        >;
      };
}

export interface ImplicitVariableExpressionToken {
  type: TokenType.ImplicitVariableExpression;
  value: string;
}

export interface LambdaVariableToken {
  type: TokenType.LambdaVariable;
  value: string;
}

export interface LambdaVariableExpressionToken {
  type: TokenType.LambdaVariableExpression;
  value: { name: string };
}

export interface LambdaPredicateExpressionToken {
  type: TokenType.LambdaPredicateExpression;
  value:
    | Token<TokenType.CommonExpression>
    | Token<TokenType.AndExpression>
    | Token<TokenType.OrExpression>
    | Token<TokenType.NotExpression>
    | Token<TokenType.BoolParenExpression>
    | Token<TokenType.MethodCallExpression>
    | Token<TokenType.IsOfExpression>
    | Token<TokenType.EqualsExpression>
    | Token<TokenType.NotEqualsExpression>
    | Token<TokenType.LesserThanExpression>
    | Token<TokenType.LesserOrEqualsExpression>
    | Token<TokenType.GreaterThanExpression>
    | Token<TokenType.GreaterOrEqualsExpression>
    | Token<TokenType.HasExpression>;
}

export interface AnyExpressionToken {
  type: TokenType.AnyExpression;
  value: {
    variable: Token<TokenType.LambdaVariableExpression>;
    predicate: Token<TokenType.LambdaPredicateExpression>;
  };
}

export interface AllExpressionToken {
  type: TokenType.AllExpression;
  value: {
    variable: Token<TokenType.LambdaVariableExpression>;
    predicate: Token<TokenType.LambdaPredicateExpression>;
  };
}

export interface CollectionNavigationExpressionToken {
  type: TokenType.CollectionNavigationExpression;
  value: {
    entity: Token<TokenType.QualifiedEntityTypeName>;
    predicate: Token<TokenType.SimpleKey> | Token<TokenType.CompoundKey>;
    navigation: Token<TokenType.SingleNavigationExpression>;
    path: Token<TokenType.CollectionPathExpression>;
  };
}

export interface SimpleKeyToken {
  type: TokenType.SimpleKey;
  value: {
    key: string;
    value: Token<TokenType.KeyPropertyValue>;
  };
}

export interface CompoundKeyToken {
  type: TokenType.CompoundKey;
  value: Token<TokenType.KeyValuePair>[];
}

export interface KeyValuePairToken {
  type: TokenType.KeyValuePair;
  value: {
    key: Token<TokenType.PrimitiveKeyProperty> | Token<TokenType.KeyPropertyAlias>;
    value: Token<TokenType.KeyPropertyValue>;
  };
}

export interface KeyPropertyValueToken {
  type: TokenType.KeyPropertyValue;
  value: string;
}

export interface KeyPropertyAliasToken {
  type: TokenType.KeyPropertyAlias;
  value: { name: string };
}

export interface SingleNavigationExpressionToken {
  type: TokenType.SingleNavigationExpression;
  value: Token<TokenType.MemberExpression>;
}

export interface CollectionPathExpressionToken {
  type: TokenType.CollectionPathExpression;
  value:
    | Token<TokenType.AnyExpression>
    | Token<TokenType.AllExpression>
    | Token<TokenType.FunctionExpression>
    | Token<TokenType.CountExpression>;
}

export interface ComplexPathExpressionToken {
  type: TokenType.ComplexPathExpression;
  value:
    | [Token<TokenType.FunctionExpression> | Token<TokenType.PropertyPathExpression>]
    | [
        Token<TokenType.QualifiedComplexTypeName>,
        Token<TokenType.FunctionExpression> | Token<TokenType.PropertyPathExpression>
      ];
}

export interface SinglePathExpressionToken {
  type: TokenType.SinglePathExpression;
  value: Token<TokenType.FunctionExpression>;
}

export interface FunctionExpressionToken {
  type: TokenType.FunctionExpression;
  value: {
    fn: Token<TokenType.ODataIdentifier>;
    params: Token<TokenType.FunctionExpressionParameters>;
    expression:
      | Token<TokenType.CollectionNavigationExpression>
      | Token<TokenType.CollectionPathExpression>
      | Token<TokenType.ComplexPathExpression>
      | Token<TokenType.SingleNavigationExpression>
      | Token<TokenType.SinglePathExpression>;
  };
}

export interface FunctionExpressionParametersToken {
  type: TokenType.FunctionExpressionParameters;
  value: Token<TokenType.FunctionExpressionParameter>[];
}

export interface FunctionExpressionParameterToken {
  type: TokenType.FunctionExpressionParameter;
  value: {
    name: Token<TokenType.ParameterName>;
    value: Token<TokenType.ParameterAlias> | Token<TokenType.ParameterValue>;
  };
}

export interface ParameterNameToken {
  type: TokenType.ParameterName;
  value: string;
}

export interface ParameterAliasToken {
  type: TokenType.ParameterAlias;
  value: { name: string };
}

export interface ParameterValueToken {
  type: TokenType.ParameterValue;
  value:
    | Token<TokenType.ArrayOrObject>
    | Token<TokenType.Array>
    | Token<TokenType.Object>
    | Token<TokenType.Identifier>
    | Token<TokenType.FunctionExpression>
    | Token<TokenType.ParameterAlias>
    | Token<TokenType.Literal>
    | Token<TokenType.OrExpression>
    | Token<TokenType.AndExpression>
    | Token<TokenType.MethodCallExpression>
    | Token<TokenType.Enum>
    | Token<TokenType.RootExpression>
    | Token<TokenType.FirstMemberExpression>
    | Token<TokenType.NegateExpression>
    | Token<TokenType.ParenExpression>
    | Token<TokenType.CastExpression>
    | Token<TokenType.AddExpression>
    | Token<TokenType.SubExpression>
    | Token<TokenType.MulExpression>
    | Token<TokenType.DivExpression>
    | Token<TokenType.ModExpression>;
}

export interface CountExpressionToken {
  type: TokenType.CountExpression;
  value: string;
}

export interface RefExpressionToken {
  type: TokenType.RefExpression;
  value: string;
}

export interface ValueExpressionToken {
  type: TokenType.ValueExpression;
  value: string;
}

export interface RootExpressionToken {
  type: TokenType.RootExpression;
  value: {
    current:
      | { entity: Token<TokenType.SingletonEntity> }
      | {
          entitySet: Token<TokenType.EntitySetName>;
          keys: Token<TokenType.SimpleKey> | Token<TokenType.CompoundKey>;
        };
    next: SingleNavigationExpressionToken;
  };
}

export interface ExpandToken {
  type: TokenType.Expand;
  value: {
    items: Token[];
  };
}

export interface ExpandItemToken {
  type: TokenType.ExpandItem;
  value: {
    path:
      | Token<TokenType.ExpandPath>
      | '*';
    levels?: Token<TokenType.Levels>;
    ref?: Token<TokenType.RefExpression>;
    count?: Token<TokenType.CountExpression>;
    options?: TokenOfType<
      | TokenType.Filter
      | TokenType.Search
      | TokenType.OrderBy
      | TokenType.Skip
      | TokenType.Top
      | TokenType.InlineCount
    >[];
  };
}

export interface ExpandPathToken {
  type: TokenType.ExpandPath;
  value: (
    | Token<TokenType.QualifiedEntityTypeName>
    | Token<TokenType.QualifiedComplexTypeName>
    | Token<TokenType.ComplexProperty>
    | Token<TokenType.ComplexCollectionProperty>
    | Token<TokenType.EntityNavigationProperty>
    | Token<TokenType.EntityCollectionNavigationProperty>
  )[];
}

export interface ExpandCountOptionToken {
  type: TokenType.ExpandCountOption;
  value: string;
}

export interface ExpandRefOptionToken {
  type: TokenType.ExpandRefOption;
  value: string;
}

export interface ExpandOptionToken {
  type: TokenType.ExpandOption;
  value: string;
}

export interface LevelsToken {
  type: TokenType.Levels;
  value: string;
}

export interface SearchExpressionToken {
  type: TokenType.SearchExpression;
  value: string;
}

export interface SearchParenExpressionToken {
  type: TokenType.SearchParenExpression;
  value:
    | Token<TokenType.SearchAndExpression>
    | Token<TokenType.SearchOrExpression>
    | Token<TokenType.SearchNotExpression>
    | Token<TokenType.SearchPhrase>
    | Token<TokenType.SearchTerm>
    | Token<TokenType.SearchWord>
    | Token<TokenType.SearchParenExpression>;
}

export interface SearchNotExpressionToken {
  type: TokenType.SearchNotExpression;
  value: Token<TokenType.SearchPhrase> | Token<TokenType.SearchWord>;
}

export interface SearchOrExpressionToken {
  type: TokenType.SearchOrExpression;
  value: {
    left:
      | Token<TokenType.SearchParenExpression>
      | Token<TokenType.SearchAndExpression>
      | Token<TokenType.SearchOrExpression>
      | Token<TokenType.SearchNotExpression>
      | Token<TokenType.SearchPhrase>
      | Token<TokenType.SearchWord>;
    right:
      | Token<TokenType.SearchAndExpression>
      | Token<TokenType.SearchOrExpression>
      | Token<TokenType.SearchNotExpression>
      | Token<TokenType.SearchPhrase>
      | Token<TokenType.SearchTerm>
      | Token<TokenType.SearchWord>
      | Token<TokenType.SearchParenExpression>;
  };
}

export interface SearchAndExpressionToken {
  type: TokenType.SearchAndExpression;
  value: {
    left:
      | Token<TokenType.SearchParenExpression>
      | Token<TokenType.SearchAndExpression>
      | Token<TokenType.SearchOrExpression>
      | Token<TokenType.SearchNotExpression>
      | Token<TokenType.SearchPhrase>
      | Token<TokenType.SearchWord>;
    right:
      | Token<TokenType.SearchAndExpression>
      | Token<TokenType.SearchOrExpression>
      | Token<TokenType.SearchNotExpression>
      | Token<TokenType.SearchPhrase>
      | Token<TokenType.SearchTerm>
      | Token<TokenType.SearchWord>
      | Token<TokenType.SearchParenExpression>;
  };
}

export interface SearchTermToken {
  type: TokenType.SearchTerm;
  value: string;
}

export interface SearchPhraseToken {
  type: TokenType.SearchPhrase;
  value: string;
}

export interface SearchWordToken {
  type: TokenType.SearchWord;
  value: string;
}

export interface OrderByToken {
  type: TokenType.OrderBy;
  value: {
    items: Token<TokenType.OrderByItem>[];
  };
}

export interface OrderByItemToken {
  type: TokenType.OrderByItem;
  value: {
    expr: Token<TokenType.CommonExpression>;
    direction: number;
  };
}

export interface FormatToken {
  type: TokenType.Format;
  value: { format: string };
}

export interface InlineCountToken {
  type: TokenType.InlineCount;
  value: Token<TokenType.Literal>;
}

export interface SelectToken {
  type: TokenType.Select;
  value: {
    items: Token<TokenType.SelectItem>[];
  };
}

export interface SelectItemToken {
  type: TokenType.SelectItem;
  value:
    | Token<TokenType.PrimitiveProperty>
    | Token<TokenType.PrimitiveKeyProperty>
    | Token<TokenType.PrimitiveCollectionProperty>
    | Token<TokenType.EntityNavigationProperty>
    | Token<TokenType.EntityCollectionNavigationProperty>
    | Token<TokenType.Action>
    | Token<TokenType.Function>
    | Token<TokenType.SelectPath>
    | { value: string }
    | { namespace: string; value: string }
    | {
        name: Token<TokenType.QualifiedEntityTypeName | TokenType.QualifiedComplexTypeName>;
        value:
          | Token<TokenType.PrimitiveProperty>
          | Token<TokenType.PrimitiveKeyProperty>
          | Token<TokenType.PrimitiveCollectionProperty>
          | Token<TokenType.EntityNavigationProperty>
          | Token<TokenType.EntityCollectionNavigationProperty>
          | Token<TokenType.Action>
          | Token<TokenType.Function>
          | Token<TokenType.SelectPath>;
      };
}

export interface SelectPathToken {
  type: TokenType.SelectPath;
  value:
    | Token<TokenType.ComplexProperty>
    | Token<TokenType.ComplexCollectionProperty>
    | {
        prop: Token<TokenType.ComplexProperty> | Token<TokenType.ComplexCollectionProperty>;
        name: Token<TokenType.QualifiedComplexTypeName>;
      }
    | {
        path: Token<TokenType.SelectPath>;
        next:
          | Token<TokenType.EntityCollectionNavigationProperty>
          | Token<TokenType.EntityNavigationProperty>
          | Token<TokenType.PrimitiveCollectionProperty>
          | Token<TokenType.PrimitiveKeyProperty>
          | Token<TokenType.PrimitiveProperty>
          | Token<TokenType.SelectPath>;
      };
}

export interface AliasAndValueToken {
  type: TokenType.AliasAndValue;
  value: {
    alias: Token<TokenType.ParameterAlias>;
    value: Token<TokenType.ParameterValue>;
  };
}

export interface SkipTokenToken {
  type: TokenType.SkipToken;
  value: string;
}

export interface IdToken {
  type: TokenType.Id;
  value: string;
}

export interface CrossjoinToken {
  type: TokenType.Crossjoin;
  value: {
    names: Token<TokenType.EntitySetName>[];
  };
}

export interface AllResourceToken {
  type: TokenType.AllResource;
  value: string;
}

export interface ActionImportCallToken {
  type: TokenType.ActionImportCall;
  value: Token<TokenType.ActionImport>;
}

export interface EntityCollectionFunctionImportCallToken {
  type: TokenType.EntityCollectionFunctionImportCall;
  value: FunctionImportValue<TokenType.EntityCollectionFunctionImport>;
}

export interface EntityFunctionImportCallToken {
  type: TokenType.EntityFunctionImportCall;
  value: FunctionImportValue<TokenType.EntityFunctionImport>;
}

export interface ComplexCollectionFunctionImportCallToken {
  type: TokenType.ComplexCollectionFunctionImportCall;
  value: FunctionImportValue<TokenType.ComplexCollectionFunctionImport>;
}

export interface ComplexFunctionImportCallToken {
  type: TokenType.ComplexFunctionImportCall;
  value: FunctionImportValue<TokenType.ComplexFunctionImport>;
}

export interface PrimitiveCollectionFunctionImportCallToken {
  type: TokenType.PrimitiveCollectionFunctionImportCall;
  value: FunctionImportValue<TokenType.PrimitiveCollectionFunctionImport>;
}

export interface PrimitiveFunctionImportCallToken {
  type: TokenType.PrimitiveFunctionImportCall;
  value: FunctionImportValue<TokenType.PrimitiveFunctionImport>;
}

export interface FunctionParametersToken {
  type: TokenType.FunctionParameters;
  value: Token<TokenType.FunctionParameter>[];
}

export interface FunctionParameterToken {
  type: TokenType.FunctionParameter;
  value: {
    name: Token<TokenType.ParameterName>;
    value: Token<TokenType.Literal> | Token<TokenType.Enum> | Token<TokenType.ParameterAlias>;
  };
}

export interface ResourcePathToken {
  type: TokenType.ResourcePath;
  value: {
    resource:
      | Token<TokenType.EntitySetName>
      | Token<TokenType.EntityCollectionFunctionImportCall>
      | Token<TokenType.SingletonEntity>
      | Token<TokenType.EntityFunctionImportCall>
      | Token<TokenType.ComplexCollectionFunctionImportCall>
      | Token<TokenType.PrimitiveCollectionFunctionImportCall>
      | Token<TokenType.ComplexFunctionImportCall>
      | Token<TokenType.PrimitiveFunctionImportCall>
      | Token<TokenType.Crossjoin>
      | Token<TokenType.AllResource>
      | Token<TokenType.ActionImportCall>;
    navigation:
      | Token<TokenType.CollectionNavigation>
      | Token<TokenType.SingleNavigation>
      | Token<TokenType.CountExpression>
      | Token<TokenType.BoundOperation>
      | Token<TokenType.ComplexPath>
      | Token<TokenType.ValueExpression>
      | Token<TokenType.RefExpression>;
  };
}

export interface CollectionNavigationToken {
  type: TokenType.CollectionNavigation;
  value: {
    name: Token<TokenType.QualifiedEntityTypeName>;
    path:
      | Token<TokenType.RefExpression>
      | Token<TokenType.CountExpression>
      | Token<TokenType.BoundOperation>
      | Token<TokenType.CollectionNavigationPath>;
  };
}

export interface CollectionNavigationPathToken {
  type: TokenType.CollectionNavigationPath;
  value: {
    predicate: Token<TokenType.SimpleKey> | Token<TokenType.CompoundKey>;
    navigation?:
      | Token<TokenType.SingleNavigation>
      | Token<TokenType.BoundOperation>
      | Token<TokenType.ValueExpression>
      | Token<TokenType.RefExpression>;
  };
}

export interface SingleNavigationToken {
  type: TokenType.SingleNavigation;
  value: {
    name: Token<TokenType.QualifiedEntityTypeName>;
    path:
      | Token<TokenType.RefExpression>
      | Token<TokenType.ValueExpression>
      | Token<TokenType.BoundOperation>
      | Token<TokenType.PropertyPath>;
  };
}

export interface PropertyPathToken {
  type: TokenType.PropertyPath;
  value: {
    path:
      | Token<TokenType.PrimitiveProperty>
      | Token<TokenType.PrimitiveKeyProperty>
      | Token<TokenType.PrimitiveCollectionProperty>
      | Token<TokenType.EntityNavigationProperty>
      | Token<TokenType.EntityCollectionNavigationProperty>
      | Token<TokenType.ComplexProperty>
      | Token<TokenType.ComplexCollectionProperty>
      | Token<TokenType.StreamProperty>;
    navigation:
      | Token<TokenType.RefExpression>
      | Token<TokenType.CollectionNavigation>
      | Token<TokenType.SingleNavigation>
      | Token<TokenType.CountExpression>
      | Token<TokenType.BoundOperation>
      | Token<TokenType.ComplexPath>
      | Token<TokenType.ValueExpression>;
  };
}

export interface ComplexPathToken {
  type: TokenType.ComplexPath;
  value: {
    name: Token<TokenType.QualifiedComplexTypeName>;
    path: Token<TokenType.BoundOperation> | Token<TokenType.PropertyPath>;
  };
}

export interface BoundOperationToken {
  type: TokenType.BoundOperation;
  value: {
    operation:
      | Token<TokenType.BoundActionCall>
      | Token<TokenType.BoundEntityFunctionCall>
      | Token<TokenType.BoundEntityCollectionFunctionCall>
      | Token<TokenType.BoundComplexFunctionCall>
      | Token<TokenType.BoundComplexCollectionFunctionCall>
      | Token<TokenType.BoundPrimitiveFunctionCall>
      | Token<TokenType.BoundPrimitiveCollectionFunctionCall>;
    name: Token<TokenType.QualifiedComplexTypeName>;
    navigation:
      | Token<TokenType.RefExpression>
      | Token<TokenType.CollectionNavigation>
      | Token<TokenType.SingleNavigation>
      | Token<TokenType.CountExpression>
      | Token<TokenType.BoundOperation>
      | Token<TokenType.ComplexPath>
      | Token<TokenType.ValueExpression>;
  };
}

export interface BoundActionCallToken {
  type: TokenType.BoundActionCall;
  value: Token<TokenType.Action>;
}

export interface BoundEntityFunctionCallToken {
  type: TokenType.BoundEntityFunctionCall;
  value: {
    call: Token<TokenType.EntityFunction>;
    params: Token<TokenType.FunctionParameters>;
  };
}

export interface BoundEntityCollectionFunctionCallToken {
  type: TokenType.BoundEntityCollectionFunctionCall;
  value: {
    call: Token<TokenType.EntityCollectionFunction>;
    params: Token<TokenType.FunctionParameters>;
  };
}

export interface BoundComplexFunctionCallToken {
  type: TokenType.BoundComplexFunctionCall;
  value: {
    call: Token<TokenType.ComplexFunction>;
    params: Token<TokenType.FunctionParameters>;
  };
}

export interface BoundComplexCollectionFunctionCallToken {
  type: TokenType.BoundComplexCollectionFunctionCall;
  value: {
    call: Token<TokenType.ComplexCollectionFunction>;
    params: Token<TokenType.FunctionParameters>;
  };
}

export interface BoundPrimitiveFunctionCallToken {
  type: TokenType.BoundPrimitiveFunctionCall;
  value: {
    call: Token<TokenType.PrimitiveFunction>;
    params: Token<TokenType.FunctionParameters>;
  };
}

export interface BoundPrimitiveCollectionFunctionCallToken {
  type: TokenType.BoundPrimitiveCollectionFunctionCall;
  value: {
    call: Token<TokenType.PrimitiveCollectionFunction>;
    params: Token<TokenType.FunctionParameters>;
  };
}

export interface ODataUriToken {
  type: TokenType.ODataUri;
  value: {
    resource:
      | Token<TokenType.ResourcePath>
      | Token<TokenType.Batch>
      | Token<TokenType.Entity>
      | Token<TokenType.Metadata>;
    query: Token<TokenType.QueryOptions>;
  };
}

export interface BatchToken {
  type: TokenType.Batch;
  value: string;
}

export interface EntityToken {
  type: TokenType.Entity;
  value: string | Token<TokenType.QualifiedEntityTypeName>;
}

export interface MetadataToken {
  type: TokenType.Metadata;
  value: string;
}

export type TokenTypeValue<T extends TokenType> = AllTokens[T]['value'];

export type TokenOfType<T extends TokenType> = {
  [K in keyof AllTokens & T]: Token<K>;
}[T];

type AllTokens = {
  [TokenType.Literal]: LiteralToken,
  [TokenType.ArrayOrObject]: ArrayOrObjectToken
  [TokenType.Array]: ArrayToken,
  [TokenType.Object]: ObjectToken,
  [TokenType.Property]: PropertyToken,
  [TokenType.Annotation]: AnnotationToken,
  [TokenType.Enum]: EnumToken,
  [TokenType.EnumValue]: EnumValueToken,
  [TokenType.EnumMemberValue]: EnumMemberValueToken,
  [TokenType.Identifier]: IdentifierToken,
  [TokenType.QualifiedEntityTypeName]: QualifiedEntityTypeNameToken,
  [TokenType.QualifiedComplexTypeName]: QualifiedComplexTypeNameToken,
  [TokenType.ODataIdentifier]: ODataIdentifierToken,
  [TokenType.Collection]: CollectionToken,
  [TokenType.NamespacePart]: NamespacePartToken,
  [TokenType.EntitySetName]: EntitySetNameToken,
  [TokenType.SingletonEntity]: SingletonEntityToken,
  [TokenType.EntityTypeName]: EntityTypeNameToken,
  [TokenType.ComplexTypeName]: ComplexTypeNameToken,
  [TokenType.TypeDefinitionName]: TypeDefinitionNameToken,
  [TokenType.EnumerationTypeName]: EnumerationTypeNameToken,
  [TokenType.EnumerationMember]: EnumerationMemberToken,
  [TokenType.TermName]: TermNameToken,
  [TokenType.PrimitiveProperty]: PrimitivePropertyToken,
  [TokenType.PrimitiveKeyProperty]: PrimitiveKeyPropertyToken,
  [TokenType.PrimitiveNonKeyProperty]: PrimitiveNonKeyPropertyToken,
  [TokenType.PrimitiveCollectionProperty]: PrimitiveCollectionPropertyToken,
  [TokenType.ComplexProperty]: ComplexPropertyToken,
  [TokenType.ComplexCollectionProperty]: ComplexCollectionPropertyToken,
  [TokenType.StreamProperty]: StreamPropertyToken,
  [TokenType.NavigationProperty]: NavigationPropertyToken,
  [TokenType.EntityNavigationProperty]: EntityNavigationPropertyToken,
  [TokenType.EntityCollectionNavigationProperty]: EntityCollectionNavigationPropertyToken,
  [TokenType.Action]: ActionToken,
  [TokenType.ActionImport]: ActionImportToken,
  [TokenType.Function]: FunctionToken,
  [TokenType.EntityFunction]: EntityFunctionToken,
  [TokenType.EntityCollectionFunction]: EntityCollectionFunctionToken,
  [TokenType.ComplexFunction]: ComplexFunctionToken,
  [TokenType.ComplexCollectionFunction]: ComplexCollectionFunctionToken,
  [TokenType.PrimitiveFunction]: PrimitiveFunctionToken,
  [TokenType.PrimitiveCollectionFunction]: PrimitiveCollectionFunctionToken,
  [TokenType.EntityFunctionImport]: EntityFunctionImportToken,
  [TokenType.EntityCollectionFunctionImport]: EntityCollectionFunctionImportToken,
  [TokenType.ComplexFunctionImport]: ComplexFunctionImportToken,
  [TokenType.ComplexCollectionFunctionImport]: ComplexCollectionFunctionImportToken,
  [TokenType.PrimitiveFunctionImport]: PrimitiveFunctionImportToken,
  [TokenType.PrimitiveCollectionFunctionImport]: PrimitiveCollectionFunctionImportToken,
  [TokenType.CommonExpression]: CommonExpressionToken,
  [TokenType.AndExpression]: AndExpressionToken,
  [TokenType.OrExpression]: OrExpressionToken,
  [TokenType.EqualsExpression]: EqualsExpressionToken,
  [TokenType.NotEqualsExpression]: NotEqualsExpressionToken,
  [TokenType.LesserThanExpression]: LesserThanExpressionToken,
  [TokenType.LesserOrEqualsExpression]: LesserOrEqualsExpressionToken,
  [TokenType.GreaterThanExpression]: GreaterThanExpressionToken,
  [TokenType.GreaterOrEqualsExpression]: GreaterOrEqualsExpressionToken,
  [TokenType.HasExpression]: HasExpressionToken,
  [TokenType.AddExpression]: AddExpressionToken,
  [TokenType.SubExpression]: SubExpressionToken,
  [TokenType.MulExpression]: MulExpressionToken,
  [TokenType.DivExpression]: DivExpressionToken,
  [TokenType.ModExpression]: ModExpressionToken,
  [TokenType.NotExpression]: NotExpressionToken,
  [TokenType.BoolParenExpression]: BoolParenExpressionToken,
  [TokenType.ParenExpression]: ParenExpressionToken,
  [TokenType.MethodCallExpression]: MethodCallExpressionToken,
  [TokenType.IsOfExpression]: IsOfExpressionToken,
  [TokenType.CastExpression]: CastExpressionToken,
  [TokenType.NegateExpression]: NegateExpressionToken,
  [TokenType.FirstMemberExpression]: FirstMemberExpressionToken,
  [TokenType.MemberExpression]: MemberExpressionToken,
  [TokenType.PropertyPathExpression]: PropertyPathExpressionToken,
  [TokenType.ImplicitVariableExpression]: ImplicitVariableExpressionToken,
  [TokenType.LambdaVariable]: LambdaVariableToken,
  [TokenType.LambdaVariableExpression]: LambdaVariableExpressionToken,
  [TokenType.LambdaPredicateExpression]: LambdaPredicateExpressionToken,
  [TokenType.AnyExpression]: AnyExpressionToken,
  [TokenType.AllExpression]: AllExpressionToken,
  [TokenType.CollectionNavigationExpression]: CollectionNavigationExpressionToken,
  [TokenType.SimpleKey]: SimpleKeyToken,
  [TokenType.CompoundKey]: CompoundKeyToken,
  [TokenType.KeyValuePair]: KeyValuePairToken,
  [TokenType.KeyPropertyValue]: KeyPropertyValueToken,
  [TokenType.KeyPropertyAlias]: KeyPropertyAliasToken,
  [TokenType.SingleNavigationExpression]: SingleNavigationExpressionToken,
  [TokenType.CollectionPathExpression]: CollectionPathExpressionToken,
  [TokenType.ComplexPathExpression]: ComplexPathExpressionToken,
  [TokenType.SinglePathExpression]: SinglePathExpressionToken,
  [TokenType.FunctionExpression]: FunctionExpressionToken,
  [TokenType.FunctionExpressionParameters]: FunctionExpressionParametersToken,
  [TokenType.FunctionExpressionParameter]: FunctionExpressionParameterToken,
  [TokenType.ParameterName]: ParameterNameToken,
  [TokenType.ParameterAlias]: ParameterAliasToken,
  [TokenType.ParameterValue]: ParameterValueToken,
  [TokenType.CountExpression]: CountExpressionToken,
  [TokenType.RefExpression]: RefExpressionToken,
  [TokenType.ValueExpression]: ValueExpressionToken,
  [TokenType.RootExpression]: RootExpressionToken,
  [TokenType.QueryOptions]: QueryOptionsToken,
  [TokenType.CustomQueryOption]: CustomQueryOptionToken,
  [TokenType.Expand]: ExpandToken,
  [TokenType.ExpandItem]: ExpandItemToken,
  [TokenType.ExpandPath]: ExpandPathToken,
  [TokenType.ExpandCountOption]: ExpandCountOptionToken,
  [TokenType.ExpandRefOption]: ExpandRefOptionToken,
  [TokenType.ExpandOption]: ExpandOptionToken,
  [TokenType.Levels]: LevelsToken,
  [TokenType.Search]: SearchToken,
  [TokenType.SearchExpression]: SearchExpressionToken,
  [TokenType.SearchParenExpression]: SearchParenExpressionToken,
  [TokenType.SearchNotExpression]: SearchNotExpressionToken,
  [TokenType.SearchOrExpression]: SearchOrExpressionToken,
  [TokenType.SearchAndExpression]: SearchAndExpressionToken,
  [TokenType.SearchTerm]: SearchTermToken,
  [TokenType.SearchPhrase]: SearchPhraseToken,
  [TokenType.SearchWord]: SearchWordToken,
  [TokenType.Filter]: FilterToken,
  [TokenType.OrderBy]: OrderByToken,
  [TokenType.OrderByItem]: OrderByItemToken,
  [TokenType.Skip]: SkipToken,
  [TokenType.Top]: TopToken,
  [TokenType.Format]: FormatToken,
  [TokenType.InlineCount]: InlineCountToken,
  [TokenType.Select]: SelectToken,
  [TokenType.SelectItem]: SelectItemToken,
  [TokenType.SelectPath]: SelectPathToken,
  [TokenType.AliasAndValue]: AliasAndValueToken,
  [TokenType.SkipToken]: SkipTokenToken,
  [TokenType.Id]: IdToken,
  [TokenType.Crossjoin]: CrossjoinToken,
  [TokenType.AllResource]: AllResourceToken,
  [TokenType.ActionImportCall]: ActionImportCallToken,
  [TokenType.EntityCollectionFunctionImportCall]: EntityCollectionFunctionImportCallToken,
  [TokenType.EntityFunctionImportCall]: EntityFunctionImportCallToken,
  [TokenType.ComplexCollectionFunctionImportCall]: ComplexCollectionFunctionImportCallToken,
  [TokenType.ComplexFunctionImportCall]: ComplexFunctionImportCallToken,
  [TokenType.PrimitiveCollectionFunctionImportCall]: PrimitiveCollectionFunctionImportCallToken,
  [TokenType.PrimitiveFunctionImportCall]: PrimitiveFunctionImportCallToken,
  [TokenType.FunctionParameters]: FunctionParametersToken,
  [TokenType.FunctionParameter]: FunctionParameterToken,
  [TokenType.ResourcePath]: ResourcePathToken,
  [TokenType.CollectionNavigation]: CollectionNavigationToken,
  [TokenType.CollectionNavigationPath]: CollectionNavigationPathToken,
  [TokenType.SingleNavigation]: SingleNavigationToken,
  [TokenType.PropertyPath]: PropertyPathToken,
  [TokenType.ComplexPath]: ComplexPathToken,
  [TokenType.BoundOperation]: BoundOperationToken,
  [TokenType.BoundActionCall]: BoundActionCallToken,
  [TokenType.BoundEntityFunctionCall]: BoundEntityFunctionCallToken,
  [TokenType.BoundEntityCollectionFunctionCall]: BoundEntityCollectionFunctionCallToken,
  [TokenType.BoundComplexFunctionCall]: BoundComplexFunctionCallToken,
  [TokenType.BoundComplexCollectionFunctionCall]: BoundComplexCollectionFunctionCallToken,
  [TokenType.BoundPrimitiveFunctionCall]: BoundPrimitiveFunctionCallToken,
  [TokenType.BoundPrimitiveCollectionFunctionCall]: BoundPrimitiveCollectionFunctionCallToken,
  [TokenType.ODataUri]: ODataUriToken,
  [TokenType.Batch]: BatchToken,
  [TokenType.Entity]: EntityToken,
  [TokenType.Metadata]: MetadataToken
};
