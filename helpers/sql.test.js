const { sqlForPartialUpdate } = require("./sql")

describe("sqlForPartialUpdate", function () {
    test("works updating 2 items", function () {
        const result = sqlForPartialUpdate(
            {f1: "Aliya"},
            {f1: "f1", fF2: "f2"})
        expect(result).toEqual({
            setCols:"\"f1\"=$1",
            values: ["Aliya"]
        })
    });
    test("returns error message with missing data", function () {
        const result = sqlForPartialUpdate(
            {f1: ""},
            {f1: "f1", fF2:"f2"})
        expect(result).toEqual({
            setCols:"\"f1\"=$1",
            values: [""]
        })
    })
});