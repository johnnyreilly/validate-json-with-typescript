# validate-json-with-typescript

This is a journey into how we can validate JSON with TypeScript.  We can do this thanks to an advanced TypeScript feature called conditional types.

We're going to want a TypeScript project to test this out with. Let's drop to the command line and:

```bash
mkdir validate-json-with-typescript
cd validate-json-with-typescript
npm install typescript
npx tsc --init # create a tsconfig.json
```

We now have a TypeScript project set up. We need to tweak our brand new `tsconfig.json` file in order that TypeScript can resolve JSON files as modules.  We do this with the `resolveJsonModule` option that includes modules imported with '.json' extension. So let's add this to our `tsconfig.json` file:

```json
{
    //...
    "resolveJsonModule": true,
    //...
}
```

#### Inferring the JSON type

Let's test out importing a JSON module and subsequently getting the type of it.  We'll create ourselves a JSON file to import as a module called `jsonToTest.json`:

```json
{
    "here": "is",
    "a": {
        "piece": "of",
        "json": "we",
        "would": "like",
        "to": "validate"
    }
}
```

Now we have our JSON file, let's create a TypeScript file called `importJsonModule.ts` that will import it:

```ts
import * as jsonToTest from './jsonToTest.json';

type JsonToTest = typeof jsonToTest;

function doSomethingWithJson(json: JsonToTest) {
    console.log(json.a.piece);
}

doSomethingWithJson(jsonToTest);
```

The exciting piece here is the `type JsonToTest = typeof jsonToTest;`; here we're using the TypeScript compiler to infer the type of the JSON module that's been imported.  If you hover over the `JsonToTest` type you'll see the type that is inferred as:  

```ts
type JsonToTest = {
    here: string;
    a: {
        piece: string;
        json: string;
        would: string;
        to: string;
    };
}
```

#### Comparing a type to an interface

This is already a powerful approach.  Let's imagine your build pipeline creates a JSON file which is then used in your TypeScript build.  The TypeScript compilation will validate all properties that are exercised within your TypeScript codebase. Consider:

```ts
function doSomethingWithJson(json: JsonToTest) {
    console.log(json.a.piece);
}
```

The above code would start to error if it encountered a JSON module which was missing a `piece` property like so: `Property 'piece' does not exist on type '{ json: string; would: string; to: string; }'.ts(2339)`

And this is great. However, it's possible that not all of the types in the JSON are not directly consumed in the TypeScript codebase; perhaps the JSON is handed over to a client for consumption.

Alternatively, you may want to use an `interface` in place of a `type` [following the guidance of the TypeScript team](https://github.com/microsoft/TypeScript/wiki/Performance#preferring-interfaces-over-intersections).

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">We tried for a long time to paper over the distinction because of people&#39;s personal choices, but ultimately unless we actually simplify the types internally (could happen) they&#39;re not really the same, and interfaces behave better.<a href="https://t.co/TZgpIuKtRc">https://t.co/TZgpIuKtRc</a></p>&mdash; Daniel Rosenwasser (@drosenwasser) <a href="https://twitter.com/drosenwasser/status/1319205566393192448?ref_src=twsrc%5Etfw">October 22, 2020</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

not using props
interfaces better 

