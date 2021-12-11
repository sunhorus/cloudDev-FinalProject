// import { parseUserId } from "../auth/utils"
// import { createTodo, getUserTodos } from "../helpers/todosAcess"
// import { TodoItem } from "../models/TodoItem"
// import { CreateTodoRequest } from "../requests/CreateTodoRequest"
// import * as uuid from 'uuid'
// import { createLogger } from "../utils/logger"
// const logger = createLogger('todos')

// export async function getTodosForUser(jwtToken: string): Promise<TodoItem[]> {

//     const userId = parseUserId(jwtToken)
//     logger.info(`found user Id = ${userId}`)
//     return await getUserTodos(userId)
// }

// export async function createNewTodo(
//     createTodoRequest: CreateTodoRequest,
//     jwtToken: string
// ): Promise<TodoItem> {
    
//     const todoId = uuid.v4()
//     const userId = parseUserId(jwtToken)

//     return await createTodo({
//         userId,
//         todoId,
//         done: false,
//         ...createTodoRequest,
//         createdAt: new Date().toISOString()
//     })

// }