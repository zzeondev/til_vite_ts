# Editor 와 파일 삭제

## 1. 오류 개선

- 기준 : 1 번이라도 발생하면 발생한 겁니다.
- 작성 중에 이미지를 제거하면 정확하게 이미지가 제거되지 않고 등록되는 문제
- 계속해서 value 를 감시해서 최종 html 이 제대로 업데이트가 안되고 있더라

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
    // alert('우리꺼');
    // input 태그를 코딩으로 만들어 낸다.
    // <input type = "file" accept = "image/*" onchange="" />
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    // 여러개는 업데이트 예정
    // input.setAttribute('multiple', 'true');
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
      console.log(`이미지가 추가됨 : ${tempId} ${tempUrl}`);

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

          // 유일한 ID 를 부여해서 추후 비교용으로 활용
          img.setAttribute('data-temp-id', tempId);

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
            const imgHtml = `<img src=${tempUrl} data-temp-id=${tempId} style="max-width:100%; height:auto; margin:10px0;" />`;
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
    // 현재 에디터 내용에서 사용중인 tempUrl 을 추출함.
    // 데이터 타입에서 Array 처럼 Set 도 있습니다.
    const usedTempUrls = new Set<string>();
    // 내용에서 blob 으로 된 글자를 찾아줄 겁니다.
    // 글자들을 비교할때 정규표현식(Regular Expression)을 사용함.
    const tempUrlRegex = /blob:[^"'\s]+/g;

    // 실제로 비교를 실행
    // const matchs = valueRef.current.match(tempUrlRegex);
    // if (matchs) {
    //   matchs.forEach(item => usedTempUrls.add(item));
    // }

    // 오류개선
    const matchs = valueRef.current.match(tempUrlRegex);

    // 순서대로 표시된 이미지를 재정렬
    const orderdImages: TempImageFile[] = [];
    matchs?.forEach(tempUrl => {
      const foundImage = tempImagesRef.current.find(item => item.tempUrl === tempUrl);
      if (foundImage && !usedTempUrls.has(tempUrl)) {
        orderdImages.push(foundImage);
        usedTempUrls.add(tempUrl);
      }
    });

    // 사용하지 않는 임시 이미지들 정리
    // 메모리 누수를 막아주기 위해서
    // tempImagesRef.current = tempImagesRef.current.filter(item => {
    //   const isUsed = usedTempUrls.has(item.tempUrl);
    //   // 내용에 임시 미리보기 URL 글자가 없다면 삭제해야 한다.
    //   if (!isUsed) {
    //     // 사용하지 않는 blob URL 정리하기
    //     URL.revokeObjectURL(item.tempUrl);
    //   }
    //   return isUsed;
    // });

    // 개선된 코드 : 사용하지 않는 임시 이미지들을 정리
    // 메모리 누수를 막아주기 위해서
    tempImagesRef.current.forEach(item => {
      if (!usedTempUrls.has(item.tempUrl)) {
        // 사용하지 않는 blob url 을 정리하기
        URL.revokeObjectURL(item.tempUrl);
        console.log(`이미지 삭제됨 : ${item.id} ${item.tempUrl}`);
      }
    });
    // 에디터 순서대로 재 정렬된 배열로 업데이트
    tempImagesRef.current = orderdImages;
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
  }, [onImagesChange, value]); // 에디터에 내용이 바뀔 때마다 이미지 목록 업데이트

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

## 2. 게시글 삭제 시 파일도 같이 삭제

- 삭제는 DB 삭제 시 먼저 파일을 삭제하고, 내용을 삭제한다.
- todoService.ts 에서 처리하면 됨

