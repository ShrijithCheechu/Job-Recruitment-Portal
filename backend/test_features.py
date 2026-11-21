import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.test import Client
from accounts.models import User
from jobs.models import Job
from applications.models import Application, IdentityRevealLog
from adminpanel.models import FAQ, AuditLog

def run_tests():
    c = Client()
    print("Testing RemoteJob.io full workflow...")

    # 1. Login Recruiter
    res_rec = c.post('/api/v1/auth/login/', {'email': 'recruiter@demo.com', 'password': 'password123'}, content_type='application/json')
    assert res_rec.status_code == 200, f"Recruiter login failed: {res_rec.status_code}"
    rec_token = res_rec.json()['token']
    rec_headers = {'HTTP_AUTHORIZATION': f'Bearer {rec_token}'}

    # 2. Login Candidate
    res_cand = c.post('/api/v1/auth/login/', {'email': 'candidate@demo.com', 'password': 'password123'}, content_type='application/json')
    assert res_cand.status_code == 200, f"Candidate login failed: {res_cand.status_code}"
    cand_token = res_cand.json()['token']
    cand_headers = {'HTTP_AUTHORIZATION': f'Bearer {cand_token}'}

    # 3. Candidate views jobs list with compatibility score calculated
    res_jobs = c.get('/api/v1/jobs/', **cand_headers)
    assert res_jobs.status_code == 200
    jobs_data = res_jobs.json()
    assert len(jobs_data) >= 4
    first_job = jobs_data[0]
    print(f"✓ Jobs list returned {len(jobs_data)} jobs. First job: '{first_job['title']}' Match score: {first_job.get('match_score')}%")

    # 4. Check Blind Hiring pipeline
    # Find job with application
    app = Application.objects.first()
    assert app is not None, "Application should exist from seed data"
    job_id = app.job.id

    res_pipe = c.get(f'/api/v1/recruiter/jobs/{job_id}/applications/', **rec_headers)
    assert res_pipe.status_code == 200
    apps_data = res_pipe.json()
    assert len(apps_data) > 0
    target_app = apps_data[0]
    print(f"✓ Blind pipeline returned application. Anonymous Name: '{target_app['candidate_name']}' Masked Email: '{target_app['candidate_email']}'")
    assert "Candidate #" in target_app['candidate_name'] or not target_app['identity_revealed']

    # 5. Reveal Candidate Identity
    res_reveal = c.post(f'/api/v1/recruiter/applications/{target_app["id"]}/reveal/', {'reason': 'Impressive skill match score'}, content_type='application/json', **rec_headers)
    assert res_reveal.status_code == 200
    revealed_app = res_reveal.json()['application']
    assert revealed_app['identity_revealed'] == True
    assert revealed_app['candidate_email'] == 'candidate@demo.com'
    print(f"✓ Candidate Identity Revealed successfully! Name: '{revealed_app['candidate_name']}' Email: '{revealed_app['candidate_email']}'")

    # 6. Check Audit Log
    reveal_log = IdentityRevealLog.objects.filter(application_id=target_app["id"]).exists()
    assert reveal_log, "Reveal log must exist in database"
    print("✓ Audit log and IdentityRevealLog verified successfully!")

    print("🎉 ALL TESTS PASSED SUCCESSFULLY!")

if __name__ == '__main__':
    run_tests()
