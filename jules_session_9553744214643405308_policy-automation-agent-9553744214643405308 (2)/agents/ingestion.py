import time

class PolicyIngestionAgent:
    def ingest(self, document_source):
        """
        Simulates ingesting a policy document.
        Returns the extracted text.
        """
        print(f"[PolicyIngestionAgent] Ingesting document from {document_source}...")
        # Simulate processing time
        time.sleep(1)
        return f"Extracted text content from {document_source}"
