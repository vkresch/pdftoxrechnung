# Use official Python image
FROM python:3.11

# Set working directory
WORKDIR /app

# Install dependencies
RUN apt-get update && apt-get install -y wget curl gnupg unzip

# Add Google Chrome repository and install it
RUN wget -qO- https://dl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /usr/share/keyrings/google-chrome-keyring.gpg \
    && echo 'deb [signed-by=/usr/share/keyrings/google-chrome-keyring.gpg] http://dl.google.com/linux/chrome/deb/ stable main' | tee /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable

# Install Selenium dependencies
RUN pip install --no-cache-dir seleniumbase

# Install ChromeDriver and undetected ChromeDriver
RUN seleniumbase install chromedriver && seleniumbase install uc_driver

# Copy and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Expose port (FastAPI default is 8000)
EXPOSE 8000

# Run FastAPI with Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
