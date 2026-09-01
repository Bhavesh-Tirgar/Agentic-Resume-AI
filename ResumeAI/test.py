from AI.Schemas.InterviewPlanSchema import (
    InterviewPlanSchema
)


test_data = {
    "target_job": "Python Backend Developer",

    "interview_type": "Technical + Behavioral",

    "overall_difficulty": "Intermediate",

    "difficulty": "Easy",

    "focus_areas": [
        "Python",
        "Django",
        "Django REST Framework",
        "PostgreSQL"
    ],

    "rounds": [
        {
            "round_number": 1,

            "round_name": "Python Fundamentals",

            "objective": "Evaluate Python fundamentals.",

            "questions": [
                {
                    "question": "What is the difference between a list and a tuple in Python?",

                    "category": "Technical",

                    "difficulty": "Easy",
                    "reason": "Python is an important skill for the target role."
                }
            ]
        }
    ]
}


plan = InterviewPlanSchema.model_validate(test_data)

print(plan)
print("\nSchema validation successful!")