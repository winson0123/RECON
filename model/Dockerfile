ARG name=sensibert_model
ARG python_version=3.10
ARG python_tag=${python_version}-slim-bookworm

# Build stage
FROM docker.io/library/python:${python_tag} AS build
ARG python_version

# Install dependencies
COPY model/requirements.txt ./
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# Deployment stage
FROM docker.io/library/python:${python_tag} AS deploy
ARG python_version

WORKDIR /app/model

# Copy dependencies
COPY --from=build /install /usr/local

# Copy application code
COPY model/api/ ./api/

EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "-k", "uvicorn.workers.UvicornWorker", "api.api:app"]
