import re
from typing import Dict, Set, List, Tuple, Optional


class SkillAliasTable:
    """
    CareerPilot Skill Alias Normalization & Adjacency Taxonomy Engine.
    Standardizes heterogeneous skill representations across resumes and job descriptions,
    enabling 3-tier semantic matching: Exact (1.0), Adjacent (0.6), and Missing (0.0).
    """

    # Canonical Alias Dictionary (Heterogeneous spelling -> Canonical token)
    ALIASES: Dict[str, str] = {
        # Frontend & Reactive UI
        "reactjs": "react",
        "react.js": "react",
        "react-js": "react",
        "vuejs": "vue",
        "vue.js": "vue",
        "vue-js": "vue",
        "angularjs": "angular",
        "angular.js": "angular",
        "angular 2+": "angular",
        "nextjs": "nextjs",
        "next.js": "nextjs",
        "nuxtjs": "nuxtjs",
        "nuxt.js": "nuxtjs",
        "sveltejs": "svelte",
        "svelte.js": "svelte",
        "html5": "html",
        "css3": "css",
        "tailwind": "tailwindcss",
        "tailwind css": "tailwindcss",
        "bootstrap 5": "bootstrap",

        # Programming Languages
        "js": "javascript",
        "vanilla js": "javascript",
        "ecmascript": "javascript",
        "ts": "typescript",
        "py": "python",
        "python3": "python",
        "python 3": "python",
        "golang": "go",
        "c++": "cpp",
        "c plus plus": "cpp",
        "c#": "csharp",
        "c sharp": "csharp",

        # Backend Frameworks
        "fastapi": "fastapi",
        "fast-api": "fastapi",
        "django rest framework": "drf",
        "django-rest-framework": "drf",
        "django rf": "drf",
        "nodejs": "nodejs",
        "node.js": "nodejs",
        "node": "nodejs",
        "expressjs": "express",
        "express.js": "express",
        "nestjs": "nestjs",
        "nest.js": "nestjs",
        "spring boot": "springboot",
        "spring-boot": "springboot",
        "laravel framework": "laravel",

        # Databases & Storage
        "postgres": "postgresql",
        "psql": "postgresql",
        "postgre sql": "postgresql",
        "mongo": "mongodb",
        "mongo db": "mongodb",
        "redis cache": "redis",
        "elasticsearch": "elastic",
        "elastic search": "elastic",
        "mysql db": "mysql",

        # DevOps, Cloud & Containers
        "k8s": "kubernetes",
        "kube": "kubernetes",
        "docker container": "docker",
        "docker-compose": "docker",
        "docker compose": "docker",
        "amazon web services": "aws",
        "google cloud platform": "gcp",
        "google cloud": "gcp",
        "microsoft azure": "azure",
        "ci/cd": "cicd",
        "ci-cd": "cicd",
        "continuous integration": "cicd",
        "github actions": "github-actions",

        # Architecture & Messaging
        "rest apis": "rest-api",
        "rest api": "rest-api",
        "restful api": "rest-api",
        "restful": "rest-api",
        "rest": "rest-api",
        "graphql api": "graphql",
        "apache kafka": "kafka",
        "rabbitmq": "rabbitmq",
        "celery worker": "celery",

        # AI / ML
        "machine learning": "machine-learning",
        "ml": "machine-learning",
        "deep learning": "deep-learning",
        "dl": "deep-learning",
        "natural language processing": "nlp",
        "large language models": "llm",
        "large language model": "llm",
        "llms": "llm",
        "computer vision": "computer-vision",
        "cv": "computer-vision",
        "pytorch": "pytorch",
        "tensorflow": "tensorflow",
    }

    # Skill Adjacency Graph (Equivalent / Substitute tech stacks -> Credit 0.6)
    ADJACENCY_CLUSTERS: List[Set[str]] = [
        # Python Web
        {"fastapi", "django", "drf", "flask"},
        # Frontend Frameworks
        {"react", "vue", "angular", "svelte", "nextjs"},
        # Node Backends
        {"nodejs", "express", "nestjs", "koa"},
        # Relational Databases
        {"postgresql", "mysql", "sqlite", "mariadb"},
        # Document NoSQL
        {"mongodb", "couchdb", "dynamodb"},
        # Container Orchestration & Tooling
        {"docker", "kubernetes", "podman", "containerd"},
        # Cloud Providers
        {"aws", "gcp", "azure"},
        # Messaging & Queues
        {"kafka", "rabbitmq", "redis", "celery", "sqs"},
        # Modern CSS
        {"tailwindcss", "bootstrap", "sass", "styled-components"},
        # Core Languages (Object Oriented)
        {"java", "csharp", "cpp"},
        # Dynamic Scripting
        {"python", "ruby", "javascript"},
    ]

    @classmethod
    def clean(cls, text: str) -> str:
        """Strip punctuation and lowercase text."""
        return re.sub(r"[^\w\+\#\.\-]", " ", text.lower()).strip()

    @classmethod
    def normalize(cls, skill: str) -> str:
        """Normalizes a raw skill string into its canonical identifier."""
        cleaned = cls.clean(skill)
        # Check direct alias
        if cleaned in cls.ALIASES:
            return cls.ALIASES[cleaned]
        # Check single-word lowercase
        single = cleaned.replace(" ", "")
        if single in cls.ALIASES:
            return cls.ALIASES[single]
        return cleaned

    @classmethod
    def are_adjacent(cls, skill_a: str, skill_b: str) -> bool:
        """Checks if two distinct canonical skills belong to the same functional cluster."""
        norm_a = cls.normalize(skill_a)
        norm_b = cls.normalize(skill_b)
        if norm_a == norm_b:
            return True
        for cluster in cls.ADJACENCY_CLUSTERS:
            if norm_a in cluster and norm_b in cluster:
                return True
        return False

    @classmethod
    def evaluate_skill_match(
        cls, candidate_skills: List[str], target_skill: str
    ) -> Tuple[str, float, Optional[str]]:
        """
        CareerPilot 3-Tier Matcher:
        1. Exact match (1.0 credit): e.g. JD wants FastAPI, resume has FastAPI
        2. Adjacent match (0.6 credit): e.g. JD wants Django, resume has FastAPI
        3. Missing (0.0 credit): e.g. JD wants Kubernetes, resume has none
        Returns (level, credit, matched_candidate_skill).
        """
        target_norm = cls.normalize(target_skill)

        # 1. Check for Exact Match
        for c_skill in candidate_skills:
            if cls.normalize(c_skill) == target_norm:
                return "exact", 1.0, c_skill

        # 2. Check for Adjacent Substitute Match
        for c_skill in candidate_skills:
            if cls.are_adjacent(c_skill, target_skill):
                return "adjacent", 0.6, c_skill

        # 3. Missing
        return "missing", 0.0, None
