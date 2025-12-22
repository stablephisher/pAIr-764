"""
Policy Fetcher Module - Online Research for Jules Automation
Searches government portals for new policy PDFs and downloads them.
"""
import os
import re
import json
import time
import hashlib
import requests
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup
from datetime import datetime
import logging

logger = logging.getLogger("PolicyFetcher")

# Configuration
MONITORED_DIR = os.path.join(os.path.dirname(__file__), "monitored_policies")
FETCH_STATE_FILE = os.path.join(os.path.dirname(__file__), "fetch_state.json")

# Default policy sources (Indian Government Portals)
DEFAULT_SOURCES = [
    {
        "name": "MSME Ministry",
        "url": "https://msme.gov.in/notifications",
        "type": "html",
        "enabled": True
    },
    {
        "name": "India Code",
        "url": "https://www.indiacode.nic.in/",
        "type": "html",
        "enabled": False  # Requires JavaScript
    }
]

# Headers to mimic browser
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5"
}

def load_fetch_state():
    """Load previously fetched URLs to avoid duplicates."""
    if os.path.exists(FETCH_STATE_FILE):
        try:
            with open(FETCH_STATE_FILE, 'r') as f:
                return json.load(f)
        except:
            pass
    return {"fetched_urls": [], "last_fetch": None}

def save_fetch_state(state):
    """Save fetch state."""
    state["last_fetch"] = datetime.now().isoformat()
    with open(FETCH_STATE_FILE, 'w') as f:
        json.dump(state, f, indent=2)

def extract_pdf_links(html_content, base_url):
    """Extract PDF links from HTML page."""
    soup = BeautifulSoup(html_content, 'html.parser')
    pdf_links = []
    
    for link in soup.find_all('a', href=True):
        href = link['href']
        # Check if it's a PDF link
        if href.lower().endswith('.pdf') or 'pdf' in href.lower():
            full_url = urljoin(base_url, href)
            pdf_links.append({
                "url": full_url,
                "title": link.get_text(strip=True) or os.path.basename(urlparse(href).path)
            })
    
    return pdf_links

def download_pdf(url, title=None):
    """Download a PDF and save to monitored_policies folder."""
    try:
        logger.info(f"Downloading: {url}")
        response = requests.get(url, headers=HEADERS, timeout=30, stream=True)
        response.raise_for_status()
        
        # Generate filename
        if title:
            # Clean title for filename
            clean_title = re.sub(r'[^\w\s-]', '', title)[:50]
            filename = f"{clean_title}.pdf"
        else:
            filename = os.path.basename(urlparse(url).path)
            if not filename.endswith('.pdf'):
                filename = f"{hashlib.md5(url.encode()).hexdigest()[:8]}.pdf"
        
        filepath = os.path.join(MONITORED_DIR, filename)
        
        # Avoid overwriting
        if os.path.exists(filepath):
            logger.info(f"File already exists: {filename}")
            return None
        
        with open(filepath, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        logger.info(f"✅ Downloaded: {filename}")
        return filepath
        
    except Exception as e:
        logger.error(f"❌ Failed to download {url}: {e}")
        return None

def fetch_from_source(source):
    """Fetch PDFs from a single source."""
    if not source.get("enabled", True):
        return []
    
    logger.info(f"Checking source: {source['name']} ({source['url']})")
    
    try:
        response = requests.get(source["url"], headers=HEADERS, timeout=15)
        response.raise_for_status()
        
        pdf_links = extract_pdf_links(response.text, source["url"])
        logger.info(f"Found {len(pdf_links)} PDF links on {source['name']}")
        
        return pdf_links
        
    except Exception as e:
        logger.error(f"Failed to fetch from {source['name']}: {e}")
        return []

def fetch_new_policies(sources=None, max_downloads=5):
    """
    Main function: Fetch new policies from online sources.
    
    Args:
        sources: List of source configs (uses DEFAULT_SOURCES if None)
        max_downloads: Maximum PDFs to download per run
    
    Returns:
        List of downloaded file paths
    """
    if sources is None:
        sources = DEFAULT_SOURCES
    
    # Ensure monitored directory exists
    if not os.path.exists(MONITORED_DIR):
        os.makedirs(MONITORED_DIR)
    
    state = load_fetch_state()
    fetched_urls = set(state.get("fetched_urls", []))
    
    downloaded_files = []
    
    for source in sources:
        pdf_links = fetch_from_source(source)
        
        for pdf in pdf_links:
            if pdf["url"] in fetched_urls:
                continue  # Already processed
            
            if len(downloaded_files) >= max_downloads:
                logger.info(f"Reached max downloads limit ({max_downloads})")
                break
            
            filepath = download_pdf(pdf["url"], pdf.get("title"))
            if filepath:
                downloaded_files.append(filepath)
                fetched_urls.add(pdf["url"])
            
            # Be polite to servers
            time.sleep(1)
        
        if len(downloaded_files) >= max_downloads:
            break
    
    # Save state
    state["fetched_urls"] = list(fetched_urls)
    save_fetch_state(state)
    
    logger.info(f"Fetch complete. Downloaded {len(downloaded_files)} new files.")
    return downloaded_files

def add_custom_source(name, url, source_type="html"):
    """Add a custom policy source."""
    sources = load_fetch_state().get("custom_sources", [])
    sources.append({
        "name": name,
        "url": url,
        "type": source_type,
        "enabled": True
    })
    state = load_fetch_state()
    state["custom_sources"] = sources
    save_fetch_state(state)
    logger.info(f"Added custom source: {name}")

if __name__ == "__main__":
    # Test the fetcher
    logging.basicConfig(level=logging.INFO)
    print("Testing Policy Fetcher...")
    files = fetch_new_policies(max_downloads=2)
    print(f"Downloaded: {files}")
