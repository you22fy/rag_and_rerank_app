from fastapi import APIRouter, Query
from typing import List, Optional
from schemas.person import Person
from crud.person import get_all_persons, search_persons, rag_search

router = APIRouter()


@router.get("/persons", response_model=List[Person], summary="全件取得")
def read_all_persons():
    return get_all_persons()


@router.get("/persons/search", response_model=List[Person], summary="条件検索")
def search_person_endpoint(name: Optional[str] = Query(None, description="検索したい名前")):
    print(f"{name=}")
    ret = search_persons(name=name)
    return ret


@router.get("/persons/rag_search", response_model=List[Person], summary="RAG検索")
def rag_search_endpoint(query: str = Query(..., description="検索したいクエリ")):
    ret = rag_search(query)
    return ret
