import type { CommandType, CarType } from "@/Global/types"
import  { CAR_TYPES } from "@/Global/types"
import { RacingGameModel } from "../Model/RacingGame"

export const racingGameM = new RacingGameModel();

export const RacingController = (command: CommandType, args: (string | number)[]): string => {
    switch (command) {
        case 'RACING_SETUP': {
            const attemptsNum = Number(args[0]);
            return racingGameM.setup(attemptsNum);
        }
        case 'RACING_SELECT_CAR': {
            const [name, type] = args as [string, CarType];
            if (name.trim() === '' || !CAR_TYPES.includes(type)) throw new Error('[ERROR] 이름 또는 자동차 타입이 유효하지 않습니다.');
            return racingGameM.selectCar(name, type);
        }
        case 'RACING_BOOST': {
            const name = String(args[0]);
            const car = racingGameM.cars.find(c => c.state.name === name);
            if (!car) throw new Error(`[ERROR] '${name}' 차량을 찾을 수 없습니다. (등록되었는지 확인하세요)`);
            return car.applyBoost();
        }
        case 'RACING_FAILURE': {
            const name = String(args[0]);
            const car = racingGameM.cars.find(c => c.state.name === name);
            if (!car) throw new Error(`[ERROR] '${name}' 차량을 찾을 수 없습니다.`);
            return car.applyFailure();
        }
        case 'RACING_DRIFT': case 'RACING_JUMP': case 'RACING_WIND_BLOCK': {
            const [name] = args as [string];
            const car = racingGameM.cars.find(c => c.state.name === name);
            if (!car) throw new Error(`[ERROR] '${name}' 차량을 찾을 수 없습니다.`);
            const skill = command.split('_')[1] as 'DRIFT' | 'JUMP' | 'WIND_BLOCK';
            return car.applySkill(skill.charAt(0) + skill.slice(1).toLowerCase() as any);
        }
        case 'RACING_RUN_TURN':
            return racingGameM.runTurn();
        default:
            throw new Error(`[ERROR] 알 수 없는 레이싱 명령: ${command}`);
    }
};