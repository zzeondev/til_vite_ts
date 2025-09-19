import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import type { Profile, Todo } from '../types/TodoType';
import { getProfile } from '../lib/profile';
import { getTodoById, toggleTodo, updateTodo } from '../services/todoService';
import Loading from '../components/Loading';
import RichTextEditor from '../components/RichTextEditor';
import { supabase } from '../lib/supabase';

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

  // 이미지 파일 보관
  const [imgaeFiles, setImageFiles] = useState<File[]>([]);
  // 이미지 파일 보관용 업데이트
  const handleImageChange = useCallback((images: File[]) => {
    setImageFiles(images);
  }, []);

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
  // 아래는 파일도 저장하도록 업데이트
  const handleSave = async () => {
    if (!todo) return;
    if (!title.trim()) {
      alert('제목을 입력하세요.');
      return;
    }
    try {
      setSaving(true);

      // 파일 업데이트 처리
      // 1. 기존의 content 내용을 보관
      // <img src="blob:~~" /> 새로 업로드 한 이미지인 경우
      // <img src="http://~" /> 기존의 storage 에 있는 경우
      let finalContent = content;

      // 2. blob 파일이 존재한다면
      if (imgaeFiles.length > 0) {
        // 모든 blob: 글자를 찾습니다.
        const blobUrlPattern = /blob:[^"'\s]+/g;
        const blobUrls = finalContent.match(blobUrlPattern) || [];
        // 혹시라도 이미지 임시 개수와 보관하고 있는 파일개수가 다른 부분 고려
        for (let i = 0; i < blobUrls.length && i < imgaeFiles.length; i++) {
          const imageFile = imgaeFiles[i];
          const blobUrl = blobUrls[i];
          // 아래에서 업로드 합니다.
          try {
            // 파일명을 생성한다.
            const timestamp = Date.now() + i; // 각 이미지 마다 다른 시간글자
            // todo-images 저장소 폴더명생성 / 파일명 생성

            // 한글 파일명 또는 특수기호 처리
            const goodFileName = (filename: string) => {
              const lastDotIndex = filename.lastIndexOf('.');
              const name = lastDotIndex > 0 ? filename.substring(0, lastDotIndex) : filename;
              const extension = lastDotIndex > 0 ? filename.substring(lastDotIndex) : '';

              // 안전한 파일명 생성
              let safeName = name
                // 1단계: 공백을 언더스코어로 변환
                .replace(/\s+/g, '_')
                // 2단계: 한글, 특수기호, 이모지 등을 언더스코어로 변환
                .replace(/[^\w\-_.]/g, '_')
                // 3단계: 연속된 언더스코어를 하나로 통합
                .replace(/_+/g, '_')
                // 4단계: 앞뒤 언더스코어 제거
                .replace(/^_|_$/g, '')
                // 5단계: 파일명이 비어있거나 너무 짧으면 기본값 사용
                .replace(/^$/, 'image');

              // 파일명이 너무 길면 자르기 (확장자 제외 50자 제한)
              if (safeName.length > 50) {
                safeName = safeName.substring(0, 50);
              }

              // 확장자도 안전하게 처리
              const safeExtension = extension
                .replace(/[^\w.]/g, '') // 영문, 숫자, 점만 허용
                .toLowerCase(); // 소문자로 통일

              return safeName + safeExtension;
            };

            const safeFileName = goodFileName(imageFile.name);
            const fileName = `${user!.id}_${timestamp}_${safeFileName}`;
            const filePath = `${user!.id}/${fileName}`;
            // supabase 에 실제 업로드
            // 폴더가 있으면 재활용, 없으면 자동 생성
            const { error } = await supabase.storage
              .from('todo-images')
              .upload(filePath, imageFile, { cacheControl: '3600', upsert: false });

            if (error) {
              // 오류가 나도 계속 반복해라.
              continue;
            }
            // 업로드 된 파일의 public URL 을 가져와야 합니다.
            const { data: urlData } = await supabase.storage
              .from('todo-images')
              .getPublicUrl(filePath);

            // blob 주소의 문자열을 http 로 변경함
            finalContent = finalContent.replace(blobUrl, urlData.publicUrl);
          } catch (err) {
            console.log(err);
          }
        }
      }

      // 현재 finalContent 는 많은 내용이 변경되었음 (기존 파일 삭제 또는 신규 파일 추가)
      const result = await updateTodo(todo.id, { title, content: finalContent });
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
            onImagesChange={handleImageChange}
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
