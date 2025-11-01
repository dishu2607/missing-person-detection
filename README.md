cd missing_person_system/backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

uvicorn main:app --reload
Backend will start at http://127.0.0.1:8000

cd ../frontend
npm install
npm run dev

Frontend runs at http://localhost:3000

