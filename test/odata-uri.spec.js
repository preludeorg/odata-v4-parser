import { Parser } from "../src/parser";


describe('OData URI Test Suite', () => {
    const parser = new Parser()

    it('should parser uri', () => {
        
        parser.odataUri("/Categories?$skip=30")
        parser.odataUri("/Categories(10)?$expand=A,C&$select=D,E")

    });

});