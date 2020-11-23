# Validate JSON with TypeScript

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

#### JSON type checking (part 1)

This is already a powerful approach.  Let's imagine your build pipeline creates a JSON file which is then used in your TypeScript build.  The TypeScript compilation will validate all properties that are exercised within your TypeScript codebase. Consider:

```ts
function doSomethingWithJson(json: JsonToTest) {
    console.log(json.a.piece);
}
```

The above code would start to error if it encountered a JSON module which was missing a `piece` property like so: `Property 'piece' does not exist on type '{ json: string; would: string; to: string; }'.ts(2339)`

And this is great. However, it's possible that not all of the types in the JSON are not directly consumed in the TypeScript codebase; perhaps the JSON is handed over to a client for consumption. Ideally it'd be nice to catch if anything is missing before we get to that point.

So maybe it would be good to have an `interface` that represents the JSON type and verify that the type inferred by the TypeScript compiler matches our interface. [It's worth noting that the TypeScript themselves advise preferring `interfaces` over `type`s.](https://github.com/microsoft/TypeScript/wiki/Performance#preferring-interfaces-over-intersections).

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">We tried for a long time to paper over the distinction because of people&#39;s personal choices, but ultimately unless we actually simplify the types internally (could happen) they&#39;re not really the same, and interfaces behave better.<a href="https://t.co/TZgpIuKtRc">https://t.co/TZgpIuKtRc</a></p>&mdash; Daniel Rosenwasser (@drosenwasser) <a href="https://twitter.com/drosenwasser/status/1319205566393192448?ref_src=twsrc%5Etfw">October 22, 2020</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

#### JSON type checking: part 2

So we've written ourselves an interface:

```ts
interface ValidType {
    here: string;
    a: {
        piece: string;
        json: string;
        would: string;
        to: string;
    };
}
```

We'd like to compare this interface to the type being derived from the JSON.

Here we delve into the depths of extreme TypeScript Fu. I speak, of course, of [conditional types](https://www.typescriptlang.org/docs/handbook/advanced-types.html#conditional-types). To quote the docs:

> A conditional type selects one of two possible types based on a condition expressed as a type relationship test:
>
> `T extends U ? X : Y`
>
> The type above means when `T` is assignable to `U` the type is `X`, otherwise the type is `Y`.

What's perhaps not obvious here is that conditional types are essentially *programs that run in the context of the type system*.  This is not a post directly about conditional types; for the definitive read on the topic I'd recommend [David Sheldrick's "Conditional Types in TypeScript"](https://artsy.github.io/blog/2018/11/21/conditional-types-in-typescript/). However we're about to use conditional types in anger.

You see, it turns out that you can use conditional types to compare type equality. This was documented by [Matt McCutchen's comment on the TypeScript GitHub repo](https://github.com/microsoft/TypeScript/issues/27024#issuecomment-421529650).

> Here's a solution that makes creative use of the assignability rule for conditional types, which requires that the types after extends be "identical" as that is defined by the checker:
>
> ```ts
>  export type Equals<X, Y> =
>    (<T>() => T extends X ? 1 : 2) extends
>    (<T>() => T extends Y ? 1 : 2) ? true : false;
> ```

We can unpack this a little by gently refactoring:

```ts
/**
 * The two types passed are evaluated for equivalence; returning true if they
 * are equivalent types and false if not
 */
type Equals<Type1, Type2> =
    (<T>() => T extends Type1 ? "match!" : "not a match") extends
    <T>() => T extends Type2 ? "match!" : "not a match"
    ? true
    : false;
```

This works due to the determination of assignability of conditional types being deferred when `T` is not known. Behind the scenes, the compiler will evaluate if both conditional types have the same constraint *and* that the true and false branches of both conditions are the same type.

**-- see https://stackoverflow.com/questions/64947040/typescript-testing-conditional-type-equality-understanding-the-syntax/64947162#64947162 IS THIS CORRECT / CAN THIS BE RELIED UPON BEHAVIOUR-WISE?**

Now we have a mechanism for comparing types.  Awesome.  Now let's use it; we'll to enforce that our imported JSON module is of the same type as our interface like so:

```ts
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
```

By writing `type _test = IsTrue<Equals<JsonToTest, ValidType>>` we're getting the TypeScript compiler to (at compile time) evaluate that `JsonToTest` matches our `interface` of `ValidType`.  If it doesn't, the compiler raises an error and the build fails.  And because, these are all `type`s they will be stripped during compilation.  There's no runtime overhead here.

A complete TypeScript file that illustrates this might be called `equal.ts` and look like so:

```ts
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
```