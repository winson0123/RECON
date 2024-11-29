from transformers import BlipProcessor, BlipForQuestionAnswering
from PIL import Image, UnidentifiedImageError
from fastapi import FastAPI, HTTPException
import os
import logging

# Configure the logger
logger = logging.getLogger(__name__)

app = FastAPI(
    title="ML Engine",
    description="API to interact with BLIP directly",
    docs_url="/docs",
    redoc_url=None,
)

# Paths and constants
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
INDEX_DIRECTORY = os.path.abspath(os.path.join(BASE_DIR, "..", "uploads"))
PROCESSOR_PATH = os.path.join(BASE_DIR, "blip_processor")
MODEL_PATH = os.path.join(BASE_DIR, "blip_model")

# Load BLIP processor and model
try:
    processor = BlipProcessor.from_pretrained(PROCESSOR_PATH)
    model = BlipForQuestionAnswering.from_pretrained(MODEL_PATH)
except Exception as e:
    raise RuntimeError(f"Failed to load model or processor: {e}")


@app.get(
    "/search/",
    summary="Semantic search for objects in screenshots",
    description=(
        "This endpoint enables semantic search of objects within the uploaded "
        "screenshots. Users can query for specific objects, and the BLIP model "
        "will analyze the screenshots to determine if the queried object is pre"
        "sent. Screenshots within each respective uploaded index are analyzed."
    ),
    responses={
        200: {
            "description": "Search completed successfully",
            "content": {
                "application/json": {
                    "example": {
                        "example-index1": [
                            "0dee725b-93e6-4f30-b751-cfaddf739e34",
                            "4cf2fde4-7b46-4b60-bf94-e7bdc504a8a5",
                            "57e9f23a-f0ce-4e96-b2a0-d1c4e836422b",
                        ],
                        "example-index2": [
                            "0dee725b-93e6-4f30-b751-cfaddf739e34",
                            "4cf2fde4-7b46-4b60-bf94-e7bdc504a8a5",
                            "57e9f23a-f0ce-4e96-b2a0-d1c4e836422b",
                        ],
                    }
                }
            },
        },
        400: {"description": "Directory does not exist."},
        500: {"description": "Error processing image."},
    },
)
def search(object: str):
    # Ensuring that directory exists
    if not os.path.isdir(INDEX_DIRECTORY):
        logger.error(f"Directory '{INDEX_DIRECTORY}' does not exist.")
        raise HTTPException(
            status_code=400,
            detail=f"Directory '{INDEX_DIRECTORY}' does not exist.",
        )

    results = {}
    prompt = f"Is there a {object} in the photo?"

    # Iterate through indexed directories
    for index_name in os.listdir(INDEX_DIRECTORY):
        index_dir = os.path.join(INDEX_DIRECTORY, index_name)
        image_dir = os.path.join(index_dir, "screenshots")

        # Skip if 'screenshots' directory doesn't exist
        if not os.path.isdir(image_dir):
            logger.warning(f"Skipping index '{index_name}' as 'screenshots' directory does not exist.")
            continue

        # List image files
        try:
            image_paths = [
                os.path.join(image_dir, f)
                for f in os.listdir(image_dir)
                if os.path.isfile(os.path.join(image_dir, f))
            ]
        except Exception as e:
            logger.error(f"Error listing files in {image_dir}: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Error listing files in {image_dir}: {e}",
            )

        # Process each image
        selected_images = []
        for image_path in image_paths:
            try:
                image = Image.open(image_path)
                inputs = processor(image, prompt, return_tensors="pt")
                output = model.generate(**inputs)
                answer = processor.decode(output[0], skip_special_tokens=True)
                if answer == "yes":
                    selected_images.append(os.path.basename(image_path))
            except UnidentifiedImageError:
                # Skip files that are not valid images
                logger.warning(f"Skipping invalid image: {image_path}")
                continue
            except Exception as e:
                # Log specific errors but continue processing
                logger.error(f"Error listing files in {image_dir}: {e}")
                raise HTTPException(
                    status_code=500,
                    detail=f"Error processing image '{image_path}': {e}",
                )

        # Add results if there are selected images
        if selected_images:
            results[index_name] = selected_images

    return results
