// This is a TypeScript port of the logic from https://github.com/mauricelambert/EmojiEncode

const EMOJI_CHARS = "😂😍😭🔥🤔🤯👍🎉";

function simpleXOR(text: string, key: string): string {
    if (!key) return text;
    let result = '';
    for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
}

export function encode(message: string, key: string = ''): string {
    const encryptedMessage = simpleXOR(message, key);
    let binaryString = '';
    for (let i = 0; i < encryptedMessage.length; i++) {
        binaryString += encryptedMessage.charCodeAt(i).toString(2).padStart(8, '0');
    }

    let emojiString = '';
    for (let i = 0; i < binaryString.length; i += 3) {
        const chunk = binaryString.substring(i, i + 3);
        const index = parseInt(chunk, 2);
        emojiString += EMOJI_CHARS[index];
    }
    return emojiString;
}


export function decode(emojiString: string, key: string = ''): string {
    let binaryString = '';
    for (let i = 0; i < emojiString.length; i++) {
        const emoji = emojiString[i];
        const index = EMOJI_CHARS.indexOf(emoji);
        if (index === -1) {
            throw new Error(`Invalid emoji character detected: ${emoji}`);
        }
        binaryString += index.toString(2).padStart(3, '0');
    }

    // Trim trailing bits that don't form a full byte
    const remainder = binaryString.length % 8;
    if (remainder !== 0) {
        binaryString = binaryString.slice(0, -remainder);
    }
    
    let decryptedMessage = '';
    for (let i = 0; i < binaryString.length; i += 8) {
        const byte = binaryString.substring(i, i + 8);
        decryptedMessage += String.fromCharCode(parseInt(byte, 2));
    }

    return simpleXOR(decryptedMessage, key);
}

export function detect_emoji_patterns(text: string) {
    // This is a simplified check to see if the text consists ONLY of the
    // special emoji characters used for encoding. A real scenario might
    // be more complex.
    const uniqueChars = new Set(text);
    const emojiSet = new Set(EMOJI_CHARS);
    let suspicious = false;
    const reasons: string[] = [];

    let emojiOnly = true;
    for (const char of uniqueChars) {
        if (!emojiSet.has(char)) {
            emojiOnly = false;
            break;
        }
    }
    
    if (emojiOnly && text.length > 10) {
        suspicious = true;
        reasons.push('high_density_of_specific_encoding_emojis');
    }
    
    return { suspicious, reasons };
}