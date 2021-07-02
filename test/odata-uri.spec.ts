import { ServiceMetadata } from '@odata/metadata';
import { defaultParser } from '../src';


describe('OData URI Test Suite', () => {

  const schoolMeta = ServiceMetadata.processMetadataJson(require('./resources/school.edmx.json'));

  it('should support parser uri', () => {

    defaultParser.odataUri('/Categories?$skip=30');
    defaultParser.odataUri('/Categories(10)?$expand=A,C&$select=D,E');
    const ast = defaultParser.odataUri('/Classes?$expand=students/student', { metadata: schoolMeta.edmx });

    expect(ast).not.toBeUndefined();

  });

  it('should support empty query', () => {
    const ast = defaultParser.odataUri('/Categories?');
    expect(ast).not.toBeUndefined()
    expect(ast?.value?.query).not.toBeUndefined()
    expect(ast.value?.query?.value?.options).toBeNull()
    expect(ast.value?.resource?.raw).toBe("Categories")

  });

});
