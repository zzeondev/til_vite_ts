# Supabase 에 Editor 적용

- 상세 내용 작성 부분을 React Quill 을 활용함
- 상세 내용은 `til_npm` 의 `15-react-quill` 참조
- 내용이 길어지므로 DB에서는 칼럼이 `Text` 타입 권장
- HTML 을 직접 출력하는 것은 위험함 (`https://www.npmjs.com/package/dompurify`)

## 1. 적용단계

- TypeScript 에서도 잘 진행됨(타입정의 불필요)

```bash
npm i react-quill
npm i quill
npm i dompurify
```

## 2. 에디터는 컴포넌트 생성 후 활용

- `/src/components/RichTextEditor.tsx` 파일 생성

```tsx
import React from 'react';
import ReactQuill, { type Value } from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// 컴포넌트가 외부에서 전달받을 데이터 형태
interface RichTextEditorProps {
  value: string; // 에디터에 초기로 보여줄 내용
  onChange: (value: string) => void; // 내용이 변결될때 실행할 함수
  placeholder?: string; // 안내 텍스트 (선택사항)
  disabled?: boolean; // 에디터를 비활성화할지 여부 (선택사항)
}

const RichTextEditor = ({
  value,
  onChange,
  placeholder = '내용을 입력하세요.',
  disabled = false,
}: RichTextEditorProps) => {
  // 툴바 설정 - 에디터 상단에 표시될 버튼들을 정의
  const modules = {
    toolbar: [
      // 헤더 옵션: H1, H2, H3, 일반 텍스트
      [{ header: [1, 2, 3, false] }],
      // 텍스트 서식 옵션
      ['bold', 'italic', 'underline', 'strike'],
      // 색상 옵션: 텍스트 색상, 배경 색상
      [{ color: [] }, { background: [] }],
      // 텍스트 정렬 옵션: 왼쪽, 가운데, 오른쪽, 양쪽 정렬
      [{ align: [] }],
      // 목록 옵션: 순서 있는 목록, 순서 없는 목록
      [{ list: 'ordered' }, { list: 'bullet' }],
      // 들여쓰기 옵션: 왼쪽으로 들여쓰기, 오른쪽으로 들여쓰기
      [{ indent: '-1' }, { indent: '+1' }],
      // 링크와 이미지 삽입 옵션
      ['link', 'image'],
      // 서식 제거 옵션: 선택한 텍스트의 모든 서식을 제거
      ['clean'],
    ],
  };

  // 에디터에서 허용할 HTML 태그들을 정의
  // 이 배열에 포함된 태그만 에디터에서 사용할 수 있음
  const formats = [
    'header', // 헤더 태그 (h1, h2, h3)
    'bold', // 굵은 글씨 (strong, b)
    'italic', // 기울임 글씨 (em, i)
    'underline', // 밑줄 (u)
    'strike', // 취소선 (s, del)
    'color', // 텍스트 색상 (span with color)
    'background', // 배경 색상 (span with background-color)
    'align', // 텍스트 정렬 (text-align)
    'list', // 목록 (ul, ol)
    'bullet', // 순서 없는 목록 (ul)
    'indent', // 들여쓰기 (margin-left)
    'link', // 링크 (a)
    'image', // 이미지 (img)
  ];

  return (
    <div>
      <ReactQuill
        theme="snow" // 테마
        value={value} // 에디터에 보여줄 내용
        onChange={onChange} // 내용 변경시 실행할 함수
        modules={modules} // 툴바에 기능 설정
        formats={formats} // 허용할 HTML 태그
        placeholder={placeholder} // 안내 글자
        readOnly={disabled} // 읽기 전용 여부
      />
    </div>
  );
};

export default RichTextEditor;
```

## 3. 에디터 내용 활용

- /src/pages/TodoWritePage.tsx

```tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { Profile, TodoInsert } from '../types/TodoType';
import { getProfile } from '../lib/profile';
import { useNavigate } from 'react-router-dom';
import { createTodo } from '../services/todoService';
import RichTextEditor from '../components/RichTextEditor';

function TodoWritePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // 사용자 입력내용
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };
  // const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  //   setContent(e.target.value);
  // };
  const handleContentChange = (value: string) => {
    setContent(value);
  };

  const handleCancle = () => {
    // 사용자가 실수로 취소할 수 있으므로 이에 대비
    if (title.trim() || content.trim()) {
      if (window.confirm('작성중인 내용이 있습니다. 정말 취소하시겠습니까?')) {
        // 목록으로
        navigate('/todos');
      }
    } else {
      // 목록으로
      navigate('/todos');
    }
  };
  const handleSave = async () => {
    // 제목은 필수 입력
    if (!title.trim()) {
      alert('제목은 필수 입니다.');
      return;
    }
    try {
      setSaving(true);
      const newTodo: TodoInsert = { title, user_id: user!.id, content };
      const result = await createTodo(newTodo);
      if (result) {
        alert('할 일이 성공적으로 등록되었습니다.');
        navigate('/todos');
      } else {
        alert('오류가 발생했습니다. 다시 시도해 주세요.');
      }
    } catch (error) {
      console.log('데이터 추가에 실패하였습니다.', error);
      alert(`데이터 추가에 실패하였습니다. ${error}`);
    } finally {
      setSaving(false);
    }
  };

  // 사용자 정보
  const [profile, setProfile] = useState<Profile | null>(null);
  useEffect(() => {
    const loadProfile = async () => {
      if (user?.id) {
        const userProfile = await getProfile(user.id);
        setProfile(userProfile);
      }
    };
    loadProfile();
  }, [user?.id]);

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">✏️ 새 할 일 작성</h2>
        {profile?.nickname && <p className="page-subtitle">{profile.nickname}님의 새로운 할 일</p>}
      </div>
      {/* 입력창 */}
      <div className="card">
        <div className="form-group">
          <label className="form-label">제목</label>
          <input
            type="text"
            className="form-input"
            value={title}
            onChange={e => handleTitleChange(e)}
            placeholder="할 일을 입력해주세요."
            disabled={saving}
          />
        </div>
        <div className="form-group">
          <label className="form-label">상세 내용</label>
          {/* <textarea
            className="form-input"
            value={content}
            onChange={e => handleContentChange(e)}
            placeholder="상세 내용을 입력해주세요.(선택사항)"
            rows={6}
            disabled={saving}
          /> */}
          <RichTextEditor
            value={content}
            onChange={handleContentChange}
            placeholder="상세 내용을 입력해주세요.(선택사항)"
            disabled={saving}
          />
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={handleCancle} disabled={saving}>
            취소
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? '⏳ 등록 중...' : '등록'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TodoWritePage;
```

## 4. 에디터 내용 보기 활용

- /src/pages.TodoDetailPage.tsx

```tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import type { Profile, Todo } from '../types/TodoType';
import { getProfile } from '../lib/profile';
import { deleteTodo, getTodoById, getTodos } from '../services/todoService';
import Loading from '../components/Loading';
import DOMPurify from 'dompurify';

function TodoDetailPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  // 사용자 정보
  const [profile, setProfile] = useState<Profile | null>(null);
  useEffect(() => {
    const loadProfile = async () => {
      if (user?.id) {
        const userProfile = await getProfile(user.id);
        setProfile(userProfile);
      }
    };
    loadProfile();
  }, [user?.id]);

  // param 값을 읽기
  const { id } = useParams<{ id: string }>();

  // id 를 이용해서 Todo 내용 가져오기
  const [todo, setTodo] = useState<Todo | null>(null);
  // 상세 페이지오면 todo 내용을 호출해야 하므로 true 셋팅
  const [loading, setLoading] = useState(true);

  // 현재 삭제 중인지 처리
  const [actionLoading, setActionLoading] = useState<{
    delete: boolean;
  }>({ delete: false });

  useEffect(() => {
    const loadTodo = async () => {
      if (!id) {
        navigate('/todos');
        return;
      }
      try {
        setLoading(true);
        const todoData = await getTodoById(parseInt(id));

        if (!todoData) {
          alert('해당 할 일을 찾을 수 없습니다.');
          navigate('/todos');
          return;
        }

        // 본인의 Todo 인지 확인
        if (todoData.user_id !== user?.id) {
          alert('조회 권한이 없습니다.');
          navigate('/todos');
          return;
        }

        setTodo(todoData);
      } catch (error) {
        console.log('Todo 로드 실패 : ', error);
        alert('할 일을 불러오는데 실패했습니다.');
        navigate('/todos');
      } finally {
        setLoading(false);
      }
    };
    loadTodo();
  }, [id, user?.id, navigate]);

  const handleDelete = async () => {
    if (!todo) return;
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      setActionLoading({ ...actionLoading, delete: true });
      await deleteTodo(todo.id);
      alert('할일이 삭제되었습니다.');
      navigate('/todos');
    } catch (error) {
    } finally {
      setActionLoading({ ...actionLoading, delete: false });
    }
  };

  if (loading) {
    return <Loading message="할 일 정보를 불러오는 중 ..." size="lg" />;
  }

  if (!todo) {
    return (
      <div className="card" style={{ textAlign: 'center' }}>
        <h3>할 일을 찾을 수 없습니다.</h3>
        <button className="btn btn-primary" onClick={() => navigate('/todos')}>
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title"> 할 일 상세보기</h2>
        {profile?.nickname && <p className="page-subtitle">{profile.nickname}님의 할 일</p>}
      </div>
      {/* 실제내용 */}
      <div className="card">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 'var(--space-6)',
          }}
        >
          <div style={{ flex: 1 }}>
            <h3
              style={{
                margin: '0 0 var(--space-2) 0',
                color: 'var(--gray-800)',
                textDecoration: todo.completed ? 'line-through' : 'none',
                opacity: todo.completed ? 0.7 : 1,
              }}
            >
              {todo.title}
            </h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span
              style={{
                padding: 'var(--space-1) var(--space-3)',
                borderRadius: 'var(--radius-md)',
                fontSize: '12px',
                fontWeight: '500',
                backgroundColor: todo.completed ? 'var(--success-100)' : 'var(--primary-100)',
                color: todo.completed ? 'var(--success-700)' : 'var(--primary-700)',
              }}
            >
              {todo.completed ? '✅ 완료' : '⏳ 진행 중'}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button
            onClick={() => navigate(`/todos/edit/${todo.id}`)}
            className="btn btn-primary btn-sm"
            disabled={actionLoading.delete}
          >
            ✏️ 수정
          </button>
          <button
            onClick={handleDelete}
            className="btn btn-danger btn-sm"
            disabled={actionLoading.delete}
          >
            {actionLoading.delete ? '⏳ 삭제 중...' : '🗑️ 삭제'}
          </button>
        </div>
        {/* 상세내용 */}
        {todo.content && (
          <div
            style={{
              padding: 'var(--space-4)',
              backgroundColor: 'var(--gray-50)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 'var(--space-6)',
            }}
          >
            <h4 style={{ margin: '0 0 var(--space-3) 0', color: 'var(--gray-700)' }}>상세 내용</h4>
            <div
              style={{
                margin: 0,
                color: 'var(--gray-600)',
                lineHeight: '1.6',
              }}
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(todo.content) }}
            />
          </div>
        )}
        {/* 추가정보 출력 */}
        <div
          style={{
            padding: 'var(--space-4)',
            backgroundColor: 'var(--gray-50)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--space-4)',
          }}
        >
          <h4 style={{ margin: '0 0 var(--space-3) 0', color: 'var(--gray-700)' }}>할 일 정보</h4>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'var(--space-3)',
            }}
          >
            <div>
              <span style={{ fontWeight: '500', color: 'var(--gray-600)' }}>작성일 : </span>
              <div style={{ color: 'var(--gray-600)', marginTop: 'var(--space-1)' }}>
                {todo.created_at ? new Date(todo.created_at).toLocaleString('ko-KR') : '정보 없음'}
              </div>
            </div>
            <div>
              <span style={{ fontWeight: '500', color: 'var(--gray-600)' }}>수정 : </span>
              <div style={{ color: 'var(--gray-600)', marginTop: 'var(--space-1)' }}>
                {todo.updated_at ? new Date(todo.updated_at).toLocaleString('ko-KR') : '정보 없음'}
              </div>
            </div>
            <div>
              <span style={{ fontWeight: '500', color: 'var(--gray-600)' }}>작성 : </span>
              <div style={{ color: 'var(--gray-600)', marginTop: 'var(--space-1)' }}>
                {profile?.nickname || user?.email}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/todos')}>
            목록으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}

export default TodoDetailPage;
```

- index.css 에 React Quill 에서 사용한 css 를 반드시 넣어주자

