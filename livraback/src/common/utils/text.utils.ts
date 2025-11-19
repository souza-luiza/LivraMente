export function extractMentions(text: string): string[] {
    if (!text) return [];

    const mentionER = /@([a-zA-Z0-9_-]+)/g;
    const mentions = new Set<string>();
    let match;

    while ((match = mentionER.exec(text)) !== null) {
        mentions.add(match[1]);
    }

    return Array.from(mentions);
}