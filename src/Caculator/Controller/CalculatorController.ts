import type { Block } from "@/Global/types";
import type { CalcState } from "@/Global/ControllerDispatcher";
import { CalculatorModel } from "../Model/CalculatorModel";

// 싱글톤 인스턴스
export const CalculatorM = new CalculatorModel();

// 연산자 레이블 매핑 함수
function getOperatorLabel(op: string): string {
    switch(op) {
        case 'CALC_ADD': return '+';
        case 'CALC_SUBTRACT': return '-';
        case 'CALC_MULTIPLY': return '*';
        case 'CALC_DIVIDE': return '/';
        default: return '?';
    }
}

export const CalculatorController = (
    block: Block,
    state: CalcState,
    model: CalculatorModel
): string => {
    if (block.command === 'CALC_INPUT') {
        const value = Number(block.args[0]);
        if (isNaN(value)) throw new Error('[ERROR] 유효한 숫자를 입력하세요.');

        if (state.pendingOperator === null) {
            if (state.runningTotal === null) {
                // 1. 초기값 설정 (A)
                state.runningTotal = value;
                return `[CALC] 계산을 ${value}로 시작합니다. (초기값 설정)`; 
            } else {
                // 오류: 연산자가 없는데 숫자가 연속됨 (A -> B)
                throw new Error(`[ERROR] 연산자 없이 숫자 입력이 연속될 수 없습니다. 연산 블록을 추가하세요. (현재: ${state.runningTotal} -> ${value})`);
            }
        } else {
            // 2. 대기 중인 연산자 실행 (B)
            const prevTotal = state.runningTotal!;
            const operatorType = state.pendingOperator;
            let newTotal: number;

            switch (operatorType) {
                case 'CALC_ADD': newTotal = model.add(prevTotal, value); break;
                case 'CALC_SUBTRACT': newTotal = model.subtract(prevTotal, value); break;
                case 'CALC_MULTIPLY': newTotal = model.multiply(prevTotal, value); break;
                case 'CALC_DIVIDE': newTotal = model.divide(prevTotal, value); break;
                default:
                    throw new Error(`[ERROR] 알 수 없는 대기 연산자: ${operatorType}`);
            }

            state.runningTotal = newTotal;
            state.pendingOperator = null;
            state.operationCount++;
            const operatorLabel = getOperatorLabel(operatorType);
            return `[CALC] ${prevTotal} ${operatorLabel} ${value} = ${newTotal}`;
        }

    } else if (block.command.startsWith('CALC_')) {
        // 연산 블록 (ADD, SUBTRACT, ...)

        if (state.runningTotal === null) {
            throw new Error('[ERROR] 계산을 시작하려면 가장 먼저 "숫자 입력" 블록이 필요합니다. (초기값)');
        }
        if (state.pendingOperator !== null) {
            throw new Error('[ERROR] 연산 블록이 연속될 수 없습니다. 이미 대기 중인 연산이 있습니다. "숫자 입력" 블록을 추가하세요.');
        }

        // 3. 연산자 대기 설정
        state.pendingOperator = block.command;
        const operatorLabel = getOperatorLabel(block.command);
        return `[CALC] ${state.runningTotal}에 대한 ${block.label} (${operatorLabel}) 연산 준비. 다음 숫자 입력을 기다립니다.`;
    }

    return '';
};
