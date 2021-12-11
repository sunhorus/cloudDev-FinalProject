import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { updateTodo } from '../../helpers/todos'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getJwtToken } from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('updatetodo')

export const handler = middy(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        logger.info('Processing update event: ', event)
        const todoId = event.pathParameters.todoId
        const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
        // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object

        const jwtToken = getJwtToken(event);

        await updateTodo(updatedTodo, todoId, jwtToken)

        return {
            statusCode: 204,
            body: null
        }
    }
)

handler
    .use(httpErrorHandler())
    .use(
        cors({
            credentials: true
        })
    )
