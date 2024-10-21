from flask import Flask, render_template, request, redirect, url_for, g, session, flash, jsonify, current_app, Response, make_response
import sqlite3
from datetime import datetime, timezone, timedelta
from flask_bcrypt import Bcrypt
import secrets
import hashlib
from openai import OpenAI
import os
from flask_cors import CORS
import logging
import time

app = Flask(__name__)
CORS(app, supports_credentials=True)
app.secret_key = 'p7'
bcrypt = Bcrypt()
# app.config['SERVER_NAME'] = '127.0.0.1:6014'
# app.config['SERVER_NAME'] = 'http://107.174.67.224:8014'
app.config['SESSION_COOKIE_SECURE'] = False
logging.basicConfig(level=logging.DEBUG, filename='my_app.log')


def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect('myLLM_v2.db')
        db.row_factory = sqlite3.Row
    return db


def hash_string_to_id(string, algorithm="sha256"):
    """根据指定的算法计算字符串的哈希值"""
    hash_object = hashlib.new(algorithm)  # 创建哈希对象
    hash_object.update(string.encode())  # 添加字符串（需要编码为字节）
    return hash_object.hexdigest()  # 返回十六进制字符串表示

def generate_id(length = 16):
    return os.urandom(length).hex()

@app.route('/', methods = ['GET', 'POST'])
def home():
    return render_template('home.html')

@app.route('/myLLM', methods = ['GET', 'POST'])
def myLLM():
    if not 'user_name' in session:
        # print(session['user_name'])
        flash("請先登入!")
        return redirect(url_for('login'))
    else:
        try:
            now = datetime.now(timezone(timedelta(hours=+8))).isoformat()
            conn = get_db()
            cursorObj = conn.cursor()
            userdata = cursorObj.execute(f'SELECT * FROM Users \
                                        WHERE user_name = "{session["user_name"]}" \
                                        ;').fetchone()
            API_key = userdata[5]
            conn.commit()
        except Exception as e:
            print(e, 53)
        finally:
            if conn:
                conn.close()
        if API_key == "" or API_key is None:
            flash("請先輸入API!")
            return redirect(url_for('userPage'))
        else:
            response = make_response(render_template('myLLM.html'))  # 使用 make_response
            response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
            return response


def store_chat(role, message_type = "text", file_url = None, message_content = "", response_parameters = "", tokens = 0):
    conn = get_db()
    try:
        now = datetime.now(timezone(timedelta(hours=+8))).isoformat()
        
        cursorObj = conn.cursor()
        # cursorObj.execute(f'INSERT INTO Messages VALUES ("{session["conversation_id"] + generate_id()}", "{session["conversation_id"]}", "{now}", \
        #     "{role}", "{message_type}", "{file_url}", "{message_content}", "{response_parameters}");')
        cursorObj.execute(
            'INSERT INTO Messages VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            (session["conversation_id"] + generate_id(), 
            session["conversation_id"], 
            now, 
            role, 
            message_type, 
            file_url, 
            message_content, 
            response_parameters,
            tokens)
        )

        conn.commit()
    except Exception as e:
        print(e, 87)
    # finally:
    #     if conn:
    #         conn.close()
    return

@app.route('/store-output', methods=['POST'])
def store_output():
    data = request.get_json()
    output = data['output']

    # 在此處處理 output，例如存入資料庫或進行其他操作
    store_chat(role='assistant', message_content=output)  # 假設您有 store_chat 函式

    response = jsonify({'message': 'Output received and stored!'})
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    return response

    
@app.route("/answer", methods=["GET", "POST"])
def answer():
    data = request.get_json()
    message = data["content"]
    store_chat(role='user', message_content=message)
    try:
        now = datetime.now(timezone(timedelta(hours=+8))).isoformat()
        conn = get_db()
        cursorObj = conn.cursor()
        cursorObj.execute(
            """
            UPDATE Conversations
            SET last_response_time = ?
            WHERE conversation_id = ?
            """,
            (
                now,
                session["conversation_id"],
            ),
        )
        chat_list = cursorObj.execute(f'SELECT * \
            FROM Messages\
            WHERE conversation_id = "{session["conversation_id"]}"\
            ORDER BY reply_time ASC;').fetchall()
        chats = [{"role": row[3],  "content": row[6]} for row in chat_list]
        parameters = cursorObj.execute(f'SELECT * \
            FROM Settings\
            WHERE conversation_id = "{session["conversation_id"]}"\
            ;').fetchone()
        userdata = cursorObj.execute(f'SELECT * FROM Users \
                                    WHERE user_name = "{session["user_name"]}" \
                                    ;').fetchone()
        API_key = userdata[5]
        # print(API_key)
        conn.commit()
    except Exception as e:
        print(e, 117)
    finally:
        if conn:
            conn.close()


    
    def generate():
        try:
            client = OpenAI(api_key=API_key)
            stream = client.chat.completions.create(
                model="gpt-4o-2024-05-13",
                top_p=parameters[3], 
                temperature=parameters[7],
                max_tokens=parameters[6], 
                frequency_penalty=parameters[8],
                presence_penalty=parameters[9],
                messages=[{"role": "system", "content": parameters[4]}] + chats,
                stream=True
            )

            for chunk in stream:
                if chunk.choices[0].delta.content is not None:
                    logging.debug(f"Streaming chunk: {chunk.choices[0].delta.content}")
                    yield(chunk.choices[0].delta.content.encode('utf-8'))
                else:
                    pass
        except Exception as e:
            yield f"發生錯誤: \n\n{e}".encode('utf-8')

    response = Response(generate())  
    response.headers['Content-Type'] = 'text/plain; charset=utf-8'
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    return response

