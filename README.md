# Editor 와 Supabase Storage 연동

- 사용자가 내용 작성 중 이미지를 배치한다면
  - 1. 그냥 text 로 처리한다.
  - 2. 이미지를 배치하면 storage 업로드 후 url 받아서 보여준다.
  - 3. 이미지를 배치하면 미리보기 URL 을 생성한 후 보여주고
    - 3.0. img src="임시주소", 이미지 파일은 별도로 보관함
    - 3.1. 사용자가 저장 버튼 누르면 그때 storage 에 등록자 폴더 생성 후 저장하고
    - 3.2. 저장이 성공되면 getURL 로 주소 알아내고.
    - 3.3. content 의 내용 중 img src="주소" 교체하고
    - 3.4. DB 에 저장한다.

## 1. Supabase Storage 설정

### 1.1. `todo-images` 를 생성합니다.

- Public bucket : 활성
- Restrict file size : 50MB
- `Allowed MIME types : image/jpeg, image/png, image/gif, image/webp, image/svg+xml`
- 주의사항 : `image/*` 는 배제합니다.

### 1.2. `RLS 를 설정` 합니다.

```sql
CREATE POLICY "Public object access Todo Images" ON storage.objects FOR ALL USING (bucket_id = 'todo-images');
```

### 1.3. 업로드시 `todo-images/사용자ID/파일들...`

## 2. 새글 및 이미지 등록

### 2.1. 텍스트 에디터의 이미지 업로드 기능

- 임시 미리보기 이미지를 생성하고,
- 실제로는 file 업로드 하고,
- url 을 받아서 내용 수정후
- content 를 insert 함

- /src/components/RichTextEditor.tsx

