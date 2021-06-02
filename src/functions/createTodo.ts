import { APIGatewayProxyHandler } from "aws-lambda";
import { v4 as uuidv4 } from "uuid";

import { document } from "src/utils/dynamodbClient";
import dayjs from "dayjs";

interface ICreateTodo {
  title: string;
  deadline: Date;
}

export const handle: APIGatewayProxyHandler = async (event) => {
  const { user_id } = event.pathParameters;
  const { title, deadline } = JSON.parse(event.body) as ICreateTodo;
  const todo_id = uuidv4();
  const deadlineDate = dayjs(deadline).format("DD-MM-YYYY");

  document
    .put({
      TableName: "todos",
      Item: {
        id: todo_id,
        user_id,
        title,
        done: false,
        deadline: deadlineDate,
      },
    })
    .promise();

  return {
    statusCode: 201,
    body: JSON.stringify({
      message: "Todo created!",
      todo: {
        id: todo_id,
        user_id,
        title,
        done: false,
        deadline: new Date(deadline),
      },
    }),

    headers: {
      "Content-Type": "application/json",
    },
  };
};
