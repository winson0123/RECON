ARG name=sensibert_model
ARG python_version=3.10
ARG python_tag=${python_version}-slim-bookworm

FROM docker.io/library/python:${python_tag} AS deploy
ARG python_version

WORKDIR /app/model


COPY model/ /app/model

EXPOSE 8000

RUN pip install \
    pillow \
    torch \
    fastapi \
    transformers \
    uvicorn \
    gunicorn \
    && rm -r ~/.cache

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "-k", "uvicorn.workers.UvicornWorker", "api.api:app"]