@app.route('/get-settings', methods = ["GET"])
def get_settings():
    try:
        conn = get_db()
        cursorObj = conn.cursor()
        settings = cursorObj.execute(f'SELECT * \
            FROM Settings\
            WHERE conversation_id = "{session["conversation_id"]}"\
            ;').fetchone()
        
    except Exception as e:
        print(e, 117)
    finally:
        if conn:
            conn.close()
        return jsonify([row for row in settings])

@app.route('/save-settings', methods=['POST'])
def save_settings():
    data = request.get_json()

    # 获取滑块的值
    top_p = data.get('topP')
    max_tokens = data.get('maxTokens')
    temperature = data.get('temperature')
    frequency_penalty = data.get('frequencyPenalty')
    presence_penalty = data.get('presencePenalty')
    sys_prompt = data.get('sysPrompt')
    chat_name = data.get('chatName')
    model = "gpt-4o-2024-05-13"
    stop = ""

    # 在这里将设置保存到数据库
    # ... (使用你的数据库连接和操作) ...
    # print(sys_prompt)
    try:
        now = datetime.now(timezone(timedelta(hours=+8))).isoformat()
        # print(session['conversation_id'])
        conn = get_db()
        cursorObj = conn.cursor()
        # cursorObj.execute(f'UPDATE Settings SET \
        #                 conversation_name = "{chat_name}", \
        #                 conversation_model = "{model}", \
        #                 top_p = {top_p}, \
        #                 sys_prompt = "{sys_prompt}", \
        #                 stop = "{stop}", \
        #                 max_tokens = {max_tokens}, \
        #                 temperature = {temperature}, \
        #                 frequency_penalty = {frequency_penalty}, \
        #                 presence_penalty = {presence_penalty}\
        #                 WHERE conversation_id = "{session["conversation_id"]}";')
        # cursorObj.execute(f'UPDATE Conversations SET\
        #                 conversation_name = "{chat_name}" \
        #                 WHERE conversation_id = "{session["conversation_id"]}";')
        cursorObj.execute(
            """
            UPDATE Settings
            SET conversation_name = ?,
                conversation_model = ?,
                top_p = ?,
                sys_prompt = ?,
                stop = ?,
                max_tokens = ?,
                temperature = ?,
                frequency_penalty = ?,
                presence_penalty = ?
            WHERE conversation_id = ?
            """,
            (
                chat_name,
                model,
                top_p,
                sys_prompt,
                stop,
                max_tokens,
                temperature,
                frequency_penalty,
                presence_penalty,
                session["conversation_id"],
            ),
        )

        cursorObj.execute(
            """
            UPDATE Conversations
            SET conversation_name = ?
            WHERE conversation_id = ?
            """,
            (chat_name, session["conversation_id"])
        )

        conn.commit()
    except Exception as e:
        print(e, 119)
    finally:
        conn.close()

    return jsonify(message="Settings saved successfully")

def init_new_chat():
    try:
        now = datetime.now(timezone(timedelta(hours=+8))).isoformat()
        conn = get_db()
        cursorObj = conn.cursor()
        # cursorObj.execute(f'INSERT INTO Conversations VALUES ("{session["conversation_id"]}", "none", "{session["user_name"]}", "{now}", "{now}");')
        # cursorObj.execute(f'INSERT INTO Settings VALUES ("{session["conversation_id"]}", "untitled", "gpt-4o-2024-05-13", 1, "", "", 256, 1, 0, 0);')
        cursorObj.execute(
            'INSERT INTO Conversations VALUES (?, ?, ?, ?, ?)',
            (session["conversation_id"], "none", session["user_name"], now, now)
        )

        cursorObj.execute(
            'INSERT INTO Settings VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            (session["conversation_id"], "untitled", "gpt-4o-2024-05-13", 1, "", "", 256, 1, 0, 0)
        )

        conn.commit()
    except Exception as e:
        print(e)
    finally:
        conn.close()
    return

