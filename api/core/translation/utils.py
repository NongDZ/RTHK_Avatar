import re
import numpy as np
import polars as pl
from sentence_transformers import util
from sentence_transformers import SentenceTransformer
from api.settings import get_settings
from opencc import OpenCC

settings = get_settings()

model = SentenceTransformer(settings.EMBEDDER_MODEL_NAME)
db = pl.read_parquet(settings.VECTOR_DB_PATH)

def segment_sentences(text: str) -> list[str]:
    import re
    # Split on Chinese sentence-ending punctuation marks
    pattern = r'([。！？!?]+)'
    parts = re.split(pattern, text)
    
    return parts

def similarity_search(query: str, model: SentenceTransformer, vector_db: pl.DataFrame, top_k: int = 5) -> list[str]:
    t2s = OpenCC('t2s')
    query = t2s.convert(query)
    query_embedding = model.encode(query, normalize_embeddings=True)
    return vector_db.with_columns(
        pl.col('embedding').map_elements(
            lambda x: model.similarity(query_embedding, x),
            return_dtype=pl.Float64,
        ).alias('score'),
    ).sort('score')[-top_k:]['Words'].to_list()
