import * as jsonToTest from './jsonToTest.json';

type JsonToTest = typeof jsonToTest;

// Based upon Matt McCutchen's comment:
// https://github.com/microsoft/TypeScript/issues/27024#issuecomment-421529650
export type Equals<Type1, Type2> = 
    (<T>() => T extends Type1 ? "match!" : "not a match") extends 
    <T>() => T extends Type2 ? "match!" : "not a match" 
    ? true 
    : false;

// eslint-disable-next-line @typescript-eslint/no-empty-function
function assertType<_T extends true>() {}

assertType<Equals<JsonToTest, ValidType>>();

interface ValidType {
    here: string;
    a: {
        piece: string;
        json: string;
        would: string;
        to: string;
    };
}