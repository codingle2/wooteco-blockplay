import { CarModel } from "./CarModel"
import type { CarType } from "@/Global/types"

export class RacingGameModel {
    cars: CarModel[] = []; attempts: number = 0; currentTurn: number = 0;
    setup(attempts: number): string {
        if (attempts < 1 || !Number.isInteger(attempts)) { throw new Error('[ERROR] 시도 횟수는 1 이상의 정수여야 합니다.'); }
        this.attempts = attempts; this.currentTurn = 0;
        return `[레이싱 설정] ${attempts}회 시도 설정됨.`;
    }
    selectCar(name: string, type: CarType): string {
        if (this.cars.some(c => c.state.name === name)) { throw new Error(`[ERROR] 이미 존재하는 이름입니다: ${name}`); }
        this.cars.push(new CarModel(name, type));
        return `[자동차 등록] ${name} (${type}) 등록 완료.`;
    }
    runTurn(): string {
        if (this.cars.length === 0 || this.attempts === 0) { throw new Error('[ERROR] 경주 설정을 완료(SETUP, SELECT_CAR)하고 RUN_TURN 블록을 사용하세요.'); }
        if (this.currentTurn >= this.attempts) { return '[레이싱 종료] 모든 시도를 마쳤습니다. 우승자를 확인하세요.'; }
        this.currentTurn++;
        let turnLog = `--- ${this.currentTurn}번째 턴 --- \n`;
        this.cars.forEach(car => {
            car.move();
            turnLog += `${car.state.name}: ${'-'.repeat(car.state.position)}${car.state.isBroken ? '(고장)' : ''}\n`;
            car.resetStatePerTurn();
        });
        return turnLog.trim();
    }
    getWinners(): string {
        if (this.cars.length === 0 || this.attempts === 0 || this.currentTurn < this.attempts) return '';
        const maxPosition = Math.max(...this.cars.map(car => car.state.position));
        const winners = this.cars.filter(car => car.state.position === maxPosition).map(car => car.state.name);
        return `[최종 우승자]: ${winners.join(', ')}`;
    }
    reset(): void { this.cars = []; this.attempts = 0; this.currentTurn = 0; }
    getRegisteredCarNames(): string[] { return this.cars.map(car => car.state.name); }
}
