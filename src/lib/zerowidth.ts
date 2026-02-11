/**
 * Zero-Width Steganography Library
 * TypeScript port of https://github.com/lorossi/zero-width-steganography
 * 
 * Hide text information using invisible zero-width characters
 */

export enum Position {
  TOP = 'TOP',
  BOTTOM = 'BOTTOM',
  RANDOM = 'RANDOM',
  NTHLINES = 'NTHLINES',
  RANDOMINLINE = 'RANDOMINLINE',
}

export enum SteganographyMode {
  BINARY = 'BINARY', // Original binary encoding
  ZWSP_TOOL = 'ZWSP_TOOL', // ZWSP-Tool base-7 encoding
}

export class ZeroWidth {
  private readonly _version = '1.1';

  // Maps bits to spaces
  private readonly _characterMap: Record<string, string> = {
    '0': '\u200B', // ZERO WIDTH SPACE
    '1': '\uFEFF', // ZERO WIDTH NO-BREAK SPACE
  };

  // Reverse mapping: spaces to bits
  private readonly _spaceMap: Record<string, string>;

  // Set of hidden characters
  private readonly _hiddenCharacters: Set<string>;

  // ZWSP-Tool encoding list
  private readonly _zwspToolChars = [
    '\u200B', // ZERO WIDTH SPACE
    '\u200C', // ZERO WIDTH NON-JOINER
    '\u200D', // ZERO WIDTH JOINER
    '\u200E', // LEFT-TO-RIGHT MARK
    '\u200F', // RIGHT-TO-LEFT MARK
    '\u180E', // MONGOLIAN VOWEL SEPARATOR
    '\uFEFF', // ZERO WIDTH NO-BREAK SPACE
  ];

  constructor() {
    this._spaceMap = {
      [this._characterMap['0']]: '0',
      [this._characterMap['1']]: '1',
    };
    this._hiddenCharacters = new Set([
      ...Object.keys(this._spaceMap),
      ...this._zwspToolChars
    ]);
  }

  /**
   * Encode the string into spaces
   */
  private _spaceEncode(clear: string): string {
    if (!clear || clear.length === 0) return '';

    // Convert each character to binary
    const binary = Array.from(clear)
      .map(c => c.charCodeAt(0).toString(2).padStart(8, '0'))
      .join('');

    // Map each bit to corresponding zero-width character
    return Array.from(binary)
      .map(b => this._characterMap[b])
      .join('');
  }

  /**
   * Decode the string from spaces
   */
  private _spaceDecode(encoded: string): string {
    if (!encoded || encoded.length === 0) return '';

    // Map zero-width characters back to binary
    const binary = Array.from(encoded)
      .map(e => this._spaceMap[e] || '')
      .join('');

    // Convert binary back to characters
    const decoded: string[] = [];
    for (let i = 0; i < binary.length; i += 8) {
      const byte = binary.substring(i, i + 8);
      if (byte.length === 8) {
        decoded.push(String.fromCharCode(parseInt(byte, 2)));
      }
    }

    return decoded.join('');
  }

  /**
   * ZWSP-Tool base-7 encoding logic
   */
  private _zwspBaseEncode(clear: string): string {
    if (!clear) return '';
    const base = this._zwspToolChars.length;
    let encoded = '';

    for (const char of clear) {
      const code = char.charCodeAt(0);
      // Convert to base N string
      const baseN = code.toString(base).padStart(3, '0');
      for (const digit of baseN) {
        encoded += this._zwspToolChars[parseInt(digit, base)];
      }
    }
    return encoded;
  }

  /**
   * ZWSP-Tool base-7 decoding logic
   */
  private _zwspBaseDecode(encoded: string): string {
    if (!encoded) return '';
    const base = this._zwspToolChars.length;
    let decoded = '';

    for (let i = 0; i < encoded.length; i += 3) {
      const chunk = encoded.substring(i, i + 3);
      if (chunk.length < 3) break;

      let baseNStr = '';
      for (const char of chunk) {
        const digit = this._zwspToolChars.indexOf(char);
        if (digit === -1) continue;
        baseNStr += digit.toString(base);
      }

      try {
        const code = parseInt(baseNStr, base);
        if (!isNaN(code)) {
          decoded += String.fromCharCode(code);
        }
      } catch (e) {
        console.error('Failed to decode ZWSP chunk:', baseNStr);
      }
    }
    return decoded;
  }

  /**
   * Encode clear string and hide into the source string
   */
  zeroEncode(
    source: string,
    clear: string,
    position: Position,
    k: number = 1,
    mode: SteganographyMode = SteganographyMode.BINARY
  ): string {
    const encoded = mode === SteganographyMode.ZWSP_TOOL
      ? this._zwspBaseEncode(clear)
      : this._spaceEncode(clear);

    switch (position) {
      case Position.TOP:
        return encoded + source;

      case Position.BOTTOM:
        return source + encoded;

      case Position.RANDOM: {
        let result = source;
        let count = 0;
        const maxAttempts = k * 10; // Prevent infinite loop
        let attempts = 0;

        while (count < k && attempts < maxAttempts) {
          attempts++;
          const pos = Math.floor(Math.random() * (result.length + 1));

          // Check if position already has hidden characters
          if (pos < result.length && this._hiddenCharacters.has(result[pos])) {
            continue;
          }

          result = result.substring(0, pos) + encoded + result.substring(pos);
          count++;
        }
        return result;
      }

      case Position.NTHLINES: {
        const lines = source.split('\n');
        for (let x = 0; x < lines.length; x += k) {
          lines[x] += encoded;
        }
        return lines.join('\n');
      }

      case Position.RANDOMINLINE: {
        const lines = source.split('\n');
        for (let x = 0; x < lines.length; x += k) {
          if (lines[x].length === 0) {
            lines[x] = encoded;
          } else {
            const pos = Math.floor(Math.random() * (lines[x].length + 1));
            lines[x] = lines[x].substring(0, pos) + encoded + lines[x].substring(pos);
          }
        }
        return lines.join('\n');
      }

      default:
        return source + encoded;
    }
  }

  /**
   * Decode a hidden string
   */
  zeroDecode(source: string, mode: SteganographyMode = SteganographyMode.BINARY): string {
    // Extract only hidden characters
    const encoded = Array.from(source)
      .filter(s => this._hiddenCharacters.has(s))
      .join('');

    if (mode === SteganographyMode.ZWSP_TOOL) {
      return this._zwspBaseDecode(encoded);
    }
    return this._spaceDecode(encoded);
  }

  /**
   * Clean a string from hidden characters
   */
  cleanString(source: string): string {
    return Array.from(source)
      .filter(s => !this._hiddenCharacters.has(s))
      .join('');
  }

  /**
   * Check if string contains hidden characters
   */
  hasHiddenText(source: string): boolean {
    return Array.from(source).some(s => this._hiddenCharacters.has(s));
  }

  get version(): string {
    return this._version;
  }
}

// Export a singleton instance
export const zeroWidth = new ZeroWidth();
