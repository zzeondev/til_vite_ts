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
