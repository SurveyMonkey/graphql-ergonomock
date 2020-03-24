
<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->
[![CircleCI][circleci-shield]][circleci-url]
[![CodeCov][codecov-shield]][codecov-url]
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]



<!-- PROJECT LOGO -->
<br />
<p align="center">
  <a href="https://github.com/SurveyMonkey/graphql-ergonomock">
  </a>

  <h3 align="center">GraphQL Ergonomock</h3>

  <p align="center">
    🔮 Developer-friendly automagical mocking for GraphQL
    <br />
    <a href="https://github.com/SurveyMonkey/graphql-ergonomock/issues">Report Bug</a>
    ·
    <a href="https://github.com/SurveyMonkey/graphql-ergonomock/issues">Request Feature</a>
  </p>
</p>



<!-- TABLE OF CONTENTS -->
## Table of Contents

- [Table of Contents](#table-of-contents)
- [About The Project](#about-the-project)
  - [Basic Example](#basic-example)
  - [Basic Example (Apollo)](#basic-example-apollo)
  - [Built With](#built-with)
- [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Usage](#usage)
    - [Default Case](#default-case)
    - [ErgonoMockedProvider for Use with Apollo-Client](#ergonomockedprovider-for-use-with-apollo-client)
    - [Providing Functions as Resolver in the Mock Shape](#providing-functions-as-resolver-in-the-mock-shape)
    - [Mocking Errors](#mocking-errors)
    - [Mocking Mutations](#mocking-mutations)
- [API](#api)
  - [`ergonomock()`](#ergonomock)
  - [`<ErgonoMockedProvider>`](#ergonomockedprovider)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)
- [Acknowledgements](#acknowledgements)



<!-- ABOUT THE PROJECT -->
## About The Project

This library provides a developer-friendly method to mock your GraphQL requests. By default, it ships with the following features:

* **Automatic mocking** of types and fields based on schema definition.
* **Deterministic randomization** of mocked values based on the provided mock shape, to support usage of features such as snapshots.
* Support for queries using **fragments, unions & interfaces**.
* Allows usage of **functions as mock values**, which have the signature of a GraphQL resolver, and are resolved at runtime.

### Basic Example

```js
import { ergonomock } from 'graphql-ergonomock';

// Given a particular GraphQL Schema, ...
const schema = gql`
  type Shape {
    id: ID!
    returnInt: Int
    nestedShape: Shape
    returnBoolean: Boolean
  }

  type Query {
    getShape: Shape
  }
`;

// ...a GraphQL query, ...
const query = gql`
{
  getShape {
    id
    nestedShape {
      returnInt
      nestedShape {
        returnInt
        returnBoolean
      }
    }
  }
}
`;

// ...and a partial, possibly nested shape of data...
const mocks = {
  getShape: {
    nestedShape: {
      returnInt: 5,
      nestedShape: {
        returnInt: 10
      }
    }
  }
};

// ... provides the expected object filled with mock data
const resp = ergonomock(schema, query, mocks);
expect(resp.data).toMatchObject({
  id: expect.toBeString(),
  nestedShape: {
    returnInt: 5,
    nestedShape: {
      returnInt: 10,
      returnBoolean: expect.toBeBoolean()
    }
  }
}); // ✅ test pass
```

### Basic Example (Apollo)

```js
import MockedProvider from "../ErgonoMockedProvider";

// Given a particular GraphQL Schema, ...
const schema = gql`
  type Shape {
    id: ID!
    returnInt: Int
    returnBoolean: Boolean
  }

  type Query {
    getShape: Shape
  }
`;

// ...a component making a query ...
const QUERY = gql`
query MyQuery {
  getShape {
    id
    returnInt
    returnBoolean
  }
}
`;
const MyComponent = () => {
  const { loading, error, data } = useQuery(QUERY);
  if (loading) return <p>Loading</p>;
  if (error) return <p>Error</p>;

  return (
    <div>
      MyComponent.
      <div>String: {data.getShape.returnString}</div>
      <div>Boolean: {data.getShape.returnBoolean}</div>
    </div>
  );
};

test("MyComponent can render the query results.", async () => {
  const mocks = {
    MyQuery: {
      getShape: { returnString: "John Doe" }
    }
  };
  const { findByText } = render(
    <MockedProvider schema={schema} mocks={mocks}>
      <MyComponent />
    </MockedProvider>
  );
  expect(await findByText(/String: John Doe/)).toBeVisible();
  expect(await findByText(/Boolean: (true|false)/)).toBeVisible();
}); // ✅ test pass
```

### Built With
* [Typescript](https://www.typescriptlang.org/)
* [GraphQL](https://graphql.org)
* [Jest](https://jestjs.io)



<!-- GETTING STARTED -->
## Getting Started

### Installation

```shell
npm i graphql-ergonomock --save-dev
```

<!-- USAGE EXAMPLES -->
### Usage

#### Default Case
The `ergonomock()` function can be used on its own to create mock responses out of GraphQL queries.

<details>
<summary>See example</summary>
<p>

```js
import { ergonomock } from 'graphql-ergonomock';
import schema from '../my-schema.graphql';

test("I can mock a response", () => {
  const resp = ergonomock(schema, 'query MyCrucialOperation { car { id, plateNumber } }', {
    mocks: { car: { plateNumber: '123abc' } }
  });

  expect(resp).toMatchObject({
    data: {
      car: {
        id: expect.toBeString(),
        plateNumber: '123abc'
      }
    }
  });
});
```
</p>
</details>

#### ErgonoMockedProvider for Use with Apollo-Client

If your app uses Apollo-Client, you can also use `ErgonoMockedProvider` which wraps `ergonomock()`. The generated values are stable & deterministic based on the query name, shape, and variables (this is so you can leverage testing snapshots if you are so inclined).

<details>
<summary>See example</summary>
<p>

```jsx
import { ErgonoMockedProvider as MockedProvider } from 'graphql-ergonomock';
import schema from '../my-schema.graphql';

test("I can mock a response", () => {
  const mocks = {
    MyCrucialOperation: {
      car: { plateNumber: '123abc' }
    }
  };
  const { findByText } = render(
    <MockedProvider schema={schema} mocks={mocks}>
      <MyApp />
    </MockedProvider>
  );
  expect(await findByText(/'123abc'/)).toBeVisible();
});
```
</p>
</details>

If a particular component is called multiple times in the React tree (but with different variables), you can provide a function as value for an operation, and the function will be called with the `operation: GraphQLOperation` as first and only argument.
<br />
<details>
<summary>See example</summary>
<p>

```jsx
import { ErgonoMockedProvider as MockedProvider } from 'graphql-ergonomock';
import schema from '../my-schema.graphql';

test("I can mock a response with a function", () => {
  let cardinality = 0;
  const mocks = {
    MyCrucialOperation: (operation) => ({ plateNumber: `aaa00${cardinality++}` })
  };
  const { findAllByText } = render(
    <MockedProvider schema={schema} mocks={mocks}>
      <MyApp />
    </MockedProvider>
  );
  expect(await findAllByText(/'aaa00'/)).toHaveLength(3);
});
```
</p></details>

Finally, you can spy on executed operations via the `onCall` prop.
<br />
<details>
<summary>See example</summary><p>

```jsx
const spy = jest.fn();
const { findByText } = render(
  <MockedProvider schema={schema} onCall={spy}>
    <MyComponent id="1" />
    <MyComponent id="2" />
    <MyComponent id="3" />
  </MockedProvider>
);

//...
expect(spy.mock.calls).toHaveLength(3);
const { operation, response } = spy.mock.calls[0][0];
expect(operation.variables.id).toEqual("1");
```
</p></details>




#### Providing Functions as Resolver in the Mock Shape

You can use functions for any part of the nested mock, and it will be used as a resolver for this field. The typical signature for a resolver is `(root, args, context, info) => any`.

<details>
<summary>See example</summary><p>

```js
// ...
const mocks = {
  returnShape: {
    returnInt: 4321,
    nestedShape: (root: any, args: any, ctx: any, info: any) => {
      return {
        returnInt: root.someField ? 1234 : 5678
      };
    }
  }
}
//...
```
</p></details>


#### Mocking Errors

You can return or throw errors within the mock shape.

<details>
<summary>See example</summary><p>

```js
const testQuery = gql`
  {
    getCar {
      id
    }
  }
`;

const resp = ergonomock(schema, testQuery, {
  mocks: {
    getCar: () => { throw new Error("Server Error"); }
    // or simply getCar: new Error("Server Error")
  }
});

console.log(resp.data.getCar); // null
console.log(resp.errors[0]); // { message: "Server Error", ...}
```
</p></details>


#### Mocking Mutations

You can mock mutations, but if you are using `ergonomock()` directly, you'll have to provide the correct variables for the operation in order for it to not fail.

<details>
<summary>See example</summary><p>

```jsx
test("Can partially mock mutations", () => {
  const query = /* GraphQL */ `
    mutation SampleQuery($input: ShapeInput!) {
      createShape(input: $input) {
        id
        returnInt
        returnString
      }
    }
  `;

  const resp: any = ergonomock(schema, query, {
    mocks: {
      createShape: { id: "567" }
    },
    variables: {
      input: { someID: "123", someInt: 123 }
    }
  });

  expect(resp.data.createShape).toMatchObject({
    id: "567",
    returnInt: expect.toBeNumber(),
    returnString: expect.toBeString()
  });
});
```
</p></details>


## API

### `ergonomock()`

The `ergonomock(schema, query, options)` function takes 3 arguments

1. _(required)_ A GraphQL **schema** (not in SDL form).
2. _(required)_ A GraphQL **query**, either in SDL (string) form, or `DocumentNode`.
3. _(optional)_ An option object.
   1. `mocks` is an object that can partially or fully match the expected response shape.
   2. `seed` is a string used to seed the random number generator for automocked values.
   3. `variables` is the variable values object used in the query or mutation.


### `<ErgonoMockedProvider>`

This component's props are very similar to Apollo-Client's [MockedProvider](https://www.apollographql.com/docs/react/api/react-testing/#mockedprovider). The only differences are:

- `mocks` is an object where keys are the operation names and the values are the `mocks` input that `ergonomock()` would accept. (i.e. could be empty, or any shape that matches the expected response.)
- `onCall` is a handler that gets called by any executed query. The call signature is `({operation: GraphQLOperation, response: any}) => void` where response is the full response being returned to that single query. The purpose of `onCall` is to provide some sort of spy (or `jest.fn()`) to make assertions on which calls went through, with which variables, and get a handle on the generated values from `ergonomock()`.

<!-- ROADMAP -->
## Roadmap

See the [open issues](https://github.com/SurveyMonkey/graphql-ergonomock/issues) for a list of proposed features (and known issues).


<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request



<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE` for more information.


<!-- CONTACT -->
## Contact

Maintainer: Joel Marcotte (Github @joual)

Project Link: [https://github.com/SurveyMonkey/graphql-ergonomock](https://github.com/SurveyMonkey/graphql-ergonomock)


<!-- ACKNOWLEDGEMENTS -->
## Acknowledgements

* [A new approach to mocking GraphQL Data](https://www.freecodecamp.org/news/a-new-approach-to-mocking-graphql-data-1ef49de3d491/)
* [GraphQL-Tools](https://github.com/apollographql/graphql-tools)
* [GraphQL-JS](https://github.com/graphql/graphql-js)


<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/SurveyMonkey/graphql-ergonomock.svg?style=flat-square
[contributors-url]: https://github.com/SurveyMonkey/graphql-ergonomock/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/SurveyMonkey/graphql-ergonomock.svg?style=flat-square
[forks-url]: https://github.com/SurveyMonkey/graphql-ergonomock/network/members
[stars-shield]: https://img.shields.io/github/stars/SurveyMonkey/graphql-ergonomock.svg?style=flat-square
[stars-url]: https://github.com/SurveyMonkey/graphql-ergonomock/stargazers
[issues-shield]: https://img.shields.io/github/issues/SurveyMonkey/graphql-ergonomock.svg?style=flat-square
[issues-url]: https://github.com/SurveyMonkey/graphql-ergonomock/issues
[license-shield]: https://img.shields.io/github/license/SurveyMonkey/graphql-ergonomock.svg?style=flat-square
[license-url]: https://github.com/SurveyMonkey/graphql-ergonomock/blob/master/LICENSE.txt
[circleci-shield]: https://circleci.com/gh/SurveyMonkey/graphql-ergonomock.svg?style=shield
[circleci-url]: https://app.circleci.com/pipelines/github/SurveyMonkey/graphql-ergonomock
[codecov-shield]: https://codecov.io/gh/SurveyMonkey/graphql-ergonomock/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/SurveyMonkey/graphql-ergonomock