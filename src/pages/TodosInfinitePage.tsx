import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { InfiniteScrollProvider, useInfiniteScroll } from '../contexts/InfiniteScrollContext';
import type { Profile, Todo, TodoInsert } from '../types/TodoType';
import { getProfile } from '../lib/profile';
// 용서하세요. 입력창 컴포넌트
const InfiniteTodoWrite = () => {
  const { addTodo, loadingIntialTodos } = useInfiniteScroll();

  const [title, setTitle] = useState('');
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };
  const handleSave = async (): Promise<void> => {
    if (!title.trim()) {
      alert('제목을 입력하세요');
      return;
    }
    try {
      // 새할일 추가
      await addTodo(title);
      // 다시 데이터를 로딩한다.
      await loadingIntialTodos();
      setTitle('');
    } catch (error) {
      console.log('등록에 오류가 발생 : ', error);
      alert(`등록에 오류가 발생 : ${error}`);
    }
  };
  return (
    <div>
      <h3>할일 작성</h3>
      <div>
        <input
          type="text"
          value={title}
          onChange={e => handleChange(e)}
          onKeyDown={e => handleKeyDown(e)}
          placeholder="할일을 입력하세요."
        />
        <button onClick={handleSave}>등록</button>
      </div>
    </div>
  );
};

