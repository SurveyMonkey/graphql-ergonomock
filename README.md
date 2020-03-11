
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
  <a href="https://github.com/joual/graphql-ergonomock">
    <!-- <img src="images/logo.png" alt="Logo" width="80" height="80"> -->
  </a>

  <h3 align="center">GraphQL Ergonomock</h3>

  <p align="center">
    Developer-friendly automock for GraphQL
    <br />
    <a href="https://github.com/joual/graphql-ergonomock/issues">Report Bug</a>
    ·
    <a href="https://github.com/joual/graphql-ergonomock/issues">Request Feature</a>
  </p>
</p>



<!-- TABLE OF CONTENTS -->
## Table of Contents

- [Table of Contents](#table-of-contents)
- [About The Project](#about-the-project)
  - [Basic Example](#basic-example)
  - [Built With](#built-with)
- [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Usage](#usage)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)
- [Acknowledgements](#acknowledgements)



<!-- ABOUT THE PROJECT -->
## About The Project

This library provides a developer-friendly method to mock your GraphQL requests. By default, it ships with the following features:

* **Automatic mocking** of types and fields based on schema definition.
* *Deterministic randomization* of mocked values based on the provided mock shape, to support usage of features such as snapshots.
* Support for queries using *fragments, unions & interfaces*.
* Allows usage of *functions as mock values*, which have the signature of a GraphQL resolver, and are resolved at runtime.

### Basic Example

```js
import { mock } from 'graphql-ergonomock';

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

const resp = mock(schema, query, mocks);
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

### Built With
This section should list any major frameworks that you built your project using. Leave any add-ons/plugins for the acknowledgements section. Here are a few examples.
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

TBD


<!-- ROADMAP -->
## Roadmap

See the [open issues](https://github.com/joual/graphql-ergonomock/issues) for a list of proposed features (and known issues).



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

Project Link: [https://github.com/joual/graphql-ergonomock](https://github.com/joual/graphql-ergonomock)



<!-- ACKNOWLEDGEMENTS -->
## Acknowledgements

* [A new approach to mocking GraphQL Data](https://www.freecodecamp.org/news/a-new-approach-to-mocking-graphql-data-1ef49de3d491/)
* [GraphQL-Tools](https://github.com/apollographql/graphql-tools)
* [GraphQL-JS](https://github.com/graphql/graphql-js)


<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/joual/graphql-ergonomock.svg?style=flat-square
[contributors-url]: https://github.com/joual/graphql-ergonomock/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/joual/graphql-ergonomock.svg?style=flat-square
[forks-url]: https://github.com/joual/graphql-ergonomock/network/members
[stars-shield]: https://img.shields.io/github/stars/joual/graphql-ergonomock.svg?style=flat-square
[stars-url]: https://github.com/joual/graphql-ergonomock/stargazers
[issues-shield]: https://img.shields.io/github/issues/joual/graphql-ergonomock.svg?style=flat-square
[issues-url]: https://github.com/joual/graphql-ergonomock/issues
[license-shield]: https://img.shields.io/github/license/joual/graphql-ergonomock.svg?style=flat-square
[license-url]: https://github.com/joual/graphql-ergonomock/blob/master/LICENSE.txt
[circleci-shield]: https://circleci.com/gh/joual/graphql-ergonomock.svg?style=shield
[circleci-url]: https://app.circleci.com/pipelines/github/joual/graphql-ergonomock
[codecov-shield]: https://codecov.io/gh/joual/graphql-ergonomock/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/joual/graphql-ergonomock
[product-screenshot]: images/screenshot.png