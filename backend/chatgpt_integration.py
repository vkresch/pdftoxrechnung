import os
import re
import json
import time
import logging
from contextlib import suppress
from selenium.webdriver.common.keys import Keys
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from seleniumbase import SB  # SB is a simple SeleniumBase driver
from backend.utils import PROMPT

logging.basicConfig(
    format="%(asctime)s - %(levelname)s - %(message)s",
    level=logging.INFO,
)


def process_with_chatgpt(pdf_text):
    """Main function to automate chat while caching login"""
    logging.info(f"Starting ChatGPT extraction process ...")
    with SB(uc=True, headless=True) as sb:
        url = "https://chatgpt.com/"
        sb.open(url)
        sb.click_if_visible('button[aria-label="Close dialog"]')
        sb.wait_for_element_visible("#prompt-textarea", timeout=10)
        chat_text_area = sb.find_element("id", "prompt-textarea")
        sb.execute_script(
            "arguments[0].innerHTML=arguments[1]",
            chat_text_area,
            f"{PROMPT} {pdf_text}",
        )
        chat_text_area.send_keys(Keys.ENTER)

        with suppress(Exception):
            # The "Stop" button disappears when ChatGPT is done typing a response
            logging.info("Extracting pdf data into json ...")
            sb.wait_for_element_not_visible(
                'button[data-testid="stop-button"]', timeout=180
            )
            time.sleep(0.5)
        response = sb.find_element("[data-message-author-role='assistant'] code").text
        json_match = re.search(r"({.*})", response, re.DOTALL)
        json_str = json_match.group(1)
        logging.info(f"JSON String:\n{json_str}")
        return json.loads(json_str)
