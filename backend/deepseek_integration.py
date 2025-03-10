import os
import re
import json
import time
import logging
from selenium.webdriver.common.keys import Keys
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from seleniumbase import SB  # SB is a simple SeleniumBase driver
from backend.utils import PROMPT

# Load credentials from environment variables (or replace with actual values)
MAIL = os.environ.get("DEEPSEEK_MAIL", "your_email@example.com")
PASSWORD = os.environ.get("DEEPSEEK_PASSWORD", "your_password")


def process_with_deepseek(pdf_text):
    """Main function to automate chat while caching login"""
    logging.info(f"Starting deepseek extraction process ...")
    with SB(
        uc=True,
        headless=True,  # Set to True for headless mode
        # user_data_dir="./user_data",  # Reuse Chrome profile to persist login
    ) as sb:
        sb.open("https://chat.deepseek.com/sign_in")
        logged_in = False

        #   try:
        #       sb.wait_for_element_visible("#chat-input", timeout=1)
        #       logged_in = True
        #   except Exception:
        #       logged_in = False

        # Check if already logged in
        if not logged_in:
            logging.info("Login required, proceeding with login.")

            # Enter credentials only if login is needed
            sb.send_keys("//input[@class='ds-input__input'][@type='text']", MAIL)
            sb.send_keys(
                "//input[@class='ds-input__input'][@type='password']", PASSWORD
            )
            sb.click(".ds-checkbox-align-wrapper")
            sb.click(".ds-button--primary")
            sb.wait_for_element_visible("#chat-input", timeout=10)
        else:
            logging.info("Already logged in, proceeding to chat.")

        # sb.send_keys("#chat-input", f"{PROMPT} {pdf_text}" + Keys.ENTER)
        # print(f"{PROMPT} {pdf_text}")
        time.sleep(2)
        # sb.execute_script(
        #    f"document.getElementById('chat-input').value = 'Hello How Are you?\n';"
        # )
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
        chat_text_area.send_keys(Keys.ENTER)

        # Wait for response elements to load
        logging.info("Extracting pdf data ...")
        sb.wait_for_element_visible("//div[@class='ds-flex abe97156']", timeout=120)

        # response = sb.find_element(".ds-markdown--block p").text
        response = sb.find_element(".md-code-block pre").text

        # Save a screenshot
        sb.save_screenshot("backend/deepseek_chat.png")

        json_match = re.search(r"({.*})", response, re.DOTALL)
        json_str = json_match.group(1)
        logging.info(f"JSON String:\n{json_str}")
        return json.loads(json_str)
