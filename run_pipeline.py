"""
run_pipeline.py
Runs the complete semiconductor ML pipeline cleanly without developer logs.
"""

import os
import sys
import warnings

warnings.filterwarnings("ignore")
os.environ["PYTHONWARNINGS"] = "ignore"
os.environ["DEBUG_MODE"] = "0"

from model_server import print_clean_terminal_output

def main():
    target_id = sys.argv[1] if len(sys.argv) > 1 else None
    print_clean_terminal_output("ml_dataset.csv", target_id)

if __name__ == "__main__":
    main()
