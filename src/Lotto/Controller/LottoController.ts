import { LottoModel } from "@/Lotto/Model/LottoModel"
import type { CommandType } from "@/Global/types"


export const LottoM = new LottoModel();

export const LottoController = (command: CommandType, args: (string | number)[]): string => {
    switch (command) {
        case 'LOTTO_BUY': {
            const count = Number(args[0]);
            return LottoM.buy(count);
        }
        case 'LOTTO_INPUT_WINNING': {
            const numbers = String(args[0]).split(',').map(n => parseInt(n.trim(), 10)).filter(n => !isNaN(n));
            return LottoM.inputWinningNumbers(numbers);
        }
        case 'LOTTO_INPUT_BONUS': {
            const number = Number(args[0]);
            return LottoM.inputBonusNumber(number);
        }
        case 'LOTTO_CHECK_RESULT': {
            return LottoM.checkResults();
        }
        default:
            throw new Error(`[ERROR] 알 수 없는 로또 명령: ${command}`);
    }
};