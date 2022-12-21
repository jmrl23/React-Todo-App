import { FC, FormEvent, FormEventHandler, useReducer, useRef } from 'react'
import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import { v4 as uuidv4 } from 'uuid'

export const App: FC<Record<string, never>> = () => {
  const [todos, dispatch] = useReducer(
    todoReducer,
    JSON.parse(localStorage.getItem('todos') ?? '[]')
  )

  const inputRef = useRef<HTMLInputElement>(null)

  const deleteTodo = (id: string) => {
    dispatch({
      type: TodoAction.DELETE,
      data: { id }
    })
  }

  const updateTodo = (id: string, data: Partial<Todo>) => {
    dispatch({
      type: TodoAction.UPDATE,
      data: { id, ...data }
    })
  }

  const handleSubmit: FormEventHandler<HTMLFormElement> = (
    event: FormEvent
  ) => {
    event.preventDefault()
    if (!inputRef.current) return
    const content = inputRef.current.value.trim()
    if (!content) return
    dispatch({
      type: TodoAction.CREATE,
      data: { content }
    })
    inputRef.current.value = ''
  }

  return (
    <main className='max-w-screen-sm mx-auto px-4 flex flex-col h-full'>
      <header className='bg-blue-500 p-4 rounded-b-lg shadow-md'>
        <h1 className='text-4xl font-bold text-white mt-8'>Todo App</h1>
        <form className='flex items-center mt-4' onSubmit={handleSubmit}>
          <input
            className='px-4 py-2 grow rounded-l-full text-lg focus:outline-dashed focus:outline-blue-900'
            type='text'
            name='todo'
            autoComplete='off'
            placeholder='Aa'
            ref={inputRef}
          />
          <button
            className='px-6 py-2 rounded-r-full bg-blue-600 hover:bg-blue-700 transition-colors focus:ring focus:ring-blue-900'
            type='submit'
            title='add todo'
            tabIndex={0}
          >
            <PlusIcon className='w-7 h-7 text-white' />
          </button>
        </form>
      </header>
      <section className='grow m-4 overflow-y-auto text-lg'>
        <div>
          {todos.length < 1 ? (
            <div className='bg-gray-200 rounded-lg p-4 mb-4 shadow-md'>
              <p className='bg-white w-full p-4 rounded-lg'>
                📃 List is empty.
              </p>
            </div>
          ) : (
            todos.map((todo: Todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                deleteTodo={deleteTodo}
                updateTodo={updateTodo}
              />
            ))
          )}
        </div>
      </section>
    </main>
  )
}

export const TodoItem: FC<{
  todo: Todo
  deleteTodo: (id: string) => void
  updateTodo: (id: string, data: Partial<Todo>) => void
}> = ({ todo, deleteTodo, updateTodo }) => {
  const contentRef = useRef<HTMLParagraphElement>(null)

  const confirmDelete = () => {
    if (confirm('Delete this item?')) deleteTodo(todo.id)
  }

  const toggleIsDone = () => {
    if (
      !contentRef.current ||
      contentRef.current.hasAttribute('contenteditable')
    )
      return
    updateTodo(todo.id, { isDone: !todo.isDone })
  }

  const updateContent = () => {
    if (!contentRef.current) return
    contentRef.current.removeAttribute('contenteditable')
    const content = (contentRef.current.textContent ?? '').trim()
    if (todo.isDone) contentRef.current.classList.add('line-through')
    if (!content) {
      contentRef.current.textContent = todo.content
      return
    }
    updateTodo(todo.id, { content })
  }

  const updateContentOnEnterKey = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      updateContent()
    }
  }

  const focusUpdate = () => {
    if (!contentRef.current) return
    contentRef.current.contentEditable = 'true'
    if (todo.isDone) contentRef.current.classList.remove('line-through')
    contentRef.current.focus()
  }

  return (
    <div className='bg-gray-200 rounded-lg p-2 mb-4 last:mb-0 shadow-md'>
      <div className='p-2 rounded-lg grid grid-cols-[94%_auto] gap-x-2'>
        <p
          className={
            'bg-white grow p-4 rounded-lg focus:cursor-text focus:outline-dashed focus:outline-blue-500 break-words' +
            (todo.isDone ? ' line-through' : '')
          }
          onClick={toggleIsDone}
          onBlur={updateContent}
          onKeyDown={updateContentOnEnterKey as () => void}
          ref={contentRef}
        >
          {todo.content}
        </p>
        <div className='w-[rem]'>
          <div className='flex flex-col text-white gap-y-2'>
            <button
              className='bg-red-500 rounded-md p-1 cursor-pointer'
              type='button'
              title='delete'
              onClick={confirmDelete}
            >
              <TrashIcon className='w-4 h-4 cursor-pointer' />
            </button>
            <button
              className='bg-blue-500 rounded-md p-1 cursor-pointer'
              type='button'
              title='update'
              onClick={focusUpdate}
            >
              <PencilIcon className='w-4 h-4 cursor-pointer' />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const todoReducer = (
  state: Todo[],
  action: {
    data?: Partial<Todo>
    type: TodoAction
  }
) => {
  const todos: Todo[] = JSON.parse(localStorage.getItem('todos') ?? '[]')
  const { id, content, isDone } = action.data ?? {}
  switch (action.type) {
    case TodoAction.CREATE:
      if (!content) return state
      const newTodo: Todo = {
        id: uuidv4(),
        content,
        isDone: false,
        dateCreated: new Date(),
        lastModified: new Date()
      }
      localStorage.setItem('todos', JSON.stringify([...state, newTodo]))
      return [...state, newTodo]
    case TodoAction.DELETE:
      const filtered = todos.filter((todo) => todo.id !== id)
      localStorage.setItem('todos', JSON.stringify(filtered))
      return filtered
    case TodoAction.UPDATE:
      const index = todos.findIndex((todo) => todo.id === id)
      if (index < 0) return state
      const todo = todos[index]
      if (content) todo.content = content
      if (typeof isDone === 'boolean') todo.isDone = isDone
      todo.lastModified = new Date()
      localStorage.setItem('todos', JSON.stringify(todos))
      return todos
    default:
      return state
  }
}

type Todo = {
  id: string
  content: string
  isDone: boolean
  dateCreated: Date
  lastModified: Date
}

enum TodoAction {
  CREATE,
  UPDATE,
  DELETE
}
