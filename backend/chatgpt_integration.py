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


def process_with_chatgpt(pdf_text, test=False):
    """Main function to automate chat while caching login"""
    logging.info(f"Starting ChatGPT extraction process ...")
    with SB(
        uc=True,
        ad_block=True,
        test=test,
        # user_data_dir="./user_data",  # Reuse Chrome profile to persist login
    ) as sb:
        url = "https://chatgpt.com/"
        # sb.uc_open_with_reconnect(url)
        sb.activate_cdp_mode(url)
        sb.sleep(1)
        sb.click_if_visible('button[aria-label="Close dialog"]')
        sb.wait_for_element_visible("#prompt-textarea", timeout=10)
        chat_text_area = sb.find_element("id", "prompt-textarea")
        sb.execute_script(
            "arguments[0].innerHTML=arguments[1]",
            chat_text_area,
            f"{PROMPT} {pdf_text}",
        )
        chat_text_area.send_keys(Keys.ENTER)

        # Save a screenshot for debugging issues
        # sb.save_screenshot("backend/chatgpt_chat.png")

        logging.info("Extracting pdf data into json ...")
        sb.wait_for_element_visible(
            "//button[@data-testid='copy-turn-action-button']", timeout=180
        )

        response = sb.find_element("[data-message-author-role='assistant'] code").text
        json_match = re.search(r"({.*})", response, re.DOTALL)
        json_str = json_match.group(1)
        logging.info(f"JSON String:\n{json_str}")
        return json.loads(json_str)
