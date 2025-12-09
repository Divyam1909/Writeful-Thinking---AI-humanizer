interface DiffPart {
  value: string;
  added?: boolean;
  removed?: boolean;
}

export const computeDiff = (oldText: string, newText: string): DiffPart[] => {
  const oldWords = oldText.split(/\s+/);
  const newWords = newText.split(/\s+/);
  
  // A very simplified diff for visualization purposes. 
  // In a real production app, we would use 'diff-match-patch' or similar algorithm.
  // This uses a basic LCS (Longest Common Subsequence) approach for words.

  const matrix: number[][] = Array(oldWords.length + 1)
    .fill(null)
    .map(() => Array(newWords.length + 1).fill(0));

  for (let i = 1; i <= oldWords.length; i++) {
    for (let j = 1; j <= newWords.length; j++) {
      if (oldWords[i - 1] === newWords[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1] + 1;
      } else {
        matrix[i][j] = Math.max(matrix[i - 1][j], matrix[i][j - 1]);
      }
    }
  }

  const diff: DiffPart[] = [];
  let i = oldWords.length;
  let j = newWords.length;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldWords[i - 1] === newWords[j - 1]) {
      diff.unshift({ value: oldWords[i - 1] + ' ' });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || matrix[i][j - 1] >= matrix[i - 1][j])) {
      diff.unshift({ value: newWords[j - 1] + ' ', added: true });
      j--;
    } else if (i > 0 && (j === 0 || matrix[i][j - 1] < matrix[i - 1][j])) {
      diff.unshift({ value: oldWords[i - 1] + ' ', removed: true });
      i--;
    }
  }

  return diff;
};