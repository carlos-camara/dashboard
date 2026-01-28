"""
Base Page Object class with common functionality.
All page objects should inherit from this class.
"""
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By


import yaml
import os

class BasePage:
    """Base class for all page objects"""
    
    # Cache for locators to avoid reading file multiple times
    _LOCATORS = None
    
    def __init__(self, driver):
        self.driver = driver
        # Increased timeout to 15 seconds for elements that load dynamically
        self.wait = WebDriverWait(driver, 15)
        self._load_locators()
        
    def _load_locators(self):
        """Load locators from YAML file if not already loaded"""
        if BasePage._LOCATORS is None:
            # Assume locators.yaml is in the same directory as this file
            current_dir = os.path.dirname(os.path.abspath(__file__))
            yaml_path = os.path.join(current_dir, "locators.yaml")
            try:
                with open(yaml_path, 'r') as f:
                    BasePage._LOCATORS = yaml.safe_load(f)
            except Exception as e:
                print(f"Error loading locators.yaml: {e}")
                BasePage._LOCATORS = {}

    def get_locator_def(self, page_name, locator_path):
        """
        Retrieve a locator tuple (By.TYPE, value) from the loaded YAML.
        
        Args:
            page_name (str): The root key in YAML (e.g., 'dashboard')
            locator_path (str): Dot-separated path to locator (e.g., 'header.title')
            
        Returns:
            tuple: (By.XPATH, value) or (By.CSS_SELECTOR, value) etc.
        """
        if not BasePage._LOCATORS:
            return None
            
        # Navigate through the dictionary
        keys = locator_path.split('.')
        data = BasePage._LOCATORS.get(page_name, {})
        
        for key in keys:
            if isinstance(data, dict):
                data = data.get(key)
            else:
                return None
                
        if not data or 'by' not in data or 'value' not in data:
            return None
            
        by_map = {
            'xpath': By.XPATH,
            'css': By.CSS_SELECTOR,
            'id': By.ID,
            'name': By.NAME,
            'class': By.CLASS_NAME,
            'tag': By.TAG_NAME,
            'link': By.LINK_TEXT,
            'partial_link': By.PARTIAL_LINK_TEXT
        }
        
        by_type = by_map.get(data['by'].lower(), By.XPATH)
        return (by_type, data['value'])

    def find_element(self, locator):
        """
        Find element using locator tuple (By.TYPE, "value")
        """
        return self.wait.until(EC.presence_of_element_located(locator))
    
    def find_elements(self, locator):
        """
        Find multiple elements using locator tuple
        """
        return self.wait.until(EC.presence_of_all_elements_located(locator))
    
    def click(self, locator):
        """
        Click on element using locator
        """
        element = self.wait.until(EC.element_to_be_clickable(locator))
        element.click()
    
    def is_visible(self, locator):
        """
        Check if element is visible
        """
        try:
            element = self.wait.until(EC.visibility_of_element_located(locator))
            return element.is_displayed()
        except:
            return False
    
    def get_text(self, locator):
        """
        Get text from element
        """
        element = self.find_element(locator)
        return element.text
    
    def scroll_to_element(self, locator):
        """
        Scroll to element
        """
        element = self.find_element(locator)
        self.driver.execute_script("arguments[0].scrollIntoView(true);", element)
