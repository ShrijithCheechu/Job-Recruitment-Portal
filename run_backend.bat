@echo off
title RemoteJob.io - Django Backend (Port 8000)
echo ========================================================
echo  Starting RemoteJob.io Django Backend
echo  API Base: http://localhost:8000/api/v1/
echo ========================================================
cd backend
python manage.py runserver 0.0.0.0:8000
