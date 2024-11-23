# RECON

Recall Extraction and Correlation for Forensic Operations Nexus (RECON)

## BLIP Model Integration

In this project, we utilize the BLIP (Bootstrapped Language-Image Pre-training) model to perform Visual Question Answering (VQA) on Microsoft Recall images. The BLIP model enables the system to process images and respond to related questions with high accuracy, making it a critical component of our application.

### Deployment Instructions

To deploy the project successfully, please ensure the following prerequisits are met:

1. Model and Processor Directories
   - The following folders must be present in the directory path `RECON/model/api`:
     - `blip_model`: This folder should contain the pretrained model files like `model.safetensors`, along with the necessary configuration files like `config.json` and `generation_config.json`.
     - `blip_processor`: This folder should contain the processor files required for input preprocessing like `preprocessor_config.json`, `special_tokens_map.json`, `tokenizer_config.json`, `tokenizer.json`, and `vocab.txt`.
2. Docker Setup:
   - Ensure that you have Docker installed and properly configured on your system
   - Before running the application, ensure the required model and processor folders are correctly placed as outlined above.
3. Running the Application:
   - Navigate to the project Root directory where the `docker-compose.yml` file is located.
   - Execute the following command to build and start the Docker container:
     ```
     docker-compose up -d
     ```
   - The application will automatically load the BLIP model and processor from the specified directories.
4. Verification:
   - Once the container is running, verify that the application is functional by sending test requests via (`127.0.0.1/8000/docs`) or referring to the application logs for confirmation.
