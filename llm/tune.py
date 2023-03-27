import os
from dotenv import load_dotenv
from llama_index import SimpleDirectoryReader, GPTSimpleVectorIndex

load_dotenv()

os.environ['OPENAI_API_KEY'] = os.getenv('OPENAI_KEY')

def tune_llm(input_directory="sourcedata", output_file="indexdata/index.json"):
    loaded_content = SimpleDirectoryReader(input_directory).load_data()
    output_index = GPTSimpleVectorIndex(loaded_content)
    output_index.save_to_disk(output_file)