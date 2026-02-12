from locust import HttpUser, task, between
import random

class DashboardUser(HttpUser):
    # Wait between 1 and 3 seconds between tasks (simulates thinking time)
    wait_time = between(1, 3)

    @task(3)
    def view_runs_list(self):
        """
        Simulate a user viewing the main 'Runs' list.
        This is weighted (3) to happen 3x more often than other tasks.
        """
        self.client.get("/api/runs", name="/api/runs (List)")

    @task(2)
    def view_endpoints(self):
        """
        Simulate viewing the endpoints catalog.
        """
        self.client.get("/api/endpoints", name="/api/endpoints (Catalog)")

    @task(1)
    def check_health(self):
        """
        Simulate a health check or heartbeat.
        """
        self.client.get("/api/health", name="/api/health")

    @task(1)
    def view_specific_run_details(self):
        """
        Simulate clicking into a specific run.
        First we need to get the list to find an ID.
        """
        # 1. Get list
        response = self.client.get("/api/runs", name="/api/runs (Fetch ID)")
        if response.status_code == 200:
            runs = response.json()
            if runs:
                # 2. Pick a random run
                selected_run = random.choice(runs)
                run_id = selected_run.get("id")
                if run_id:
                    # 3. View details for that run
                    self.client.get(f"/api/runs/{run_id}/scenarios", name="/api/runs/:id/scenarios")

    def on_start(self):
        """
        Called when a simulated user is hatched.
        """
        pass