```css
/* ===== React Quill Styles ===== */
/* 텍스트 정렬 */
.ql-align-center {
  text-align: center !important;
}
.ql-align-right {
  text-align: right !important;
}
.ql-align-justify {
  text-align: justify !important;
}
.ql-align-left {
  text-align: left !important;
}

/* 헤더 스타일 */
.ql-size-small {
  font-size: 0.75em !important;
}
.ql-size-large {
  font-size: 1.5em !important;
}
.ql-size-huge {
  font-size: 2.5em !important;
}

/* 헤더 태그 */
.ql-editor h1 {
  font-size: 2em !important;
  font-weight: bold !important;
  margin: 0.67em 0 !important;
}
.ql-editor h2 {
  font-size: 1.5em !important;
  font-weight: bold !important;
  margin: 0.75em 0 !important;
}
.ql-editor h3 {
  font-size: 1.17em !important;
  font-weight: bold !important;
  margin: 0.83em 0 !important;
}

/* 텍스트 서식 */
.ql-editor strong {
  font-weight: bold !important;
}
.ql-editor em {
  font-style: italic !important;
}
.ql-editor u {
  text-decoration: underline !important;
}
.ql-editor s {
  text-decoration: line-through !important;
}

/* 목록 스타일 */
.ql-editor ul {
  list-style-type: disc !important;
  margin: 1em 0 !important;
  padding-left: 1.5em !important;
}
.ql-editor ol {
  list-style-type: decimal !important;
  margin: 1em 0 !important;
  padding-left: 1.5em !important;
}
.ql-editor li {
  display: list-item !important;
  margin: 0.5em 0 !important;
}

/* 들여쓰기 */
.ql-indent-1 {
  padding-left: 3em !important;
}
.ql-indent-2 {
  padding-left: 6em !important;
}
.ql-indent-3 {
  padding-left: 9em !important;
}
.ql-indent-4 {
  padding-left: 12em !important;
}
.ql-indent-5 {
  padding-left: 15em !important;
}
.ql-indent-6 {
  padding-left: 18em !important;
}
.ql-indent-7 {
  padding-left: 21em !important;
}
.ql-indent-8 {
  padding-left: 24em !important;
}

/* 링크 스타일 */
.ql-editor a {
  color: #06c !important;
  text-decoration: underline !important;
}
.ql-editor a:hover {
  color: #0056b3 !important;
}

/* 이미지 스타일 */
.ql-editor img {
  max-width: 100% !important;
  height: auto !important;
  display: block !important;
  margin: 0.5em auto !important;
}

/* 인용문 스타일 */
.ql-editor blockquote {
  border-left: 4px solid #ccc !important;
  margin: 1em 0 !important;
  padding-left: 1em !important;
  color: #666 !important;
  font-style: italic !important;
}

/* 코드 스타일 */
.ql-editor code {
  background-color: #f4f4f4 !important;
  border: 1px solid #ddd !important;
  border-radius: 3px !important;
  padding: 2px 4px !important;
  font-family: 'Courier New', Courier, monospace !important;
  font-size: 0.9em !important;
}

.ql-editor pre {
  background-color: #f4f4f4 !important;
  border: 1px solid #ddd !important;
  border-radius: 3px !important;
  padding: 1em !important;
  margin: 1em 0 !important;
  overflow-x: auto !important;
  font-family: 'Courier New', Courier, monospace !important;
  font-size: 0.9em !important;
}

.ql-editor pre code {
  background: none !important;
  border: none !important;
  padding: 0 !important;
}

/* 구분선 */
.ql-editor hr {
  border: none !important;
  border-top: 1px solid #ccc !important;
  margin: 1em 0 !important;
}

/* 문단 스타일 */
.ql-editor p {
  margin: 0.5em 0 !important;
  line-height: 1.6 !important;
}

/* 에디터 컨테이너 */
.ql-editor {
  font-family: inherit !important;
  font-size: 14px !important;
  line-height: 1.6 !important;
  color: inherit !important;
}

/* 선택된 텍스트 스타일 */
.ql-editor::selection {
  background-color: #b3d4fc !important;
}

/* 포커스 스타일 */
.ql-editor:focus {
  outline: none !important;
}
```

## 5. 에디터 내용 수정 활용

- /src/pages/TodoEditPage.tsx

```tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import type { Profile, Todo } from '../types/TodoType';
import { getProfile } from '../lib/profile';
import { getTodoById, toggleTodo, updateTodo } from '../services/todoService';
import Loading from '../components/Loading';
import RichTextEditor from '../components/RichTextEditor';

function TodoEditPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [todo, setTodo] = useState<Todo | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  // 연속 처리 방지
  const [saving, setSaving] = useState(false);
  // 토글 처리
  const [toggleLoading, setToggleLoading] = useState(false);

  // 사용자 정보
  useEffect(() => {
    const loadProfile = async () => {
      if (user?.id) {
        const userProfile = await getProfile(user.id);
        setProfile(userProfile);
      }
    };
    loadProfile();
  }, [user?.id]);

  // Todo 정보 가져오기
  useEffect(() => {
    const loadTodo = async () => {
      if (!id) {
        navigate('/todos');
        return;
      }
      try {
        setLoading(true);
        const todoData = await getTodoById(parseInt(id));

        if (!todoData) {
          alert('해당 할 일을 찾을 수 없습니다.');
          navigate('/todos');
          return;
        }

        // 본인의 Todo 인지 확인
        if (todoData.user_id !== user?.id) {
          alert('수정 권한이 없습니다.');
          navigate('/todos');
          return;
        }
        setTodo(todoData);
        setTitle(todoData.title);
        if (todoData.content) {
          setContent(todoData.content);
        }
      } catch (error) {
        console.log('Todo 로드 실패 : ', error);
        alert('할 일을 불러오는데 실패했습니다.');
        navigate('/todos');
      } finally {
        setLoading(false);
      }
    };
    loadTodo();
  }, [id, user?.id, navigate]);

  const handleToggle = async () => {
    if (!todo) return;
    try {
      setToggleLoading(true);
      const result = await toggleTodo(todo.id, !todo.completed);
      if (result) {
        setTodo(result);
        alert(`할 일이 ${result.completed ? '완료' : '진행 중'}으로 변경되었습니다.`);
      } else {
        alert('오류가 발생하였습니다. 잠시 후 다시 시도해 주세요.');
      }
    } catch (error) {
      console.log('상태 변경 실패 : ', error);
      alert('에러가 발생하였습니다.');
    } finally {
      setToggleLoading(false);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  // const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  //   setContent(e.target.value);
  // };
  const handleContentChange = (value: string) => {
    setContent(value);
  };
  const handleSave = async () => {
    if (!todo) return;
    if (!title.trim()) {
      alert('제목을 입력하세요.');
      return;
    }
    try {
      setSaving(true);
      const result = await updateTodo(todo.id, { title, content });
      if (result) {
        alert('할 일이 성공적으로 수정되었습니다.');
        navigate('/todos');
      } else {
        alert('수정 중 오류가 발생하였습니다. 잠시 후 다시 시도해주세요.');
      }
    } catch (error) {
      console.log('수정 실패 : ', error);
      alert('수정에 실패하였습니다');
    } finally {
      setSaving(false);
    }
  };

  const handleCancle = () => {
    // 바로 취소하지 않음
    if (title !== todo?.title || content !== (todo?.content || '')) {
      if (window.confirm('수정 중인 내용이 있습니다. 정말 취소하시겠습니까?')) {
        navigate('/todos');
      }
    } else {
      navigate('/todos');
    }
  };

  if (loading) {
    return <Loading message="할 일 정보를 불러오는 중 ..." size="lg" />;
  }

  if (!todo) {
    return (
      <div className="card" style={{ textAlign: 'center' }}>
        <h3>할 일을 찾을 수 없습니다.</h3>
        <button className="btn btn-primary" onClick={() => navigate('/todos')}>
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title"> 할 일 수정</h2>
        {profile?.nickname && <p className="page-subtitle">{profile.nickname}님의 할 일</p>}
      </div>
      <div className="card">
        <div className="form-group">
          <label className="form-label">완료 상태</label>
          <div>
            <input
              type="checkbox"
              onChange={handleToggle}
              checked={todo.completed}
              disabled={toggleLoading || saving}
              style={{
                cursor: toggleLoading || saving ? 'not-allowed' : 'pointer',
                transform: 'scale(1.3)',
                opacity: toggleLoading || saving ? 0.6 : 1,
              }}
            />
            <span>{todo.completed ? ' ✅ 완료됨' : ' ⏳ 진행 중'}</span>
            {toggleLoading && (
              <span style={{ color: 'var(--gray-500)', fontSize: '14px' }}>처리 중...</span>
            )}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">제목</label>
          <input
            type="text"
            className="form-input"
            onChange={handleTitleChange}
            value={title}
            disabled={saving}
            placeholder="할 일을 입력하세요."
          />
        </div>
        <div className="form-group">
          <label className="form-label">상세 내용</label>
          {/* <textarea
            className="form-input"
            onChange={handleContentChange}
            value={content}
            rows={6}
            placeholder="상세 내용을 입력하세요.(선택사항)"
            disabled={saving}
          /> */}
          <RichTextEditor
            value={content}
            onChange={handleContentChange}
            placeholder="상세 내용을 입력하세요.(선택사항)"
            disabled={saving}
          />
        </div>
        {/* 추가정보 출력 */}
        <div
          style={{
            padding: 'var(--space-4)',
            backgroundColor: 'var(--gray-50)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--space-4)',
          }}
        >
          <h4 style={{ margin: '0 0 var(--space-3) 0', color: 'var(--gray-700)' }}>할일 정보</h4>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'var(--space-3)',
            }}
          >
            <div>
              <span style={{ fontWeight: '500', color: 'var(--gray-600)' }}>작성일 :</span>
              <div style={{ color: 'var(--gray-600)', marginTop: 'var(--space-1)' }}>
                {todo.created_at ? new Date(todo.created_at).toLocaleString('ko-KR') : '정보 없음'}
              </div>
            </div>
            <div>
              <span style={{ fontWeight: '500', color: 'var(--gray-600)' }}>수정일 : </span>
              <div style={{ color: 'var(--gray-600)', marginTop: 'var(--space-1)' }}>
                {todo.updated_at ? new Date(todo.updated_at).toLocaleString('ko-KR') : '정보 없음'}
              </div>
            </div>
            <div>
              <span style={{ fontWeight: '500', color: 'var(--gray-600)' }}>작성자 : </span>
              <div style={{ color: 'var(--gray-600)', marginTop: 'var(--space-1)' }}>
                {profile?.nickname || user?.email}
              </div>
            </div>
          </div>
        </div>
        {/* 버튼 */}
        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
          <button
            className="btn btn-secondary"
            disabled={saving || toggleLoading}
            onClick={handleCancle}
          >
            취소
          </button>
          <button
            className="btn btn-secondary"
            disabled={saving || toggleLoading}
            onClick={handleSave}
          >
            {saving ? '⏳ 수정 중...' : '수정'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TodoEditPage;
```

## 6. 스크롤 페이지 업데이트 (선택)

- /src/pages/TodosInfinitePage.tsx

