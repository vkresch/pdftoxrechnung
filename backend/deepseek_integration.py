import os
import re
import json
import time
import logging
from selenium.webdriver.common.keys import Keys
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from seleniumbase import SB  # SB is a simple SeleniumBase driver
from backend.utils import PROMPT

logging.basicConfig(
    format="%(asctime)s - %(levelname)s - %(message)s",
    level=logging.INFO,
)

# Load credentials from environment variables (or replace with actual values)
MAIL = os.environ.get("DEEPSEEK_MAIL", "your_email@example.com")
PASSWORD = os.environ.get("DEEPSEEK_PASSWORD", "your_password")


def process_with_deepseek(pdf_text, test=False):
    """Main function to automate chat while caching login"""
    logging.info(f"Starting deepseek extraction process ...")
    with SB(
        uc=True,
        ad_block=True,
        test=test,
        # user_data_dir="./user_data",  # Reuse Chrome profile to persist login
    ) as sb:
        url = "https://chat.deepseek.com/sign_in"
        sb.uc_open_with_reconnect(url, 4)
        if test:
            sb.uc_gui_click_captcha()
            sb.sleep(1)
            sb.uc_gui_click_captcha()
            sb.sleep(1)
            sb.uc_gui_handle_captcha()
            sb.sleep(1)
        logged_in = False

        # TODO: Readd this once headless mode works with user_data_dir to avoid login for every request
        #   try:
        #       sb.wait_for_element_visible("#chat-input", timeout=1)
        #       logged_in = True
        #   except Exception:
        #       logged_in = False

        # Check if already logged in
        if not logged_in:
            logging.info("Login required, proceeding with login.")

            if test:
                sb.save_screenshot("screenshots/01_deepseek_before_login.png")

            # Enter credentials only if login is needed
            sb.send_keys("//input[@class='ds-input__input'][@type='text']", MAIL)
            sb.send_keys(
                "//input[@class='ds-input__input'][@type='password']", PASSWORD
            )
            # sb.click(".ds-checkbox-align-wrapper")
            sb.click(".ds-button--primary")
            sb.wait_for_element_visible("#chat-input", timeout=20)
        else:
            logging.info("Already logged in, proceeding to chat.")

        if test:
            sb.save_screenshot("screenshots/02_deepseek_logged_in.png")

        chat_text_area = sb.find_element("id", "chat-input")
        sb.execute_script(
            """
         let event = new Event('input', { bubbles: true });
         Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(arguments[0], arguments[1]);
         arguments[0].dispatchEvent(event);
         """,
            chat_text_area,
            f"{PROMPT} {pdf_text}",
        )
        sb.wait_for_element_visible("//div[@class='_7436101'][@aria-disabled='false']")
        chat_text_area.send_keys(Keys.ENTER)

        if test:
            sb.sleep(20)
            sb.save_screenshot("screenshots/03_deepseek_started_extraction.png")

        # Wait for response elements to load
        logging.info("Extracting pdf data into json ...")
        sb.wait_for_element_visible("//div[@class='ds-flex _965abe9']", timeout=300)

        # response = sb.find_element(".ds-markdown--block p").text
        response = sb.find_element(".md-code-block pre").text

        # Save a screenshot
        if test:
            sb.save_screenshot("screenshots/04_deepseek_after_extraction.png")

        json_match = re.search(r"({.*})", response, re.DOTALL)
        json_str = json_match.group(1)
        logging.info(f"JSON String:\n{json_str}")
        return json.loads(json_str)
