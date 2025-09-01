# full-calendar

- https://fullcalendar.io/docs/getting-started

## 1. 설치

```bash
npm i @fullcalendar/react @fullcalendar/core \
      @fullcalendar/daygrid @fullcalendar/timegrid \
      @fullcalendar/interaction @fullcalendar/list
```

## 2. 폴더 및 파일 구조

- `/src/pages/Calendar.tsx 파일` 생성
- 최초 월 달력 출력하기

```tsx
import React from 'react';
// full screen 관련
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';

function Calendar() {
  return (
    <div>
      <h2>Full Calendar</h2>
      <div>
        {/* dayGridPlugin : 월 달력 플러그 인, intialView : '월'로 보기 */}
        <FullCalendar plugins={[dayGridPlugin]} initialView="dayGridMonth" height={'auto'} />
      </div>
    </div>
  );
}

export default Calendar;
```

- 일정 출력 및 날짜 선택시 상세 내용 보기

```tsx
import React, { useState } from 'react';
// full screen 관련
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import type { EventClickArg } from '@fullcalendar/core/index.js';

function Calendar() {
  const [events, setEvents] = useState([
    { id: '1', title: '우리반 운동회', start: '2025-09-03', allDay: true },
    { id: '2', title: '과학 실험', start: '2025-09-05T10:00:00', end: '2025-09-05T11:00:00' },
  ]);
  // 일정 상세 보기
  const handleClick = (info: EventClickArg) => {
    console.log(info.event.title);
    alert(`제목 : ${info.event.title} 입니다.`);
  };
  return (
    <div>
      <h2>Full Calendar</h2>
      <div>
        {/* dayGridPlugin : 월 달력 플러그 인, intialView : '월'로 보기 */}
        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          events={events} // 일정 출력
          eventClick={e => handleClick(e)}
          height={'auto'}
        />
      </div>
    </div>
  );
}

export default Calendar;
```

- 일정 추가하기

```tsx
import React, { useState } from 'react';
// full screen 관련
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { DateSelectArg, EventClickArg } from '@fullcalendar/core/index.js';

// full calendar 에 입력시 들어오는 데이터 모양
import type { EventInput } from '@fullcalendar/core/index.js';

function Calendar() {
  const [events, setEvents] = useState<EventInput[]>([
    { id: '1', title: '우리반 운동회', start: '2025-09-03', allDay: true },
    { id: '2', title: '과학 실험', start: '2025-09-05T10:00:00', end: '2025-09-05T11:00:00' },
  ]);
  // 일정 상세 보기
  const handleClick = (info: EventClickArg) => {
    // console.log(info.event.title);
    alert(`제목 : ${info.event.title} 입니다.`);
  };
  // 빈 날짜 선택 처리
  const handleSelect = (e: DateSelectArg) => {
    console.log(e);
    // 내용 입력창을 만들어 봄.
    // 웹브라우저 prompt 로 일단 처리
    const title = prompt('일정의 제목을 입력하세요.') || '';
    const calendarData = e.view.calendar;
    console.log(calendarData);

    if (!title.trim()) {
      alert('제목을 입력하세요.');
      return;
    }

    const newEvent = {
      id: String(Date.now()),
      title,
      start: e.start,
      allDay: e.allDay,
      end: e.end,
    };
    setEvents([...events, { ...newEvent }]);
  };
  return (
    <div>
      <h2>Full Calendar</h2>
      <div>
        {/* dayGridPlugin :  월 달력 플러그 인, initialView :  `월`로 보기 */}
        {/* interactionPlugin :  클릭 및 드래그 관련 플러그인 */}
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events} // 일정 출력
          eventClick={e => handleClick(e)} // 날짜선택 내용 출력
          selectable={true} // 날짜를 선택할 수 있게 활성화
          selectMirror={true}
          select={e => handleSelect(e)}
          height={'auto'}
        />
      </div>
    </div>
  );
}

export default Calendar;
```

- 드래그 해서 일정 수정하기 : `editable={true/false}`

