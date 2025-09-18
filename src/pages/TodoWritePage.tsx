import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { Profile, TodoInsert } from '../types/TodoType';
import { getProfile } from '../lib/profile';
import { useNavigate } from 'react-router-dom';
import { createTodo } from '../services/todoService';
import RichTextEditor from '../components/RichTextEditor';
import { supabase } from '../lib/supabase';

function TodoWritePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // 사용자 입력내용
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  // 데이터가 추가 되고 있는지의 상태
  const [saving, setSaving] = useState(false);

  // 이전에는 글자만 state 로 관리했는데, 이제는 파일도 state로 관리해야 한다.
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  // 이미지 파일 변경 처리
  const handleImageChange = useCallback((images: File[]) => {
    setImageFiles(images);
  }, []);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };
  // const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  //   setContent(e.target.value);
  // };
  const handleContentChange = (value: string) => {
    setContent(value);
  };

  const handleCancel = () => {
    // 사용자가 실수로 취소를 할 수 있으므로 이에 대비
    if (title.trim() || content.trim()) {
      if (window.confirm('작성 중인 내용이 있습니다. 정말 취소하시겠습니까?')) {
        // 목록으로
        navigate('/todos');
      }
    } else {
      // 목록으로
      navigate('/todos');
    }
  };

  // 기존과는 다르게
  // 파일 저장 후 성공시
  // content 내용 중 img src="주소" 변경
  // DB 를 Insert 합니다.
  const handleSave = async () => {
    // 제목은 필수 입력
    if (!title.trim()) {
      alert('제목은 필수 입니다.');
      return;
    }
    try {
      setSaving(true);
      // 1. 기존의 content 내용을 보관한다.
      let finalContent = content; // <img src="blob:~~`/>
      // 2. files 이 존재한다면
      if (imageFiles.length > 0) {
        // 모든 blob : 글자를 찾습니다.
        const blobUrlPattern = /blob:[^"'\s]+/g;
        const blobUrls = finalContent.match(blobUrlPattern) || [];

        // 혹시라도 이미지 임시 개수와 보관하고 있는 파일 개수가 다른 부분 고려
        for (let i = 0; i < blobUrls.length && i < imageFiles.length; i++) {
          const imageFile = imageFiles[i];
          const blobUrl = blobUrls[i];
          // 아래에서 업로드 합니다.
          try {
            // 파일명을 생성한다.
            const timestamp = Date.now() + i; // 각 이미지 마다 다른 시간 글자

            // 한글 파일명 또는 특수 기호 처리
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
            // todo-images 저장소 폴더명 생성 / 파일명 생성
            const fileName = `${user!.id}_${timestamp}_${safeFileName}`;
            const filePath = `${user!.id}/${fileName}`;
            // supabase에 실제로 업로드
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

      const newTodo: TodoInsert = { title, user_id: user!.id, content: finalContent };
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
            onImagesChange={handleImageChange}
          />
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={handleCancel} disabled={saving}>
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