```ts
// Todo 삭제
// content 에 포함된 파일을 제거하고 나서 내용을 삭제함.
export const deleteTodo = async (id: number): Promise<void> => {
  try {
    // 1. 먼저 삭제할 todo의 content 에서 이미지의 url 만 추출한다.
    const { data: todo, error: fetchError } = await supabase
      .from('todos')
      .select('content, user_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      throw new Error(`deleteTodo fetch 오류 : ${fetchError.message}`);
    }
    // 2. content 에서 이미지 URL을 추출
    if (todo.content) {
      // 정규 표현식으로 특정 패턴의 글자를 알아낸다.
      const imageUrlPattern = /https:\/\/[^"'\s]+\.(jpg|jpeg|png|gif|webp|svg)/gi;
      const imageUrls = todo.content.match(imageUrlPattern) || [];
      // 배열의 반복으로 요소를 찾아내는 법
      // imageUrls 에서 url 을 찾아서 파일 삭제 supabase 실행함.
      for (const url of imageUrls) {
        try {
          // url : https://erontyifxxztudowhees.supabase.co/storage/v1/object/public/todo-images/6b66829c-ec6c-4750-ad15-90641c3cb0fe/6b66829c-ec6c-4750-ad15-90641c3cb0fe_1758243951105_icon.png
          const urlParts = url.split('/');
          // urlParas : [ "https:",  "", "erontyifxxztudowhees.supabase.co"....]
          // todo-images 라는 버킷이 몇번째 인지를 알아냄.
          // 버킷 다음이 실제 파일의 경로가 됨.
          const bucketIndex = urlParts.findIndex((item: string) => item === 'todo-images');

          // todo-images 의 인덱스를 찾았으므로 실제 파일 경로가 있는지 검사
          // 만약 없다면 bucketIndex 가  -1 이라고 담겨짐
          if (bucketIndex !== -1 && bucketIndex + 1 < urlParts.length) {
            // 6b66829c-ec6c-4750-ad15-90641c3cb0fe/6b66829c-ec6c-4750-ad15-90641c3cb0fe_1758243951105_icon.png
            // 삭제 되어야 할 파일 경로 및 파일명
            const filePath = urlParts.slice(bucketIndex + 1).join('/');
            const { error: deleteError } = await supabase.storage
              .from('todo-images')
              .remove([filePath]);

            if (deleteError) {
              console.log(`이미지 파일 삭제 실패 : ${filePath}`, deleteError.message);
            }
          }
        } catch (imageError) {
          console.log(`이미지 삭제 중 오류 : ${imageError}`);
        }
      }
    }

    const { error } = await supabase.from('todos').delete().eq('id', id);
    if (error) {
      throw new Error(`deleteTodo 오류 : ${error.message}`);
    }
  } catch (error) {
    console.log(error);
  }
};
```

## 3. 게시글 수정시 파일 삭제와 추가

- /src/pages/TodoEditPage.tsx

```tsx
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
```

- todoService.ts 에서 `updateTodo` 기능 업데이트

```ts
// Todo 수정
// 로그인을 하고 나면 실제로 user_id 가 이미 파악이 됨
// TodoUpdate 에서 user_id : 값 을 생략하는 타입을 생성
// 타입스크립트에서 Omit 을 이용하면, 특정 키를 제거할 수 있음.
export const updateTodo = async (
  id: number,
  updateData: Omit<TodoUpdate, 'user_id'>,
): Promise<Todo | null> => {
  try {
    // 1. 아직 DB 에는 예전의 내용이 있다.
    // 수정 전 content 에 있던 이미지 URL 들을 확인하기 위함.
    // 예전 데이터 조회
    const { data: oldTodo, error: fetchError } = await supabase
      .from('todos')
      .select('content')
      .eq('id', id)
      .single();
    if (fetchError) {
      throw new Error(`updateTodo fetch 오류 : ${fetchError.message}`);
    }

    // 2. content 가 변경된 경우, 삭제된 이미지들을 정리
    // 새로운 content 와 기존의 content를 비교
    // 삭제된 이미지들을 찾아서 storage 에서 제거
    if (updateData.content && oldTodo.content) {
      // 정규표현식으로 이미지를 찾음.
      const oldImageUrlPattern = /https:\/\/[^"'\s]+\.(jpg|jpeg|png|gif|webp|svg)/gi;
      const newImageUrlPattern = /https:\/\/[^"'\s]+\.(jpg|jpeg|png|gif|webp|svg)/gi;

      // 기존 content 와 새로운 content 에서 이미지 url 을 추출
      const oldImageUrls: string[] = oldTodo.content.match(oldImageUrlPattern) || [];
      const newImageUrls: string[] = updateData.content.match(newImageUrlPattern) || [];

      // 삭제된 이미지 URL들을 찾기
      // 기존에 있던 이미지 URL 중에서 새로운 content에 없는 것들을 필터링
      const deletedImageUrls = oldImageUrls.filter(item => !newImageUrls.includes(item));

      // 삭제된 이미지로 판별된다면 storage 에서 제거한다.
      for (const deleteUrl of deletedImageUrls) {
        try {
          // url 을 "/" 로 분리해서 배열을 만듦
          const urlParts = deleteUrl.split('/');
          // 배열에서 todo-images 버킷 이름이 있는 인덱스 찾는다.
          const bucketIndex = urlParts.findIndex((item: string) => item === 'todo-images');

          // todo-images 를 찾았고, 다음에 나오는 것들을 이용해서 실제 파일 경로를 만듦
          if (bucketIndex !== -1 && bucketIndex + 1 < urlParts.length) {
            const filePath = urlParts.slice(bucketIndex + 1).join('/');
            // 실제 filePath 로 이미지 삭제하기
            const { error: deleteError } = await supabase.storage
              .from('todo-images')
              .remove([filePath]);
            // 파일 삭제에 실패하면 메시지 출력
            if (deleteError) {
              console.log(`삭제된 파일 정리 실패 : ${filePath}`, deleteError.message);
            }
          }
        } catch (error) {
          console.log(`이미지 정리 중 오류 : ${deleteUrl}, ${error}`);
        }
      }
    }

    // 3. 데이터 업데이트
    const { data, error } = await supabase
      .from('todos')
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`updateTodo 오류 : ${error.message}`);
    }

    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};
```
