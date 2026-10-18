import re
from typing import List, Set, Dict
import io

# Common tech aliases mapped to standardized skill names
SKILL_ALIASES: Dict[str, str] = {
    "js": "javascript",
    "javascript": "javascript",
    "react": "react",
    "reactjs": "react",
    "react.js": "react",
    "node": "node.js",
    "nodejs": "node.js",
    "node.js": "node.js",
    "express": "express",
    "expressjs": "express",
    "express.js": "express",
    "ts": "typescript",
    "typescript": "typescript",
    "python": "python",
    "py": "python",
    "python3": "python",
    "postgres": "postgresql",
    "postgresql": "postgresql",
    "psql": "postgresql",
    "mongo": "mongodb",
    "mongodb": "mongodb",
    "aws": "amazon web services",
    "amazon web services": "amazon web services",
    "gcp": "google cloud",
    "google cloud platform": "google cloud",
    "k8s": "kubernetes",
    "kubernetes": "kubernetes",
    "docker": "docker",
    "rest": "rest api",
    "restful": "rest api",
    "rest api": "rest api",
    "graphql": "graphql",
    "html": "html",
    "html5": "html",
    "css": "css",
    "css3": "css",
    "tailwind": "tailwind css",
    "tailwindcss": "tailwind css",
    "ci/cd": "ci/cd",
    "cicd": "ci/cd",
    "git": "git",
    "github": "github",
    "java": "java",
    "c#": "c#",
    "c++": "c++",
    "golang": "golang",
    "go": "golang",
    "sql": "sql",
    "nosql": "nosql",
    "redis": "redis",
    "fastapi": "fastapi",
    "django": "django",
    "flask": "flask",
    "vue": "vue.js",
    "vuejs": "vue.js",
    "angular": "angular",
}

STOP_WORDS: Set[str] = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are",
    "aren't", "as", "at", "be", "because", "been", "before", "being", "below", "between", "both",
    "but", "by", "can", "can't", "cannot", "could", "couldn't", "did", "didn't", "do", "does",
    "doesn't", "doing", "don't", "down", "during", "each", "few", "for", "from", "further", "had",
    "hadn't", "has", "hasn't", "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her",
    "here", "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i", "i'd",
    "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself",
    "let's", "me", "more", "most", "mustn't", "my", "myself", "no", "nor", "not", "of", "off",
    "on", "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own",
    "same", "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such",
    "than", "that", "that's", "the", "their", "theirs", "them", "themselves", "then", "there",
    "there's", "these", "they", "they'd", "they'll", "they're", "they've", "this", "those", "through",
    "to", "too", "under", "until", "up", "very", "was", "wasn't", "we", "we'd", "we'll", "we're",
    "we've", "were", "weren't", "what", "what's", "when", "when's", "where", "where's", "which",
    "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would", "wouldn't", "you",
    "you'd", "you'll", "you're", "you've", "your", "yours", "yourself", "yourselves", "will", "looking",
    "experience", "years", "work", "working", "team", "strong", "skills", "ability", "candidate"
}

def normalize_text(text: str) -> str:
    """Lowercase and clean basic characters while keeping programming symbols (+, #, .) safe."""
    if not text:
        return ""
    return text.lower().strip()

def stem_token(w: str) -> str:
    """Lightweight heuristic suffix normalizer."""
    if w.endswith("ment") and len(w) > 6:
        return w[:-4]
    if w.endswith("ing") and len(w) > 5:
        return w[:-3]
    if w.endswith("ers") and len(w) > 5:
        return w[:-3]
    if w.endswith("er") and len(w) > 4:
        return w[:-2]
    if w.endswith("es") and len(w) > 4:
        return w[:-2]
    if w.endswith("s") and len(w) > 3 and not w.endswith("ss") and not w.endswith("js"):
        return w[:-1]
    return w

def tokenize(text: str, stem: bool = True) -> List[str]:
    """Tokenize text into distinct clean alphanumeric/programming tokens excluding stop words."""
    if not text:
        return []
    cleaned = normalize_text(text)
    raw_tokens = re.findall(r'[a-zA-Z0-9+#]+(?:\.[a-zA-Z0-9+#]+)*', cleaned)
    tokens = []
    for t in raw_tokens:
        if len(t) > 1 and t not in STOP_WORDS:
            tokens.append(t)
            if stem:
                stemmed = stem_token(t)
                if stemmed != t and len(stemmed) > 1:
                    tokens.append(stemmed)
    return tokens

def match_skill(skill: str, text: str) -> bool:
    """
    Case-insensitive matching of skill in text with alias normalization and word boundary checks.
    Guarantees 'java' does not match 'javascript'.
    """
    if not skill or not text:
        return False

    norm_skill = normalize_text(skill)
    norm_text = normalize_text(text)

    # Check canonical name and all known aliases
    canonical = SKILL_ALIASES.get(norm_skill, norm_skill)
    aliases_to_check = {norm_skill, canonical}
    for alias, standard in SKILL_ALIASES.items():
        if standard == canonical:
            aliases_to_check.add(alias)

    for term in aliases_to_check:
        escaped = re.escape(term)
        pattern = r'(?<![a-zA-Z0-9])' + escaped + r'(?![a-zA-Z0-9])'
        if re.search(pattern, norm_text):
            return True

    return False

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract plain text from PDF bytes using pypdf."""
    try:
        from pypdf import PdfReader
        reader = PdfReader(io.BytesIO(pdf_bytes))
        extracted = []
        for page in reader.pages:
            text = page.extract_text()
            if text:
                extracted.append(text)
        return "\n".join(extracted).strip()
    except Exception as e:
        raise ValueError(f"Could not extract text from PDF: {str(e)}")
