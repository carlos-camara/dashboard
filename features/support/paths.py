import os
import sys

def add_framework_to_path(project_root=None):
    """
    Ensure qa-hub-framework is in python path for local execution.
    This allows running tests without setting PYTHONPATH manually.
    """
    if project_root is None:
        project_root = os.getcwd()
        
    framework_dir = os.path.abspath(os.path.join(project_root, '..', 'qa-hub-framework'))
    if framework_dir not in sys.path and os.path.exists(framework_dir):
        sys.path.insert(0, framework_dir)
        print(f"[SETUP] Added framework to path: {framework_dir}")
