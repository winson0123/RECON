from transformers import BlipProcessor, BlipForQuestionAnswering
from PIL import Image
from fastapi import FastAPI
import json
import os

app = FastAPI(
    title="ML Engine",
    description="API to interact with BLIP directly",
    docs_url="/docs",
    redoc_url=None,
)

# Obtain the base dir of the current file path
base_dir = os.path.dirname(os.path.abspath(__file__))

# Predefined Directory Path
INDEX_DIRECTORY = os.path.join(base_dir, "..", "uploads")

# Processor and model directory
processor_path = os.path.join(base_dir, "blip_processor")
model_path = os.path.join(base_dir, "blip_model")

# Load processor and model locally
processor = BlipProcessor.from_pretrained(processor_path)
model = BlipForQuestionAnswering.from_pretrained(model_path)


@app.post("/predict/")
def predict(question: str):
    try:
        results = []
        prompt = f"Is there a {question} in the photo?"
        # Ensuring that directory exists
        if not os.path.isdir(INDEX_DIRECTORY):
            return {"error": f"The directory '{INDEX_DIRECTORY}' does not exist."}

        for indexes in os.listdir(INDEX_DIRECTORY):
            index_dir = os.path.join(
                INDEX_DIRECTORY, indexes)
            image_dir = os.path.join(index_dir, "screenshots")

            # Obtain image files with specific extensions
            image_files = [
                os.path.join(image_dir, f)
                for f in os.listdir(image_dir)
                if f.lower().endswith(('.png', '.jpg', '.jpeg'))
            ]

            if not image_files:
                return {"error": "No image files found in the directory."}

            selected_images = []
            for image_path in image_files:
                try:
                    # Running it through the model
                    # Loading the image
                    image = Image.open(image_path)
                    # Process the image and question
                    inputs = processor(image, prompt, return_tensors="pt")
                    out = model.generate(**inputs)
                    answer = processor.decode(out[0], skip_special_tokens=True)

                    # Only append images of those that the model returns a yes to the prompt
                    if answer == "yes":
                        selected_images.append(os.path.basename(image_path))
                except Exception as e:
                    return {"error": str(e) + "for the path" + image_path}
            results.append({os.path.basename(index_dir): selected_images})

        merged_results = {
            key: value for d in results for key, value in d.items()}

        results_json = json.dumps(merged_results)

        return results_json

    except Exception as e:
        return {"error": str(e)}
