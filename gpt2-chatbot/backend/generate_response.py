# app.py
import sys
from flask import Flask, request, jsonify
from transformers import GPT2LMHeadModel, GPT2Tokenizer

app = Flask(__name__)

# Load the fine-tuned model and tokenizer
model_path = "D:/DOWNLOAD/car_design_model_updated-20241002T091721Z-001/car_design_model_updated"
tokenizer = GPT2Tokenizer.from_pretrained(model_path)
model = GPT2LMHeadModel.from_pretrained(model_path)

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    input_text = data.get('message')

    if input_text:
        input_ids = tokenizer.encode(input_text, return_tensors='pt')
        output = model.generate(input_ids, max_length=100, num_return_sequences=1, no_repeat_ngram_size=2)
        
        response = tokenizer.decode(output[0], skip_special_tokens=True)
        return jsonify({'response': response})
    return jsonify({'response': "No input provided."})

if __name__ == "__main__":
    app.run(port=5001)
