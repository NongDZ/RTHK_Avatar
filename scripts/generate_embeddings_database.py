from api.settings import get_settings
import polars as pl
from opencc import OpenCC
from sentence_transformers import SentenceTransformer
settings = get_settings()

def generate_embeddings():
    t2s = OpenCC('t2s')
    db = pl.read_csv(settings.PHRASE_TABLE_PATH).select("Words")
    words = [t2s.convert(word) for word in db['Words'].to_list()]
    embedder = SentenceTransformer(settings.EMBEDDER_MODEL_NAME)
    embeddings = embedder.encode(words, normalize_embeddings=True)
    db = db.with_columns(pl.Series("embedding", embeddings))
    db.write_parquet(settings.VECTOR_DB_PATH)

if __name__ == "__main__":
    generate_embeddings()
    