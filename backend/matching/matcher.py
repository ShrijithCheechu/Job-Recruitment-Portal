import re
from io import BytesIO
try:
    from pypdf import PdfReader
except ImportError:
    PdfReader = None

# Default comprehensive skills dictionary with common synonyms and variations
SKILLS_DICTIONARY = {
    'Python': ['python', 'py', 'django', 'fastapi', 'flask'],
    'React': ['react', 'react.js', 'reactjs'],
    'JavaScript': ['javascript', 'js', 'es6', 'ecmascript'],
    'TypeScript': ['typescript', 'ts'],
    'HTML/CSS': ['html', 'html5', 'css', 'css3', 'tailwind', 'bootstrap', 'sass'],
    'UI/UX Design': ['ui/ux', 'ui', 'ux', 'figma', 'sketch', 'adobe xd', 'wireframing', 'prototyping'],
    'Figma': ['figma'],
    'Django': ['django', 'drf', 'django rest framework'],
    'Node.js': ['nodejs', 'node.js', 'node', 'express'],
    'PostgreSQL': ['postgresql', 'postgres', 'psql'],
    'SQL': ['sql', 'mysql', 'sqlite'],
    'Git': ['git', 'github', 'gitlab'],
    'REST APIs': ['rest api', 'rest', 'restful', 'api design'],
    'Agile/Scrum': ['agile', 'scrum', 'kanban', 'sprints'],
    'Project Management': ['project management', 'pmp', 'jira', 'confluence'],
    'Machine Learning / AI': ['machine learning', 'ml', 'ai', 'deep learning', 'pytorch', 'tensorflow', 'scikit-learn'],
    'Cloud / AWS': ['aws', 'amazon web services', 'cloud', 'docker', 'kubernetes', 'azure', 'gcp'],
    'Frontend': ['frontend', 'front-end', 'client-side'],
    'Backend': ['backend', 'back-end', 'server-side'],
    'Mobile': ['mobile', 'react native', 'flutter', 'ios', 'android', 'swift', 'kotlin'],
    'DevOps': ['devops', 'ci/cd', 'docker', 'kubernetes', 'terraform'],
}

def extract_text_from_pdf(pdf_file_or_bytes):
    """Extract clean text from a PDF file."""
    if not PdfReader:
        return ""
    try:
        if hasattr(pdf_file_or_bytes, 'read'):
            reader = PdfReader(pdf_file_or_bytes)
        else:
            reader = PdfReader(BytesIO(pdf_file_or_bytes))
        
        text = ""
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        return text.strip()
    except Exception as e:
        print(f"Error extracting PDF text: {e}")
        return ""

def extract_skills_from_text(text):
    """Identify skills in raw text using dictionary matching and synonyms."""
    if not text:
        return []
    
    text_lower = text.lower()
    detected_skills = set()
    
    for canonical_name, terms in SKILLS_DICTIONARY.items():
        for term in terms:
            # Match word boundary or term
            pattern = r'(?:\b|_)' + re.escape(term.lower()) + r'(?:\b|_)'
            if re.search(pattern, text_lower):
                detected_skills.add(canonical_name)
                break
                
    return sorted(list(detected_skills))

def calculate_compatibility_score(candidate_skills, job_skills_queryset_or_list):
    """
    Computes compatibility score:
    Compatibility (%) = (2 * M_req + M_pref) / (2 * N_req + N_pref) * 100
    """
    candidate_skills_norm = {s.strip().lower() for s in candidate_skills}

    # Expand candidate skills with synonyms
    expanded_candidate_skills = set(candidate_skills_norm)
    for canonical, terms in SKILLS_DICTIONARY.items():
        if any(term.lower() in candidate_skills_norm for term in terms) or canonical.lower() in candidate_skills_norm:
            expanded_candidate_skills.add(canonical.lower())
            for t in terms:
                expanded_candidate_skills.add(t.lower())

    n_req = 0
    n_pref = 0
    m_req = 0
    m_pref = 0
    matching_skills = []
    missing_skills = []

    for js in job_skills_queryset_or_list:
        skill_name = js['name'] if isinstance(js, dict) else js.name
        is_required = js['is_required'] if isinstance(js, dict) else js.is_required
        
        skill_name_lower = skill_name.strip().lower()
        matched = False
        
        # Check direct or synonym match
        if skill_name_lower in expanded_candidate_skills:
            matched = True
        else:
            for canonical, terms in SKILLS_DICTIONARY.items():
                if (canonical.lower() == skill_name_lower or any(t.lower() == skill_name_lower for t in terms)):
                    if canonical.lower() in expanded_candidate_skills or any(t.lower() in expanded_candidate_skills for t in terms):
                        matched = True
                        break

        if is_required:
            n_req += 1
            if matched:
                m_req += 1
                matching_skills.append(f"{skill_name} (Required)")
            else:
                missing_skills.append(f"{skill_name} (Required)")
        else:
            n_pref += 1
            if matched:
                m_pref += 1
                matching_skills.append(f"{skill_name} (Preferred)")
            else:
                missing_skills.append(f"{skill_name} (Preferred)")

    denom = (2 * n_req) + n_pref
    if denom == 0:
        return 100.0, matching_skills, missing_skills

    numer = (2 * m_req) + m_pref
    score = round((numer / denom) * 100, 1)
    return score, matching_skills, missing_skills

def redact_text_for_blind_hiring(text, candidate_name=None, email=None, phone=None):
    """
    Redact personally identifiable details (name, email, phone, links)
    for objective blind screening per SRS Section 5.1.
    """
    if not text:
        return ""
    
    redacted = text
    # Redact email addresses
    redacted = re.sub(r'[\w\.-]+@[\w\.-]+\.\w+', '[REDACTED EMAIL]', redacted)
    # Redact phone numbers
    redacted = re.sub(r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', '[REDACTED PHONE]', redacted)
    # Redact links like linkedin, github, portfolio
    redacted = re.sub(r'https?://[^\s]+', '[REDACTED LINK]', redacted)
    
    if candidate_name and len(candidate_name.strip()) > 2:
        for part in candidate_name.strip().split():
            if len(part) > 2:
                redacted = re.sub(re.escape(part), '[REDACTED NAME]', redacted, flags=re.IGNORECASE)
                
    if email:
        redacted = re.sub(re.escape(email), '[REDACTED EMAIL]', redacted, flags=re.IGNORECASE)

    if phone:
        redacted = re.sub(re.escape(phone), '[REDACTED PHONE]', redacted, flags=re.IGNORECASE)

    return redacted
