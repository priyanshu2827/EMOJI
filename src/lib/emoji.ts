// This is a TypeScript port of the logic from https://github.com/mauricelambert/EmojiEncode

const EMOJI_CHARS = "😂😍😭🔥🤔🤯👍🎉";

function xor(data: Uint8Array, key: string): Uint8Array {
    if (!key) return data;
    const keyBytes = new TextEncoder().encode(key);
    const result = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) {
        result[i] = data[i] ^ keyBytes[i % keyBytes.length];
    }
    return result;
}

export function encode(message: string, key: string = ''): string {
    const encoder = new TextEncoder();
    const messageBytes = encoder.encode(message);
    const encryptedBytes = xor(messageBytes, key);
    
    let binaryString = '';
    for (const byte of encryptedBytes) {
        binaryString += byte.toString(2).padStart(8, '0');
    }

    let emojiString = '';
    for (let i = 0; i < binaryString.length; i += 3) {
        const chunk = binaryString.substring(i, i + 3).padEnd(3, '0'); // Pad last chunk if needed
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
            // Handle multi-codepoint emojis if they slip in
             const codePoints = [...emoji];
             if (codePoints.length > 1) {
                const firstChar = codePoints[0];
                const firstCharIndex = EMOJI_CHARS.indexOf(firstChar);
                 if (firstCharIndex !== -1) {
                    binaryString += firstCharIndex.toString(2).padStart(3, '0');
                    // Skip the other parts of the complex emoji
                    i += codePoints.length - 2; 
                    continue;
                 }
             }
            throw new Error(`Invalid emoji character detected: ${emoji}`);
        }
        binaryString += index.toString(2).padStart(3, '0');
    }

    const byteLength = Math.floor(binaryString.length / 8);
    const bytes = new Uint8Array(byteLength);
    for (let i = 0; i < byteLength; i++) {
        const byte = binaryString.substring(i * 8, (i + 1) * 8);
        bytes[i] = parseInt(byte, 2);
    }

    const decryptedBytes = xor(bytes, key);
    const decoder = new TextDecoder();
    return decoder.decode(decryptedBytes);
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
