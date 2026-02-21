"""
pAIr v4 — Policy Diff Engine
===============================
Compares two versions of a policy/regulation to produce a structured
diff highlighting what changed, what's new, and what was removed.

Architecture
------------
    OldPolicy  ─┐
                 ├── TextNormalizer → SectionSplitter → DiffComputer → StructuredDiff
    NewPolicy  ─┘

Output
------
    PolicyDiff = {
        sections_added:     List[DiffSection],
        sections_removed:   List[DiffSection],
        sections_modified:  List[DiffSection],
        penalty_changes:    List[PenaltyDiff],
        deadline_changes:   List[DeadlineDiff],
        summary:            str,
        severity:           MAJOR | MINOR | COSMETIC,
    }

Use Cases
---------
1. Compare old vs new version of a GST notification
2. Track changes in MSME scheme guidelines year-over-year
3. Highlight penalty increases/decreases
4. Detect deadline shifts
"""

from __future__ import annotations

import difflib
import hashlib
import re
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional, Tuple


# ── Enums ────────────────────────────────────────────────────────────────

class DiffSeverity(str, Enum):
    MAJOR = "MAJOR"       # Penalty/deadline/obligation changes
    MINOR = "MINOR"       # Wording changes with potential impact
    COSMETIC = "COSMETIC" # Formatting/numbering changes only


class ChangeAction(str, Enum):
    ADDED = "ADDED"
    REMOVED = "REMOVED"
    MODIFIED = "MODIFIED"
    UNCHANGED = "UNCHANGED"


# ── Data Models ──────────────────────────────────────────────────────────

@dataclass
class DiffSection:
    """A single section-level diff."""
    section_id: str
    section_title: str
    action: ChangeAction
    old_text: str = ""
    new_text: str = ""
    change_summary: str = ""
    similarity_ratio: float = 0.0  # 0.0 = completely different, 1.0 = identical


@dataclass
class PenaltyDiff:
    """Change in a penalty or fine amount."""
    obligation: str
    old_penalty: str
    new_penalty: str
    direction: str  # INCREASED / DECREASED / NEW / REMOVED
    estimated_change_inr: float = 0.0


@dataclass
class DeadlineDiff:
    """Change in a compliance deadline."""
    obligation: str
    old_deadline: str
    new_deadline: str
    direction: str  # EXTENDED / SHORTENED / NEW / REMOVED
    days_change: int = 0


@dataclass
class PolicyDiff:
    """Complete structured diff between two policy versions."""
    diff_id: str
    old_policy_name: str
    new_policy_name: str
    overall_severity: DiffSeverity
    total_sections: int
    sections_added: List[DiffSection]
    sections_removed: List[DiffSection]
    sections_modified: List[DiffSection]
    sections_unchanged: int
    penalty_changes: List[PenaltyDiff]
    deadline_changes: List[DeadlineDiff]
    summary: str
    change_percentage: float  # % of content that changed
    generated_at: str


# ── Text Processing ─────────────────────────────────────────────────────

class TextNormalizer:
    """Normalizes policy text for consistent comparison."""

    @staticmethod
    def normalize(text: str) -> str:
        """Clean and normalize policy text."""
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        # Normalize common variations
        text = text.replace('\u2018', "'").replace('\u2019', "'")
        text = text.replace('\u201c', '"').replace('\u201d', '"')
        text = text.replace('\u2013', '-').replace('\u2014', '-')
        # Remove page numbers
        text = re.sub(r'\bPage \d+ of \d+\b', '', text, flags=re.IGNORECASE)
        return text.strip()

    @staticmethod
    def split_sections(text: str) -> List[Tuple[str, str]]:
        """
        Split policy text into titled sections.
        Returns list of (section_title, section_content) tuples.
        """
        # Pattern matches: numbered sections, Roman numerals, article headers
        section_pattern = re.compile(
            r'(?:^|\n)'
            r'(?:'
            r'(?:Section|Art(?:icle)?|Clause|Rule|Part|Schedule|Chapter)\s*[\d.]+[:\.\s]+'
            r'|(?:\d+[\.\)]\s+)'
            r'|(?:[IVXLC]+[\.\)]\s+)'
            r'|(?:[A-Z][A-Z\s]{5,}(?:\n|\:))'  # ALL-CAPS headers
            r')',
            re.MULTILINE | re.IGNORECASE,
        )

        matches = list(section_pattern.finditer(text))

        if not matches:
            # No sections found — treat entire text as one section
            return [("Full Document", text)]

        sections = []
        for i, match in enumerate(matches):
            start = match.start()
            end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
            header_text = match.group().strip()
            body = text[start:end].strip()

            # Extract title from first line
            first_line = body.split('\n')[0].strip()[:80]
            sections.append((first_line or f"Section {i+1}", body))

        return sections


