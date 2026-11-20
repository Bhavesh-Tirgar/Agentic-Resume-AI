from django.db import transaction
from AI.Graphs.ResumeGraph import run_resume_graph

from rest_framework.response import Response
from rest_framework import status

from AI.Models.ResumeParserResult import ResumeParserResult
from AI.Models.ResumeAnalysisResult import ResumeAnalysisResult
from AI.Models.ResumeScoreResult import ResumeScoreResult



class ResumeProcessingService:
   
    @staticmethod
    @transaction.atomic
    def process(resume):
        # Step 1: Check extracted text
        if not resume.extracted_text or not resume.extracted_text.strip():
            raise ValueError("Resume extracted text not found. Please upload a valid resume PDF.")

        # Step 2: Run complete LangGraph
        try:
            result = run_resume_graph(resume.extracted_text)
        except Exception as exc:
            raise RuntimeError(
                f"Resume AI processing failed: {str(exc)}"
            ) from exc

        # Step 3: Get graph results
        parsed_resume = result.get("parsed_resume")
        analysis = result.get("analysis")
        score = result.get("score")

        if parsed_resume is None:
            raise RuntimeError("Resume parser did not return a valid result.")

        if analysis is None:
            raise RuntimeError("Resume analysis did not return a valid result.")

        if score is None:
            raise RuntimeError("Resume scoring did not return a valid result.")
            

        # Step 4: Save parser result

        parser_result, parser_created = (
            ResumeParserResult.objects.update_or_create(
                resume=resume,
                defaults={
                    "parsed_data": parsed_resume.model_dump()
                }
            )
        )

        # Step 5: Save analysis result

        analysis_result, analysis_created = (
            ResumeAnalysisResult.objects.update_or_create(
                resume=resume,
                defaults={
                    "analysis_data": analysis.model_dump()
                }
            )
        )

        # Step 8: Save score result

        score_result, score_created = (
            ResumeScoreResult.objects.update_or_create(
                resume=resume,
                defaults={
                    "score_data": score.model_dump()
                }
            )
        )

        # Step 6: Return results

        return {
            "parser_result": parser_result,
            "analysis_result": analysis_result,
            "parser_created": parser_created,
            "analysis_created": analysis_created,
            "score_result": score_result,
            "score_created": score_created
        }