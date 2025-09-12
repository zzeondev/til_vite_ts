import { useState } from 'react';
import { useTodos } from '../../contexts/TodoContext';
import type { Todo } from '../../types/TodoType';
import {
  updateTodo as updateTodoService,
  toggleTodo as toggleTodoService,
  deleteTodo as deleteTodoService,
} from '../../services/todoService';

type TodoItemProps = {
  todo: Todo;
  index: number;
};

const TodoItem = ({ todo, index }: TodoItemProps): JSX.Element => {
  const { toggleTodo, editTodo, deleteTodo, currentPage, itemsPerPage, totalCount } = useTodos();
  // 순서번호 매기기
  const globalIndex = totalCount - ((currentPage - 1) * itemsPerPage + index);

  // 수정중인지
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [editTitle, setEditTitle] = useState<string>(todo.title);
  const handleChangeTitle = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setEditTitle(e.target.value);
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      handleEditSave();
    }
  };
  // 비동기로 DB 에 update 한다.
  const handleEditSave = async (): Promise<void> => {
    if (!editTitle.trim()) {
      alert('제목을 입력하세요.');
      return;
    }

    try {
      // DB 의  내용 업데이트
      const result = await updateTodoService(todo.id, { title: editTitle });

      if (result) {
        // context 의 state.todos 의 항목 1개의 타이틀 수정
        editTodo(todo.id, editTitle);
        setIsEdit(false);
      }
    } catch (error) {
      console.log('데이터 업데이트에 실패하였습니다.');
    }
  };
  const handleEditCancel = (): void => {
    setEditTitle(todo.title);
    setIsEdit(false);
  };

  // 비동기 통신으로 toggle 업데이트
  const handleToggle = async (): Promise<void> => {
    try {
      // db 의 completed 가 업데이트 성공시 Todo 타입 리턴
      const result = await toggleTodoService(todo.id, !todo.completed);
      if (result) {
        // context 의  state.todos 의 1개 항목 completed 업데이트
        toggleTodo(todo.id);
      }
    } catch (error) {
      console.log('데이터베이스 Toggle 이 실패하였어요.', error);
    }
  };

  // db 의 데이터 delete
  const handleDelete = async (): Promise<void> => {
    try {
      // db 삭제기능
      await deleteTodoService(todo.id);
      // state 삭제기능
      deleteTodo(todo.id);
    } catch (error) {
      console.log('DB 삭제가 실패하였습니다.', error);
    }
  };

  return (
    <li>
      {/* 출력 번호 */}
      <span>{globalIndex}</span>
      {isEdit ? (
        <>
          <input
            type="text"
            value={editTitle}
            onChange={e => handleChangeTitle(e)}
            onKeyDown={e => handleKeyDown(e)}
          />
          <button onClick={handleEditSave}>저장</button>
          <button onClick={handleEditCancel}>취소</button>
        </>
      ) : (
        <>
          <input type="checkbox" checked={todo.completed} onChange={handleToggle} />
          <span>{todo.title}</span>
          <button onClick={() => setIsEdit(true)}>수정</button>
          <button onClick={() => handleDelete()}>삭제</button>
        </>
      )}
    </li>
  );
};

export default TodoItem;
