import { Parser } from "../src/parser";
import { ServiceMetadata } from "@odata/metadata";


describe('OData URI Test Suite', () => {

    const schoolMeta = ServiceMetadata.processMetadataJson(require("./resources/school.edmx.json"))

    const parser = new Parser()

    it('should parser uri', () => {



        parser.odataUri("/Categories?$skip=30")
        parser.odataUri("/Categories(10)?$expand=A,C&$select=D,E")
        const ast = parser.odataUri("/Classes?$expand=students/student", { metadata: schoolMeta.edmx })

        expect(ast).not.toBeUndefined()
    
    });

});