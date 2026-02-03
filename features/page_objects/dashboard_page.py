"""
Dashboard Page Object
Contains all locators and methods for the main dashboard page.
"""
import time
from selenium.webdriver.common.by import By
from .base_page import BasePage
# Ensuring we use the local base page that will inherit from framework



class DashboardPage(BasePage):
    """Page Object for the main Dashboard page"""
    
    # URL
    URL = "http://localhost:3000"
    
    # Header Elements
    @property
    def HEADER_TITLE(self): return self.get_locator_def('dashboard', 'header.title')
    
    @property
    def HEADER_SUBTITLE(self): return self.get_locator_def('dashboard', 'header.subtitle')
    
    # Statistics Cards
    @property
    def STAT_PASS_RATE(self): return self.get_locator_def('dashboard', 'stats.pass_rate')
    
    @property
    def STAT_TOTAL_RUNS(self): return self.get_locator_def('dashboard', 'stats.total_runs')
    
    @property
    def STAT_AVG_DURATION(self): return self.get_locator_def('dashboard', 'stats.avg_duration')

    # Timeline Section
    @property
    def TIMELINE_HEADING(self): return self.get_locator_def('dashboard', 'timeline.heading')
    
    @property
    def TIMELINE_CHART(self): return self.get_locator_def('dashboard', 'timeline.chart')

    @property
    def TIMELINE_TOGGLE_SUCCESS(self): return self.get_locator_def('dashboard', 'timeline.toggle_success')

    @property
    def TIMELINE_TOGGLE_VOLUME(self): return self.get_locator_def('dashboard', 'timeline.toggle_volume')
    
    # Recent Runs Section
    @property
    def RECENT_RUNS_HEADING(self): return self.get_locator_def('dashboard', 'recent_runs.heading')
    
    @property
    def RECENT_RUNS_LIST_ITEM(self): return self.get_locator_def('dashboard', 'recent_runs.list_item')

    # Incidents Section
    @property
    def INCIDENTS_HEADING(self): return self.get_locator_def('dashboard', 'incidents.heading')

    @property
    def INCIDENTS_LIST_ITEM(self): return self.get_locator_def('dashboard', 'incidents.list_item')

    @property
    def SYSTEM_STATUS(self): return self.get_locator_def('dashboard', 'status_ticker.system_status')
    
    # Endpoints Section
    @property
    def ENDPOINTS_HEADING(self): return self.get_locator_def('dashboard', 'endpoints.heading')
    
    @property
    def ENDPOINTS_CATALOG(self): return self.get_locator_def('dashboard', 'endpoints.catalog')
    
    # Action Buttons
    @property
    def SYNC_BUTTON(self): return self.get_locator_def('dashboard', 'actions.sync_button')
    
    @property
    def FILTER_7_DAYS(self): return self.get_locator_def('dashboard', 'actions.filter_7_days')
    
    @property
    def FILTER_30_DAYS(self): return self.get_locator_def('dashboard', 'actions.filter_30_days')
    
    @property
    def FILTER_ALL_TIME(self): return self.get_locator_def('dashboard', 'actions.filter_all_time')

    @property
    def EXPORT_BUTTON(self): return self.get_locator_def('dashboard', 'actions.export_button')
    
    # Generic text locator builder
    @staticmethod
    def text_locator(text):
        """
        Build a locator for any text on the page.
        Uses normalize-space to handle whitespace and multiple matching strategies.
        """
        # Try multiple strategies for finding text
        # 1. Exact match with normalized spaces
        # 2. Contains match (more flexible)
        return (By.XPATH, f"//*[contains(normalize-space(.), '{text}')]")
    
    @staticmethod
    def button_locator(button_text):
        """Build a locator for a button with specific text"""
        return (By.XPATH, f"//button[contains(normalize-space(.), '{button_text}')]")
    
    @staticmethod
    def heading_locator(heading_text):
        """Build a locator for a heading (h1-h6) with specific text"""
        return (By.XPATH, f"//*[self::h1 or self::h2 or self::h3 or self::h4 or self::h5 or self::h6][contains(normalize-space(.), '{heading_text}')]")
    
    # Page Actions
    def navigate(self):
        """Navigate to the dashboard"""
        self.driver.get(self.URL)
    
    def click_sync_button(self):
        """Click the Sync button"""
        self.click(self.SYNC_BUTTON)
    
    def click_filter_7_days(self):
        """Click 7 Days filter"""
        self.click(self.FILTER_7_DAYS)
    
    def click_filter_30_days(self):
        """Click 30 Days filter"""
        self.click(self.FILTER_30_DAYS)
    
    def click_filter_all_time(self):
        """Click All Time filter"""
        self.click(self.FILTER_ALL_TIME)
    
    def is_stat_card_visible(self, stat_name):
        """Check if a stat card is visible"""
        locator = (By.XPATH, f"//*[contains(text(), '{stat_name}')]")
        return self.is_visible(locator)
    
    def scroll_to_bottom(self):
        """Scroll to bottom of the main content area"""
        try:
            # The main content area is the scrollable container in Layout.tsx (tag <main>)
            main_content = self.driver.find_element(By.TAG_NAME, "main")
            # Multiple scrolls to ensure everything is rendered
            for _ in range(3):
                self.driver.execute_script("arguments[0].scrollTop = arguments[0].scrollHeight;", main_content)
                time.sleep(0.3)
        except:
            # Fallback if main not found or not scrollable
            self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
    
    def scroll_to_top(self):
        """Scroll to top of the main content area"""
        try:
            main_content = self.driver.find_element(By.TAG_NAME, "main")
            self.driver.execute_script("arguments[0].scrollTop = 0;", main_content)
        except:
            self.driver.execute_script("window.scrollTo(0, 0);")

    def get_locator(self, locator_path):
        """
        Retrieves a locator from the YAML definition based on a dot-separated path.
        Example: "sidebar.test_runs_link"
        """
        parts = locator_path.split('.')
        
        # Known root pages in locators.yaml other than dashboard
        root_pages = ['sidebar', 'test_runs', 'run_detail', 'endpoints_view', 'endpoint_detail', 'performance_report_view', 'project_detail']
        
        if parts[0] in root_pages:
            return self.get_locator_def(parts[0], '.'.join(parts[1:]))
            
        if parts[0] == 'dashboard':
             return self.get_locator_def('dashboard', '.'.join(parts[1:]))

        # Default to checking under dashboard for sections like 'actions', 'stats', etc.
        return self.get_locator_def('dashboard', locator_path)

    def send_keys(self, locator, text):
        """Types text into an element after clearing it"""
        element = self.find_element(locator)
        element.clear()
        element.send_keys(text)
