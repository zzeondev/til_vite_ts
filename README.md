# Redux

- https://redux-toolkit.js.org/
- https://ko.redux.js.org
- Context API 와 같은 역할을 함
- 여러 컴포넌트들이 값(state)를 공유해서 활용한다.
- `Redux` 와 `Redux Toolkit` 이 있다.
- Redux 가 복잡해서 나온 최신 버전이 `Redux Toolkit`

## 1. 설치

- https://redux-toolkit.js.org/introduction/getting-started

```bash
npm install @reduxjs/toolkit
```

```bash
npm install react-redux
```

## 2. Props 예제

- `State Props Drilling` 을 개발자가 관리해야 함
- `Drilling` 은 `3 단계 이상 넘어가면 관리`가 어려움
- App.tsx 대상 코드 진행 중

```tsx
import { useState } from 'react';
// css 객체
const container_root: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  border: '5px solid black',
  padding: 10,
  gap: 10,
};
const container: React.CSSProperties = {
  border: '5px solid blue',
  display: 'flex',
  gap: '10px',
};
const container_title: React.CSSProperties = {
  fontSize: '40px',
  color: 'blue',
  border: '5px solid aqua',
};
const container_div: React.CSSProperties = {
  border: '5px solid skyblue',
  margin: 10,
};
const container_div_2: React.CSSProperties = {
  border: '5px solid yellowgreen',
  margin: 10,
};
const btn: React.CSSProperties = {
  border: '5px solid #000',
  padding: 10,
  margin: 20,
};
export default function App() {
  // 만약 props 로 useState 값을 넘겨준다면?
  const [num, setNum] = useState(0);
  const onIncrease = () => {
    setNum(num + 1);
  };

  return (
    <div style={container_root}>
      <div style={container_title}>Root : {num} </div>

      <div style={container}>
        <div>
          <Left_1 num={num} />
        </div>
        <div>
          <Right_1 action={onIncrease} />
        </div>
      </div>
    </div>
  );
}
// 각각이 컴포넌트로 되어 있음.
function Left_1(props: { num: number }) {
  return (
    <div style={container_div}>
      <h1>Left_1 : {props.num}</h1>
      <div>
        <Left_2 num={props.num} />
      </div>
    </div>
  );
}

function Left_2(props: { num: number }) {
  return (
    <div style={container_div}>
      <h1>Left_2 : {props.num}</h1>
      <div>
        <Left_3 num={props.num} />
      </div>
    </div>
  );
}

function Left_3(props: { num: number }) {
  return (
    <div style={container_div}>
      <h1>Left_3 : {props.num}</h1>
      <div>
        <Left_4 num={props.num} />
      </div>
    </div>
  );
}

function Left_4(props: { num: number }) {
  return (
    <div style={container_div}>
      <h1>Left_4 : {props.num}</h1>
    </div>
  );
}

// 각각이 컴포넌트로 되어 있음.
function Right_1(props: { action: () => void }) {
  return (
    <div style={container_div_2}>
      <div>
        <Right_2 action={props.action} />
      </div>
    </div>
  );
}

function Right_2(props: { action: () => void }) {
  return (
    <div style={container_div_2}>
      <div>
        <Right_3 action={props.action} />
      </div>
    </div>
  );
}

function Right_3(props: { action: () => void }) {
  return (
    <div style={container_div_2}>
      <div>
        <Right_4 action={props.action} />
      </div>
    </div>
  );
}

function Right_4(props: { action: () => void }) {
  return (
    <div style={container_div_2}>
      <div>
        <button onClick={() => props.action()} style={btn}>
          값의 증가 버튼
        </button>
      </div>
    </div>
  );
}
```

## 3. Redux 예제로 변경

### 3.1. 기본적 흐름

```tsx
import { createStore } from '@reduxjs/toolkit';
import { useState } from 'react';
import {} from 'react-redux';

// 3. reducer 함수 생성
function reducer(state, action) {
  if (action.type === '') {
    return { ...state, num: state.value + 1 };
  }
  return state;
}

// 2. 초기값 생성
const initialState = {
  num: 0,
};

// 1. store 생성
const store = createStore(reducer, initialState);

export default function App() {
  // 만약 props 로 useState 값을 넘겨준다면?
  const [num, setNum] = useState(0);
  const onIncrease = () => {
    setNum(num + 1);
  };

  return (
    <div style={container_root}>
      <div style={container_title}>Root : {num} </div>

      <div style={container}>
        <div>
          <Left_1 num={num} />
        </div>
        <div>
          <Right_1 action={onIncrease} />
        </div>
      </div>
    </div>
  );
}
// 각각이 컴포넌트로 되어 있음.
function Left_1(props: { num: number }) {
  return (
    <div style={container_div}>
      <h1>Left_1 : {props.num}</h1>
      <div>
        <Left_2 num={props.num} />
      </div>
    </div>
  );
}

function Left_2(props: { num: number }) {
  return (
    <div style={container_div}>
      <h1>Left_2 : {props.num}</h1>
      <div>
        <Left_3 num={props.num} />
      </div>
    </div>
  );
}

function Left_3(props: { num: number }) {
  return (
    <div style={container_div}>
      <h1>Left_3 : {props.num}</h1>
      <div>
        <Left_4 num={props.num} />
      </div>
    </div>
  );
}

function Left_4(props: { num: number }) {
  return (
    <div style={container_div}>
      <h1>Left_4 : {props.num}</h1>
    </div>
  );
}

// 각각이 컴포넌트로 되어 있음.
function Right_1(props: { action: () => void }) {
  return (
    <div style={container_div_2}>
      <div>
        <Right_2 action={props.action} />
      </div>
    </div>
  );
}

function Right_2(props: { action: () => void }) {
  return (
    <div style={container_div_2}>
      <div>
        <Right_3 action={props.action} />
      </div>
    </div>
  );
}

function Right_3(props: { action: () => void }) {
  return (
    <div style={container_div_2}>
      <div>
        <Right_4 action={props.action} />
      </div>
    </div>
  );
}

function Right_4(props: { action: () => void }) {
  return (
    <div style={container_div_2}>
      <div>
        <button onClick={() => props.action()} style={btn}>
          값의 증가 버튼
        </button>
      </div>
    </div>
  );
}

// css 객체
const container_root: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  border: '5px solid black',
  padding: 10,
  gap: 10,
};
const container: React.CSSProperties = {
  border: '5px solid blue',
  display: 'flex',
  gap: '10px',
};
const container_title: React.CSSProperties = {
  fontSize: '40px',
  color: 'blue',
  border: '5px solid aqua',
};
const container_div: React.CSSProperties = {
  border: '5px solid skyblue',
  margin: 10,
};
const container_div_2: React.CSSProperties = {
  border: '5px solid yellowgreen',
  margin: 10,
};
const btn: React.CSSProperties = {
  border: '5px solid #000',
  padding: 10,
  margin: 20,
};
```

