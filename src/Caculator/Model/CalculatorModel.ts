export class CalculatorModel {
    add(current: number, value: number): number { return current + value; }
    subtract(current: number, value: number): number { return current - value; }
    multiply(current: number, value: number): number { return current * value; }
    divide(current: number, value: number): number {
        if (value === 0) throw new Error('[ERROR] 0으로 나눌 수 없습니다.');
        return current / value;
    }
}
