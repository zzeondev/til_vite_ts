import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Pagination from '../components/Pagination';
import TodoWriteBox from '../components/todos/TodoWriteBox';
import { useAuth } from '../contexts/AuthContext';
import { TodoProvider, useTodos } from '../contexts/TodoContext';
import { getProfile } from '../lib/profile';
import type { Profile, Todo } from '../types/TodoType';

// 용서하세요. 나중에 추출하세요. ^^
type TodoItemProps = {
  todo: Todo;
  index: number;
};
const TodoItemBox = ({ todo, index }: TodoItemProps) => {
  const { toggleTodo, editTodo, deleteTodo, currentPage, itemsPerPage, totalCount } = useTodos();

  // 순서번호 매기기
  const globalIndex = totalCount - ((currentPage - 1) * itemsPerPage + index);

  // 작성 날짜 포맷팅
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '날짜 없음';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <li className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      {/* 출력 번호 */}
      <span className="todo-number">{globalIndex}</span>
      <div className="todo-content">
        <Link
          to={`/todos/detail/${todo.id}`}
          className={`todo-title ${todo.completed ? 'completed' : ''}`}
          style={{ cursor: 'pointer' }}
        >
          {todo.title}
        </Link>
        <span className="todo-date">작성일: {formatDate(todo.created_at)}</span>
      </div>
    </li>
  );
};

// 용서하세요. 나중에 추출하세요. ^^
const TodoListBox = () => {
  const { user } = useAuth();
  // 전체 할일 목록 가져오기
  const { todos } = useTodos();
  return (
    <ul className="todo-list">
      {todos.map((item, index) => (
        <TodoItemBox key={item.id} todo={item} index={index} />
      ))}
    </ul>
  );
};

interface TodosContentProps {
  profile: Profile | null;
  currentPage: number;
  itemsPerPage: number;
  handleChangePage: (page: number) => void;
}
const TodosContent = ({
  profile,
  currentPage,
  itemsPerPage,
  handleChangePage,
}: TodosContentProps): JSX.Element => {
  const { totalCount, totalPages } = useTodos();
  return (
    <div>
      <div>
        {/* 새글 등록시 1페이지로 이동후 목록새로고침 */}
        <TodoWriteBox profile={profile} />
      </div>
      <div>
        <TodoListBox />
      </div>
      <div>
        <Pagination
          totalCount={totalCount}
          totalPages={totalPages}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          handleChangePage={handleChangePage}
        />
      </div>
    </div>
  );
};

function TodoListPage() {
  const { user } = useAuth();

  // 페이지네이션 관련
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  // 페이지 변경 핸들러
  const handleChangePage = (page: number) => {
    setCurrentPage(page);
  };

  // 프로필 가져오기
  const [profile, setProfile] = useState<Profile | null>(null);
  const loadProfile = async () => {
    try {
      if (user?.id) {
        const userProfile = await getProfile(user.id);
        if (!userProfile) {
          alert('탈퇴한 회원입니다. 관리자님에게 요청하세요.');
        }
        setProfile(userProfile);
      }
    } catch (error) {
      console.log('프로필 가져오기 Error : ', error);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">🍈 할 일 관리</h2>
        {profile?.nickname && <p className="page-subtitle">{profile.nickname}님의 Todo 관리</p>}
      </div>

      <TodoProvider currentPage={currentPage} limit={itemsPerPage}>
        <TodosContent
          profile={profile}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          handleChangePage={handleChangePage}
        />
      </TodoProvider>
    </div>
  );
}

export default TodoListPage;