```tsx
import React, { useState } from 'react';
// full screen 관련
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { DateSelectArg, EventClickArg } from '@fullcalendar/core/index.js';

// full calendar 에 입력시 들어오는 데이터 모양
import type { EventInput } from '@fullcalendar/core/index.js';

function Calendar() {
  const [events, setEvents] = useState<EventInput[]>([
    { id: '1', title: '우리반 운동회', start: '2025-09-03', allDay: true },
    { id: '2', title: '과학 실험', start: '2025-09-05T10:00:00', end: '2025-09-05T11:00:00' },
  ]);
  // 일정 상세 보기
  const handleClick = (info: EventClickArg) => {
    // console.log(info.event.title);
    alert(`제목 : ${info.event.title} 입니다.`);
  };
  // 빈 날짜 선택 처리
  const handleSelect = (e: DateSelectArg) => {
    console.log(e);
    // 내용 입력창을 만들어 봄.
    // 웹브라우저 prompt 로 일단 처리
    const title = prompt('일정의 제목을 입력하세요.') || '';
    const calendarData = e.view.calendar;
    console.log(calendarData);

    if (!title.trim()) {
      alert('제목을 입력하세요.');
      return;
    }

    const newEvent = {
      id: String(Date.now()),
      title,
      start: e.start,
      allDay: e.allDay,
      end: e.end,
    };
    setEvents([...events, { ...newEvent }]);
  };
  return (
    <div>
      <h2>Full Calendar</h2>
      <div>
        {/* dayGridPlugin :  월 달력 플러그 인, initialView :  `월`로 보기 */}
        {/* interactionPlugin :  클릭 및 드래그 관련 플러그인 */}
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events} // 일정 출력
          eventClick={e => handleClick(e)} // 날짜선택 내용 출력
          selectable={true} // 날짜를 선택할 수 있게 활성화
          selectMirror={true}
          select={e => handleSelect(e)}
          editable={true} // 드래그로 수정
          height={'auto'}
        />
      </div>
    </div>
  );
}

export default Calendar;
```

- 주/일 버튼 처리하기 (도구모음)

```tsx
import React, { useState } from 'react';
// full screen 관련
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import type { DateSelectArg, EventClickArg } from '@fullcalendar/core/index.js';

// full calendar 에 입력시 들어오는 데이터 모양
import type { EventInput } from '@fullcalendar/core/index.js';

function Calendar() {
  const [events, setEvents] = useState<EventInput[]>([
    { id: '1', title: '우리반 운동회', start: '2025-09-03', allDay: true },
    { id: '2', title: '과학 실험', start: '2025-09-05T10:00:00', end: '2025-09-05T11:00:00' },
  ]);
  // 일정 상세 보기
  const handleClick = (info: EventClickArg) => {
    // console.log(info.event.title);
    alert(`제목 : ${info.event.title} 입니다.`);
  };
  // 빈 날짜 선택 처리
  const handleSelect = (e: DateSelectArg) => {
    console.log(e);
    // 내용 입력창을 만들어 봄.
    // 웹브라우저 prompt 로 일단 처리
    const title = prompt('일정의 제목을 입력하세요.') || '';
    const calendarData = e.view.calendar;
    console.log(calendarData);

    if (!title.trim()) {
      alert('제목을 입력하세요.');
      return;
    }

    const newEvent = {
      id: String(Date.now()),
      title,
      start: e.start,
      allDay: e.allDay,
      end: e.end,
    };
    setEvents([...events, { ...newEvent }]);
  };
  // 헤더 도구 상자
  const headerToolbar = {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
  };

  return (
    <div>
      <h2>Full Calendar</h2>
      <div>
        {/* dayGridPlugin :  월 달력 플러그 인, initialView :  `월`로 보기 */}
        {/* interactionPlugin :  클릭 및 드래그 관련 플러그인 */}
        {/* timeGridPlugin :  시간순 출력 관련 플러그인 */}
        {/* listPlugin :  목록 출력 관련 플러그인 */}
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin, listPlugin]}
          initialView="dayGridMonth"
          events={events} // 일정 출력
          headerToolbar={headerToolbar}
          eventClick={e => handleClick(e)} // 날짜선택 내용 출력
          selectable={true} // 날짜를 선택할 수 있게 활성화
          selectMirror={true}
          select={e => handleSelect(e)}
          editable={true} // 드래그로 수정
          height={'auto'}
        />
      </div>
    </div>
  );
}

export default Calendar;
```

