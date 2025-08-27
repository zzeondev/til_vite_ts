import { useState } from 'react';
import type { TodoType } from '../../types/TodoType';
import { useTodos } from '../../contexts/TodoContext';

type TodoWriteProps = {
  children?: React.ReactNode;
};

const TodoWrite = ({}: TodoWriteProps): JSX.Element => {
  // Context 를 사용함
  const { addTodo } = useTodos();

  const [title, setTitle] = useState<string>('');
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setTitle(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      // 저장하기
      handleSave();
    }
  };
  const handleSave = (): void => {
    if (title.trim()) {
      // 업데이트 시키기
      const newTodo: TodoType = { id: Date.now().toString(), title: title, completed: false };
      addTodo(newTodo);
      setTitle('');
    }
  };

  return (
    <div>
      <h2>할 일 작성</h2>
      <div>
        <input
          type="text"
          value={title}
          onChange={e => handleChange(e)}
          onKeyDown={e => handleKeyDown(e)}
        />
        <button onClick={handleSave}>등록</button>
      </div>
    </div>
  );
};

export default TodoWrite;
