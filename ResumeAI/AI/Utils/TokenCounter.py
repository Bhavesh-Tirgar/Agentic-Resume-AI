from langchain_core.callbacks import BaseCallbackHandler


class TokenCounter(BaseCallbackHandler):
    """
    Reusable callback for tracking Gemini token usage.
    """

    def __init__(self, agent_name="Unknown Agent"):
        super().__init__()
        self.agent_name = agent_name

        self.prompt_tokens = 0
        self.output_tokens = 0
        self.total_tokens = 0

    def on_llm_end(self, response, **kwargs):

        try:
            generations = response.generations

            if not generations:
                return

            generation = generations[0][0]
            message = generation.message

            usage = getattr(message, "usage_metadata", {}) or {}

            self.prompt_tokens = usage.get("input_tokens", 0)
            self.output_tokens = usage.get("output_tokens", 0)
            self.total_tokens = usage.get("total_tokens", 0)

            print()
            print("========================================")
            print("          GEMINI TOKEN USAGE")
            print("========================================")
            print(f"Agent           : {self.agent_name}")
            print(f"Prompt Tokens   : {self.prompt_tokens}")
            print(f"Output Tokens   : {self.output_tokens}")
            print("----------------------------------------")
            print(f"Total Tokens    : {self.total_tokens}")
            print("========================================")
            print()

        except Exception as e:
            print(f"Token usage error: {e}")