- 한국어/한국시간 처리하기

```tsx
import React, { useState } from 'react';
// full screen 관련
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import type { DateSelectArg, EventClickArg } from '@fullcalendar/core/index.js';
// 한국어
import koLocale from '@fullcalendar/core/locales/ko';
// full calendar 에 입력시 들어오는 데이터 모양
import type { EventInput } from '@fullcalendar/core/index.js';

function Calendar() {
  const [events, setEvents] = useState<EventInput[]>([
    { id: '1', title: '우리반 운동회', start: '2025-09-03', allDay: true },
    { id: '2', title: '과학 실험', start: '2025-09-05T10:00:00', end: '2025-09-05T11:00:00' },
  ]);
  // 일정 상세 보기
  const handleClick = (info: EventClickArg) => {
    // console.log(info.event.title);
    alert(`제목 : ${info.event.title} 입니다.`);
  };
  // 빈 날짜 선택 처리
  const handleSelect = (e: DateSelectArg) => {
    console.log(e);
    // 내용 입력창을 만들어 봄.
    // 웹브라우저 prompt 로 일단 처리
    const title = prompt('일정의 제목을 입력하세요.') || '';
    const calendarData = e.view.calendar;
    console.log(calendarData);

    if (!title.trim()) {
      alert('제목을 입력하세요.');
      return;
    }

    const newEvent = {
      id: String(Date.now()),
      title,
      start: e.start,
      allDay: e.allDay,
      end: e.end,
    };
    setEvents([...events, { ...newEvent }]);
  };
  // 헤더 도구 상자
  const headerToolbar = {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
  };

  return (
    <div>
      <h2>Full Calendar</h2>
      <div>
        {/* dayGridPlugin :  월 달력 플러그 인, initialView :  `월`로 보기 */}
        {/* interactionPlugin :  클릭 및 드래그 관련 플러그인 */}
        {/* timeGridPlugin :  시간순 출력 관련 플러그인 */}
        {/* listPlugin :  목록 출력 관련 플러그인 */}
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin, listPlugin]}
          initialView="dayGridMonth"
          events={events} // 일정 출력
          headerToolbar={headerToolbar}
          locale={koLocale} // 한국어
          timeZone="Asia/Seoul" // 한국 시간
          slotMinTime="06:00:00" // 아침 6시부터
          slotMaxTime="22:00:00" // 밤 10시까지
          nowIndicator={true} // 현재 시간 빨간 선
          eventClick={e => handleClick(e)} // 날짜선택 내용 출력
          selectable={true} // 날짜를 선택할 수 있게 활성화
          selectMirror={true}
          select={e => handleSelect(e)}
          editable={true} // 드래그로 수정
          height={'auto'}
        />
      </div>
    </div>
  );
}

export default Calendar;
```

- 하루 최대 출력 가능 개수 : (더 많으면 more 출력)
- dayMaxEvents={3} // 최대 미리보기 개수

