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

const QUERY_B = gql`
  query OperationB {
    returnEnum
    returnFloat
  }
`;

const ChildB = (props): ReactElement => {
  return <div></div>;
};

test("Can render a nested tree of components with appropriate mocking", async () => {
  const { findByText } = render(
    <MockedProvider schema={schema}>
      <Parent/>
    </MockedProvider>
  );

  expect(await findByText(/Hello World/)).toBeVisible();
});
