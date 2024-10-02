import sys
from transformers import GPT2LMHeadModel, GPT2Tokenizer

def generate_response(input_text):
    # Load the fine-tuned model and tokenizer
    model_path = "D:/DOWNLOAD/car_design_model_updated-20241002T091721Z-001/car_design_model_updated"
    tokenizer = GPT2Tokenizer.from_pretrained(model_path)
    model = GPT2LMHeadModel.from_pretrained(model_path)

    # Tokenize the input and generate a response
    input_ids = tokenizer.encode(input_text, return_tensors='pt')
    output = model.generate(input_ids, max_length=100, num_return_sequences=1, no_repeat_ngram_size=2)
    
    response = tokenizer.decode(output[0], skip_special_tokens=True)
    return response

if __name__ == "__main__":
    if len(sys.argv) > 1:
        user_input = sys.argv[1]
        response = generate_response(user_input)
        print(response)
    else:
        print("No input provided.")