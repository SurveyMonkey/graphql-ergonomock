import React, { ReactElement } from "react";
import { render } from "@testing-library/react";
import { gql, useQuery } from "@apollo/client";
import schema from "../../__tests__/schema";
import MockedProvider from "../ErgonoMockedProvider";

const Parent = (props): ReactElement => {
  return (
    <div>
      <ChildA shapeId={props.shapeId} />
    </div>
  );
};

const QUERY_A = gql`
  query OperationA($shapeId: String) {
    queryShape(id: $shapeId) {
      id
      returnInt
      returnString
    }
  }
`;

const ChildA = ({ shapeId }: { shapeId: string }): ReactElement => {
  const { loading, error, data } = useQuery(QUERY_A, { variables: { shapeId } });
  if (loading) return <p>Component ChildA: Loading</p>;
  if (error) return <p>Component ChildA: Error</p>;

  return (
    <div>
      Component ChildA. returnString: {data.queryShape.returnString} returnInt:{" "}
      {data.queryShape.returnInt}{" "}
    </div>
  );
};

test("Can render a nested tree of components with appropriate mocking", async () => {
  const spy = jest.fn();
  const { findByText } = render(
    <MockedProvider schema={schema} onCall={spy}>
      <Parent />
    </MockedProvider>
  );

  expect(await findByText(/returnString: Hello World/)).toBeVisible();
  expect(await findByText(/returnInt: -?[0-9]+/)).toBeVisible();
  const { operation, response } = spy.mock.calls[0][0];
  expect(operation.operationName).toEqual("OperationA");
  expect(operation.variables).toEqual({});
  expect(response).toMatchObject({
    data: {
      queryShape: {
        returnString: expect.toBeString(),
        returnInt: expect.toBeNumber()
      }
    }
  });
});

test("can accept mocks per operation name", async () => {
  const spy = jest.fn();
  const mocks = {
    OperationA: {
      queryShape: {
        returnString: "John Doe"
      }
    }
  };
  const { findByText } = render(
    <MockedProvider schema={schema} onCall={spy} mocks={mocks}>
      <Parent />
    </MockedProvider>
  );

  expect(await findByText(/returnString: John Doe/)).toBeVisible();
  expect(await findByText(/returnInt: -?[0-9]+/)).toBeVisible();
  const { operation, response } = spy.mock.calls[0][0];
  expect(operation.operationName).toEqual("OperationA");
  expect(operation.variables).toEqual({});
  expect(response).toMatchObject({
    data: {
      queryShape: {
        returnString: "John Doe",
        returnInt: expect.toBeNumber()
      }
    }
  });
});

test("can mock the same operation multiple times in the same tree", async () => {
  const spy = jest.fn();
  const mocks = {
    OperationA: {
      queryShape: {
        returnString: "John Doe"
      }
    }
  };
  const { findAllByText } = render(
    <MockedProvider schema={schema} onCall={spy} mocks={mocks}>
      <>
        <Parent shapeId="123" />
        <Parent shapeId="124" />
      </>
    </MockedProvider>
  );

  expect(await findAllByText(/returnString: John Doe/)).toHaveLength(2);
  expect(await findAllByText(/returnInt: -?[0-9]+/)).toHaveLength(2);
  const { operation, response } = spy.mock.calls[0][0];
  expect(spy).toHaveBeenCalledTimes(2);
  expect(operation.operationName).toEqual("OperationA");
  expect(operation.variables).toEqual({ shapeId: "123" });
  expect(response).toMatchObject({
    data: {
      queryShape: {
        returnString: "John Doe",
        returnInt: expect.toBeNumber()
      }
    }
  });
});

test("can mock the same operation multiple times with a function", async () => {
  const spy = jest.fn();
  const mocks = {
    OperationA: (operation) => {
      return {
        queryShape: {
          id: operation.variables.shapeId, // you need to return the ID to have separate cache entry
          returnString: `John Doe ${operation.variables.shapeId}`
        }
      }
    }
  };
  const { findAllByText } = render(
    <MockedProvider schema={schema} onCall={spy} mocks={mocks}>
      <>
        <Parent shapeId="123" />
        <Parent shapeId="124" />
      </>
    </MockedProvider>
  );

  expect(await findAllByText(/returnString: John Doe 123/)).toHaveLength(1);
  expect(await findAllByText(/returnString: John Doe 124/)).toHaveLength(1);
  expect(await findAllByText(/returnInt: -?[0-9]+/)).toHaveLength(2);
  const { operation, response } = spy.mock.calls[0][0];
  expect(spy).toHaveBeenCalledTimes(2);
  expect(operation.operationName).toEqual("OperationA");
  expect(operation.variables).toEqual({ shapeId: "123" });
  expect(response).toMatchObject({
    data: {
      queryShape: {
        returnString: "John Doe 123",
        returnInt: expect.toBeNumber()
      }
    }
  });
});