```tsx
import React, { useState } from 'react';
// full screen 관련
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import type { DateSelectArg, EventClickArg } from '@fullcalendar/core/index.js';
// 한국어
import koLocale from '@fullcalendar/core/locales/ko';
// full calendar 에 입력시 들어오는 데이터 모양
import type { EventInput } from '@fullcalendar/core/index.js';

function Calendar() {
  const [events, setEvents] = useState<EventInput[]>([
    { id: '1', title: '우리반 운동회', start: '2025-09-03', allDay: true },
    { id: '2', title: '우리반 운동회', start: '2025-09-03', allDay: true },
    { id: '3', title: '우리반 운동회', start: '2025-09-03', allDay: true },
    { id: '4', title: '우리반 운동회', start: '2025-09-03', allDay: true },
    { id: '5', title: '우리반 운동회', start: '2025-09-03', allDay: true },
    { id: '6', title: '우리반 운동회', start: '2025-09-03', allDay: true },
    { id: '7', title: '과학 실험', start: '2025-09-05T10:00:00', end: '2025-09-05T11:00:00' },
  ]);
  // 일정 상세 보기
  const handleClick = (info: EventClickArg) => {
    // console.log(info.event.title);
    alert(`제목 : ${info.event.title} 입니다.`);
  };
  // 빈 날짜 선택 처리
  const handleSelect = (e: DateSelectArg) => {
    console.log(e);
    // 내용 입력창을 만들어 봄.
    // 웹브라우저 prompt 로 일단 처리
    const title = prompt('일정의 제목을 입력하세요.') || '';
    const calendarData = e.view.calendar;
    console.log(calendarData);

    if (!title.trim()) {
      alert('제목을 입력하세요.');
      return;
    }

    const newEvent = {
      id: String(Date.now()),
      title,
      start: e.start,
      allDay: e.allDay,
      end: e.end,
    };
    setEvents([...events, { ...newEvent }]);
  };
  // 헤더 도구 상자
  const headerToolbar = {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
  };

  return (
    <div>
      <h2>Full Calendar</h2>
      <div>
        {/* dayGridPlugin :  월 달력 플러그 인, initialView :  `월`로 보기 */}
        {/* interactionPlugin :  클릭 및 드래그 관련 플러그인 */}
        {/* timeGridPlugin :  시간순 출력 관련 플러그인 */}
        {/* listPlugin :  목록 출력 관련 플러그인 */}
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin, listPlugin]}
          initialView="dayGridMonth"
          events={events} // 일정 출력
          headerToolbar={headerToolbar}
          locale={koLocale} // 한국어
          timeZone="Asia/Seoul" // 한국 시간
          slotMinTime="06:00:00" // 아침 6시부터
          slotMaxTime="22:00:00" // 밤 10시까지
          nowIndicator={true} // 현재 시간 빨간 선
          dayMaxEvents={3} // 최대 미리보기 개수
          eventClick={e => handleClick(e)} // 날짜선택 내용 출력
          selectable={true} // 날짜를 선택할 수 있게 활성화
          selectMirror={true}
          select={e => handleSelect(e)}
          editable={true} // 드래그로 수정
          height={'auto'}
        />
      </div>
    </div>
  );
}

export default Calendar;
```

- 일정 삭제하기 : (useState 업데이트)

```tsx
const arr = events.filter(item => item.title !== info.event.title);
setEvents(arr);
```

- 일정별로 색상을 다르게 표현하기

```tsx
const [events, setEvents] = useState<EventInput[]>([
  {
    id: '1',
    title: '우리반 운동회1',
    start: '2025-09-03',
    allDay: true,
    color: '#ff7f50', // 배경 및 글자 기본 색상
    textColor: '#f00', // 글자 색상
    borderColor: '#cc3300', // 테두리 색상
  },
  { id: '2', title: '우리반 운동회2', start: '2025-09-03', allDay: true },
  { id: '7', title: '과학 실험', start: '2025-09-05T10:00:00', end: '2025-09-05T11:00:00' },
]);
```

- 일정 기본 색상 지정하기

```tsx
<FullCalendar
...
  eventColor="#90ee90" // 기본 이벤트 배경 색상
  eventTextColor="#000" // 기본 글자 색상
  eventBorderColor="#008000" // 기본 테두리 색상
/>
```

- 클래스로 일정 색상 통일하기 : 카테고리별로 처리하기

```css
/* CSS */
.sports-event {
  background-color: #f08080 !important;
  color: #fff !important;
}
.science-event {
  background-color: #4682b4 !important;
  color: #fff !important;
}
```

```tsx
const [events, setEvents] = useState<EventInput[]>([
  {
    id: '1',
    title: '우리반 운동회1',
    start: '2025-09-03',
    allDay: true,
    color: '#ff7f50', // 배경 및 글자 기본 색상
    textColor: '#f00', // 글자 색상
    borderColor: '#cc3300', // 테두리 색상
  },
  {
    id: '2',
    title: '우리반 운동회2',
    start: '2025-09-03',
    allDay: true,
    classNames: ['sports-event'],
  },
  {
    id: '7',
    title: '과학 실험',
    start: '2025-09-05T10:00:00',
    end: '2025-09-05T11:00:00',
    classNames: ['science-event'],
  },
]);
```

