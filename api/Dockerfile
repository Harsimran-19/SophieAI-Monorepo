FROM python:3.11-slim

# Set the working directory.
WORKDIR /app

# Copy the application files
COPY pyproject.toml README.md requirements.txt .env ./
COPY src/ src/
COPY tools/ tools/

# Install uv for faster package installation
# RUN pip install uv

# Install dependencies without installing the package itself
RUN pip install -e .

# Set the Python path to include src directory directly
ENV PYTHONPATH="/app:/app/src"

# Expose the port the app runs on
EXPOSE 8000

CMD ["/usr/local/bin/python", "-m", "src.main"]
