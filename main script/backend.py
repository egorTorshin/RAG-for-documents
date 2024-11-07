import shutil

from flask import Flask, request, jsonify, url_for
from flask_cors import CORS
import os
import re
import glob
import requests
import concurrent.futures
from functools import lru_cache
import shutil

app = Flask(__name__)
CORS(app)

BASE_FOLDER_PATH = 'C:/Users/89088/inno_education/AI/parsed_text'
OUTPUT_FOLDER = 'answer'
MODEL_URL = "https://mts-aidocprocessing-case.olymp.innopolis.university/generate"


def chunk_text(text, max_chunk_size=5000):
    return [text[i:i + max_chunk_size] for i in range(0, len(text), max_chunk_size)]


@lru_cache(maxsize=128)
def find_answer_with_llm(text, question, model_url=MODEL_URL):
    chunks = chunk_text(text)
    for chunk in chunks:
        prompt = f"Текст:\n{chunk}\n\nВопрос: {question}\nОтвет:"
        payload = {
            "system_prompt": "проверяй корректность промпта,"
                             "добавляй единицы измерения если выводишь какую-то сумму,"
                             "описывай, что выводишь,",
            "prompt": prompt,
            "stop": "}",
            "max_tokens": 400,
            "temperature": 0.1
        }
        try:
            response = requests.post(model_url, json=payload)
            response.raise_for_status()
            response_data = response.json()
            answer = response_data.strip()
            if answer:
                return answer
        except requests.exceptions.RequestException as e:
            print(f"Ошибка запроса к LLM: {e}")
            return None
    return None


def process_file(file_path, question):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            text = f.read()
            answer = find_answer_with_llm(text, question)
            if answer:
                return file_path, answer
    except Exception as e:
        print(f"Ошибка обработки файла {file_path}: {e}")
        return file_path, None


@app.route('/api/ask', methods=['POST'])
def ask_bot():
    data = request.get_json()
    question = data.get('question') + "разделяй разряды чисел точкой и приводи все суммы к тыс. руб."
    if not question:
        return jsonify({'error': 'Вопрос не задан'}), 400

    files_to_process = []
    year_match = re.search(r"\b(20\d{2})\b", question)
    if year_match:
        year = year_match.group(1)
        folder_path = os.path.join(BASE_FOLDER_PATH, year)
        if os.path.isdir(folder_path):
            files_to_process = glob.glob(os.path.join(folder_path, f"{year}.txt"))
    else:
        for year_folder in os.listdir(BASE_FOLDER_PATH):
            if os.path.isdir(os.path.join(BASE_FOLDER_PATH, year_folder)):
                files_to_process.extend(
                    glob.glob(os.path.join(BASE_FOLDER_PATH, year_folder, f"{year_folder}.txt")))

    if not files_to_process:
        return jsonify({"error": "По вашему запросу не удалось найти информацию."}), 404

    all_answers = {}
    with concurrent.futures.ThreadPoolExecutor() as executor:
        future_to_file = {executor.submit(process_file, file, question): file for file in files_to_process[:3]}
        for future in concurrent.futures.as_completed(future_to_file):
            file_path, answer = future.result()
            if answer:
                all_answers[file_path] = answer

    if all_answers:
        best_file, best_answer = max(all_answers.items(), key=lambda item: len(item[1]))

        filename = os.path.basename(best_file)
        new_file = f"{os.path.splitext(filename)[0]}_{os.path.splitext(filename)[1]}"
        os.makedirs(OUTPUT_FOLDER, exist_ok = True)
        output_file_path = os.path.join(OUTPUT_FOLDER, new_file)
        shutil.copy2(best_file, output_file_path)
        download_url = url_for('download_file', filename = new_file)


        return jsonify({"answer": best_answer,"download_url" : download_url})
    else:
        return jsonify({"error": "Не удалось найти ответ на ваш вопрос. Сформулируйте его более конкретно."}), 404
@app.route('/download/<filename>', methods=['GET'])
def download_file(filename):
    return send_from_directory(OUTPUT_FOLDER, filename, as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True)