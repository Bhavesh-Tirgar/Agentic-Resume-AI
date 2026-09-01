from pydantic import BaseModel, Field
from typing import List


class InterviewQuestion(BaseModel):
    question: str
    category: str
    difficulty: str
    reason: str


class InterviewRound(BaseModel):
    round_number: int
    round_name: str
    objective: str
    questions: List[InterviewQuestion]


class InterviewPlanSchema(BaseModel):
    target_job: str

    interview_type: str

    overall_difficulty: str

    focus_areas: List[str] = Field(default_factory=list)

    rounds: List[InterviewRound] = Field(default_factory=list)