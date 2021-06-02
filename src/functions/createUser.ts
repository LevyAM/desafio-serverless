import { APIGatewayProxyHandler } from "aws-lambda";
import { v4 as uuidv4 } from "uuid";
import { hash } from "bcryptjs";

import { document } from "../utils/dynamodbClient";

interface ICreateUser {
  username: string;
  password: string;
}

export const handle: APIGatewayProxyHandler = async (event) => {
  const { username, password } = JSON.parse(event.body) as ICreateUser;

  const response = await document
    .scan({
      TableName: "users",
      ProjectionExpression: "username, id",
    })
    .promise();

  const userExists = response.Items.find((user) => user.username === username);

  if (userExists)
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "User already exists",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    };

  const user_id = uuidv4();

  const passwordHash = await hash(password, 7);

  document
    .put({
      TableName: "users",
      Item: {
        id: user_id,
        username,
        password: passwordHash,
      },
    })
    .promise();

  return {
    statusCode: 201,
    body: JSON.stringify({
      message: "User created",
      user: {
        id: user_id,
        username,
      },
    }),
    headers: {
      "Content-Type": "application/json",
    },
  };
};
