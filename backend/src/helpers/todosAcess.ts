import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';
import {Types} from 'aws-sdk/clients/s3'


const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

const docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient()
const s3Bucket: Types = new XAWS.S3({ signatureVersion: 'v4' })
const todosTable = process.env.TODOS_TABLE
const bucketName = process.env.ATTACHMENT_S3_BUCKET
const urlExpiration = Number(process.env.SIGNED_URL_EXPIRATION)

export async function getUserTodos(userId: string): Promise<TodoItem[]> {
    logger.info(`Getting Todos for User ${userId}`)

    const params = {
        TableName: todosTable,
        KeyConditionExpression: "#userId = :userId",
        ExpressionAttributeNames: {
            "#userId": "userId"
        },
        ExpressionAttributeValues: {
            ":userId": userId
        }
    }
    const result = await docClient.query(params).promise()
    logger.info(`found the following for the user ${userId} item ${JSON.stringify(result)}`)
    return result.Items as TodoItem[]
}


export async function createTodo(request: TodoItem): Promise<TodoItem> {

    const params = {
        TableName: todosTable,
        Item: request
    }
    await docClient.put(params).promise()
    return request as TodoItem
}


export async function getTodoById(id: string): Promise<AWS.DynamoDB.QueryOutput> {
    return await docClient.query({
        TableName: todosTable,
        KeyConditionExpression: 'todoId = :todoId',
        ExpressionAttributeValues: {
            ':todoId': id
        }
    }).promise()
}

export async function updateTodo(updatedTodo: TodoUpdate, todoId: string) {
    await docClient.update({
        TableName: todosTable,
        Key: {
            'todoId': todoId
        },
        UpdateExpression: 'set #namefield = :n, dueDate = :d, done = :done',
        ExpressionAttributeValues: {
            ':n': updatedTodo.name,
            ':d': updatedTodo.dueDate,
            ':done': updatedTodo.done
        },
        ExpressionAttributeNames: {
            "#namefield": "name"
        }
    }).promise()
}

export async function deleteTodoById(todoId: string, userId: string) {

    logger.info(`Deleting todo item with id ${todoId}`)
    const param = {
        TableName: todosTable,
        Key: {
            "userId": userId,
            "todoId": todoId
        }
    }

    await docClient.delete(param).promise()
    return
}



export async function updateTodoById(
    todoUpdate: TodoUpdate,
    todoId: string,
    userId: string): Promise<TodoUpdate> {
    logger.info(`Updating existing todo item with id ${todoId}`)

    const params = {
        TableName: todosTable,
        Key: {
            "userId": userId,
            "todoId": todoId
        },
        UpdateExpression: "set #name = :name, #dueDate = :dueDate, #done = :done",
        ExpressionAttributeNames: {
            "#name": "name",
            "#dueDate": "dueDate",
            "#done": "done"
        },
        ExpressionAttributeValues: {
            ":name": todoUpdate.name,
            ":dueDate": todoUpdate.dueDate,
            ":done": todoUpdate.done
        },
        ReturnValues: "ALL_NEW"
    }

    const result = await docClient.update(params).promise()

    const attributes = result.Attributes

    logger.info(`update done and the following returned = ${attributes}`)

    return attributes as TodoUpdate
}


export async function generateUploadUrlById(todoId: string, userId: string): Promise<string> {
    console.log(`Generating upload url of attachment for todo item with id ${todoId}`)

    await addAttachmentToTodoItem(todoId, userId)

    return s3Bucket.getSignedUrl('putObject', {
        Bucket: bucketName,
        Key: todoId,
        Expires: urlExpiration
    })
}

async function addAttachmentToTodoItem(todoId: string, userId: string) {

    console.log('Updating attachment url')

    const attachmentUrl: string = `https://${bucketName}.s3.amazonaws.com/${todoId}`

    const params = {
        TableName: todosTable,
        Key: {
            "userId": userId,
            "todoId": todoId
        },
        UpdateExpression: "set #attachmentUrl = :attachmentUrl",
        ExpressionAttributeNames: {
            "#attachmentUrl": "attachmentUrl"
        },
        ExpressionAttributeValues: {
            ":attachmentUrl": attachmentUrl
        },
        ReturnValues: "ALL_NEW"
    }

    const result = await docClient.update(params).promise()

    return result.Attributes
}