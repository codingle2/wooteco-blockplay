import React, { useState, useCallback } from 'react';
import type { Block, GameStatus, GameStage } from './Global/types';
import { BlockPalette } from "@/components/BlockPalette";
import { BlockComponent } from "@/components/Block";
import { executeBlockScript } from "@/Global/ControllerDispatcher";

// Tailwind CSS를 위한 헬퍼 컴포넌트
const TailwindSpinner = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const App: React.FC = () => {
    // 1. 상태 관리 
    const [gameStatus, setGameStatus] = useState<GameStatus>({
        current: 'CALCULATOR',
        isCleared: false,
        message: '계산기 미션을 수행할 블록 스크립트를 만들어주세요. (숫자 입력 -> 연산 -> 숫자 입력 -> 연산... 최소 2회 연산 필요)',
    });
    const [blockScript, setBlockScript] = useState<Block[]>([]);
    const [executionResults, setExecutionResults] = useState<string[]>([]);
    const [isExecuting, setIsExecuting] = useState(false);
    
    // 💡 캔버스 내 블록 순서 변경을 위한 상태
    const [draggedId, setDraggedId] = useState<string | null>(null);
    const [dragOverId, setDragOverId] = useState<string | null>(null);

    // 스크립트에서 현재 등록된 차량 이름을 파싱하여 실시간으로 가져옴
    const currentCarNamesFromScript = blockScript
        .filter(block => block.command === 'RACING_SELECT_CAR' && typeof block.args[0] === 'string' && block.args[0].trim().length > 0 && block.args[0].length <= 5)
        .map(block => block.args[0] as string);
        

    const handleAddBlock = useCallback((block: Block) => {
        // 팔레트에서 드래그 시 metadata도 함께 복사
        const newBlock: Block = {
            ...block,
            id: crypto.randomUUID(),
        };
        // 버그 수정 로직: 이벤트 블록이 추가될 때, 등록된 차량이 있으면 첫 번째 이름으로 args 초기화
        // 동적 드롭다운을 사용하는 블록이고, 현재 등록된 차량이 있다면 첫 번째 차량 이름으로 초기화
        if (newBlock.domain === 'racing' && newBlock.metadata?.[0] === 'select:dynamic' && currentCarNamesFromScript.length > 0) {
            newBlock.args = [currentCarNamesFromScript[0]];
        }
        
        setBlockScript(prev => [...prev, newBlock]);
    }, [currentCarNamesFromScript]);

    /** 캔버스에서 블록을 제거합니다. */
    const handleRemoveBlock = useCallback((id: string) => {
        setBlockScript(prev => prev.filter(block => block.id !== id));
    }, []);
    
    /** 블록 인자(Args)를 변경합니다. */
    const handleArgChange = useCallback((blockId: string, argIndex: number, newValue: string | number) => {
        setBlockScript(prevScript => prevScript.map(block => {
            if (block.id === blockId) {
                const newArgs = [...block.args];
                newArgs[argIndex] = newValue;
                return { ...block, args: newArgs };
            }
            return block;
        }));
    }, []);
    
    // 다음 게임 스테이지로 수동으로 이동합니다. (클리어와 관계없이 이동 가능) 
    const handleNextGame = () => {
        const stages: GameStage[] = ['CALCULATOR', 'RACING', 'LOTTO', 'COMPLETE'];
        const currentIndex = stages.indexOf(gameStatus.current);
        
        let nextStage: GameStage;
        let nextIndex: number;
        
        if (gameStatus.current === 'COMPLETE') {
            // 로또 (COMPLETE) 후에는 처음 게임으로 돌아가기
            nextIndex = 0;
            nextStage = stages[nextIndex];
        } else {
            // 다음 게임으로
            nextIndex = currentIndex < stages.length - 1 ? currentIndex + 1 : stages.length - 1;
            nextStage = stages[nextIndex];
        }
        
        setBlockScript([]); // 스크립트 초기화
        setExecutionResults([]); // 결과 초기화

        let message = '';
        if (nextStage === 'CALCULATOR') { message = '계산기 미션을 수행할 블록 스크립트를 만들어주세요. (숫자 입력 -> 연산 -> 숫자 입력 -> 연산... 최소 2회 연산 필요)'; } 
        else if (nextStage === 'RACING') { message = '자동차 경주 미션을 수행할 블록 스크립트를 만들어주세요. (SETUP -> SELECT_CAR -> RUN_TURN...)'; } 
        else if (nextStage === 'LOTTO') { message = '로또 미션을 수행할 블록 스크립트를 만들어주세요. (BUY -> INPUT_WINNING -> CHECK_RESULT)'; } 
        else if (nextStage === 'COMPLETE') { message = '🏆 모든 미션 완료! 축하합니다!'; }
        
        setGameStatus({ 
            current: nextStage, 
            isCleared: nextStage === 'COMPLETE', // COMPLETE일 때만 true 유지
            message: message 
        });
    }

    // 팔레트에서 캔버스로 드롭: 새 블록 추가 
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        try {
            // 팔레트에서 온 데이터 (metadata)
            const metadataJson = e.dataTransfer.getData("application/block-metadata");
            if (metadataJson) {
                const metadata: Omit<Block, 'id'> = JSON.parse(metadataJson);
                
                            // 새 블록 인스턴스 생성 (id 추가)
              const newBlock: Block = {
                  ...metadata,
                  id: crypto.randomUUID(), // 필수: Block 타입을 위해 id 추가
              };

              handleAddBlock(newBlock);
              }
        } catch (error) {
            console.error("Failed to parse dropped block data:", error);
        }
    };
    
    // 💡 캔버스 내 블록 재배열 로직
    // 블록 배열 내에서 항목의 위치를 실제로 변경합니다. 
    const handleReorder = useCallback((dragId: string, dropId: string) => {
        if (dragId === dropId) return;

        setBlockScript(currentScript => {
            const draggedIndex = currentScript.findIndex(b => b.id === dragId);
            const dropIndex = currentScript.findIndex(b => b.id === dropId);
            if (draggedIndex === -1 || dropIndex === -1) return currentScript;

            const newScript = [...currentScript];
            const [draggedItem] = newScript.splice(draggedIndex, 1);
            newScript.splice(dropIndex, 0, draggedItem);
            
            return newScript;
        });
    }, []);

    // 캔버스 블록 드래그 시작 
    const handleDragStartCanvas = (e: React.DragEvent<HTMLDivElement>, id: string) => {
        e.dataTransfer.setData("block/id", id); // 재배열을 위한 ID 저장
        setDraggedId(id);
    };

    // 캔버스 블록 위로 드래그 오버 (재배열 대상) 
    const handleDragOverCanvas = (e: React.DragEvent<HTMLDivElement>, id: string) => {
        e.preventDefault();
        if (id !== draggedId && id !== dragOverId) {
            setDragOverId(id);
        }
    };
    
    // 캔버스 블록 위로 드래그 리브 
    const handleDragLeaveCanvas = () => {
         setDragOverId(null);
    }

    // 캔버스 블록에 드롭 (재배열 완료) 
    const handleDropCanvas = (e: React.DragEvent<HTMLDivElement>, dropId: string) => {
        e.preventDefault();
        
        // 재배열 로직을 위해 저장된 블록 ID를 가져옴
        const dragId = e.dataTransfer.getData("block/id");
        
        if (dragId) {
            handleReorder(dragId, dropId);
        }
        setDraggedId(null);
        setDragOverId(null);
    };

    // 캔버스 블록 드래그 종료 
    const handleDragEndCanvas = () => {
        setDraggedId(null);
        setDragOverId(null);
    };
    

    // 💡 실행 로직
    // 블록 스크립트 실행 버튼 핸들러 
    const handleExecuteScript = async () => {
        if (isExecuting) return;

        setIsExecuting(true);
        setExecutionResults(['--- 실행 시작 ---']);

        // 비동기 작업 시뮬레이션
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 1. Controller Dispatcher (executeBlockScript) 호출
        const setGameStatusWrapper = (newStatus: GameStatus) => setGameStatus(newStatus);
        
        const results = executeBlockScript(blockScript, gameStatus, setGameStatusWrapper);

        setExecutionResults(prev => [...prev, ...results, '--- 실행 완료 ---']);
        setIsExecuting(false);
    };

    const isMissionCleared = gameStatus.isCleared && gameStatus.current !== 'COMPLETE';
    const isGameComplete = gameStatus.current === 'COMPLETE';

    // 💡 버튼 텍스트와 색상 클래스 결정
    const buttonText = isGameComplete ? '처음 게임으로 돌아가기' : '다음 게임으로 →';
    const buttonClass = isGameComplete
        ? 'bg-indigo-600 hover:bg-indigo-700 text-white' // 완료 후: 시작으로 돌아가기 (항상 활성)
        : isMissionCleared
        ? 'bg-green-500 hover:bg-green-600 text-white'  // 클리어 후: 다음 게임으로 (활성)
        : 'bg-gray-300 text-gray-600 hover:bg-gray-400'; // 클리어 전: 다음 게임으로 (비활성/클릭 가능)

    return (
        <div className="min-h-screen bg-gray-50 p-6 font-inter flex flex-col items-center">
            <h1 className="text-4xl font-extrabold text-indigo-700 mb-2 tracking-tight">
                MVC 블록 코딩 미션 플랫폼
            </h1>
            <p className={`mb-6 text-center font-medium ${isMissionCleared || isGameComplete ? 'text-green-600' : 'text-gray-600'}`}>
                {gameStatus.message}
            </p>

            <div className="flex w-full max-w-7xl space-x-6">
                
                {/* 왼쪽: 블록 팔레트 */}
                <BlockPalette currentGame={gameStatus.current} />

                {/* 오른쪽: 캔버스 및 결과 창 */}
                <div className="flex-1 flex flex-col space-y-4">
                    
                    {/* 블록 캔버스 (features/blocks/components/BlockCanvas.tsx) */}
                    <div 
                        className="bg-white p-4 rounded-xl shadow-lg border-2 border-dashed border-gray-300 min-h-60 flex flex-col"
                        onDragOver={(e) => e.preventDefault()} // 드롭을 허용하기 위해 기본 동작 방지 (팔레트 -> 캔버스 드롭 시 필요)
                        onDrop={handleDrop} // 팔레트에서 드롭 처리
                    >
                        <h2 className="text-xl font-bold mb-3 text-gray-800">
                            블록 캔버스 (스크립트)
                        </h2>
                        {blockScript.length === 0 ? (
                            <p className="text-gray-400 italic flex-1 flex items-center justify-center">
                                팔레트에서 블록을 드래그하여 순서대로 조립하세요. (캔버스에서 클릭하여 제거/드래그로 순서 변경)
                            </p>
                        ) : (
                            <div className="flex flex-col space-y-2 flex-1">
                                {blockScript.map((block, index) => {
                                    const isDragging = draggedId === block.id;
                                    const isDropTarget = dragOverId === block.id;
                                    
                                    // 드래그 오버 시 경계선 스타일 정의
                                    const borderClass = isDropTarget && draggedId !== block.id 
                                        ? 'border-2 border-dashed border-indigo-500 bg-indigo-50 rounded-lg' 
                                        : 'border-2 border-transparent';
                                        
                                    return (
                                        <div 
                                            key={block.id} 
                                            className={`flex items-center transition-all duration-150 p-1 ${borderClass}`}
                                            draggable={true}
                                            // 캔버스 내 재배열 드래그 핸들러
                                            onDragStart={(e) => handleDragStartCanvas(e, block.id)}
                                            onDragOver={(e) => handleDragOverCanvas(e, block.id)}
                                            onDragLeave={handleDragLeaveCanvas}
                                            onDrop={(e) => handleDropCanvas(e, block.id)}
                                            onDragEnd={handleDragEndCanvas}
                                            style={{ opacity: isDragging ? 0.3 : 1, order: index }} 
                                        >
                                            <span className="text-gray-500 font-mono text-sm w-8 flex-shrink-0">
                                                {index + 1}.
                                            </span>
                                            {/* 캔버스 블록은 제거 기능 및 인자 변경 기능을 가집니다 */}
                                            <BlockComponent 
                                                block={block} 
                                                onRemove={handleRemoveBlock} 
                                                onArgChange={handleArgChange}
                                                // 💡 수정됨: 스크립트에서 파싱한 차량 목록을 전달하여 실시간 드롭다운을 구현
                                                registeredCarNames={currentCarNamesFromScript}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                    
                    {/* 실행 및 다음 게임 버튼 */}
                    <div className="flex space-x-4">
                         <button
                            onClick={handleExecuteScript}
                            disabled={isExecuting || isGameComplete}
                            className={`py-3 px-6 rounded-xl text-lg font-bold transition duration-300 shadow-md ${
                                isExecuting
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-lg'
                            } flex-1`}
                        >
                            {isExecuting ? (
                                <div className="flex items-center justify-center">
                                    <TailwindSpinner />
                                    스크립트 실행 중...
                                </div>
                            ) : (
                                '스크립트 실행하기 (Run)'
                            )}
                        </button>
                        
                         {/* 다음 게임 또는 처음 게임으로 돌아가기 버튼 */}
                        <button
                            onClick={handleNextGame}
                            className={`flex-1 py-3 px-6 rounded-xl text-lg font-bold shadow-md transition duration-300 ${buttonClass}`}
                        >
                            {buttonText}
                        </button>
                    </div>
                    
                    {/* 실행 결과 창 */}
                    <div className="bg-gray-800 p-4 rounded-xl shadow-lg text-white font-mono text-sm max-h-52 overflow-y-auto">
                        <h2 className="text-lg font-bold mb-2 text-indigo-400">실행 결과 콘솔</h2>
                        {executionResults.map((line, index) => (
                            <p 
                                key={index} 
                                className={
                                    line.includes('[ERROR]') || line.includes('❌') 
                                        ? 'text-red-400' 
                                        : (line.includes('[최종 우승자]') || line.includes('[CALC] 최종 레지스터 값') || line.includes('[LOTTO 결과]')) ? 'text-yellow-400 font-bold' : 'text-gray-200'
                                }
                            >
                                {line}
                            </p>
                        ))}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default App;