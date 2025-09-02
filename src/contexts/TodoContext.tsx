import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type PropsWithChildren,
} from 'react';
import type { Todo } from '../types/TodoType';
// 전체 DB 가져오기
import { getTodos } from '../services/todoService';

// 1. 초기값
type TodosState = { todos: Todo[] };
const initialState: TodosState = {
  todos: [],
};

// 2. 리듀서
// action 은 {type : "문자열", payload : 재료} 형태
enum TodoActionType {
  ADD = 'ADD',
  DELETE = 'DELETE',
  TOGGLE = 'TOGGLE',
  EDIT = 'EDIT',
  // Supabase todos 의 목록읽기
  SET_TODOS = 'SET_TODOS',
}

type AddAction = { type: TodoActionType.ADD; payload: { todo: Todo } };
type DeleteAction = { type: TodoActionType.DELETE; payload: { id: number } };
type ToggleAction = { type: TodoActionType.TOGGLE; payload: { id: number } };
type EditAction = { type: TodoActionType.EDIT; payload: { id: number; title: string } };
// Supabase 목록으로 state.todos 배열을 채워라
type SetTodosAction = { type: TodoActionType.SET_TODOS; payload: { todos: Todo[] } };

function reducer(
  state: TodosState,
  action: AddAction | DeleteAction | ToggleAction | EditAction | SetTodosAction,
) {
  switch (action.type) {
    case TodoActionType.ADD: {
      const { todo } = action.payload;
      // 초기값이 객제냐 배열이냐에 따라서 리턴값도 객체인지 배열인지 달라짐 - 현재는 객체라 객체로 리턴
      return { ...state, todos: [todo, ...state.todos] };
    }
    case TodoActionType.TOGGLE: {
      const { id } = action.payload;
      const arr = state.todos.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item,
      );
      return { ...state, todos: arr };
    }
    case TodoActionType.DELETE: {
      const { id } = action.payload;
      const arr = state.todos.filter(item => item.id !== id);
      return { ...state, todos: arr };
    }
    case TodoActionType.EDIT: {
      const { id, title } = action.payload;
      const arr = state.todos.map(item => (item.id === id ? { ...item, title } : item));
      return { ...state, todos: arr };
    }
    // Supabase 에 목록 읽기
    case TodoActionType.SET_TODOS: {
      const { todos } = action.payload;
      return { ...state, todos };
    }
    default:
      return state;
  }
}

// 3. context 생성
// 만들어진 Context 가 관리하는 Value 의 모양
type TodoContextValue = {
  todos: Todo[];
  addTodo: (todo: Todo) => void;
  toggleTodo: (id: number) => void;
  deleteTodo: (id: number) => void;
  editTodo: (id: number, editTitle: string) => void;
};
const TodoContext = createContext<TodoContextValue | null>(null);

// 4. provider 생성
export const TodoProvider: React.FC<PropsWithChildren> = ({ children }): JSX.Element => {
  const [state, dispatch] = useReducer(reducer, initialState);
  // dispatch 를 위한 함수 표현식 모음
  const addTodo = (newTodo: Todo) => {
    dispatch({ type: TodoActionType.ADD, payload: { todo: newTodo } });
  };
  const toggleTodo = (id: number) => {
    // 이름이 같으면 줄이기 가능 ex.id:id 형태를 id 로 줄이기 가능
    dispatch({ type: TodoActionType.TOGGLE, payload: { id } });
  };
  const deleteTodo = (id: number) => {
    dispatch({ type: TodoActionType.DELETE, payload: { id } });
  };
  const editTodo = (id: number, editTitle: string) => {
    dispatch({ type: TodoActionType.EDIT, payload: { id, title: editTitle } });
  };
  // 실행시 state { todos } 를 업데이트 함
  // reducer 함수를 실행함
  const setTodos = (todos: Todo[]) => {
    dispatch({ type: TodoActionType.SET_TODOS, payload: { todos } });
  };
  // Supabase 의 목록 읽기 함수 표현식
  // 비동기 데이터베이스 접근
  const loadTodos = async (): Promise<void> => {
    try {
      const result = await getTodos();
      setTodos(result);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    loadTodos();
  }, []);

  // value 전달할 값
  const value: TodoContextValue = {
    todos: state.todos,
    // 이름이 같으면 줄이기 가능 ex.addTodo: addTodo, 이 형태를 addTodo, 이렇게 줄이기 가능
    addTodo,
    toggleTodo,
    deleteTodo,
    editTodo,
  };
  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
};

// 5. custom hook 생성
export function useTodos(): TodoContextValue {
  const ctx = useContext(TodoContext);
  if (!ctx) {
    throw new Error('컨텍스트가 없어요.');
  }
  return ctx;
}
