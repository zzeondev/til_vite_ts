import { useTodos } from '../../contexts/TodoContext';
import type { Todo } from '../../types/TodoType';
import TodoItem from './TodoItem';

type TodoListProps = {};

const TodoList = ({}: TodoListProps): JSX.Element => {
  const { todos } = useTodos();

  return (
    <div>
      <h3 style={{ marginBottom: 'var(--space-4)', color: 'var(--gray-800)' }}>할 일 목록</h3>
      <ul>
        {todos.map((item: Todo, index: number) => (
          <TodoItem key={item.id} todo={item} index={index} />
        ))}
      </ul>
    </div>
  );
};

export default TodoList;
