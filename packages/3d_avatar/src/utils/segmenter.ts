// Segmenter: TypeScript port of the Java PhrasesMapFree used in the Android app.
// It parses the phrase DB text (same format as used by loadWordDB in
// TextToSignActivity) and provides sentence segmentation using greedy longest
// matches. Matched phrases return their token ID (string); unmatched spans
// return id = "none".

export type StringPair = { str: string; id: string };

export class PhrasesMapFree {
  private phraseMap: Map<string, string> = new Map();
  private phraseToIDMap: Map<string, string> = new Map();
  private longestPhraseLength = 0;

  constructor(phraseMapText: string) {
    if (!phraseMapText) return;

    // split lines in a robust way (supports CRLF)
    const lines = phraseMapText.split(/\r?\n/);
    for (const line of lines) {
      const tokens = line.trim().split(/\s+/);
      if (!tokens || tokens.length <= 1) continue;

      const tokenID = tokens[0];
      // tokens[1] may be a value (e.g., filename or label) in the Java version
      if (tokens.length >= 2) {
        this.phraseMap.set(tokenID, tokens[1]);
      }

      for (let i = 1; i < tokens.length; i++) {
        if (!tokens[i] || tokens[i].length === 0) continue;
        // store uppercase keys for case-insensitive matching like the Java code
        const key = tokens[i].toUpperCase();
        this.phraseToIDMap.set(key, tokenID);
        if (this.longestPhraseLength < tokens[i].length) {
          this.longestPhraseLength = tokens[i].length;
        }
      }
    }
  }

  get dbSize(): number {
    return this.phraseToIDMap.size;
  }

  private removeNonWord(sentence: string): string {
    let result = sentence.replace(/\s+/g, '');
    result = result.replace(/[:：]/g, 'COLON');
    try {
      result = result.replace(/\p{P}|\p{S}/gu, '');
    } catch (e) {
      // fallback for environments without Unicode property escapes
      result = result.replace(/[!"#\$%&'()\*+,\-./:;<=>?@[\\\]^_`{|}~]/g, '');
    }
    result = result.replace(/[？。，：；、“”‘’（）【】《》「」『』〈〉〖〗…—～＠＃＄％︿＆＊｛｝〔〕·￥]/g, '');
    result = result.replace(/COLON/g, ':');
    return result;
  }

  sentenceSegment(sentence: string): StringPair[] {
    const result: StringPair[] = [];
    if (this.dbSize <= 0 || this.longestPhraseLength === 0) {
      result.push({ str: sentence, id: 'none' });
      return result;
    }
    if (!sentence || sentence.length === 0) return result;

    const modifiedSentence = this.removeNonWord(sentence).toUpperCase();
    let prevMatchedPos = 0;
    let pos = 0;
    while (pos < modifiedSentence.length) {
      let matchedStr = '';
      let matchedLength = 0;
      let matchedID = '';
      for (let testLength = 1; testLength <= this.longestPhraseLength; testLength++) {
        if (pos + testLength > modifiedSentence.length) break;
        const testStr = modifiedSentence.substring(pos, pos + testLength);
        if (this.phraseToIDMap.has(testStr)) {
          matchedStr = testStr;
          matchedLength = testLength;
          matchedID = this.phraseToIDMap.get(testStr) as string;
        }
      }
      if (matchedLength > 0) {
        if (prevMatchedPos < pos) {
          result.push({ str: modifiedSentence.substring(prevMatchedPos, pos), id: 'none' });
        }
        pos += matchedLength;
        prevMatchedPos = pos;
        result.push({ str: matchedStr, id: matchedID });
      } else {
        pos++;
      }
    }

    if (prevMatchedPos < modifiedSentence.length) {
      result.push({ str: modifiedSentence.substring(prevMatchedPos, modifiedSentence.length), id: 'none' });
    }

    return result;
  }

  // Optional helpers mirroring the Android implementation
  getKeyList(): string[] {
    return Array.from(this.phraseToIDMap.keys());
  }

  getFileNameFromValue(id: string): string | undefined {
    return this.phraseMap.get(id);
  }
}

export default PhrasesMapFree;
