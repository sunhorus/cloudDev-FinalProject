import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { createAttachmentPresignedUrl } from '../../helpers/todos'
import { getJwtToken } from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('updatetodo')

export const handler = middy(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        logger.info(`procecing upload even = ${event}`)
        const todoId = event.pathParameters.todoId
        // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
        const jwtTokken = getJwtToken(event)

        const uploadURL = await createAttachmentPresignedUrl(todoId, jwtTokken)

        logger.info(`all done new upload url ${uploadURL}`)
        return {
            statusCode: 200,
            body: JSON.stringify({
                uploadUrl: uploadURL,
            })
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
