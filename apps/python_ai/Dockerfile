FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y wget && rm -rf /var/lib/apt/lists/*

RUN wget --continue --tries=100 --read-timeout=30 -O "torch-2.1.0+cpu-cp311-cp311-linux_x86_64.whl" "https://download.pytorch.org/whl/cpu/torch-2.1.0%2Bcpu-cp311-cp311-linux_x86_64.whl"

COPY requirements.txt .

RUN pip install --upgrade pip && \
    pip install --no-cache-dir ./torch-2.1.0+cpu-cp311-cp311-linux_x86_64.whl && \
    pip install --no-cache-dir -r requirements.txt

RUN rm "torch-2.1.0+cpu-cp311-cp311-linux_x86_64.whl"

RUN pip install --no-cache-dir https://github.com/explosion/spacy-models/releases/download/en_core_web_sm-3.7.1/en_core_web_sm-3.7.1-py3-none-any.whl

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]