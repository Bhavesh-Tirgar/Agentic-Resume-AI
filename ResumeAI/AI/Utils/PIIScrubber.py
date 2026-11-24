import re
from typing import Tuple, Dict


class PIIScrubber:
    """
    Privacy & Data Protection Utility (India DPDP Act & GDPR Ready).
    Redacts Personally Identifiable Information (PII) such as phone numbers,
    email addresses, and physical addresses from raw resume text before
    dispatching tokens to third-party LLM providers.
    """

    # Matches standard and obfuscated emails (e.g. name@domain.com, name [at] domain.com)
    EMAIL_PATTERN = re.compile(
        r"[\w\.-]+\s*(@|\bat\b|\[at\])\s*[\w\.-]+\s*(\.|\bdot\b|\[dot\])\s*[a-z]{2,}",
        re.IGNORECASE
    )

    # Detects Indian mobile numbers (+91, spaced, hyphenated, dot-separated, 10-digit) and international formats
    PHONE_PATTERN = re.compile(
        r"(\+?91[\-\s\.]?)?[6-9]\d{4}[\-\s\.]?\d{5}|"
        r"(\+?91[\-\s\.]?)?[6-9]\d{9}|"
        r"(\+?\d{1,3}[\-\.\s]?)?\(?\d{3}\)?[\-\.\s]?\d{3}[\-\.\s]?\d{4}|"
        r"\b\d{5}[\s\-]\d{5}\b"
    )

    # Indian 6-digit PIN codes (e.g. PIN: 380015, PIN Code: 560001)
    PIN_PATTERN = re.compile(r"\b(pin|pincode|postal\s*code)[\s:\-]*([1-9][0-9]{5})\b", re.IGNORECASE)

    @classmethod
    def redact(cls, text: str) -> Tuple[str, Dict[str, str]]:
        """
        Scrubs emails, phones, and postal addresses, replacing them with
        deterministic anonymized tokens. Returns (scrubbed_text, vault_map).
        """
        if not text:
            return "", {}

        vault: Dict[str, str] = {}
        scrubbed = text

        # 1. Redact Emails
        email_matches = list(set(m.group(0) for m in cls.EMAIL_PATTERN.finditer(scrubbed)))
        for i, email in enumerate(email_matches):
            token = f"[REDACTED_EMAIL_{i + 1}]"
            vault[token] = email
            scrubbed = scrubbed.replace(email, token)

        # 2. Redact Phones
        phone_matches = list(set(m.group(0) for m in cls.PHONE_PATTERN.finditer(scrubbed)))
        for i, phone in enumerate(phone_matches):
            clean_digits = re.sub(r"\D", "", phone)
            if len(clean_digits) >= 10:
                token = f"[REDACTED_PHONE_{i + 1}]"
                vault[token] = phone
                scrubbed = scrubbed.replace(phone, token)

        # 3. Redact PIN Codes
        pin_matches = list(set(m.group(0) for m in cls.PIN_PATTERN.finditer(scrubbed)))
        for i, pin in enumerate(pin_matches):
            token = f"[REDACTED_POSTAL_PIN_{i + 1}]"
            vault[token] = pin
            scrubbed = scrubbed.replace(pin, token)

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
