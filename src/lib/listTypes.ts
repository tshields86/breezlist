/** Emoji shown for each list type across cards and headers. */
export const listTypeEmoji: Record<string, string> = {
  grocery: '🛒',
  todo: '✅',
  packing: '🧳',
  gift: '🎁',
  general: '📝',
}

/** Emoji for a list type, falling back to the generic note icon. */
export function emojiForListType(listType: string): string {
  return listTypeEmoji[listType] ?? '📝'
}
