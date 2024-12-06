import pandas as pd

from dotenv import load_dotenv
from langchain_chroma import Chroma
from langchain_community.document_loaders import TextLoader
from langchain_openai import OpenAIEmbeddings
import os
from dotenv import load_dotenv
from langchain_core.documents import Document

load_dotenv()

apiKey = os.getenv('OPENAI_API_KEY')


def create_vdb():
    df = pd.read_csv('../statics/db.csv')
    print(df)
    docs = []

    for _, r in df.iterrows():
        introduction = r['introduction']
        gender = r['gender']
        age = r['age']

        knowledge = f"{age}歳({gender})の{r['name']}さんです。自己紹介は{introduction}です。"
        d = Document(
            knowledge, metadata={
                "name": r['name'],
            })
        docs.append(d)
    embeddings = OpenAIEmbeddings()

    Chroma.from_documents(
        documents=docs, embedding=embeddings, persist_directory='../statics'
    )


if __name__ == '__main__':
    create_vdb()
