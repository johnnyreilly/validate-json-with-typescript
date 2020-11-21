import * as jsonToTest from './jsonToTest.json';

type JsonToTest = typeof jsonToTest;

interface ValidType {
    here: string;
    a: {
        piece: string;
        json: string;
        would: string;
        to: string;
    };
}

/**
 * The two types passed are evaluated for equivalence; returning true if they
 * are equivalent types and false if not
 * 
 * Based upon Matt McCutchen's comment:
 * https://github.com/microsoft/TypeScript/issues/27024#issuecomment-421529650
 */
type Equals<Type1, Type2> =
    (<T>() => T extends Type1 ? "match!" : "not a match") extends
    <T>() => T extends Type2 ? "match!" : "not a match"
    ? true
    : false;

/**
 * This is a type assertion that tests the truthiness of the type argument supplied 
 */
type IsTrue<T extends true> = T

/**
 * This expression will evaluate that our types match; note
 * the underscore at the start which indicates this is expected
 * to be an unused type 
 */
type _test = IsTrue<Equals<JsonToTest, ValidType>>
