export class LottoModel {
    private tickets: number[][] = []; private winningNumbers: number[] = []; private bonusNumber: number | null = null; private purchaseAmount: number = 0;
    buy(count: number): string {
        // 로또 구매 개수 제한 10,000개
        if (count <= 0 || !Number.isInteger(count)) throw new Error('[ERROR] 구매 개수는 1개 이상의 정수여야 합니다.');
        if (count > 10000) throw new Error('[ERROR] 로또 구매 개수는 최대 10,000개로 제한됩니다.');
        
        this.purchaseAmount = count * 1000; 
        this.tickets = Array.from({ length: count }, () => this.generateSingleTicket());
        return `[LOTTO] ${count}개의 로또 (${this.purchaseAmount}원) 발급 완료.`;
    }
    generateSingleTicket(): number[] {
        const numbers = Array.from({ length: 45 }, (_, i) => i + 1);
        return numbers.sort(() => 0.5 - Math.random()).slice(0, 6).sort((a, b) => a - b);
    }
    inputWinningNumbers(numbers: number[]): string {
        if (numbers.length !== 6 || new Set(numbers).size !== 6 || numbers.some(n => n < 1 || n > 45)) {
            throw new Error('[ERROR] 당첨 번호는 1-45 사이의 중복 없는 6개 숫자여야 합니다.');
        }
        this.winningNumbers = numbers.sort((a, b) => a - b);
        return `[LOTTO] 당첨 번호: ${this.winningNumbers.join(', ')} 입력 완료.`;
    }
    inputBonusNumber(number: number): string {
        if (number < 1 || number > 45 || this.winningNumbers.includes(number)) {
            throw new Error('[ERROR] 보너스 번호는 1-45 사이이며 당첨 번호와 중복될 수 없습니다.');
        }
        this.bonusNumber = number;
        return `[LOTTO] 보너스 번호: ${this.bonusNumber} 입력 완료.`;
    }
    checkResults(): string {
        if (this.tickets.length === 0) return '[ERROR] 로또를 먼저 구매하세요.';
        if (this.winningNumbers.length === 0 || this.bonusNumber === null) return '[ERROR] 당첨/보너스 번호를 모두 입력하세요.';

        const prizeTable = { '3': 5000, '4': 50000, '5': 1500000, '5+B': 30000000, '6': 2000000000 };
        let totalPrize = 0;
        const matchCounts: { [key: string]: number } = { '3': 0, '4': 0, '5': 0, '5+B': 0, '6': 0, '0-2': 0 };

        this.tickets.forEach(ticket => {
            const matches = ticket.filter(n => this.winningNumbers.includes(n)).length;
            const hasBonus = this.bonusNumber !== null && ticket.includes(this.bonusNumber);
            let rank: keyof typeof prizeTable | '0-2' = '0-2';

            if (matches === 6) rank = '6';
            else if (matches === 5 && hasBonus) rank = '5+B';
            else if (matches === 5) rank = '5';
            else if (matches === 4) rank = '4';
            else if (matches === 3) rank = '3';

            if (rank !== '0-2') { totalPrize += prizeTable[rank]; matchCounts[rank] += 1; } 
            else { matchCounts['0-2'] += 1; }
        });
        
        const returnRate = (totalPrize / this.purchaseAmount * 100).toFixed(2);
        let report = "[LOTTO 결과] \n";
        report += `구매 금액: ${this.purchaseAmount}원, 당첨금 총액: ${totalPrize.toLocaleString()}원\n`;
        report += `수익률: ${returnRate}%\n`;
        report += `6개 일치 (20억): ${matchCounts['6']}개\n`;
        // 생략된 통계 출력
        return report;
    }
}