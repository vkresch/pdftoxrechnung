import os
import pandas as pd
import selenium
from selenium import webdriver
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from time import sleep
import undetected_chromedriver as uc
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.support import expected_conditions as EC

prompt = "How are you today?"

op = webdriver.ChromeOptions()

# ✅ Set Headless Mode Properly
op.add_argument("--headless=new")  # This is a crucial line to make it headless
op.add_argument("--disable-gpu")  # Disable GPU acceleration in headless mode
op.add_argument(
    "--window-size=1920x1080"
)  # Set a window size to avoid rendering issues
op.add_argument("--no-sandbox")  # Prevents sandbox issues
op.add_argument("--remote-debugging-port=9222")  # Debugging (optional)
op.add_argument("user-data-dir=./")
# op.add_experimental_option("detach", True)
# op.add_experimental_option("excludeSwitches", ["enable-logging"])

# Set Chromium binary if using Chromium instead of Chrome
op.binary_location = "/usr/bin/chromium-browser"  # Adjust as needed
# op.binary_location = "/usr/bin/google-chrome"

# driver = webdriver.Chrome(ChromeDriverManager().install(), options=op)
# driver = uc.Chrome(chrome_options=op, headless=False, version_main=134)
driver = uc.Chrome(options=op)

MAIL = os.environ.get("DEEPSEEK_MAIL")
PASSWORD = os.environ.get("DEEPSEEK_PASSWORD")

driver.get("https://chat.deepseek.com/sign_in")

wait = WebDriverWait(driver, 10)

# Wait for input fields to be visible
input_elements = wait.until(
    EC.visibility_of_all_elements_located((By.TAG_NAME, "input"))
)

# Enter credentials
input_elements[0].send_keys(MAIL)
input_elements[1].send_keys(PASSWORD)

# Click checkbox
check_box = wait.until(EC.element_to_be_clickable((By.CLASS_NAME, "ds-checkbox")))
check_box.click()

# Click sign-in button
btn = wait.until(EC.element_to_be_clickable((By.CLASS_NAME, "ds-button--filled")))
btn.click()

# Wait for chat input field to appear
chat_input = wait.until(EC.visibility_of_element_located((By.ID, "chat-input")))

# Send message
chat_input.send_keys(prompt)
chat_input.send_keys(Keys.ENTER)

sleep(20)
# Wait for response elements to load
wait.until(EC.presence_of_all_elements_located((By.TAG_NAME, "p")))

# Extract response text
results = [element.text for element in driver.find_elements(By.TAG_NAME, "p")]
print(results)
