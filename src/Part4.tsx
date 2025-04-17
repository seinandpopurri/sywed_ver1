import { useState } from "react";

const people = [
  {
    id: "yang",
    name: "양경희",
    relation: "이은지, 이영건의 엄마",
    phone: "010-1111-1111",
    account: "1111-0000-0000",
  },
  {
    id: "lee",
    name: "이정길",
    relation: "이은지, 이영건의 아빠",
    phone: "010-2222-2222",
    account: "2222-0000-0000",
  },
  {
    id: "kim",
    name: "김시은",
    relation: "홍세인, 홍세영의 엄마",
    phone: "010-9209-4919",
    account: "3333-0000-0000",
  },
  {
    id: "hongdad",
    name: "홍성면",
    relation: "홍세인, 홍세영의 아빠",
    phone: "010-9749-0030",
    account: "4444-0000-0000",
  },
  {
    id: "eunji",
    name: "이은지",
    relation: "양경희, 이정길의 딸",
    phone: "010-5555-5555",
    account: "5555-0000-0000",
  },
  {
    id: "yeonggun",
    name: "이영건",
    relation: "양경희, 이정길의 아들",
    phone: "010-5104-9962",
    account: "0000-0000-0000",
  },
  {
    id: "sein",
    name: "홍세인",
    relation: "김시은, 홍성면의 딸",
    phone: "010-6470-8811",
    account: "0000-0000-0000",
  },
  {
    id: "seyeong",
    name: "홍세영",
    relation: "김시은, 홍성면의 딸",
    phone: "010-7217-0035",
    account: "0000-0000-0000",
  },
  {
    id: "millet",
    name: "밀레",
    relation: "우리와 함께 사는 귀여운 강아지",
    phone: "",
    account: "",
  },
];

interface Part4Props {
  paddingTop?: number;
}

export default function Part4({ paddingTop = 0 }: Part4Props) {
  const [selected, setSelected] = useState<any>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("계좌번호가 복사되었습니다");
  };

  return (
    <div 
      className="w-full h-full bg-green-200 flex flex-col items-center justify-center p-6 space-y-6 relative text-sm"
      style={{ paddingTop: paddingTop ? `${paddingTop}px` : undefined }}
    >
      {/* 부모 세대 */}
      <div className="flex flex-col items-center space-y-2">
        <div className="flex justify-center gap-4 items-center">
          <button
            onClick={() => setSelected(people[0])}
            className="bg-white rounded-xl px-3 py-1 shadow hover:bg-green-100 transition whitespace-nowrap"
          >
            {people[0].name}
          </button>
          <div className="w-12 h-[2px] bg-gray-500" />
          <button
            onClick={() => setSelected(people[1])}
            className="bg-white rounded-xl px-3 py-1 shadow hover:bg-green-100 transition whitespace-nowrap"
          >
            {people[1].name}
          </button>

          <div className="w-12" />

          <button
            onClick={() => setSelected(people[2])}
            className="bg-white rounded-xl px-3 py-1 shadow hover:bg-green-100 transition whitespace-nowrap"
          >
            {people[2].name}
          </button>
          <div className="w-12 h-[2px] bg-gray-500" />
          <button
            onClick={() => setSelected(people[3])}
            className="bg-white rounded-xl px-3 py-1 shadow hover:bg-green-100 transition whitespace-nowrap"
          >
            {people[3].name}
          </button>
        </div>

        {/* 세로 연결선 */}
        <div className="flex justify-center w-full">
          <div className="w-[40%] flex justify-around">
            <div className="w-[2px] h-6 bg-gray-500"></div>
            <div className="w-[2px] h-6 bg-gray-500"></div>
          </div>
        </div>
      </div>

      {/* 자녀 세대 */}
      <div className="flex justify-center gap-6 items-center relative">
        <div className="flex flex-col items-center">
          <div className="w-[2px] h-6 bg-gray-400"></div>
          <button
            onClick={() => setSelected(people[4])}
            className="bg-white rounded-xl px-3 py-1 shadow hover:bg-green-100 transition whitespace-nowrap"
          >
            {people[4].name}
          </button>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-[2px] h-6 bg-gray-400"></div>
          <button
            onClick={() => setSelected(people[5])}
            className="bg-white rounded-xl px-3 py-1 shadow hover:bg-green-100 transition whitespace-nowrap"
          >
            {people[5].name}
          </button>
        </div>
        <div className="w-6" />
        <div className="flex flex-col items-center">
          <div className="w-[2px] h-6 bg-gray-400"></div>
          <button
            onClick={() => setSelected(people[6])}
            className="bg-white rounded-xl px-3 py-1 shadow hover:bg-green-100 transition whitespace-nowrap"
          >
            {people[6].name}
          </button>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-[2px] h-6 bg-gray-400"></div>
          <button
            onClick={() => setSelected(people[7])}
            className="bg-white rounded-xl px-3 py-1 shadow hover:bg-green-100 transition whitespace-nowrap"
          >
            {people[7].name}
          </button>
        </div>
      </div>

      {/* 밀레 */}
      <div className="mt-6">
        <button
          onClick={() => setSelected(people[8])}
          className="bg-white rounded-full px-5 py-1 shadow hover:bg-green-100 transition whitespace-nowrap"
        >
          {people[8].name}
        </button>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-xl p-6 shadow-lg text-center space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-xl font-semibold">{selected.name}</p>
            <p>{selected.relation}</p>
            {selected.phone && (
              <button
                onClick={() => (window.location.href = `tel:${selected.phone}`)}
                className="bg-green-300 rounded px-4 py-1"
              >
                📞 {selected.phone}
              </button>
            )}
            {selected.account && (
              <button
                onClick={() => handleCopy(selected.account)}
                className="bg-green-300 rounded px-4 py-1"
              >
                📋 {selected.account}
              </button>
            )}
            <button
              className="text-sm text-gray-500 mt-2 underline"
              onClick={() => setSelected(null)}
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
