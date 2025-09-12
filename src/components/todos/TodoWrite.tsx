import { useState } from 'react';
import type { Todo, TodoInsert } from '../../types/TodoType';
import { useTodos } from '../../contexts/TodoContext';
import { createTodo } from '../../services/todoService';

type TodoWriteProps = {
  children?: React.ReactNode;
  handleChangePage: (page: number) => void;
};
const TodoWrite = ({ handleChangePage }: TodoWriteProps): JSX.Element => {
  // Context 를 사용함.
  const { addTodo } = useTodos();

  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setTitle(e.target.value);
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  //  Supabase 에 데이터를 Insert 한다. : 비동기
  const handleSave = async (): Promise<void> => {
    if (!title.trim()) {
      alert('제목을 입력하세요.');
      return;
    }

    try {
      const newTodo = { title, content };
      // Supabase 에 데이터를 Insert 함
      // Insert 결과로 추가가 된 Todo 형태를 받아옮
      const result = await createTodo(newTodo);
      if (result) {
        // Context 에 Todo 타입 데이터를 추가해 줌.
        addTodo(result);

        // 현재 페이지를 1 페이지로 이동
        handleChangePage(1);
      }

      // 현재 Write 컴포넌트 state 초기화
      setTitle('');
      setContent('');
    } catch (error) {
      console.log(error);
      alert('데이터 추가에 실패 하였습니다.');
    }
  };

  return (
    <div>
      <h2>할일 작성</h2>
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
