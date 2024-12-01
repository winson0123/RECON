# RECON
Recall Extraction and Correlation for Forensic Operations Nexus (RECON)

RECON is a robust platform designed to streamline forensic investigations by leveraging Recall data for advanced indexing, searching, and visual analysis. It enables forensic analysts to quickly extract insights from Recall artifacts, enhancing efficiency and accuracy in cyber incident investigations.

## Deployment Instructions
### Prerequisites
Before deploying RECON, ensure the following dependencies are installed on your system:  
- **Docker**: Version 20.x or higher  
- **Docker Compose**: Version 2.x or higher  

### Steps to Deploy

1. **Clone the Repository**  
   ```bash
   git clone https://github.com/winson0123/RECON.git
   cd RECON
   ```

2. Configuration
Make a copy of the `.env.sample` file and rename it `.env`. Modify the `.env` file to set any required environment variables such as database credentials, Elasticsearch settings.

3. Build and Deploy Services
Use the following command to build and start all services:
   ```bash
   docker compose up --build
   ```

4. Verify Deployment
Once all containers are running, verify by accessing the RECON dashboard in your browser at:
   ```
   http://localhost:3000
   ```

5. Shut Down Services
To stop and remove all running containers, use:
   ```bash
   docker compose down
   ```
## Usage
1. Upload Recall Data
   - Use the "Upload" feature on the dashboard to add Recall database files (SQLite).
   - The platform automatically parses and indexes the data for search and analysis.

2. Conduct Forensic Analysis
   #### Search Capabilities

   - Use the search bar to perform queries using Lucene syntax, including operators like AND, NOT, wildcards, and regex.
   - Example query:
      ```
      appName:"Windows Explorer" OR appName:"Microsoft Edge"
      ```
   #### Semantic Search
   - Utilize the semantic search feature to check for the presence of search item
      ```
      screenshot:monkey
      ```
   - The system will process the query through the integrated BLIP model to return relevant screenshots and parsed data.
   - The semantic search API can also be tested by accessing the FastAPI endpoint at:
      ```
      http://localhost:8000/docs
      ```

# Contributing
We welcome contributions to RECON! Please fork the repository, make your changes, and submit a pull request. For major changes, open an issue to discuss your proposed enhancements.
