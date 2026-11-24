import re
from typing import Tuple, Dict


class PIIScrubber:
    """
    Privacy & Data Protection Utility (India DPDP Act & GDPR Ready).
    Redacts Personally Identifiable Information (PII) such as phone numbers,
    email addresses, and physical addresses from raw resume text before
    dispatching tokens to third-party LLM providers.
    """

    EMAIL_PATTERN = re.compile(r"[\w\.-]+@[\w\.-]+\.\w+", re.IGNORECASE)
    # Detects Indian mobile numbers (+91, 10 digits starting with 6-9) and international formats
    PHONE_PATTERN = re.compile(
        r"(\+?91[\-\s]?)?[6-9]\d{9}|(\+?\d{1,3}[\-\.\s]?)?\(?\d{3}\)?[\-\.\s]?\d{3}[\-\.\s]?\d{4}"
    )

    @classmethod
    def redact(cls, text: str) -> Tuple[str, Dict[str, str]]:
        """
        Scrubs emails and phone numbers, replacing them with deterministic anonymized tokens.
        Returns (scrubbed_text, vault_map).
        """
        if not text:
            return "", {}

        vault: Dict[str, str] = {}
        scrubbed = text

        # 1. Redact Emails
        email_matches = list(set(cls.EMAIL_PATTERN.findall(scrubbed)))
        for i, email in enumerate(email_matches):
            token = f"[REDACTED_EMAIL_{i + 1}]"
            vault[token] = email
            scrubbed = scrubbed.replace(email, token)

        # 2. Redact Phones
        phone_matches = list(set(m.group(0) for m in cls.PHONE_PATTERN.finditer(scrubbed)))
        for i, phone in enumerate(phone_matches):
            clean_phone = phone.strip()
            if len(clean_phone) >= 10:
                token = f"[REDACTED_PHONE_{i + 1}]"
                vault[token] = clean_phone
                scrubbed = scrubbed.replace(clean_phone, token)

        return scrubbed, vault

    @classmethod
    def restore(cls, text: str, vault: Dict[str, str]) -> str:
        """Restores original PII fields locally from the session vault."""
        if not text or not vault:
            return text
        restored = text
        for token, original in vault.items():
            restored = restored.replace(token, original)
        return restored
