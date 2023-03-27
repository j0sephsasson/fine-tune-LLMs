import os
from dotenv import load_dotenv
from llama_index import GPTSimpleVectorIndex

load_dotenv()

os.environ['OPENAI_API_KEY'] = os.getenv('OPENAI_KEY')

def query_llm(prompt, index_file="indexdata/index.json"):
    loaded_index = GPTSimpleVectorIndex.load_from_disk(index_file)
    result = loaded_index.query(prompt)
    return result
