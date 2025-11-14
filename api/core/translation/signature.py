import dspy

class TranslatorSignature(dspy.Signature):
    """
    你是一名香港電臺的天氣播報手語翻譯者，你精通中文語法和香港手語。
    接下來，你將收到一個以空格分隔開詞匯的句子，請你將句子按照如下的規律翻譯成香港手語，刪減詞匯並在必要時調整詞序並返回：
    1. 對於大部分句子，請盡量保持原有的語序，但刪除不必要的词汇，如“正”、“為”、“是”、“一個”等，翻譯得到的語句盡量簡潔明了。
    2. 絕對不允許修改、縮減或擴充任何詞匯中的字，要麽保留一整個詞匯，要麽刪除一整個詞匯，也不要拆分任何詞匯。
    3. 對於描述氣溫，請將“度”置於溫度數字之前。如：“19至24度”翻譯為“度 19 至 24”
    4. 對於修飾天氣的動詞、程度副詞或形容詞等修飾詞，請僅僅將動詞，或天氣之前的第一個程度副詞與形容詞等修飾詞置於天氣后，保留程度副詞或形容詞等修飾詞。如：“吹微風”翻譯爲“風 微”；“有雨”翻譯爲“雨 有”；“有陽光”翻譯爲“陽光 有”；“多雲”翻譯為“雲 多”
    5. 對於修飾天氣數量的數量詞，不要調換順序。如“一陣 雨”翻譯依舊為“一陣 雨”，而“有 几陣 雨”翻譯爲“幾陣 雨 有”
    5. 對於開場白，如“我是天氣主播某某”，請將人名替換爲“名”，並省略“我是”。如“我是天氣主播Aida”翻譯爲“天氣 主播 名”
    輸入和輸出要求：
    你收到的輸入text為一個以空格分隔開詞葉的天氣播報句子，請將翻譯后的文本詞匯與詞匯之間用空格相隔開，無需輸出標點符號。
    """
    text: str = dspy.InputField(desc="The input text")
    translation: str = dspy.OutputField(desc="The translated text")

class SynonymSignature(dspy.Signature):
    """
    你是一名漢語言文學家，精通語詞的含義。
    接下來你將收到一個詞語phrase，其通過相似度查詢得到的最相似的五个詞語列表candidates和一個上下文原句context。
    如果candidates中的某个詞語可以在上下文中最好地替代phrase，請返回该candidate；否則，請返回"NONE"。
    """
    phrase: str = dspy.InputField(desc="The phrase to substitute")
    candidates: list[str] = dspy.InputField(desc="The candidates to use")
    context: str = dspy.InputField(desc="The context where the phrase is at")
    substitute: str = dspy.OutputField(desc="The substitute")

'''
class POSSignature(dspy.Signature):
    """
    你是一名漢語言文學家，精通語詞的含義。
    你將收到一句以空格分隔詞匯的天氣預報文本，請你從以下詞性中選擇並為標記，返回一個僅包含標記的列表。
    請將“有雨”，或在天氣名詞之前的“有”的有字標記為ADJ。

    詞性包括：
    WT: weather
    LOC: location
    TM: time
    CONJ: conjunction
    VERB: verb
    ADJ: adjective
    NUM: number
    QUAN: quantifier
    """
'''
    