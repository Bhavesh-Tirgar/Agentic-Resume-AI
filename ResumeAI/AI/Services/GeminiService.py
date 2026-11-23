import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
load_dotenv(os.path.join(BASE_DIR, ".env"))
load_dotenv()


class GeminiService:
    """
    Centralized Gemini LLM service.
    Configures LangChain Gemini with reliable, high-quota model defaults.
    """

    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        model = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in .env")

        self.model = model

        self.llm = ChatGoogleGenerativeAI(
            model=model,
            google_api_key=api_key,
            max_retries=2,
        )

    def get_llm(self) -> ChatGoogleGenerativeAI:
        return self.llm

    def get_structured_llm(self, schema):
        return self.llm.with_structured_output(schema)
