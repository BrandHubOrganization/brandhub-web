export function validCreditAmounts(amounts: number[]) {
  return amounts.every((amount) => Number.isSafeInteger(amount) && amount >= 0);
}

export function formatCredits(amount: number, language: string) {
  return new Intl.NumberFormat(language).format(amount);
}
