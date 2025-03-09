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
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Windows; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.114 Safari/537.36"

# print(prompt)

op = uc.ChromeOptions()
op.binary_location = "/usr/bin/google-chrome"
op.add_argument(f"user-agent={USER_AGENT}")
op.add_argument("--no-sandbox")

driver = uc.Chrome(chrome_options=op)

MAIL = "*******"
PASSWORD = "********"
PATH = "/usr/bin/google-chrome"

driver.get("https://chatgpt.com/auth/login")

sleep(3)

inputElements = driver.find_elements(By.TAG_NAME, "button")
inputElements[0].click()

sleep(5)

mail = driver.find_elements(By.ID, "email-input")[0]
mail.send_keys(MAIL)

btn = driver.find_elements(By.CLASS_NAME, "continue-btn")[0]
btn.click()

password = driver.find_elements(By.ID, "password")[0]
password.send_keys(PASSWORD)

sleep(3)


wait = WebDriverWait(driver, 10)
btn = wait.until(EC.element_to_be_clickable((By.CLASS_NAME, "_button-login-password")))
btn.click()
sleep(10)

inputElements = driver.find_elements(By.ID, "prompt-textarea")

i = 0
# while i<10:
inputElements[0].send_keys(prompt)
sleep(2)
inputElements[0].send_keys(Keys.ENTER)
sleep(10)
inputElements = driver.find_elements(By.TAG_NAME, "p")
sleep(5)
results = []
for element in inputElements:
    results.append(element.text)
print(results)
i += 1
sleep(5)
