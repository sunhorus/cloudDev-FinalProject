// import { TodosAccess } from './todosAcess'
// import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
// import * as createError from 'http-errors'

import { parseUserId } from "../auth/utils"
import { createTodo, deleteTodoById, getUserTodos, updateTodoById, generateUploadUrlById } from "../helpers/todosAcess"
import { TodoUpdate } from '../models/TodoUpdate'

// // TODO: Implement businessLogic
const logger = createLogger('todos')

export async function getTodosForUser(jwtToken: string): Promise<TodoItem[]> {

    const userId = parseUserId(jwtToken)
    logger.info(`found user Id = ${userId}`)
    return await getUserTodos(userId)
}

export async function createNewTodo(
    createTodoRequest: CreateTodoRequest,
    jwtToken: string
): Promise<TodoItem> {
    
    const todoId = uuid.v4()
    const userId = parseUserId(jwtToken)

    return await createTodo({
        userId,
        todoId,
        done: false,
        ...createTodoRequest,
        createdAt: new Date().toISOString()
    })

}


export async function deleteTodo(todoId: string, jwtToken: string) {
    logger.info(`Deleting existing todo item with id ${todoId}`)

    const userId = parseUserId(jwtToken)
    logger.info(`Deleting existing todo item with id ${todoId} for user ${userId}`)

    // const tempTodo: TodoItem = getTodoById(todoId)[0]

    // if (userId !== tempTodo.userId)
    //     throw new Error(`unathorized action`)

    await deleteTodoById(todoId, userId)

    return
}

export async function updateTodo(
    updateTodoRequest: UpdateTodoRequest,
    todoId: string,
    jwtToken: string
): Promise<TodoUpdate> {
    const userId = parseUserId(jwtToken)
    
    return await updateTodoById(updateTodoRequest, todoId, userId)
}

export async function createAttachmentPresignedUrl(
    todoId: string,
    jwtToken: string
): Promise<string> {
    const userId = parseUserId(jwtToken)

    return generateUploadUrlById(todoId, userId);
}