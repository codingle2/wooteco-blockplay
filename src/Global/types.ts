export type GameStage = 'CALCULATOR' | 'RACING' | 'LOTTO' | 'COMPLETE';
export type CarType = '소나타' | '그랜저' | '제네시스';

export const CAR_TYPES: CarType[] = ['소나타', '그랜저', '제네시스'];

export type CommandType = 
    // Calculator
    'CALC_INPUT' | 'CALC_ADD' | 'CALC_SUBTRACT' | 'CALC_MULTIPLY' | 'CALC_DIVIDE' |
    // Racing
    'RACING_SETUP' | 'RACING_SELECT_CAR' | 'RACING_BOOST' | 'RACING_FAILURE' | 'RACING_DRIFT' | 'RACING_JUMP' | 'RACING_WIND_BLOCK' | 'RACING_RUN_TURN' |
    // Lotto
    'LOTTO_BUY' | 'LOTTO_INPUT_WINNING' | 'LOTTO_INPUT_BONUS' | 'LOTTO_CHECK_RESULT';

type BlockDomain = 'calculator' | 'racing' | 'lotto' | 'utility';

export interface Block {
    id: string;
    domain: BlockDomain;
    command: CommandType;
    label: string;
    args: (string | number)[]; 
    metadata?: string[]; 
    color: string;
}

export interface GameStatus {
    current: GameStage;
    isCleared: boolean;
    message: string;
}