```tsx
import { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { InfiniteScrollProvider, useInfiniteScroll } from '../contexts/InfiniteScrollContext';
import { getProfile } from '../lib/profile';
import type { Profile } from '../types/TodoType';
// 용서하세요. 입력창 컴포넌트
const InfiniteTodoWrite = () => {
  const navigate = useNavigate();
  const handleWrite = () => {
    navigate('/todos/write');
  };
  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3
          style={{
            margin: '0 0 15px 0',
            color: 'var(--gray-900)',
            fontSize: '18px',
            fontWeight: '600',
          }}
        >
          ✏️ 할일 작성
        </h3>
        <button onClick={handleWrite} className="btn btn-primary">
          작성하기
        </button>
      </div>
    </div>
  );
};

// 용서하세요. 목록 컴포넌트
const InfiniteTodoList = () => {
  const { loading, hasMore, loadMoreTodos, todos, totalCount } = useInfiniteScroll();
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

  if (loading) {
    return <div className="loading-container">데이터 로딩중 ...</div>;
  }

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div
        style={{
          padding: '20px',
          borderBottom: '1px solid var(--gray-200)',
          backgroundColor: 'var(--gray-50)',
        }}
      >
        <h3
          style={{
            margin: '0',
            color: 'var(--gray-900)',
            fontSize: '18px',
            fontWeight: '600',
          }}
        >
          📋 TodoList(무한 스크롤)
          {profile?.nickname && (
            <span
              style={{
                marginLeft: '8px',
                fontSize: '14px',
                color: 'var(--gray-600)',
                fontWeight: '400',
              }}
            >
              {profile.nickname}님의 할일
            </span>
          )}
        </h3>
      </div>

      {todos.length === 0 ? (
        <div className="loading-container">등록된 할 일이 없습니다.</div>
      ) : (
        // 무한 스크롤 라이브러리 적용
        <div style={{ height: '500px', overflow: 'auto' }}>
          <InfiniteScroll
            dataLength={todos.length}
            next={loadMoreTodos}
            hasMore={hasMore}
            height={500}
            loader={<div className="loading-container">데이터를 불러오는 중...</div>}
            endMessage={
              <div
                style={{
                  textAlign: 'center',
                  padding: '20px',
                  color: 'var(--success-500)',
                  fontSize: '14px',
                  fontWeight: '600',
                }}
              >
                모든 데이터를 불러왔습니다.
              </div>
            }
          >
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {todos.map((item, index) => {
                return (
                  <li
                    key={item.id}
                    className={`todo-item ${item.completed ? 'completed' : ''}`}
                    style={{
                      backgroundColor: index % 2 === 0 ? 'white' : 'var(--gray-50)',
                    }}
                  >
                    {/* 번호표시 */}
                    <span className="todo-number">{getGlobalIndex(index)}.</span>
                    <div className="todo-content">
                      <span className={`todo-title ${item.completed ? 'completed' : ''}`}>
                        <Link to={`/todos/edit/${item.id}`}>{item.title}</Link>
                      </span>
                      <span className="todo-date">작성일: {formatDate(item.created_at)}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </InfiniteScroll>
        </div>
      )}
    </div>
  );
};

function TodosInfinitePage() {
  return (
    <InfiniteScrollProvider itemsPerPage={10}>
      <div>
        <div className="page-header">
          <h2 className="page-title">🔄 무한 스크롤 Todo 목록</h2>
          <p className="page-subtitle">스크롤하여 더 많은 할일을 확인하세요</p>
        </div>

        <div className="container">
          <div style={{ marginBottom: '20px' }}>
            <InfiniteTodoWrite />
          </div>

          <div>
            <InfiniteTodoList />
          </div>
        </div>
      </div>
    </InfiniteScrollProvider>
  );
}

export default TodosInfinitePage;
```

## 7. 페이지네이션 업데이트 (선택사항)

- /src/index.css

```css
/* ===== PagiNation Styles ===== */
.pagination-container {
  display: 'flex';
  align-items: 'center';
  gap: var(--space-4);
  padding: var(--space-4);
}
.pagination-info {
  text-align: center;
  color: var(--gray-600);
  font-size: 14px;
}
.pagination-count {
  font-weight: 600;
  color: var(--gray-600);
}
.pagination-range {
  font-weight: 600;
  color: var(--gray-800);
}
.pagination-controls {
  display: flex;
  align-self: center;
  justify-content: center;
  gap: var(--space-2);
}
.pagination-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 40px;
  padding: 0 var(--space-3);
  border: 1px solid var(--gray-300);
  background-color: #fff;
  color: var(--gray-700);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}
.pagination-btn:hover {
  background-color: var(--primary-50);
  border-color: var(--primary-300);
  color: var(--primary-700);
  box-shadow: var(--shadow-sm);
}
.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: var(--gray-100);
  color: var(--gray-400);
}
.pagination-numbers {
  display: flex;
  gap: var(--space-1);
}
.pagination-ellipsis {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 40px;
  color: var(--gray-500);
  font-weight: 600;
  font-size: 16px;
}
/* 현재 페이지일 때 버튼 */
.pagination-btn-number.active {
  background-color: var(--primary-500);
  border-color: var(--primary-500);
  color: #fff;
  font-weight: 600;
  box-shadow: var(--shadow-sm);
}
.pagination-btn-number.active:hover {
  background-color: var(--primary-600);
  border-color: var(--primary-600);
}
/* 반응형 */
@media screen and (max-width: 768px) {
  .pagination-controls {
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--space-1);
  }
  .pagination-btn {
    min-width: 36px;
    height: 36px;
    font-size: 13px;
  }
}
```

