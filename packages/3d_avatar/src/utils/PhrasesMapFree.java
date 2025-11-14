package com.sl.signlanguage;

import android.util.Log;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.Map;

public class PhrasesMapFree {

    private final HashMap<String, String> phraseMap = new HashMap<>();

    private final HashMap<String, String> phraseToIDMap = new HashMap<>();

    private int longestPhraseLength = 0;

    private final String Tag = "PhrasesMap";

    PhrasesMapFree(String phraseMapText) {
        final String[] lines = phraseMapText.split(System.lineSeparator());
        for (String line: lines) {
            final String[] tokens = line.split("\\s+");
            if (tokens.length <= 1) {
                continue;
            }

            final String tokenID = tokens[0];
            phraseMap.put(tokenID, tokens[1]);

            for (int i = 1; i < tokens.length; i++) {
                if (tokens[i].length() == 0) {
                    continue;
                }
                phraseToIDMap.put(tokens[i], tokenID);
                if (longestPhraseLength < tokens[i].length()) {
                    longestPhraseLength = tokens[i].length();
                }
            }
        }
    }

    public int getDBSize() {
        return phraseToIDMap.size();
    }

    private String removeNonWord(String sentence) {
        String result = sentence.replaceAll("\\s", "");
        result = result.replaceAll("[:：]", "COLON");
        result = result.replaceAll("\\p{Punct}", "");
        result = result.replaceAll("[？。，：；、“”‘’（）【】《》「」『』〈〉〖〗… —～＠＃＄％︿＆＊｛｝〔〕·￥]", "");
        result = result.replaceAll("COLON", ":");
        return result;
    }

    static class StringPair {
        String str;
        String id;
        StringPair(String str, String id) {
            this.str = str;
            this.id = id;
        }
    }

    public ArrayList<StringPair> sentenceSegment(String sentence) {
        ArrayList<StringPair> result = new ArrayList<>();
        if (getDBSize() <= 0 || longestPhraseLength == 0) {
            result.add(new StringPair(sentence, "none"));
            return result;
        }
        if (sentence.length() == 0) {
            return result;
        }

        String modifiedSentence = removeNonWord(sentence).toUpperCase(Locale.ROOT);
        Log.d("modifiedSentence", modifiedSentence);
        int prevMatchedPos = 0;
        int pos = 0;
        while (pos < modifiedSentence.length()) {
            String matchedStr = "";
            int matchedLength = 0;
            String matchedID = "";
            for (int testLength = 1; testLength <= longestPhraseLength; testLength++) {
                if (pos + testLength > modifiedSentence.length()) {
                    break;
                }
                String testStr = modifiedSentence.substring(pos, pos + testLength);
                if (phraseToIDMap.containsKey(testStr)) {
                    matchedStr = testStr;
                    matchedLength = testLength;
                    matchedID = phraseToIDMap.get(testStr);
                }
            }
            if (matchedLength > 0) {
                if (prevMatchedPos < pos) {
                    result.add(new StringPair(modifiedSentence.substring(prevMatchedPos, pos), "none"));
                }
                pos += matchedLength;
                prevMatchedPos = pos;
                result.add(new StringPair(matchedStr, matchedID));
            } else {
                pos++;
            }
        }

        if (prevMatchedPos < modifiedSentence.length()) {
            result.add(new StringPair(modifiedSentence.substring(prevMatchedPos, modifiedSentence.length()), "none"));
        }

        return result;
    }
}
