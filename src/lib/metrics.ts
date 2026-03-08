export function computeCorrectChars(typedText: string, sentence: string): number {
  let count = 0
  const len = Math.min(typedText.length, sentence.length)
  for (let i = 0; i < len; i++) {
    if (typedText[i] === sentence[i]) count++
  }
  return count
}

export function computeAccuracy(
  correctChars: number,
  sentenceLength: number
): number {
  if (sentenceLength === 0) return 0
  return Math.min(1, correctChars / sentenceLength)
}

export function computeWpm(correctChars: number, elapsedMs: number): number {
  const elapsedMinutes = Math.max(elapsedMs, 1000) / 60_000
  return (correctChars / 5) / elapsedMinutes
}
