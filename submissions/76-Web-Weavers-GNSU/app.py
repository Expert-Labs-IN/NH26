from flask import Flask, render_template, request, redirect
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import random, os, base64

# ===== Try OpenAI (safe import) =====
try:
    from openai import OpenAI
    client = OpenAI(api_key="YOUR_REAL_API_KEY")
    AI_ENABLED = True
except:
    print("OpenAI not working, fallback mode ON")
    AI_ENABLED = False

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
db = SQLAlchemy(app)

# ===== Database =====
class Ticket(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    ticket_id = db.Column(db.String(10))
    name = db.Column(db.String(50))
    issue = db.Column(db.String(200))
    category = db.Column(db.String(50))
    priority = db.Column(db.String(10))
    status = db.Column(db.String(20))
    date = db.Column(db.String(50))

with app.app_context():
    db.create_all()

# ===== AI Function =====
def ai_analyze(text):
    # 👉 If AI available
    if AI_ENABLED:
        try:
            res = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role":"system","content":"Return only: Category - Priority (High, Medium, Low)"},
                    {"role":"user","content": text}
                ]
            )
            result = res.choices[0].message.content.strip()

            if " - " in result:
                category, priority = result.split(" - ")
            else:
                category, priority = "General", "Medium"

            return category, priority

        except Exception as e:
            print("AI Error:", e)

    # 👉 Fallback logic (no API needed)
    text = text.lower()

    if "water" in text or "pani" in text:
        return "Plumbing", "High"
    elif "wifi" in text or "internet" in text:
        return "IT", "Medium"
    elif "window" in text or "fan" in text:
        return "Maintenance", "Medium"
    else:
        return "General", "Low"

# ===== Generate Ticket =====
def generate_id():
    return "TKT" + str(random.randint(1000,9999))

# ===== Routes =====
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/submit', methods=['POST'])
def submit():
    issue = request.form['issue']

    category, priority = ai_analyze(issue)

    ticket = Ticket(
        ticket_id = generate_id(),
        name = request.form['name'],
        issue = issue,
        category = category,
        priority = priority,
        status = "Pending",
        date = datetime.now().strftime("%Y-%m-%d %H:%M")
    )

    db.session.add(ticket)
    db.session.commit()

    os.makedirs("static/photos", exist_ok=True)

    # Upload Photo
    photo = request.files.get('photo')
    if photo and photo.filename != "":
        photo.save(f"static/photos/{ticket.ticket_id}.png")

    # Camera Photo
    cam = request.form.get('camera_photo')
    if cam:
        header, encoded = cam.split(",", 1)
        data = base64.b64decode(encoded)
        with open(f"static/photos/{ticket.ticket_id}.png", "wb") as f:
            f.write(data)

    return render_template('success.html', ticket_id=ticket.ticket_id)

@app.route('/track', methods=['GET','POST'])
def track():
    data = None
    if request.method == 'POST':
        tid = request.form['ticket_id']
        data = Ticket.query.filter_by(ticket_id=tid).first()
    return render_template('track.html', data=data)

@app.route('/admin')
def admin():
    data = Ticket.query.all()
    return render_template('admin.html', data=data)

@app.route('/update/<tid>')
def update(tid):
    t = Ticket.query.filter_by(ticket_id=tid).first()
    if t:
        t.status = "Resolved"
        db.session.commit()
    return redirect('/admin')

# ===== Run =====
if __name__ == "__main__":
    app.run(debug=True)