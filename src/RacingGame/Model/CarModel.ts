import type { CarType } from "@/Global/types";

interface CarState {
    name: string;
    type: CarType;
    position: number;
    hasBoost: boolean;
    isBroken: boolean;
    skillUsed: string | null;
}

export class CarModel {
    state: CarState;
    constructor(name: string, type: CarType) {
        if (name.length < 1 || name.length > 5) {
            throw new Error(`[ERROR] 자동차 이름은 1자에서 5자 이내여야 합니다: ${name}`);
        }
        this.state = { name, type, position: 0, hasBoost: false, isBroken: false, skillUsed: null };
    }
    move(): boolean {
        if (this.state.isBroken) return false;
        let threshold = this.state.type === '그랜저' ? 3 : 4;
        let bonusMove = 0;
        
        if (this.state.hasBoost) { bonusMove = 1; this.state.hasBoost = false; }
        if (this.state.skillUsed === 'Drift') { bonusMove += 1; this.state.skillUsed = null; }

        const randomValue = Math.floor(Math.random() * 10);
        if (randomValue >= threshold) {
            this.state.position += 1 + bonusMove;
            return true;
        }
        return false;
    }
    applyBoost(): string { this.state.hasBoost = true; return `${this.state.name}에게 부스트가 적용되었습니다! 다음 턴에 추가 이동합니다.`; }
    applyFailure(): string { this.state.isBroken = true; return `${this.state.name}의 엔진이 고장나 한 턴 정지합니다.`; }
    applySkill(skill: 'Drift' | 'Jump' | 'WindBlock'): string { this.state.skillUsed = skill; return `${this.state.name}가 ${skill} 스킬을 발동했습니다.`; }
    resetStatePerTurn() { if (this.state.isBroken) { this.state.isBroken = false; } }
}