- 아이콘 및 JSX 출력하기

```tsx
eventContent={e => {
            return (
              <>
                <div style={{ backgroundColor: 'yellowgreen', padding: '20px' }}>
                  <b>✨ {e.event.title}</b>
                </div>
              </>
            );
          }}
```

- 전체 코드

```tsx
import React, { useState } from 'react';
// full screen 관련
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import type { DateSelectArg, EventClickArg } from '@fullcalendar/core/index.js';
// 한국어
import koLocale from '@fullcalendar/core/locales/ko';
// full calendar 에 입력시 들어오는 데이터 모양
import type { EventInput } from '@fullcalendar/core/index.js';

function Calendar() {
  const [events, setEvents] = useState<EventInput[]>([
    {
      id: '1',
      title: '우리반 운동회1',
      start: '2025-09-03',
      allDay: true,
      color: '#ff7f50', // 배경 및 글자 기본 색상
      textColor: '#f00', // 글자 색상
      borderColor: '#cc3300', // 테두리 색상
    },
    {
      id: '2',
      title: '우리반 운동회2',
      start: '2025-09-03',
      allDay: true,
      classNames: ['sports-event'],
    },
    {
      id: '7',
      title: '과학 실험',
      start: '2025-09-05T10:00:00',
      end: '2025-09-05T11:00:00',
      classNames: ['science-event'],
    },
  ]);
  // 일정 상세 보기
  const handleClick = (info: EventClickArg) => {
    // console.log(info.event.title);
    // alert(`제목 : ${info.event.title} 입니다.`);
    // 삭제한다면? (useState 업데이트하면 됨)
    const arr = events.filter(item => item.title !== info.event.title);
    setEvents(arr);
  };
  // 빈 날짜 선택 처리
  const handleSelect = (e: DateSelectArg) => {
    console.log(e);
    // 내용 입력창을 만들어 봄.
    // 웹브라우저 prompt 로 일단 처리
    const title = prompt('일정의 제목을 입력하세요.') || '';
    const calendarData = e.view.calendar;
    console.log(calendarData);

    if (!title.trim()) {
      alert('제목을 입력하세요.');
      return;
    }

    const newEvent = {
      id: String(Date.now()),
      title,
      start: e.start,
      allDay: e.allDay,
      end: e.end,
    };
    setEvents([...events, { ...newEvent }]);
  };
  // 헤더 도구 상자
  const headerToolbar = {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
  };

  return (
    <div>
      <h2>Full Calendar</h2>
      <div>
        {/* dayGridPlugin :  월 달력 플러그 인, initialView :  `월`로 보기 */}
        {/* interactionPlugin :  클릭 및 드래그 관련 플러그인 */}
        {/* timeGridPlugin :  시간순 출력 관련 플러그인 */}
        {/* listPlugin :  목록 출력 관련 플러그인 */}
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin, listPlugin]}
          initialView="dayGridMonth"
          events={events} // 일정 출력
          headerToolbar={headerToolbar}
          locale={koLocale} // 한국어
          timeZone="Asia/Seoul" // 한국 시간
          slotMinTime="06:00:00" // 아침 6시부터
          slotMaxTime="22:00:00" // 밤 10시까지
          nowIndicator={true} // 현재 시간 빨간 선
          dayMaxEvents={3} // 최대 미리보기 개수
          eventClick={e => handleClick(e)} // 날짜선택 내용 출력
          selectable={true} // 날짜를 선택할 수 있게 활성화
          selectMirror={true}
          select={e => handleSelect(e)}
          editable={true} // 드래그로 수정
          height={'auto'}
          eventColor="#90ee90" // 기본 이벤트 배경 색상
          eventTextColor="#000" // 기본 글자 색상
          eventBorderColor="#008000" // 기본 테두리 색상
          // JSX 출력하기
          eventContent={e => {
            return (
              <>
                <div style={{ backgroundColor: 'yellowgreen', padding: '20px' }}>
                  <b>✨ {e.event.title}</b>
                </div>
              </>
            );
          }}
        />
      </div>
    </div>
  );
}

export default Calendar;
```
