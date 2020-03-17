import React, { ReactElement } from "react";
import { render } from "@testing-library/react";
import { gql, useQuery } from "@apollo/client";
import schema from '../../__tests__/schema';
import MockedProvider from '../ErgonoMockedProvider';

const Parent = (props): ReactElement => {
  return (
    <div>
      <ChildA />
    </div>
  );
};

const QUERY_A = gql`
  query OperationA {
    returnString
    returnInt
  }
`;

const ChildA = (props): ReactElement => {
  const { loading, error, data } = useQuery(QUERY_A);
  if (loading) return <p>Component ChildA: Loading</p>;
  if (error) return <p>Component ChildA: Error</p>;

  return <div>Component ChildA. returnString: {data.returnString} returnInt: {data.returnInt} </div>;
};

test("Can render a nested tree of components with appropriate mocking", async () => {
  const spy = jest.fn();
  const { findByText } = render(
    <MockedProvider schema={schema} onCall={spy}>
      <Parent/>
    </MockedProvider>
  );

  expect(await findByText(/returnString: Hello World/)).toBeVisible();
  expect(await findByText(/returnInt: -?[0-9]+/)).toBeVisible();
  const { operation, response } = spy.mock.calls[0][0];
  expect(operation.operationName).toEqual('OperationA');
  expect(operation.variables).toEqual({});
  expect(response).toMatchObject({
    data: {
      returnString: expect.toBeString(),
      returnInt: expect.toBeNumber()
    }
  })
});
