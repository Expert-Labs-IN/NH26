@echo off
echo Starting DocNerve Backend...
cd backend

if not exist .venv (
	echo Creating virtual environment...
	python -m venv .venv
)

call .venv\Scripts\activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
