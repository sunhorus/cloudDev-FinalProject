import { APIGatewayProxyEvent } from "aws-lambda";
import { createLogger } from '../utils/logger'
import { parseUserId } from "../auth/utils";


const logger = createLogger('TodosAccess')
/**
 * Get a user id from an API Gateway event
 * @param event an event from API Gateway
 *
 * @returns a user id from a JWT token
 */
export function getUserId(event: APIGatewayProxyEvent): string {
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  return parseUserId(jwtToken)
}

export function getJwtToken(event: APIGatewayProxyEvent) {

  logger.info(`getting the token from event ${event}`)
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const token = split[1]
  logger.info(`found token = ${token}`)
  return token
}