# Multi 파일 올리기

- RichTextEditor.tsx 수정

```tsx
const imageHandler = useCallback(() => {
  // input 태그를 코딩으로 만들어 낸다.
  // <input type="file" accept = "image/*" onchange="" />
  const input = document.createElement('input');
  input.setAttribute('type', 'file');
  // 업데이트 : 여러개 선택 가능
  input.setAttribute('multiple', 'true');
  input.setAttribute('accept', 'image/*');
  input.click();
  input.onchange = async () => {
    // 업데이트 : 최소 1개 이상 파일 선택
    const files = input.files;
    if (!files || files.length === 0) return;

    // 실제 React Quill 내용 창에 출력
    const quill = quilRef.current?.getEditor();
    if (!quill) return;

    // 어디에다가 이미지를 출력할 것인가 위치를 파악
    const range = quill.getSelection();
    // 특정 범위가 없다면 끝에 배치한다.
    let insertIndex = range ? range.index : quill.getLength();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // 파일 크기를 보통 5MB 바이트로 제한
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name}은 이미지 파일 크기는 5MB 이하여야 합니다.`);
        continue; // 이 파일은 건너띄어서 계속 실행
      }
      // 임시 주소 생성
      const tempUrl = createTempImageUrl(file);
      // 절대 중복되지 않는 임시 ID 를 생성하자.
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

      try {
        // 직접 html 태그를 만들어서 삽입해줌.
        // 나중에 고민 좀 해보자.
        // <p> <img src="" /> </p>
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

        // 다음 이미지를 위해서 입력 위치만 업데이트
        insertIndex++;
      } catch (error) {
        console.log('이미지 삽입 중 오류 : ', error);
        // 오류 이더라도 다시 html 을 추가해 봄.
        try {
          const imgHtml = `<img src=${tempUrl} data-temp-id=${tempId} style="max-width:100%; height:auto; maring: 10px 0;"/>`;
          quill.clipboard.dangerouslyPasteHTML(insertIndex, imgHtml);
          insertIndex++;
        } catch (err) {
          console.log('이미지 삽입 정말 실패 : ', err);
        }
      }
    }

    // 모든 이미지가 배치가 되면 강제렌더링
    quill.update();
    // 마우스 커서 위치 조절
    quill.setSelection(insertIndex);
  };
}, [createTempImageUrl]);
```
