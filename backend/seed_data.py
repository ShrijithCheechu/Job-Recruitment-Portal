import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from profiles.models import CandidateProfile, RecruiterProfile, Resume, Experience
from jobs.models import Category, Skill, Job, JobSkill
from applications.models import Application, ApplicationStatusHistory
from adminpanel.models import FAQ
from matching.matcher import calculate_compatibility_score

User = get_user_model()

def seed():
    print("🌱 Starting database seeding...")

    # 1. Categories
    categories_data = [
        {"name": "Featured", "slug": "featured", "order": 1},
        {"name": "Software Engineers", "slug": "software-engineers", "order": 2},
        {"name": "UI/UX", "slug": "ui-ux", "order": 3},
        {"name": "Project Management", "slug": "project-management", "order": 4},
        {"name": "Accounting", "slug": "accounting", "order": 5},
        {"name": "Hybrid Jobs", "slug": "hybrid-jobs", "order": 6},
        {"name": "International Companies", "slug": "international-companies", "order": 7},
        {"name": "Remote", "slug": "remote", "order": 8},
    ]

    cat_map = {}
    for cd in categories_data:
        cat, _ = Category.objects.get_or_create(slug=cd['slug'], defaults=cd)
        cat_map[cd['slug']] = cat

    # 2. Demo Users
    # Admin
    admin_user, _ = User.objects.get_or_create(
        email='admin@demo.com',
        defaults={'username': 'admin@demo.com', 'role': 'admin', 'is_staff': True, 'is_superuser': True}
    )
    admin_user.set_password('password123')
    admin_user.save()

    # Recruiter
    recruiter_user, _ = User.objects.get_or_create(
        email='recruiter@demo.com',
        defaults={'username': 'recruiter@demo.com', 'role': 'recruiter'}
    )
    recruiter_user.set_password('password123')
    recruiter_user.save()

    rec_profile, _ = RecruiterProfile.objects.get_or_create(
        user=recruiter_user,
        defaults={
            'company_name': 'TechNova Global',
            'location': 'Lalitpur, Nepal',
            'description': 'Building next-generation distributed teams and AI-powered products worldwide.',
            'website': 'https://technovaglobal.io'
        }
    )

    # Candidate
    candidate_user, _ = User.objects.get_or_create(
        email='candidate@demo.com',
        defaults={'username': 'candidate@demo.com', 'role': 'candidate'}
    )
    candidate_user.set_password('password123')
    candidate_user.save()

    cand_profile, _ = CandidateProfile.objects.get_or_create(
        user=candidate_user,
        defaults={
            'full_name': 'Alex Morgan',
            'headline': 'Fullstack & React Developer',
            'bio': 'Passionate engineer with 3+ years experience building reactive frontends and Python web services.',
            'location': 'Lalitpur, Nepal',
            'phone': '+977 9812345678',
            'skills': ['React', 'JavaScript', 'Python', 'UI/UX Design', 'Git', 'HTML/CSS', 'TypeScript'],
            'is_discoverable': True
        }
    )

    # Add Experience
    Experience.objects.get_or_create(
        candidate=cand_profile,
        title='Frontend Engineer',
        company='V-Mec Solutions',
        start_date='2023',
        end_date='Present',
        is_current=True,
        description='Developed modern single-page applications with React and Tailwind CSS.'
    )

    # Candidate Resume
    Resume.objects.get_or_create(
        candidate=cand_profile,
        title='Alex_Morgan_Resume_2026.pdf',
        defaults={
            'extracted_text': """Alex Morgan - Fullstack Engineer
Email: alex.morgan@email.com | Phone: +977 9812345678 | Lalitpur, Nepal
Summary: Specialized in React, JavaScript, Python, Django, and modern responsive UI engineering.
Skills: React, JavaScript, Python, HTML/CSS, TypeScript, Git, UI/UX Design, REST APIs, PostgreSQL.
Experience:
- Frontend Engineer at V-Mec Solutions (2023 - Present)
- Junior Web Developer at Innovate Labs (2021 - 2023)""",
            'skills': ['React', 'JavaScript', 'Python', 'HTML/CSS', 'TypeScript', 'Git', 'UI/UX Design', 'REST APIs', 'PostgreSQL'],
            'is_default': True
        }
    )

    # Second Candidate for discovery and blind screening
    cand2_user, _ = User.objects.get_or_create(
        email='priya.sharma@demo.com',
        defaults={'username': 'priya.sharma@demo.com', 'role': 'candidate'}
    )
    cand2_user.set_password('password123')
    cand2_user.save()

    cand2_profile, _ = CandidateProfile.objects.get_or_create(
        user=cand2_user,
        defaults={
            'full_name': 'Priya Sharma',
            'headline': 'Lead UI/UX & Product Designer',
            'bio': '7+ years crafting intuitive design systems, design tokens, and user journeys.',
            'location': 'Kathmandu, Nepal',
            'phone': '+977 9801234567',
            'skills': ['UI/UX Design', 'Figma', 'HTML/CSS', 'Agile/Scrum'],
            'is_discoverable': True
        }
    )

    # 3. Seed Jobs (matching reference UI cards directly!)
    jobs_data = [
        {
            "title": "UI/UX Designer",
            "company_name": "Studio Zenith",
            "category": cat_map["ui-ux"],
            "description": "We are looking for a UI/UX Designer with 2+ years of experience to lead user experience flows and component design.",
            "requirements": "Proficiency in Figma, user testing, wireframing, and interactive design systems.",
            "location": "Lalitpur, Nepal",
            "work_mode": "Hybrid",
            "job_type": "Full-time",
            "experience_level": "Mid Level",
            "featured": True,
            "skills": [
                {"name": "UI/UX Design", "is_required": True},
                {"name": "Figma", "is_required": True},
                {"name": "HTML/CSS", "is_required": False}
            ]
        },
        {
            "title": "React Developer",
            "company_name": "v/mec",
            "category": cat_map["software-engineers"],
            "description": "Join our team as a React Developer to build high performance web applications with modern state management.",
            "requirements": "Solid experience with React, JavaScript (ES6+), component architecture, and responsive styling.",
            "location": "Lalitpur, Nepal",
            "work_mode": "Remote",
            "job_type": "Full-time",
            "experience_level": "Mid Level",
            "featured": True,
            "skills": [
                {"name": "React", "is_required": True},
                {"name": "JavaScript", "is_required": True},
                {"name": "Git", "is_required": False},
                {"name": "TypeScript", "is_required": False}
            ]
        },
        {
            "title": "Python Developer",
            "company_name": "Apex AI Labs",
            "category": cat_map["software-engineers"],
            "description": "Need of a Python Developer with experience in AI/ML, along with different Python libraries.",
            "requirements": "Strong Python fundamentals, familiarity with Django or FastAPI, and exposure to PyTorch/TensorFlow or scikit-learn.",
            "location": "Lalitpur, Nepal",
            "work_mode": "Remote",
            "job_type": "Full-time",
            "experience_level": "Senior Level",
            "featured": True,
            "skills": [
                {"name": "Python", "is_required": True},
                {"name": "Machine Learning / AI", "is_required": True},
                {"name": "Django", "is_required": False},
                {"name": "REST APIs", "is_required": False}
            ]
        },
        {
            "title": "Frontend Developer",
            "company_name": "Momentum Systems",
            "category": cat_map["software-engineers"],
            "description": "We are looking for a Frontend Developer with 2+ years of experience in creating polished, accessible interfaces.",
            "requirements": "Strong HTML5, CSS3, modern JavaScript, and React or Vue ecosystem knowledge.",
            "location": "Lalitpur, Nepal",
            "work_mode": "Hybrid",
            "job_type": "Full-time",
            "experience_level": "Mid Level",
            "featured": True,
            "skills": [
                {"name": "React", "is_required": True},
                {"name": "HTML/CSS", "is_required": True},
                {"name": "JavaScript", "is_required": True}
            ]
        },
        {
            "title": "Technical Project Manager",
            "company_name": "Nexus Global",
            "category": cat_map["project-management"],
            "description": "Lead cross-functional engineering teams, run sprint planning, and coordinate delivery milestones across global clients.",
            "requirements": "3+ years in Agile project leadership, Jira, Scrum ceremonies, and stakeholder communication.",
            "location": "Remote",
            "work_mode": "Remote",
            "job_type": "Contract",
            "experience_level": "Senior Level",
            "featured": False,
            "skills": [
                {"name": "Project Management", "is_required": True},
                {"name": "Agile/Scrum", "is_required": True}
            ]
        },
        {
            "title": "Senior Financial Accountant",
            "company_name": "Clarion Partners",
            "category": cat_map["accounting"],
            "description": "Manage multi-currency ledger accounting, financial statement reconciliations, and international payroll reports.",
            "requirements": "CPA or equivalent, experience with ERP systems, Excel modeling, and remote compliance.",
            "location": "Remote",
            "work_mode": "Remote",
            "job_type": "Full-time",
            "experience_level": "Senior Level",
            "featured": False,
            "skills": [
                {"name": "Accounting", "is_required": True}
            ]
        }
    ]

    created_jobs = []
    for jd in jobs_data:
        skills_list = jd.pop("skills")
        comp_name = jd.pop("company_name")
        job, created = Job.objects.get_or_create(
            title=jd['title'],
            recruiter=recruiter_user,
            defaults={
                **jd,
                'company': rec_profile,
                'company_name_override': comp_name,
                'status': 'Published',
                'is_blind': True
            }
        )
        if created:
            for s in skills_list:
                JobSkill.objects.create(job=job, name=s['name'], is_required=s['is_required'])
        created_jobs.append(job)

    # 4. Seed an Application in Blind Screening Mode
    react_job = created_jobs[1] # React Developer
    resume_alex = Resume.objects.filter(candidate=cand_profile).first()
    
    score, matching, missing = calculate_compatibility_score(
        cand_profile.skills,
        react_job.job_skills.all()
    )

    app, created = Application.objects.get_or_create(
        job=react_job,
        candidate=candidate_user,
        defaults={
            'resume': resume_alex,
            'cover_letter': "I have spent 3+ years writing scalable React applications with modern hooks and clean component patterns.",
            'status': 'Under Review',
            'match_score': score,
            'matching_skills': matching,
            'missing_skills': missing,
            'identity_revealed': False,
            'anonymous_code': 'Candidate #7F3A'
        }
    )
    if created:
        ApplicationStatusHistory.objects.create(
            application=app,
            old_status='Applied',
            new_status='Under Review',
            changed_by=recruiter_user,
            comment='Reviewing candidate skills and anonymous resume.'
        )

    # 5. Seed FAQs (Reference UI FAQs + SRS compliance)
    faqs_data = [
        {
            "question": "How do I get started as a remote designer?",
            "answer": "Sign up for a free candidate account, upload your portfolio link and PDF resume. Our automated skill parser will detect your design tools and match you with open design opportunities globally.",
            "order": 1
        },
        {
            "question": "What type of remote jobs are available?",
            "answer": "We offer a wide range of remote opportunities across various industries including tech, marketing, design, customer support, and more. You can find both full-time positions and contract-based work.",
            "order": 2
        },
        {
            "question": "How can I make my profile stand out to employers?",
            "answer": "Upload a clean text-based PDF resume so our skill extraction engine highlights your full technical repertoire. Achieving a 85%+ compatibility score for job postings significantly increases shortlist rates.",
            "order": 3
        },
        {
            "question": "How does the hiring process work?",
            "answer": "Recruiters evaluate applicants using blind hiring, assessing skills, experience, and compatibility score free from unconscious bias. Once shortlisted, candidate identity is unlocked and live video interviews are scheduled.",
            "order": 4
        },
        {
            "question": "How do you verify remote candidates?",
            "answer": "We verify remote candidates through automated resume extraction, past project portfolios, and structured interview workflows.",
            "order": 5
        },
        {
            "question": "Is RemoteJob.io really free?",
            "answer": "Yes! RemoteJob.io is 100% free with no subscription plans, paid tiers, or hidden commissions for both candidates and recruiters.",
            "order": 6
        },
        {
            "question": "What support do you provide?",
            "answer": "We offer complete community and technical support for interview coordination, resume parsing troubleshooting, and applicant pipeline management.",
            "order": 7
        }
    ]

    for fd in faqs_data:
        FAQ.objects.get_or_create(question=fd['question'], defaults=fd)

    print("✅ Database seeding completed successfully!")

if __name__ == '__main__':
    seed()