### 3.2. 기본 구성 진행

- 단계 1 : `/src/redux` 폴더 생성
- 단계 1-1 : `/src/redux/store.ts` 파일 생성

```ts
import { configureStore } from '@reduxjs/toolkit';

// Redux 는 Store 를 조각조각 내서 사용함
// Store 를 조각내서 활용하는 것을 Slice 라고 함
import numReducer from './slices/numSlice';

export const store = configureStore({
  reducer: { num: numReducer },
});

// 값을 읽을 때 타입
export type RootState = ReturnType<typeof store.getState>;
// 값을 갱신할 때 타입
export type AppDispatch = typeof store.dispatch;
```

- 단계 2 : `/src/redux/slices` 폴더 생성
- 단계 2-1 : `/src/redux/slices/numSlice.ts` 파일 생성

```ts
import { createSlice } from '@reduxjs/toolkit';

// Slice 의 초기값
const initialState = {
  num: 0,
};

// Slice 구성
const numSlice = createSlice({
  name: 'numSlice',
  initialState,
  reducers: {
    onIncrease: state => {
      state.num += 1;
    },
  },
});

// 액션 내보내기
export const { onIncrease } = numSlice.actions;

// 보통 Slice 는 default 로 내보냄
export default numSlice.reducer;
```

### 3.3. Redux Provider 적용

- Provider 공급 (`/main.tsx`)

```tsx
import { createRoot } from 'react-dom/client';

import './index.css';
import App from './App';
import { Provider } from 'react-redux';
import { store } from './redux/store';

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <App />
  </Provider>,
);
```

- store 의 `slice 의 state` 와 `slice 의 action` 활용해보기

```tsx
function Left_4() {
  // state 값 읽기
  const num = useSelector((state: RootState) => state.num.num);

  return (
    <div style={container_div}>
      <h1>Left_4 : {num} </h1>
    </div>
  );
}
```

```tsx
function Right_4() {
  const dispatch = useDispatch();

  return (
    <div style={container_div_2}>
      <div>
        <button onClick={() => dispatch(onIncrease())} style={btn}>
          값의 증가 버튼
        </button>
      </div>
    </div>
  );
}
```

## 4. 예제 (좋아요)

### 4.1. Slice 만들기

- `/src/redux/slices/likeSlice.ts` 파일 생성

```ts
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  count: 0,
};

const likeSlice = createSlice({
  name: 'likeSlice',
  initialState,
  reducers: {
    addLike: state => {
      state.count += 1;
    },
    removeLike: state => {
      state.count -= 1;
    },
  },
});

export const { addLike, removeLike } = likeSlice.actions;
export default likeSlice.reducer;
```

### 4.2. Store 등록하기

- `/redux/store.ts` 추가

```ts
import { configureStore } from '@reduxjs/toolkit';

// Redux 는 Store 를 조각조각 내서 사용함
// Store 를 조각내서 활용하는 것을 Slice 라고 함
import numReducer from './slices/numSlice';
// like Slice 추가
import likeReducer from './slices/likeSlice';

export const store = configureStore({
  reducer: { num: numReducer, liek: likeReducer },
});

// 값을 읽을 때 타입
export type RootState = ReturnType<typeof store.getState>;
// 값을 갱신할 때 타입
export type AppDispatch = typeof store.dispatch;
```

### 4.3. `Provider 작성되었는지 확인`하기

- `/main.ts`

### 4.4. 활용하기

```tsx
function Left_2() {
  const like = useSelector((state: RootState) => state.liek.count);

  return (
    <div style={container_div}>
      <h1>Left_2 좋아요 :{like}</h1>
      <div>
        <Left_3 />
      </div>
    </div>
  );
}
```

```tsx
function Right_2() {
  const dispatch = useDispatch();

  return (
    <div style={container_div_2}>
      <div>
        <Right_3 />
      </div>
      <div>
        <button onClick={() => dispatch(addLike())} style={btn}>
          좋아요
        </button>
        <button onClick={() => dispatch(removeLike())} style={btn}>
          싫어요
        </button>
      </div>
    </div>
  );
}
```
