import os
import json
import logging
from ai import run_ai_pipeline

TEST_IMAGE_PATH = "image copy.png" 

logging.basicConfig(
    level=logging.INFO, 
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%H:%M:%S'
)

logging.getLogger("ai").setLevel(logging.INFO)
logging.getLogger("httpx").setLevel(logging.WARNING)
logging.getLogger("httpcore").setLevel(logging.WARNING)

def run_test():
    if not os.path.exists(TEST_IMAGE_PATH):
        print(json.dumps({"success": False, "error": f"Could not find {TEST_IMAGE_PATH}"}, indent=4))
        return

    with open(TEST_IMAGE_PATH, "rb") as file_obj:
        result = run_ai_pipeline(file_obj, TEST_IMAGE_PATH)

    print(json.dumps(result, indent=4))

if __name__ == "__main__":
    run_test()