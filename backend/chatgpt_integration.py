import os
import re
import json
import time
import logging
from contextlib import suppress
from selenium.webdriver.common.keys import Keys
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from seleniumbase import SB  # SB is a simple SeleniumBase driver
from utils import PROMPT

logging.basicConfig(
    format="%(asctime)s - %(levelname)s - %(message)s",
    level=logging.INFO,
)


def process_with_chatgpt(pdf_text, test=False):
    """Main function to automate chat while caching login"""
    logging.info(f"Starting ChatGPT extraction process ...")
    with SB(
        uc=True,
        test=test,
        # user_data_dir="./user_data",  # Reuse Chrome profile to persist login
    ) as sb:
        url = "https://chatgpt.com/"
        sb.uc_open_with_reconnect(url)
        if test:
            sb.sleep(1)
            sb.uc_gui_click_captcha()
            sb.sleep(1)
            sb.uc_gui_handle_captcha()
            sb.sleep(1)
        sb.save_screenshot("screenshots/01_chatgpt_on_site.png")
        sb.click_if_visible('button[aria-label="Close dialog"]')
        sb.wait_for_element_visible("#prompt-textarea", timeout=60)
        chat_text_area = sb.find_element("id", "prompt-textarea")
        sb.execute_script(
            "arguments[0].innerHTML=arguments[1]",
            chat_text_area,
            f"{PROMPT} {pdf_text}",
        )
        chat_text_area.send_keys(Keys.ENTER)

        sb.sleep(100)

        # Save a screenshot for debugging issues
        # if test:
        sb.save_screenshot("screenshots/02_chatgpt_started_extraction.png")

        logging.info("Extracting pdf data into json ...")
        sb.wait_for_element_visible(
            "//button[@data-testid='copy-turn-action-button']", timeout=180
        )

        response = sb.find_element("[data-message-author-role='assistant'] code").text
        json_match = re.search(r"({.*})", response, re.DOTALL)
        json_str = json_match.group(1)
        logging.info(f"JSON String:\n{json_str}")
        return json.loads(json_str)
