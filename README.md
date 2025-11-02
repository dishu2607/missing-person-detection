cd missing_person_system/backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt

.env in backend folder

MONGO_URI=mongodb+srv://dishantvisariya23_db_user:uCvvRCT3c1ZNKH3t@cluster0.rqwpkpk.mongodb.net/missing_persons?retryWrites=true&w=majority&appName=Cluster0

DB_NAME=missing_person_db

COLLECTION_NAME=reference_embeddings

uvicorn main:app --reload

Backend will start at http://127.0.0.1:8000




cd ../frontend

.env.local in frontend folder

NEXT_PUBLIC_API_BASE=http://127.0.0.1:8000

npm install
npm run dev

Frontend runs at http://localhost:3000

