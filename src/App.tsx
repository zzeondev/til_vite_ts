import { Provider, useDispatch, useSelector } from 'react-redux';
import { store, type RootState } from './redux/store';
import { onIncrease } from './redux/slices/numSlice';
import { addLike, removeLike } from './redux/slices/likeSlice';

export default function App() {
  // state 값 읽기
  const num = useSelector((state: RootState) => state.num.num);

  // state 값 변경
  const dispatch = useDispatch();

  return (
    <div style={container_root}>
      <div style={container_title}>Root : {num} </div>

      <div style={container}>
        <div>
          <Left_1 />
        </div>
        <div>
          <Right_1 />
        </div>
      </div>
    </div>
  );
}
// 각각이 컴포넌트로 되어 있음.
function Left_1() {
  return (
    <div style={container_div}>
      <h1>Left_1 : </h1>
      <div>
        <Left_2 />
      </div>
    </div>
  );
}

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

function Left_3() {
  return (
    <div style={container_div}>
      <h1>Left_3 : </h1>
      <div>
        <Left_4 />
      </div>
    </div>
  );
}

function Left_4() {
  // state 값 읽기
  const num = useSelector((state: RootState) => state.num.num);

  return (
    <div style={container_div}>
      <h1>Left_4 : {num} </h1>
    </div>
  );
}

// 각각이 컴포넌트로 되어 있음.
function Right_1() {
  return (
    <div style={container_div_2}>
      <div>
        <Right_2 />
      </div>
    </div>
  );
}

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

function Right_3() {
  return (
    <div style={container_div_2}>
      <div>
        <Right_4 />
      </div>
    </div>
  );
}

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