```tsx
import React, { useCallback, useEffect, useRef } from 'react';
import ReactQuill, { type Value } from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// 임시 미리보기 이미지의 데이터 형태
interface TempImageFile {
  file: File; // 사용자가 실제로 선택한 이미지 파일
  tempUrl: string; // URL.createObjectURL 로 만든 blob 임시 URL (본문 보여줌)
  id: string; // 관리를 위한 ID 를 할당
}

// 컴포넌트가 외부에서 전달받을 데이터 형태
interface RichTextEditorProps {
  value: string; // 에디터에 초기로 보여줄 내용
  onChange: (value: string) => void; // 내용이 변결될때 실행할 함수
  placeholder?: string; // 안내 텍스트 (선택사항)
  disabled?: boolean; // 에디터를 비활성화할지 여부 (선택사항)
  // 추가됨
  onImagesChange?: (images: File[]) => void; // 파일을 외부에 보관하는 용도
}

const RichTextEditor = ({
  value,
  onChange,
  placeholder = '내용을 입력하세요.',
  disabled = false,
  onImagesChange, // 외부로 이미지를 전달하는 함수
}: RichTextEditorProps) => {
  // ref 변수들을 저장해둠

  // ReactQuill 을 보관해둡니다.
  const quilRef = useRef<ReactQuill | null>(null);

  // 미리보기 이미지들을 보관할 임시 목록 ("blob:~~~")
  const tempImagesRef = useRef<TempImageFile[]>([]);

  // 가장 최근의 내용을 관리하기 위한 변수
  const valueRef = useRef<string>(value);

  // 임시 이미지 URL 생성하는 기능 (기능을 한번만 만들고 재활용)
  const createTempImageUrl = useCallback((file: File): string => {
    // 웹브라우저 임시 파일 주소 생성
    return URL.createObjectURL(file);
  }, []);

  // React Quill 의 툴바의 파일 추가 (이미지 아이콘 클릭 처리)를 수정
  // 리랜더링시 다시 함수를 안만들도록 useCallback 으로 보관
  const imageHandler = useCallback(() => {
    alert('우리꺼');
    // input 태그를 코딩으로 만들어 낸다.
    // <input type = "file" accept = "image/*" onchange="" />
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();
    input.onchange = async () => {
      // 파일 1개만 선택하도록 처리
      const file = input.files?.[0];
      if (!file) return;

      // 파일 크기를 보통 5MB 로 제한
      if (file.size > 5 * 1024 * 1024) {
        alert('이미지 파일 크기는 5MB 이하여야 합니다.');
        return;
      }
      // 임시 주소 생성
      const tempUrl = createTempImageUrl(file);

      // 절대 중복되지 않는 임시 ID 를 생성하자
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      // 임시 파일 및 주소를 저장
      const tempImage: TempImageFile = {
        file: file,
        tempUrl: tempUrl,
        id: tempId,
      };

      // 생성된 정보를 보관한다.
      tempImagesRef.current.push(tempImage);

      // 실제 React Quill 내용 창에 출력
      const quill = quilRef.current?.getEditor();
      if (quill) {
        // 어디에다가 이미지를 출력할 것인가 위치를 파악
        const range = quill.getSelection();
        // 특정 범위가 없다면 끝에 배치한다.
        const insertIndex = range ? range.index : quill.getLength();
        try {
          // 직접 html 태그를 만들어서 삽입해줌
          // 나중에 고민 해보자
          // <p><img src="" /></p>
          const img = document.createElement('img');
          img.src = tempUrl;
          img.style.maxWidth = '100%';
          img.style.height = 'auto';
          img.style.display = 'block';
          img.style.margin = '10px 0';

          const p = document.createElement('p');
          p.appendChild(img);

          // React Quill 직접 추가
          const editorElement = quill.root;
          // 현재 위치에 추가
          if (insertIndex === 0) {
            // 찾은 root Div 태그에 앞쪽에 추가한다.
            editorElement.insertBefore(p, editorElement.firstElementChild);
          } else {
            const nodes = editorElement.childNodes;
            if (insertIndex < nodes.length) {
              editorElement.insertBefore(p, nodes[insertIndex]);
            } else {
              editorElement.appendChild(p);
            }
          }
          // 강제로 리랜더링 시킨다.
          quill.update();
          // 마우스 커서 위치를 설정한다.
          quill.setSelection(insertIndex + 1);
        } catch (error) {
          console.log('이미지 삽입 중 오류 :', error);
          // 오류이더라도 다시 html 을 추가해 봄
          try {
            const imgHtml = `<img src=${tempUrl} style="max-width:100%; height:auto; margin:10px0; />`;
            quill.clipboard.dangerouslyPasteHTML(insertIndex, imgHtml);
            quill.setSelection(insertIndex + 1);
          } catch (err) {
            console.log('이미지 삽입 정말 실패 : ', err);
          }
        }
      }
    };
  }, [createTempImageUrl]);

  // value 변경되면 다시 value 를 보관함
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  // 에디터 내용과 임시 이미지 목록 즉, tempImagesRef 의 변화를 매칭해줌. 동기화
  // 리랜더링 되더라도 한번만 생성되게
  const syncTempImages = useCallback(() => {
    // 현재 에디터 내용에서 사용중인 tempUrl 을 추출함
    // 데이터 타입에서 Array 처럼 Set 도 있습니다.
    const usedTempUrls = new Set<string>();
    // 내용에서 blob 으로 된 글자를 찾아줄 겁니다.
    // 글자들을 비교할 때 정규표현식(Regular Expression)을 사용함
    const tempUrlRegex = /blob:[^"'\s]+/g;
    // 실제로 비교를 실행
    const matchs = valueRef.current.match(tempUrlRegex);
    if (matchs) {
      matchs.forEach(item => usedTempUrls.add(item));
    }
    // 사용하지 않는 임시 이미지들 정리.
    // 메모리 누수를 막아주기 위해서
    tempImagesRef.current = tempImagesRef.current.filter(item => {
      const isUsed = usedTempUrls.has(item.tempUrl);
      // 내용에 임시 미리보기 URL 글자가 없다면 삭제해야 한다.
      if (!isUsed) {
        // 사용하지 않는 blob URL 정리하기
        URL.revokeObjectURL(item.tempUrl);
      }
      return isUsed;
    });
  }, []);

  // 에디터의 내용이 변경되면 임시 이미지 동기화
  useEffect(() => {
    // 메모리 누수 방지 및 필요없는 파일 업로드 방지용
    syncTempImages();
  }, [value, syncTempImages]);

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

  // 이미지 파일을 외부로 전달
  useEffect(() => {
    if (onImagesChange) {
      // 실제 화면에 보이는 파일만 배열요소로 추출
      const imageFiles = tempImagesRef.current.map(item => item.file);
      onImagesChange(imageFiles);
    }
  }, [onImagesChange, tempImagesRef.current.length]);

  // 에디터가 마운트 되면
  // 즉, 화면에 보이면 이미지 버튼에 이벤트 리스너 추가
  useEffect(() => {
    // 약간 시간을 두고 핸들러 등록 (에디터가 초기화 하는데 시간 걸림)
    const timer = setTimeout(() => {
      const quill = quilRef.current?.getEditor();
      if (quill) {
        console.log('Quill 에디터 초기화 성공!');
        const toolbar = quill.getModule('toolbar') as any;
        if (toolbar && toolbar.addHandler) {
          console.log('이미지 핸들러 등록 실행함');
          // 우리가 원하는 핸들러 등록
          toolbar.addHandler('image', imageHandler);
        }
      }
    }, 100);
    // 클린업 함수
    return () => {
      clearTimeout(timer);
    };
  }, [imageHandler]);

  return (
    <div>
      <ReactQuill
        ref={quilRef} // React Quill 인스턴스를 보관해 둠
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

- /src/pages/TodoWritePage.tsx

```tsx
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
            // todo-images 저장소 폴더명생성 / 파일명 생성

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
```
