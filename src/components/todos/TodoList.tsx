import { useTodos } from '../../contexts/TodoContext';
import type { Todo } from '../../types/TodoType';
import TodoItem from './TodoItem';

type TodoListProps = {};

const TodoList = ({}: TodoListProps): JSX.Element => {
  const { todos } = useTodos();

  return (
    <div>
      <h2>TodoList</h2>
      <ul>
        {todos.map((item: Todo, index: number) => (
          <TodoItem key={item.id} todo={item} index={index} />
        ))}
      </ul>
    </div>
  );
};

export default TodoList;
