# 🧩 Block Coding Mission Platform

<div style="text-align:center; margin-bottom:20px;">
  <img src="https://github.com/user-attachments/assets/61e2f233-08cf-4846-93db-807fe71ea3d8" 
       alt="Block Coding Mission Platform" 
       style="max-width:800px; width:100%; height:auto; border-radius:8px;" />
</div>

**MVC + Command Pattern 기반 교육형 블록 코딩 미션 플랫폼**

Scratch 스타일의 블록 코딩 방식으로  
**계산기 · 자동차 경주 · 로또** 세 가지 미션의 도메인 로직을 직접 조립하고 실행할 수 있는 교육/경험형 플랫폼입니다.

View(블록 UI)와 Model(도메인 규칙)을 완전히 분리하기 위해  
**MVC 아키텍처 + Command Pattern**을 적용하여 높은 확장성과 테스트 용이성을 확보했습니다.

<div style="text-align:center; margin: 20px 0;">
  <div style="display:inline-block; padding:12px 24px; border:2px solid #4F46E5; border-radius:8px; background-color:#F3F4F6;">
    <a href="https://wooteco-blockplay.vercel.app/" target="_blank" style="text-decoration:none; font-weight:bold; color:#4F46E5; font-size:16px;">
      🔗 프로젝트 바로가기
    </a>
  </div>
</div>

---

## 🏛️ Architecture Overview

### 🔧 전체 흐름 (MVC + Command Pattern)

1. 사용자가 블록 UI에서 **스크립트(명령 리스트)** 를 조립한다.
2. Engine(Dispatcher)이 스크립트를 순회하며 `command + args`를 추출한다.
3. 해당 도메인의 **Controller**로 전달된다.
4. Controller가 **Model**의 비즈니스 로직을 호출한다.
5. Model이 순수 로직 처리 후 결과를 반환한다.

---

## 📁 폴더 구조
```
src/
├── app/ # 전역 상태(Store), 라우팅
│ ├── calculator/
│ ├── racing/
│ ├── lotto/
│ └── Global/ # Controller Dispatcher
│
├── components/
│ ├── blocks/ # 블록 UI, D&D 로직, 메타데이터
│
├── main/ # 미션 플레이그라운드 페이지
```

---

## ✨ 주요 기능

### 1. 블록 시스템 (View)
- Drag & Drop 지원  
  - 팔레트 → 캔버스  
  - 캔버스 내 블록 재배치  
- 동적 입력 블록  
  - 숫자 입력  
  - 이름 입력  
  - 구매 개수 입력  
  - **선수 목록 기반 Select 자동 생성**
- 스크립트 실행 버튼 → Controller Dispatcher 호출

---

## 🎮 미션 시스템 (Core MVC)

### A. 계산기 미션 (Calculator)
<div style="text-align:center; margin:15px 0;">
  <img src="https://github.com/user-attachments/assets/bb6c360d-99de-4a43-9ffe-c96946a9d62a" 
       alt="Calculator Mission" 
       style="max-width:600px; width:100%; height:auto; border-radius:8px;" />
</div>

- **중위 표기법 강제**: 숫자 → 연산자 → 숫자
- 지원 연산: `+`, `-`, `*`, `/`
- **오류 검증**
  - 연속된 연산자 불가  
  - 초기값 없이 연산자 시작 불가  
  - 잘못된 블록 순서 시 명확한 오류 메시지 제공

---

### B. 자동차 경주 미션 (Racing)
<div style="text-align:center; margin:15px 0;">
  <img src="https://github.com/user-attachments/assets/8efffdba-0171-4097-aa17-9b6376d3d207" 
       alt="Racing Mission" 
       style="max-width:600px; width:100%; height:auto; border-radius:8px;" />
</div>

#### ✔ 선수 등록
- 이름 길이 1~5자  
- 자동차 타입: 소나타 / 그랜저 / 제네시스  

#### ✔ 이벤트·스킬 블록
- 부스트  
- 엔진 고장  
- 드리프트  
- 점프  
- 바람막이(드래프팅) → 선택 시 **등록된 선수 목록 자동 반영**

#### ✔ 경주 진행
- “경주 1턴 실행” 블록 반복 실행  
- 최종 우승자 판정

---

### C. 로또 미션 (Lotto)
<div style="text-align:center; margin:15px 0;">
  <img src="https://github.com/user-attachments/assets/60f8949b-b6fd-43e3-82d0-b4889c0b6686" 
       alt="Lotto Mission" 
       style="max-width:600px; width:100%; height:auto; border-radius:8px;" />
</div>

- 구매 개수 제한: **최대 10,000개**
- 입력 블록
  - 구매 개수  
  - 당첨 번호  
  - 보너스 번호  
- 출력
  - 통계  
  - 수익률  
- 실제 로또 규칙 기반의 정확한 Model 구현

---

## 🚀 실행 방법

# 1. 프로젝트 클론
git clone [repository-url]
cd block-coding-mission-platform

# 2. 의존성 설치
npm install

# 3. 개발 서버 실행
npm run dev

📌 기술 스택  
React + TypeScript  
Tailwind CSS  
MVC Architecture  
Command Pattern  
Drag & Drop 기반 블록 시스템  