- /src/components/Pagination.tsx

```tsx
import React from 'react';

interface PaginationProps {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
  handleChangePage: (page: number) => void;
}
const Pagination = ({
  totalCount,
  totalPages,
  currentPage,
  itemsPerPage,
  handleChangePage,
}: PaginationProps): JSX.Element => {
  // ts 자리
  // 시작 번호를 생성함.
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  // 마지막 번호를 생성함.
  const endItem = Math.min(currentPage * itemsPerPage, totalCount);

  // 페이지 번호 버튼 배열을 생성함
  const getPageNumbers = () => {
    const pages = [];
    // 한 화면에 몇개의 버튼들을 출력할 것인가?
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // 현재 5 페이지 보다 적은 경우
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 현재 5 페이지 보다 큰 경우
      // 시나리오
      // ... currentpage-2 currentpage-1 currentpage currentpage+1 currentpage+2 ...
      // 현재 페이지를 중심으로 앞뒤 2개씩 표현
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, currentPage + 2);

      // 시작페이지가 1 보다 크면 첫 페이지와 ... 추가
      if (startPage > 1) {
        pages.push(1);
        // [1]
        if (startPage > 2) {
          pages.push('...');
          // [1, "..."]
        }
      }
      // 중간 페이지를 추가
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // 끝 페이지가 마지막 보다 작으면 ... 과 페이지 추가
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push('...');
        }
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  // 페이지네이션이 무조건 나오는 것은 아닙니다.
  if (totalPages <= 1) {
    return <></>;
  }

  // tsx 자리
  return (
    <div className="pagination-container">
      {/* 페이지 정보 */}
      <div className="pagination-info">
        총 <span className="pagination-count">{totalCount}</span>개 중{' '}
        <span className="pagination-range">
          {startItem} ~ {endItem}
        </span>
        개 표시
      </div>
      {/* 페이지 번호들 */}
      <div className="pagination-controls">
        <button
          className="pagination-btn"
          onClick={() => handleChangePage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          이전
        </button>

        {/* 버튼들 출력 */}
        <div className="pagination-numbers">
          {pageNumbers.map((item, index) => (
            <React.Fragment key={index}>
              {item === '...' ? (
                <span className="pagination-ellipsis">...</span>
              ) : (
                <button
                  className={`pagination-btn pagination-btn-number ${item === currentPage ? 'active' : ''}`}
                  onClick={() => handleChangePage(item as number)}
                >
                  {item}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        <button
          className="pagination-btn"
          onClick={() => handleChangePage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          다음
        </button>
      </div>
    </div>
  );
};

export default Pagination;
```

## 8. 관리자페이지 업데이트 (선택)

- /src/pages/AdminPage.tsx

