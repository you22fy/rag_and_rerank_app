from pydantic import BaseModel
from typing import Optional


class Person(BaseModel):
    name: str
    introduction: str
    gender: str
    age: int
