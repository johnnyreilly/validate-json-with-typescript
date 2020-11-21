import * as jsonToTest from './jsonToTest.json';

type JsonToTest = typeof jsonToTest;

function doSomethingWithJson(json: JsonToTest) {
    console.log(json.a.piece);
}

doSomethingWithJson(jsonToTest);