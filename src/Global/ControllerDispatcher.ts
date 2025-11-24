import type { Block, CommandType, GameStatus } from "@/Global/types"

import { RacingController, racingGameM } from "@/RacingGame/Controller/RacingController"
import { LottoController } from "@/Lotto/Controller/LottoController"
import { CalculatorController, CalculatorM } from "@/Caculator/Controller/CalculatorController"

export interface CalcState {
    runningTotal: number | null;
    pendingOperator: CommandType | null;
    operationCount: number;
}

export const executeBlockScript = (
    script: Block[],
    gameStatus: GameStatus,
    setGameStatus: (status: GameStatus) => void
): string[] => {
    if (script.length === 0) return ['실행할 블록이 없습니다.'];

    const executionResults: string[] = [];
    let isSuccessful = false;
    
    // 게임별 환경 리셋
    if (gameStatus.current === 'RACING') { racingGameM.reset(); }
    
    // 계산기 상태 초기화
    let calcState: CalcState = { runningTotal: null, pendingOperator: null, operationCount: 0 };

    for (const block of script) {
        let result = '';
        try {
            const expectedDomain = gameStatus.current.toLowerCase();
            if (block.domain !== expectedDomain && block.domain !== 'utility') {
                 throw new Error(`[ERROR] 현재 ${gameStatus.current} 미션에서는 ${block.domain} 블록을 사용할 수 없습니다.`);
            }

            if (block.domain === 'calculator') {
                // Calculator Controller 호출 (상태 전달)
                result = CalculatorController(block, calcState, CalculatorM);
            } else if (block.domain === 'racing') {
                // Racing Controller 호출
                result = RacingController(block.command, block.args);
                
                if (block.command === 'RACING_RUN_TURN' && racingGameM.currentTurn === racingGameM.attempts && racingGameM.attempts > 0) {
                    result += '\n' + racingGameM.getWinners();
                    isSuccessful = (gameStatus.current === 'RACING'); 
                }
            } else if (block.domain === 'lotto') {
                // Lotto Controller 호출
                result = LottoController(block.command, block.args);
                if (block.command === 'LOTTO_CHECK_RESULT') isSuccessful = (gameStatus.current === 'LOTTO'); 
            }
        } catch (error) {
            const errorMessage = (error as Error).message;
            executionResults.push(`[❌ 실행 중단] ${block.label}: ${errorMessage}`);
            setGameStatus({ ...gameStatus, isCleared: false, message: '미션 실패: 스크립트 실행 중 오류가 발생했습니다.' });
            return executionResults;
        }
        
        executionResults.push(`${block.label}: ${result}`);
    }
    
    // 계산기 미션 최종 상태 체크 및 로그 추가
    if (gameStatus.current === 'CALCULATOR') {
        if (calcState.pendingOperator !== null) {
            executionResults.push('[CALC] 스크립트 종료: 대기 중인 연산자가 남아있습니다. (A -> OP 순서로 종료됨)');
        }
        if (calcState.operationCount >= 2) {
            isSuccessful = true;
        }
        executionResults.push(`[CALC] 최종 결과: ${calcState.runningTotal}`);
    }

    // 미션 클리어 상태 업데이트
    if (isSuccessful) {
        let successMessage = '';
        if (gameStatus.current === 'CALCULATOR') { successMessage = '🎉 계산기 미션 성공! "다음 게임으로" 버튼을 눌러주세요.'; } 
        else if (gameStatus.current === 'RACING') { successMessage = '🚗 자동차 경주 미션 성공! "다음 게임으로" 버튼을 눌러주세요.'; } 
        else if (gameStatus.current === 'LOTTO') { successMessage = '🏆 모든 미션 완료! 축하합니다!'; }

        if (successMessage) {
             setGameStatus({ ...gameStatus, isCleared: true, message: successMessage });
        }
    } else {
        setGameStatus({ ...gameStatus, isCleared: false, message: `${gameStatus.current} 미션 실행 완료. 클리어 조건을 다시 확인하세요.` });
    }

    return executionResults;
};