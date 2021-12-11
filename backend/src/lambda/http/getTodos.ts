import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getJwtToken } from '../utils';
import { getTodosForUser } from '../../helpers/todos';
import { createLogger } from '../../utils/logger'

const logger = createLogger('gettodos')
// TODO: Get all TODO items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Write your code here
    const Jwt = getJwtToken(event)

    const todos = await getTodosForUser(Jwt)

    logger.info(`the final array result = ${todos}`)
    return {
      statusCode: 200,
      body: JSON.stringify({
        items: todos
      })
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
