import { Stage, Interest, Option } from './types';

export const STAGES: Stage[] = [
  { key: "goal", title: "목표", wheel: "목표", note: "목표가 뚜렷해야 AI 답변도 흔들리지 않습니다." },
  { key: "role", title: "역할", wheel: "역할", note: "역할을 정하면 답변의 말투와 관점이 선명해집니다." },
  { key: "context", title: "맥락", wheel: "맥락", note: "맥락을 넣으면 너무 거창한 답변을 줄일 수 있습니다." },
  { key: "condition", title: "조건", wheel: "조건", note: "조건은 AI에게 거는 안전벨트입니다." },
  { key: "format", title: "형식", wheel: "형식", note: "형식을 정하면 발표 화면에 옮기기 쉬운 답이 나옵니다." },
  { key: "verify", title: "검증", wheel: "검증", note: "AI 답변은 끝이 아니라 검토할 초안입니다." }
];

export const INTERESTS: Interest[] = [
  { icon: "⚽", interest: "축구와 영상 편집", problem: "우리 팀 축구 하이라이트 영상을 유튜브 쇼츠로 멋지게 만들고 싶다" },
  { icon: "🎨", interest: "웹툰 감상과 일러스트", problem: "나만의 웹툰 주인공 캐릭터를 디자인하고 스토리를 짜고 싶다" },
  { icon: "🎵", interest: "K-POP 댄스와 SNS 숏폼", problem: "친구들과 출 댄스 챌린지 기획과 조회수가 잘 나오는 썸네일을 만들고 싶다" },
  { icon: "🎮", interest: "모바일 게임과 코딩", problem: "친구들과 쉬는 시간에 할 수 있는 간단한 미니 게임 아이디어를 기획하고 싶다" },
  { icon: "🐶", interest: "반려동물과 펫튜버", problem: "우리집 강아지/고양이의 귀여운 일상 브이로그 영상을 기획하고 싶다" }
];

export const getStageOptions = (stageKey: string, interest: string, problem: string): Option[] => {
  const optionsByKey: Record<string, Option[]> = {
    goal: [
      { label: "진로\n프로젝트", value: `"${interest}"를 AI 진로 프로젝트로 발전시키기` },
      { label: "문제\n해결", value: `"${problem}"를 해결할 아이디어 3개 만들기` },
      { label: "3분\n발표", value: `"${interest}"와 AI를 연결한 3분 발표 아이디어 만들기` },
      { label: "작은\n결과물", value: `"${interest}"로 일주일 안에 만들 수 있는 작은 결과물 기획하기` },
      { label: "직업\n연결", value: `"${interest}"와 연결되는 미래 직업·업무 질문 만들기` },
      { label: "AI\n활용", value: `"${problem}"를 해결할 때 AI에게 맡길 일 찾기` }
    ],
    role: [
      { label: "진로\n상담쌤", value: `"${interest}"를 잘 아는 진로 상담 선생님처럼 답하기` },
      { label: "AI\n코치", value: `"${problem}" 해결을 돕는 AI 프로젝트 코치처럼 답하기` },
      { label: "발표\n멘토", value: "중학생 발표 멘토처럼 쉽고 설득력 있게 답하기" },
      { label: "콘텐츠\n기획자", value: `"${interest}" 콘텐츠 기획자처럼 아이디어를 넓혀 답하기` },
      { label: "팩트\n체커", value: "근거와 확인이 필요한 부분을 따지는 팩트체크 담당자처럼 답하기" },
      { label: "친구\n설명", value: "친구에게 말하듯 짧고 쉬운 문장으로 답하기" }
    ],
    context: [
      { label: "중학생\n수준", value: "중학생이 바로 이해하고 실행할 수 있게" },
      { label: "학교\n안에서", value: `"${problem}"를 학교 안에서 시도할 수 있는 활동으로` },
      { label: "돈 거의\n안 쓰기", value: "돈을 거의 쓰지 않고 시작할 수 있는 방법으로" },
      { label: "친구와\n함께", value: "친구 2명과 함께 역할을 나누어 할 수 있게" },
      { label: "일주일\n실행", value: "일주일 안에 첫 결과가 나오게" },
      { label: "진로\n발표", value: "진로 발표 자료에 바로 옮길 수 있게" }
    ],
    condition: [
      { label: "AI/나\n구분", value: "AI가 할 일과 내가 직접 판단하고 책임질 일을 구분하기" },
      { label: "개인정보\n금지", value: "이름·얼굴·학교·연락처 같은 개인정보를 넣지 않는 방식으로" },
      { label: "근거\n표시", value: `"${problem}" 관련 근거가 필요한 내용은 따로 표시하기` },
      { label: "쉽게\n설명", value: "어려운 전문용어는 중학생 눈높이로 쉽게 풀기" },
      { label: "실패\n지점", value: "실패할 수 있는 부분과 줄이는 방법도 함께 적기" },
      { label: "저작권\n주의", value: `"${interest}" 결과물을 만들 때 저작권과 출처 주의점을 포함하기` }
    ],
    format: [
      { label: "4칸\n표", value: "좋아하는 것·해결할 문제·AI가 도울 일·내가 판단할 일 4칸 표" },
      { label: "3단계\n계획", value: "오늘 할 일·이번 주 할 일·확인할 일 3단계 계획" },
      { label: "발표\n제목", value: `"${interest}" 발표 제목 3개와 발표 흐름` },
      { label: "체크\n리스트", value: `"${problem}" 해결 체크리스트 7개` },
      { label: "문제→AI\n→나", value: "문제 → AI → 나 순서의 짧은 도식" },
      { label: "30초\n대본", value: "강당에서 말할 수 있는 30초 발표 대본" }
    ],
    verify: [
      { label: "사실 2개\n확인", value: `"${interest}" 관련 확인해야 할 사실 2가지를 마지막에 적기` },
      { label: "틀릴 수\n있는 점", value: "AI 답변이 틀릴 수 있는 부분과 이유를 적기" },
      { label: "추가\n질문", value: `"${problem}"를 더 구체화할 추가 질문 3개 만들기` },
      { label: "출처\n필요", value: "출처가 필요한 문장을 따로 표시하기" },
      { label: "내 판단", value: "AI가 대신 결정하면 안 되고 내가 판단해야 할 결정을 표시하기" },
      { label: "과장\n줄임", value: "과장된 표현을 줄이고 현실적으로 다시 쓰기" }
    ]
  };
  return optionsByKey[stageKey] || [];
};
