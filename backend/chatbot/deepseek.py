import os
import pandas as pd
import selenium
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from time import sleep
import undetected_chromedriver as uc
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

prompt = "How are you today?"

op = webdriver.ChromeOptions()

# ✅ Set Headless Mode Properly
# op.add_argument("--headless=new")  # This is a crucial line to make it headless
op.add_argument("--disable-gpu")  # Disable GPU acceleration in headless mode
op.add_argument(
    "--window-size=1920x1080"
)  # Set a window size to avoid rendering issues
op.add_argument("--start-maximized")
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

try:
    chat_input = wait.until(
        EC.visibility_of_element_located((By.XPATH, "//textarea[@id='chat-input']"))
    )
    print("Already logged in, proceeding to chat.")
    sleep(1)

except selenium.common.exceptions.TimeoutException:
    print("Login required, proceeding with login.")

    # Wait for input fields to be visible
    input_elements = wait.until(
        EC.visibility_of_all_elements_located(
            (By.XPATH, "//input[@class='ds-input__input']")
        )
    )

    # Enter credentials
    input_elements[0].send_keys(MAIL)
    input_elements[1].send_keys(PASSWORD)

    # Click checkbox
    check_box = wait.until(
        EC.element_to_be_clickable(
            (By.XPATH, "//div[@class='ds-checkbox-align-wrapper']")
        )
    )
    check_box.click()

    # Click sign-in button
    btn = wait.until(
        EC.element_to_be_clickable(
            (
                By.XPATH,
                "//div[@class='ds-button ds-button--primary ds-button--filled ds-button--rect ds-button--block ds-button--l ds-sign-up-form__register-button']",
            )
        )
    )
    btn.click()

    # Wait for chat input field to appear
    chat_input = wait.until(
        EC.visibility_of_element_located((By.XPATH, "//textarea[@id='chat-input']"))
    )

# Send message
chat_input.send_keys(prompt)
chat_input.send_keys(Keys.ENTER)

# Wait for response elements to load
sleep(20)
wait.until(
    EC.presence_of_all_elements_located(
        (By.XPATH, "//div[@class='ds-markdown ds-markdown--block']/p")
    )
)

# Extract response text
results = [
    element.text
    for element in driver.find_elements(
        By.XPATH, "//div[@class='ds-markdown ds-markdown--block']/p"
    )
]
print(results)