# ── Diff Engine ──────────────────────────────────────────────────────────

class PolicyDiffEngine:
    """
    Computes structured diffs between two policy document versions.

    Usage
    -----
        engine = PolicyDiffEngine()
        diff = engine.compute_diff(
            old_text="... old policy text ...",
            new_text="... new policy text ...",
            old_name="GST Notification 2024",
            new_name="GST Notification 2025",
        )
    """

    # Penalty-related keywords for detection
    PENALTY_PATTERNS = [
        re.compile(r'(?:penalty|fine|fee)\s*(?:of|:)?\s*(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d+)?)', re.I),
        re.compile(r'(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d+)?)\s*(?:per day|per month|crore|lakh)', re.I),
        re.compile(r'imprisonment\s+(?:for|of|up\s+to)\s+([\w\s]+)', re.I),
    ]

    # Deadline-related keywords
    DEADLINE_PATTERNS = [
        re.compile(r'(?:deadline|due date|last date|effective from)\s*(?::|is|:-)?\s*(\d{1,2}[\s/-]\w+[\s/-]\d{2,4})', re.I),
        re.compile(r'(?:within|before)\s+(\d+)\s+(?:days|months|weeks)', re.I),
        re.compile(r'(?:w\.?e\.?f\.?|with effect from)\s*(\d{1,2}[\s/-]\w+[\s/-]\d{2,4})', re.I),
    ]

    def compute_diff(
        self,
        old_text: str,
        new_text: str,
        old_name: str = "Previous Version",
        new_name: str = "Current Version",
    ) -> PolicyDiff:
        """
        Compute a structured diff between two policy versions.

        Parameters
        ----------
        old_text : str
            Full text of the old/previous policy version.
        new_text : str
            Full text of the new/current policy version.
        old_name : str
            Display name for the old version.
        new_name : str
            Display name for the new version.
        """
        # Normalize
        old_norm = TextNormalizer.normalize(old_text)
        new_norm = TextNormalizer.normalize(new_text)

        # Split into sections
        old_sections = TextNormalizer.split_sections(old_norm)
        new_sections = TextNormalizer.split_sections(new_norm)

        # Compute section-level diffs
        added, removed, modified, unchanged = self._diff_sections(
            old_sections, new_sections
        )

        # Detect penalty changes
        penalty_changes = self._detect_penalty_changes(old_norm, new_norm)

        # Detect deadline changes
        deadline_changes = self._detect_deadline_changes(old_norm, new_norm)

        # Compute overall severity
        severity = self._compute_severity(added, removed, modified, penalty_changes, deadline_changes)

        # Compute change percentage
        total_sections = len(old_sections) + len(new_sections)
        changed_sections = len(added) + len(removed) + len(modified)
        change_pct = (changed_sections / max(total_sections, 1)) * 100

        # Generate summary
        summary = self._generate_summary(
            added, removed, modified, unchanged,
            penalty_changes, deadline_changes, severity
        )

        diff_id = hashlib.sha256(
            f"{old_name}:{new_name}:{datetime.utcnow().isoformat()}".encode()
        ).hexdigest()[:16]

        return PolicyDiff(
            diff_id=f"diff_{diff_id}",
            old_policy_name=old_name,
            new_policy_name=new_name,
            overall_severity=severity,
            total_sections=max(len(old_sections), len(new_sections)),
            sections_added=added,
            sections_removed=removed,
            sections_modified=modified,
            sections_unchanged=unchanged,
            penalty_changes=penalty_changes,
            deadline_changes=deadline_changes,
            summary=summary,
            change_percentage=round(change_pct, 1),
            generated_at=datetime.utcnow().isoformat(),
        )

    # ── Section Diffing ──────────────────────────────────────────────

    def _diff_sections(
        self,
        old_sections: List[Tuple[str, str]],
        new_sections: List[Tuple[str, str]],
    ) -> Tuple[List[DiffSection], List[DiffSection], List[DiffSection], int]:
        """Compare sections between old and new versions."""
        added: List[DiffSection] = []
        removed: List[DiffSection] = []
        modified: List[DiffSection] = []
        unchanged = 0

        old_dict = {title: content for title, content in old_sections}
        new_dict = {title: content for title, content in new_sections}

        old_titles = set(old_dict.keys())
        new_titles = set(new_dict.keys())

        # Sections only in new
        for title in new_titles - old_titles:
            # Try fuzzy match
            best_match, best_ratio = self._find_best_match(title, old_titles)
            if best_ratio > 0.6:
                # This is a renamed/modified section
                modified.append(DiffSection(
                    section_id=f"mod_{hashlib.md5(title.encode()).hexdigest()[:8]}",
                    section_title=title,
                    action=ChangeAction.MODIFIED,
                    old_text=old_dict[best_match][:500],
                    new_text=new_dict[title][:500],
                    change_summary=f"Section renamed/modified from '{best_match[:50]}'",
                    similarity_ratio=best_ratio,
                ))
                old_titles.discard(best_match)
            else:
                added.append(DiffSection(
                    section_id=f"add_{hashlib.md5(title.encode()).hexdigest()[:8]}",
                    section_title=title,
                    action=ChangeAction.ADDED,
                    new_text=new_dict[title][:500],
                    change_summary=f"New section added: {title[:60]}",
                ))

        # Sections only in old (after fuzzy matching)
        for title in old_titles - new_titles:
            removed.append(DiffSection(
                section_id=f"rem_{hashlib.md5(title.encode()).hexdigest()[:8]}",
                section_title=title,
                action=ChangeAction.REMOVED,
                old_text=old_dict[title][:500],
                change_summary=f"Section removed: {title[:60]}",
            ))

        # Sections in both
        for title in old_titles & new_titles:
            old_content = old_dict[title]
            new_content = new_dict[title]
            ratio = difflib.SequenceMatcher(None, old_content, new_content).ratio()

            if ratio >= 0.98:
                unchanged += 1
            else:
                # Generate change summary
                diff_lines = list(difflib.unified_diff(
                    old_content.split('\n'),
                    new_content.split('\n'),
                    lineterm='',
                    n=1,
                ))
                change_count = sum(1 for l in diff_lines if l.startswith('+') or l.startswith('-'))

                modified.append(DiffSection(
                    section_id=f"mod_{hashlib.md5(title.encode()).hexdigest()[:8]}",
                    section_title=title,
                    action=ChangeAction.MODIFIED,
                    old_text=old_content[:500],
                    new_text=new_content[:500],
                    change_summary=f"{change_count} lines changed ({(1-ratio)*100:.0f}% modified)",
                    similarity_ratio=ratio,
                ))

        return added, removed, modified, unchanged

    def _find_best_match(
        self, title: str, candidates: set
    ) -> Tuple[str, float]:
        """Find the best fuzzy match for a section title."""
        best_match = ""
        best_ratio = 0.0

        for candidate in candidates:
            ratio = difflib.SequenceMatcher(None, title.lower(), candidate.lower()).ratio()
            if ratio > best_ratio:
                best_ratio = ratio
                best_match = candidate

        return best_match, best_ratio

    # ── Penalty Detection ────────────────────────────────────────────

    def _detect_penalty_changes(
        self, old_text: str, new_text: str
    ) -> List[PenaltyDiff]:
        """Detect changes in penalty amounts between versions."""
        changes = []

        old_penalties = self._extract_penalties(old_text)
        new_penalties = self._extract_penalties(new_text)

        # Compare
        all_obligations = set(old_penalties.keys()) | set(new_penalties.keys())
        for obligation in all_obligations:
            old_val = old_penalties.get(obligation, "")
            new_val = new_penalties.get(obligation, "")

            if old_val and not new_val:
                changes.append(PenaltyDiff(
                    obligation=obligation,
                    old_penalty=old_val,
                    new_penalty="(removed)",
                    direction="REMOVED",
                ))
            elif new_val and not old_val:
                changes.append(PenaltyDiff(
                    obligation=obligation,
                    old_penalty="(none)",
                    new_penalty=new_val,
                    direction="NEW",
                ))
            elif old_val != new_val:
                old_amount = self._parse_inr(old_val)
                new_amount = self._parse_inr(new_val)
                direction = "INCREASED" if new_amount > old_amount else "DECREASED"
                changes.append(PenaltyDiff(
                    obligation=obligation,
                    old_penalty=old_val,
                    new_penalty=new_val,
                    direction=direction,
                    estimated_change_inr=new_amount - old_amount,
                ))

        return changes

    def _extract_penalties(self, text: str) -> Dict[str, str]:
        """Extract penalty amounts from text with their context."""
        penalties = {}
        for pattern in self.PENALTY_PATTERNS:
            for match in pattern.finditer(text):
                # Get surrounding context as the obligation name
                start = max(0, match.start() - 100)
                context = text[start:match.start()].strip()
                # Extract last meaningful phrase as obligation
                words = context.split()[-5:]
                obligation = " ".join(words).strip(" .,;:")
                if obligation:
                    penalties[obligation] = match.group(0)

        return penalties

    # ── Deadline Detection ───────────────────────────────────────────

    def _detect_deadline_changes(
        self, old_text: str, new_text: str
    ) -> List[DeadlineDiff]:
        """Detect changes in compliance deadlines between versions."""
        changes = []

        old_deadlines = self._extract_deadlines(old_text)
        new_deadlines = self._extract_deadlines(new_text)

        all_obligations = set(old_deadlines.keys()) | set(new_deadlines.keys())
        for obligation in all_obligations:
            old_val = old_deadlines.get(obligation, "")
            new_val = new_deadlines.get(obligation, "")

            if old_val and not new_val:
                changes.append(DeadlineDiff(
                    obligation=obligation,
                    old_deadline=old_val,
                    new_deadline="(removed)",
                    direction="REMOVED",
                ))
            elif new_val and not old_val:
                changes.append(DeadlineDiff(
                    obligation=obligation,
                    old_deadline="(none)",
                    new_deadline=new_val,
                    direction="NEW",
                ))
            elif old_val != new_val:
                changes.append(DeadlineDiff(
                    obligation=obligation,
                    old_deadline=old_val,
                    new_deadline=new_val,
                    direction="CHANGED",
                ))

        return changes

    def _extract_deadlines(self, text: str) -> Dict[str, str]:
        """Extract deadlines from text with context."""
        deadlines = {}
        for pattern in self.DEADLINE_PATTERNS:
            for match in pattern.finditer(text):
                start = max(0, match.start() - 80)
                context = text[start:match.start()].strip()
                words = context.split()[-4:]
                obligation = " ".join(words).strip(" .,;:")
                if obligation:
                    deadlines[obligation] = match.group(1) if match.groups() else match.group(0)
        return deadlines

    # ── Severity & Summary ───────────────────────────────────────────

    def _compute_severity(
        self,
        added: List[DiffSection],
        removed: List[DiffSection],
        modified: List[DiffSection],
        penalty_changes: List[PenaltyDiff],
        deadline_changes: List[DeadlineDiff],
    ) -> DiffSeverity:
        """Determine overall diff severity."""
        if penalty_changes or deadline_changes:
            return DiffSeverity.MAJOR
        if len(added) + len(removed) > 2 or len(modified) > 3:
            return DiffSeverity.MAJOR
        if added or removed or modified:
            return DiffSeverity.MINOR
        return DiffSeverity.COSMETIC

    def _generate_summary(
        self,
        added: List[DiffSection],
        removed: List[DiffSection],
        modified: List[DiffSection],
        unchanged: int,
        penalty_changes: List[PenaltyDiff],
        deadline_changes: List[DeadlineDiff],
        severity: DiffSeverity,
    ) -> str:
        """Generate human-readable diff summary."""
        parts = [f"Policy Diff Summary ({severity.value}):"]

        if added:
            parts.append(f"  + {len(added)} section(s) added")
        if removed:
            parts.append(f"  - {len(removed)} section(s) removed")
        if modified:
            parts.append(f"  ~ {len(modified)} section(s) modified")
        if unchanged:
            parts.append(f"  = {unchanged} section(s) unchanged")

        if penalty_changes:
            increased = [p for p in penalty_changes if p.direction == "INCREASED"]
            decreased = [p for p in penalty_changes if p.direction == "DECREASED"]
            if increased:
                parts.append(f"  ⚠ {len(increased)} penalty increase(s)")
            if decreased:
                parts.append(f"  ✓ {len(decreased)} penalty decrease(s)")

        if deadline_changes:
            parts.append(f"  📅 {len(deadline_changes)} deadline change(s)")

        return "\n".join(parts)

    # ── Helpers ──────────────────────────────────────────────────────

    @staticmethod
    def _parse_inr(text: str) -> float:
        """Parse INR amount from text."""
        cleaned = re.sub(r'[^\d.]', '', text.replace(',', ''))
        try:
            amount = float(cleaned) if cleaned else 0.0
        except ValueError:
            amount = 0.0

        lower = text.lower()
        if 'crore' in lower or 'cr' in lower:
            amount *= 1_00_00_000
        elif 'lakh' in lower or 'lac' in lower:
            amount *= 1_00_000
        elif 'thousand' in lower or 'k' in lower:
            amount *= 1_000

        return amount
