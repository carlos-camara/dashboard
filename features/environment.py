from features.support.paths import add_framework_to_path

# 1. Path Setup (Must be first to import framework)
add_framework_to_path()

import os
from qa_framework.utils.hooks import FrameworkHooks
from features.support.seeding import seed_performance_data, seed_test_run_data

# -----------------------------------------------------------------------------
# HOOKS
# -----------------------------------------------------------------------------

def before_all(context):
    """
    Project-level setup.
    Initializes framework, configures paths, and seeds test data.
    """
    # 1. Framework Bootstrap
    lang_dir = os.path.join(os.path.dirname(__file__), "language")
    FrameworkHooks.bootstrap(context, lang_dir=lang_dir)
    
    # 2. Configure Paths
    context.failure_screenshots_dir = os.path.join("features", "resources", "screenshots")

    # 3. Seed Data (Project Specific)
    seed_performance_data(context)
    seed_test_run_data(context)


def before_scenario(context, scenario):
     """Initialize driver using framework lifecycle logic."""
     FrameworkHooks.before_scenario(context, scenario)


def after_step(context, step):
    """Capture screenshots on failure using framework utility."""
    FrameworkHooks.handle_step_failure(context, step, context.failure_screenshots_dir)


def after_all(context):
    """Project-level teardown using framework hook."""
    FrameworkHooks.teardown(context)
