# OData(V4) URI Parser

[![npm (scoped)](https://img.shields.io/npm/v/@odata/parser)](https://www.npmjs.com/package/@odata/parser)
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/Soontao/odata-v4-parser/Node%20CI?label=nodejs)](https://github.com/Soontao/odata-v4-parser/actions?query=workflow%3A%Node+CI%22)
[![Codecov](https://codecov.io/gh/Soontao/odata-v4-parser/branch/master/graph/badge.svg)](https://codecov.io/gh/Soontao/odata-v4-parser)


OData v4 parser based on OASIS Standard OData v4 ABNF grammar

## Usage

```js
const { Parser } = require('odata-v4-parser');
const parser = new Parser()
parser.filter("Title eq 'Article1'");
```

## [CHANGELOG](./CHANGELOG.md)
