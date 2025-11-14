import dspy
import polars as pl
import jieba
from sentence_transformers import SentenceTransformer
from api.core.translation.signature import TranslatorSignature, SynonymSignature
from api.core.translation.utils import segment_sentences, similarity_search
from api.settings import get_settings
from api.core.translation.LM_configure import lm_factory

settings = get_settings()

class LLMTranslator(dspy.Module):
    def __init__(self):
        self.translator = dspy.ChainOfThought(TranslatorSignature)
        self.synonym_checker = dspy.ChainOfThought(SynonymSignature)
        self.db = pl.read_csv(str(settings.PHRASE_TABLE_PATH))['Words'].to_list()
        self.model = SentenceTransformer(settings.EMBEDDER_MODEL_NAME)
        self.vector_db = pl.read_parquet(str(settings.VECTOR_DB_PATH))

    def forward(self, text: str) -> str:
        jieba.load_userdict(self.db)
        segs = jieba.cut(text)
        text = ' '.join(segs)
        print("Segmented: ", text)
        translated = self.translator(text=text).translation
        print("Translated: ", translated)
        found = []
        for phrase in translated.split(' '):
            if phrase not in self.db:
                topk_similar_phrases = similarity_search(query=phrase, model=self.model, vector_db=self.vector_db)
                print("Similar phrases: ", topk_similar_phrases)
                substitute = self.synonym_checker(phrase=phrase, candidates=topk_similar_phrases, context=translated).substitute
                if substitute is not None:
                    if substitute == "NONE":
                        continue
                    found.append(substitute)
            else:
                found.append(phrase)        
        return ' '.join(found)

def translate_text(text: str) -> str:
    sentences = segment_sentences(text)
    translator = LLMTranslator()
    translated_sentences = [translator(sentence) for sentence in sentences if sentence.strip()]
    return ' '.join(translated_sentences)

if __name__ == "__main__":
    lm = lm_factory(settings.LLM_PROVIDER)
    dspy.configure(lm=lm)
    test_text = "桂林、廣州、廈門有雨"
    result = translate_text(test_text)
    print(f"Original: {test_text}")
    print(f"Translated: {result}")