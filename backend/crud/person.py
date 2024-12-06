import csv
from typing import List, Optional
from pathlib import Path
from langchain_openai import OpenAIEmbeddings
from dotenv import load_dotenv
from schemas.person import Person
from langchain_chroma import Chroma
from sentence_transformers import CrossEncoder

DB_PATH = Path(__file__).parent.parent / "statics" / "db.csv"

load_dotenv()


def get_all_persons() -> List[Person]:
    persons = []
    with open(DB_PATH, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            # DictReaderで取得したrowは全て文字列のため、ageをintに変換
            person = Person(
                name=row["name"],
                introduction=row["introduction"],
                gender=row["gender"],
                age=int(row["age"])
            )
            persons.append(person)
    return persons


def search_persons(name: Optional[str] = None) -> List[Person]:
    def _remove_blanc(s: str) -> str:
        ret = s.replace(" ", "").replace("　", "").replace(
            "\n", "").replace("\t", "").lower()
        return ret

    persons = get_all_persons()
    if name:
        persons = [p for p in persons if _remove_blanc(
            name) in _remove_blanc(p.name)]
    return persons


model = CrossEncoder("cl-nagoya/ruri-reranker-small", trust_remote_code=True)


def rag_search(query: str) -> List[Person]:
    embeddings = OpenAIEmbeddings()
    vector_store_path = "statics/vdb"

    vdb = Chroma(
        embedding_function=embeddings,
        persist_directory=vector_store_path
    )

    retriever = vdb.as_retriever(
        search_type="similarity",
        search_kwargs={"k": 10}
    )

    results = retriever.invoke(
        query,
        k=10,
    )

    all_persons = get_all_persons()

    retrieved_person: List[Person] = []
    for r in results:
        name = r.metadata["name"]
        pearson = next(p for p in all_persons if p.name == name)

        retrieved_person.append(pearson)

    data_for_rerank = [
        (f"{p.age}歳({p.gender})の", p) for p in retrieved_person
    ]

    reranked = model.rank(
        query,
        list(map(lambda x: x[0], data_for_rerank),)
    )

    res = []
    for r in reranked:
        corpus_id = r['corpus_id']

        person = data_for_rerank[corpus_id][1]
        res.append(person)

    return res
