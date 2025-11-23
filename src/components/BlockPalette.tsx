import type { Block, GameStage } from "@/Global/types"
import { CAR_TYPES } from "@/Global/types"
import { BlockComponent } from "./Block"

export const BlockPalette: React.FC<{ currentGame: GameStage; }> = ({ currentGame }) => {
    
    // 블록 메타데이터 정의 (features/blocks/blocks/*.ts 역할)
    const allAvailableBlocks: (Omit<Block, 'id'> & { stage: GameStage[] })[] = [
        { domain: 'calculator', command: 'CALC_INPUT', label: '숫자 입력', args: [50], metadata: ['number'], color: '#FFBF00', stage: ['CALCULATOR']},
        { domain: 'calculator', command: 'CALC_ADD', label: '덧셈 (+)', args: [], metadata: [], color: '#FFA500', stage: ['CALCULATOR']}, 
        { domain: 'calculator', command: 'CALC_SUBTRACT', label: '뺄셈 (-)', args: [], metadata: [], color: '#FFA500', stage: ['CALCULATOR']}, 
        { domain: 'calculator', command: 'CALC_MULTIPLY', label: '곱셈 (*)', args: [], metadata: [], color: '#FFA500', stage: ['CALCULATOR']}, 
        { domain: 'calculator', command: 'CALC_DIVIDE', label: '나눗셈 (/)', args: [], metadata: [], color: '#FFA500', stage: ['CALCULATOR']}, 
        
        { domain: 'racing', command: 'RACING_SETUP', label: '경주 설정 (시도 횟수)', args: [5], metadata: ['number'], color: '#FF7F50', stage: ['RACING']},
        { domain: 'racing', command: 'RACING_SELECT_CAR', label: '선수/자동차 등록', args: ['pobi', '소나타'], metadata: ['text', `select:${CAR_TYPES.join(',')}`], color: '#4682B4', stage: ['RACING']},
        { domain: 'racing', command: 'RACING_BOOST', label: '부스트 이벤트', args: ['선수 이름'], metadata: ['select:dynamic'], color: '#FFD700', stage: ['RACING']},
        { domain: 'racing', command: 'RACING_FAILURE', label: '엔진 고장 이벤트', args: ['선수 이름'], metadata: ['select:dynamic'], color: '#B22222', stage: ['RACING']},
        { domain: 'racing', command: 'RACING_DRIFT', label: '스킬 발동: 드리프트', args: ['선수 이름'], metadata: ['select:dynamic'], color: '#1E90FF', stage: ['RACING']},
        { domain: 'racing', command: 'RACING_JUMP', label: '스킬 발동: 점프', args: ['선수 이름'], metadata: ['select:dynamic'], color: '#1E90FF', stage: ['RACING']},
        { domain: 'racing', command: 'RACING_WIND_BLOCK', label: '스킬 발동: 바람막이', args: ['선수 이름'], metadata: ['select:dynamic'], color: '#1E90FF', stage: ['RACING']},
        { domain: 'racing', command: 'RACING_RUN_TURN', label: '경주 1턴 실행', args: [], metadata: [], color: '#FF4500', stage: ['RACING']},

        { domain: 'lotto', command: 'LOTTO_BUY', label: '로또 구매 (개수)', args: [5], metadata: ['number'], color: '#3CB371', stage: ['LOTTO']},
        { domain: 'lotto', command: 'LOTTO_INPUT_WINNING', label: '당첨 번호 입력', args: ['1,8,15,22,29,36'], metadata: ['text'], color: '#2E8B57', stage: ['LOTTO']},
        { domain: 'lotto', command: 'LOTTO_INPUT_BONUS', label: '보너스 번호 입력', args: [45], metadata: ['number'], color: '#2E8B57', stage: ['LOTTO']},
        { domain: 'lotto', command: 'LOTTO_CHECK_RESULT', label: '당첨 통계 및 수익률 확인', args: [], metadata: [], color: '#4CAF50', stage: ['LOTTO']},
    ];

    const availableBlocks = allAvailableBlocks.filter(block => block.stage.includes(currentGame));

    // 드래그 시작 핸들러: 블록 메타데이터를 dataTransfer에 저장 
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, metadata: Omit<Block, 'id'>) => {
        e.dataTransfer.setData("application/block-metadata", JSON.stringify(metadata));
    };
    

    return (
        <div className="p-4 bg-gray-100 rounded-xl shadow-inner min-w-80 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-3 text-gray-800">
                블록 팔레트 <span className="text-sm font-normal text-indigo-500">({currentGame} 미션)</span>
            </h2>
            {availableBlocks.length === 0 ? (
                <p className="text-gray-500 italic text-sm">현재 스테이지에 사용 가능한 블록이 없습니다.</p>
            ) : (
                availableBlocks.map((metadata, index) => (
                    <div 
                        key={index} 
                        draggable={true}
                        // 팔레트 -> 캔버스 드래그
                        onDragStart={(e) => handleDragStart(e, metadata)}
                    >
                         <BlockComponent
                            block={{ ...metadata, id: `meta-${index}` }}
                            isDraggable={true}
                        />
                    </div>
                ))
            )}
            <p className="text-xs mt-3 text-gray-500">블록을 캔버스에 드래그하여 추가하세요. (캔버스에서 클릭시 제거/드래그로 순서 변경)</p>
        </div>
    );
};