// 용서하세요. 목록 컴포넌트
const InfiniteTodoList = () => {
  const {
    loading,
    loadingMore,
    hasMore,
    loadMoreTodos,
    todos,
    totalCount,
    editTodo,
    toggleTodo,
    deleteTodo,
    loadingIntialTodos,
  } = useInfiniteScroll();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);

  // 사용자 프로필 가져오기
  useEffect(() => {
    const loadProifle = async () => {
      if (user?.id) {
        const userProfile = await getProfile(user.id);
        setProfile(userProfile);
      }
    };
    loadProifle();
  }, [user?.id]);

  // IntersectionObserver 를 이용한 무한 스크롤

  // 1. IntersectionObserver 를 저장하는 ref
  const observerRef = useRef<IntersectionObserver | null>(null);
  // 2. 목록 더보기 할 때 보여줄 로딩창
  const loadingRef = useRef<HTMLDivElement | null>(null);
  // 3. 연속 로딩 방지를 위한 타이버 ref
  const debounceTimerRef = useRef<any>(null);
  // 4. 데이터 로드 스크롤 바 하단에 위치문제로 연속 호출되는 부분 제어
  const [isInCooldown, setIsInCooldown] = useState(false);
  const cooldownTimerRef = useRef<any>(null);

  useEffect(() => {
    // 화면에서 사라질 때 메모리 정리 : 클린업 함수
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (cooldownTimerRef.current) {
        clearTimeout(cooldownTimerRef.current);
      }
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // 연속 로딩 방지
  useEffect(() => {
    if (loadingMore) {
      if (cooldownTimerRef.current) {
        clearTimeout(cooldownTimerRef.current);
      }
    } else {
      // obsercer 를 비활성화 하기 위해서
      setIsInCooldown(true);
      cooldownTimerRef.current = setTimeout(() => {
        setIsInCooldown(false);
      }, 1000);
    }
  }, [loadingMore]);

  /**
   * 목록에 마지막 요소를 등록할 겁니다.
   * 목록의 마지막 요소가 화면에 들어오면 isIntersecting 를 true 로
   * 아직 더 불러올 데이터가 있으면 loadMore 를 실행 ==> 데이터 추가
   * 새로운 목록이 랜더링 되면 새로운 마지막 요소에 다시 옵저버를 붙임
   * 위의 과정을 반복 ==> 끝까지 반복
   */

  // 마지막 todo 항목이 화면에 보이면 자동으로 다음 데이터를 불러들이는 함수
  // 여기서는 useCallback 을 사용합니다.
  //  - 함수가 리랜더링 될 때 마다 새롭게 만들면 성능 이슈가 있습니다.
  //  - 함수가 새로 만들어져야 하는 경우는 의존성 배열에 추가하겠다.
  //  - 의존성 배열에는 loadingMore, hasMore, loadMoreTodos 번경될 때

  const lastTodoElementRef = useCallback(
    (node: HTMLElement | null) => {
      if (observerRef.current) observerRef.current.disconnect();
      if (loadingMore || !hasMore || !node || isInCooldown) return;

      observerRef.current = new IntersectionObserver(
        entries => {
          if (entries[0].isIntersecting && hasMore && !loadingMore && !isInCooldown) {
            if (debounceTimerRef.current) {
              clearTimeout(debounceTimerRef.current);
            }
            debounceTimerRef.current = setTimeout(() => {
              if (!loadingMore && hasMore && !isInCooldown) {
                loadMoreTodos();
              }
            }, 500);
          }
        },
        {
          threshold: 0.8,
        },
      );

      observerRef.current.observe(node);
    },
    [loadingMore, hasMore, loadMoreTodos, isInCooldown],
  );

  // 번호 계산 함수 (최신글이 높은 번호가지도록 )
  const getGlobalIndex = (index: number) => {
    // 무한스크롤시에 계산 해서 번호 출력
    const globalIndex = totalCount - index;
    // console.log(
    //   `번호 계산 - index : ${index}, totalCount : ${totalCount}, globalIndex: ${globalIndex}`,
    // );
    return globalIndex;
  };

  // 날짜 포맷팅 함수
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

  // 수정 상태 관리
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>('');
  // 수정 시작
  const handleEditStart = (todo: any) => {
    setEditingId(todo.id);
    setEditingTitle(todo.title);
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  const handleEditSave = async (id: number) => {
    if (!editingTitle.trim()) {
      alert('제목을 입력하세요.');
      return;
    }
    try {
      editTodo(id, editingTitle);
      setEditingId(null);
      setEditingTitle('');
    } catch (error) {
      console.log(error);
      alert('수정에 실패했습니다.');
    }
  };

  const handleToggle = async (id: number) => {
    try {
      // Context 의 state 를 업데이트
      await toggleTodo(id);
    } catch (error) {
      console.log('토글 실패 : ', error);
      alert('상태 변경에 실패하였습니다.');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        // id 를 삭제
        await deleteTodo(id);
        // 삭제 이후에 번호를 갱신해서 정리해줌
        await loadingIntialTodos();
      } catch (error) {
        console.log('삭제에 실패하였습니다.');
        alert('삭제에 실패하였습니다.');
      }
    }
  };

  if (loading) {
    return <div>데이터 로딩중 ...</div>;
  }
  return (
    <div>
      <h3>TodoList(무한 스크롤) {profile?.nickname && <span>{profile.nickname}님의 할일</span>}</h3>
      {todos.length === 0 ? (
        <p>등록된 할일이 없습니다.</p>
      ) : (
        <div>
          <ul>
            {todos.map((item, index) => (
              // 마지막 요소 태그인지를 연결한다. (마지막 배열의 index 인지 비교하면 됨)
              <li key={item.id} ref={index === todos.length - 1 ? lastTodoElementRef : null}>
                {/* 번호표시 */}
                <span>{getGlobalIndex(index)}</span>
                {/* 체크박스 */}
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => handleToggle(item.id)}
                />
                {/* 제목과 날짜출력 */}
                <div>
                  {editingId === item.id ? (
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={e => setEditingTitle(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          handleEditSave(item.id);
                        } else if (e.key === 'Escape') {
                          handleEditCancel();
                        }
                      }}
                    />
                  ) : (
                    <span>{item.title}</span>
                  )}

                  <span>작성이 : {formatDate(item.created_at)}</span>
                </div>
                {/* 버튼들 */}
                {editingId === item.id ? (
                  <>
                    <button onClick={() => handleEditSave(item.id)}>저장</button>
                    <button onClick={handleEditCancel}>취소</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleEditStart(item)}>수정</button>
                    <button onClick={() => handleDelete(item.id)}>삭제</button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* 무한 목록 로딩용 인디케이터 */}
      {loadingMore && (
        <div ref={loadingRef} style={{ color: 'red', fontSize: '30px' }}>
          더 많은 할 일을 불러오는 중...
        </div>
      )}
      {/* 더이상 로드할 데이터가 없을 때 */}
      {todos.length > 0 && !hasMore && (
        <div style={{ color: 'red', fontSize: '30px' }}>모든 데이터를 불러왔습니다.</div>
      )}
    </div>
  );
};

function TodosInfinitePage() {
  return (
    <InfiniteScrollProvider itemsPerPage={10}>
      <div>
        <h2>무한 스크롤 Todo 목록</h2>
        <div>
          <InfiniteTodoWrite />
        </div>
        <div>
          <InfiniteTodoList />
        </div>
      </div>
    </InfiniteScrollProvider>
  );
}

export default TodosInfinitePage;