```tsx
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { DeleteRequest, DeleteRequestUpdate } from '../types/TodoType';
import Loading from '../components/Loading';

function AdminPage() {
  // ts 자리
  const { user } = useAuth();
  // 삭제 요청 DB 목록 관리
  const [deleteRequests, setDeleteRequests] = useState<DeleteRequest[]>([]);
  // 로딩창
  const [loading, setLoading] = useState(true);

  // 관리자 확인
  const isAdmin = user?.email === 'wldjsjiun@naver.com';
  useEffect(() => {
    console.log(user?.email);
    console.log(user?.id);
    console.log(user);
  }, [user]);

  // 컴포넌트가 완료가 되었을 때, isAdmin 을 체크 후 실행
  useEffect(() => {
    if (isAdmin) {
      // 회원 탈퇴 신청자 목록을 파악
      loadDeleteMember();
    }
  }, [isAdmin]);

  // 탈퇴 신청자 목록 파악 테이터 요청
  const loadDeleteMember = async (): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('account_deletion_requests')
        .select('*')
        .eq('status', 'pending')
        .order('requested_at', { ascending: false });

      if (error) {
        console.log(`삭제 목록 요청 에러 : ${error.message}`);
        return;
      }

      // 삭제 요청 목록 보관
      setDeleteRequests(data || []);
    } catch (err) {
      console.log('삭제 요청 목록 오류', err);
    } finally {
      setLoading(false);
    }
  };
  // 탈퇴 승인
  const approveDelete = async (id: string, updateUser: DeleteRequestUpdate): Promise<void> => {
    try {
      const { error } = await supabase
        .from('account_deletion_requests')
        .update({ ...updateUser, status: 'approved' })
        .eq('id', id);
      if (error) {
        console.log(`탈퇴 업데이트 오류 : ${error.message}`);
        return;
      }

      alert(`사용자 ${id}의 계정이 삭제가 승인되었습니다. \n\n 관리자님 수동으로 삭제하세요.`);

      // 목록 다시 읽기
      loadDeleteMember();
    } catch (err) {
      console.log('탈퇴승인 오류 : ', err);
    }
  };

  // 탈퇴 거절
  const rejectDelete = async (id: string, updateUser: DeleteRequestUpdate): Promise<void> => {
    try {
      const { error } = await supabase
        .from('account_deletion_requests')
        .update({ ...updateUser, status: 'rejected' })
        .eq('id', id);

      if (error) {
        console.log(`탈퇴 업데이트 오류 : ${error.message}`);
        return;
      }

      alert(`사용자 ${id}의 계정이 삭제가 거부되었습니다.`);

      // 목록 다시 읽기
      loadDeleteMember();
    } catch (err) {
      console.log('탈퇴거절 오류 : ', err);
    }
  };

  // 1. 관리자 아이디가 불일치라면
  if (!isAdmin) {
    return (
      <div className="card" style={{ textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
        <h2 className="page-title">접근 권한이 없습니다.</h2>
        <p className="page-subtitle">관리자만이 이 페이지에 접근할 수 있습니다.</p>
        <div style={{ marginTop: 'var(--space-6)' }}>
          <p style={{ color: 'var(--gray-600)' }}>
            현재 로그인 된 계정 : <strong>{user?.email}</strong>
          </p>
        </div>
      </div>
    );
  }
  // 2. 로딩중 이라면
  if (loading) {
    return <Loading message="관리자데이터를 불러오는 중..." />;
  }

  // tsx 자리
  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">👨‍💼 관리자 페이지</h2>
        <p className="page-subtitle">계정 삭제 요청 관리</p>
      </div>
      {/* 삭제 요청 관리 */}
      <div className="card">
        <h3 style={{ marginBottom: 'var(--space-4)', color: 'var(--gray-800)' }}>
          📋 삭제 요청 목록
        </h3>
        {deleteRequests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>✅</div>
            <p style={{ color: 'var(--gray-600)', fontSize: '1.1rem' }}>
              대기 중인 삭제 요청이 없습니다.
            </p>
          </div>
        ) : (
          <div>
            {deleteRequests.map(item => (
              <div key={item.id} className="admin-request-item">
                <div className="admin-request-header">
                  <h4 style={{ margin: 0, color: 'var(--gray-800)' }}>👤 {item.user_email}</h4>
                  <span className="admin-status-badge">대기 중</span>
                </div>
                {/* 상세정보 */}
                <div className="admin-request-details">
                  <div className="admin-detail-row">
                    <span className="admin-detail-label">사용자 ID:</span>
                    <span className="admin-detail-value">{item.user_id}</span>
                  </div>
                  <div className="admin-detail-row">
                    <span className="admin-detail-label">요청시간:</span>
                    <span className="admin-detail-value">
                      {item.requested_at && new Date(item.requested_at).toLocaleString('ko-KR')}
                    </span>
                  </div>
                  <div className="admin-detail-row">
                    <span className="admin-detail-label">삭제사유:</span>
                    <span className="admin-detail-value"> {item.reason}</span>
                  </div>
                </div>
                {/* 액션들 */}
                <div className="admin-request-actions">
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => approveDelete(item.id, item)}
                  >
                    ✅ 승인
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => rejectDelete(item.id, item)}
                  >
                    ❌ 거절
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPage;
```

```css
/* ===== Admin Page Styles ===== */
.admin-request-item {
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  margin-bottom: var(--space-4);
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;
}

.admin-request-item:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--gray-300);
}

.admin-request-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--gray-200);
}

.admin-status-badge {
  background-color: var(--primary-100);
  color: var(--primary-700);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-md);
  font-size: 12px;
  font-weight: 500;
}

.admin-request-details {
  margin-bottom: var(--space-4);
}

.admin-detail-row {
  display: flex;
  margin-bottom: var(--space-2);
  align-items: flex-start;
}

.admin-detail-label {
  font-weight: 500;
  color: var(--gray-700);
  min-width: 100px;
  margin-right: var(--space-3);
}

.admin-detail-value {
  color: var(--gray-600);
  flex: 1;
  word-break: break-all;
}

.admin-request-actions {
  display: flex;
  gap: var(--space-3);
  justify-content: flex-end;
  padding-top: var(--space-3);
  border-top: 1px solid var(--gray-200);
}
```