@app.route('/get-conversations', methods = ['GET'])
def get_conversations():
    try:
        conn = get_db()
        cursorObj = conn.cursor()
        conversation_list = cursorObj.execute(f'SELECT * \
            FROM Conversations\
            WHERE user_name = "{session["user_name"]}"\
            ORDER BY last_response_time DESC;').fetchall()
        conversations = [[row[1], row[0]] for row in conversation_list]
        # print(conversations)
    except Exception as e:
        print(e)
    finally:
        conn.close()
    response = jsonify(conversations)
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    return response

@app.route('/new-chat', methods = ['GET'])
def new_chat():
    conversation_id = session['user_name'] + generate_id()
    # print(conversation_id)
    session['conversation_id'] = conversation_id
    init_new_chat()
    response = jsonify("success")
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    return response

@app.route('/change-chat', methods = ['POST'])
def change_chat():
    data = request.get_json()
    conversation_id = data.get('conversationID')
    session['conversation_id'] = conversation_id
    try:
        conn = get_db()
        cursorObj = conn.cursor()
        chat_list = cursorObj.execute(f'SELECT * \
            FROM Messages\
            WHERE conversation_id = "{session["conversation_id"]}"\
            ORDER BY reply_time ASC;').fetchall()
        chats = [[row[i] for i in range(0, 8)] for row in chat_list]
        # print(chats)
    except Exception as e:
        print(e)
    finally:
        conn.close()
    response = jsonify(chats)
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    return response


    
@app.route('/login', methods = ['GET', 'POST'])
def login():
    if request.method == 'POST':
        user_name = request.form['username']
        user_PWD = request.form['userPWD']
        # rememberForget = request.form['rememberForget']
        remember = False
        if 'rememberForget' in request.form:
            remember = True
        
        last_login = datetime.now(timezone(timedelta(hours=+8))).isoformat()
        
        conn = get_db()
        cursorObj = conn.cursor()
        user = cursorObj.execute(f"SELECT * FROM Users WHERE user_name = '{user_name}'").fetchone()
        conn.close()
        if user is not None:
            # print(user['user_password'])
            if bcrypt.check_password_hash(user['user_password'], user_PWD) == False:
                return render_template('login.html', NameError = "密碼錯誤!")
            else:
                session['user_name'] = user_name
                return redirect(url_for('userPage'))
        else:
            return render_template('login.html', NameError = "帳號不存在!")
    return render_template('login.html')

        

@app.route('/signUp', methods = ['GET', 'POST'])
def signUp():
    if request.method == 'POST':
        user_name = request.form['username']
        user_PWD = request.form['userPWD']
        user_PWD2 = request.form['userPWD2']
        
        conn = get_db()
        cursorObj = conn.cursor()
        user = cursorObj.execute(f"SELECT * FROM Users WHERE user_name = '{user_name}'").fetchone()
        
        if user is not None:
            return render_template('signUp.html', NameError = "帳號已存在!")
        elif user_PWD != user_PWD2:
            return render_template('signUp.html', PWDerror = "密碼不一致!")
        else:
            user_id = hash_string_to_id(user_name)
            user_password_hashed = bcrypt.generate_password_hash(password=user_PWD)
            created_at = datetime.now(timezone(timedelta(hours=+8))).isoformat()
            last_login = datetime.now(timezone(timedelta(hours=+8))).isoformat()
            # print(user_id, user_password_hashed, last_login)
            user_password_hashed = user_password_hashed.decode('utf-8')
            cursorObj.execute(f'INSERT INTO Users VALUES ("{user_id}", "{user_name}", "{user_password_hashed}", "{created_at}", "{last_login}", "", "");')
            conn.commit()
            conn.close()
            # session['user_id'] = user_id
            session['user_name'] = user_name
            return redirect(url_for('userPage'))
    
    return render_template('signUp.html')
        
    

@app.route('/userPage', methods = ['GET', 'POST'])
def userPage():
    if not 'user_name' in session:
        flash("請先登入!")
        return redirect(url_for('login'))
    if request.method == "POST":
        try:
            
            conn = get_db()
            cursorObj = conn.cursor()
            user_name = session['user_name']
            # cursorObj.execute(f"UPDATE Users SET api_key = '{request.form['newAPI']}' WHERE user_name = '{user_name}'")
            cursorObj.execute(
                'UPDATE Users SET api_key = ? WHERE user_name = ?',
                (request.form['newAPI'], user_name)
            )

            conn.commit()
            flash('更新成功')
        except sqlite3.Error as e:
            flash('更新失敗: ', e)
        finally:
            conn.close()
            # return redirect(url_for('myLLM'))
    return render_template('user.html', Username = session['user_name'])
  

@app.route('/logout', methods = ['GET', 'POST'])
def logout():
    session.pop('user_name', None)
    return redirect(url_for('login'))

if __name__ == '__main__':
    app.run(debug=True, port=6014)