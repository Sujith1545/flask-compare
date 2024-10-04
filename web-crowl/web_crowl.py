import re
import requests
import requests.exceptions
from urllib.parse import urlsplit, urljoin
from collections import deque
from bs4 import BeautifulSoup
from concurrent.futures import ThreadPoolExecutor, as_completed
import csv

# Function to read blacklisted URLs from a file
def read_blacklist(file_path):
    with open(file_path, 'r') as file:
        return set(line.strip() for line in file if line.strip())

# Function to extract emails and header/footer links from a given URL
def extract_emails_and_links_from_url(url):
    emails = set()
    links = set()
    try:
        response = requests.get(url)
        response.raise_for_status()  # Raise HTTPError for bad responses

        # Extract all email addresses
        new_emails = set(re.findall(r"[a-z0-9\.\-+_]+@[a-z0-9\.\-+_]+\.[a-z]+", response.text, re.I))
        emails.update(new_emails)

        # Parse HTML document
        soup = BeautifulSoup(response.text, 'lxml')
        base_url = f"{urlsplit(url).scheme}://{urlsplit(url).netloc}"

        # Extract links from header and footer sections
        header = soup.find('header')
        footer = soup.find('footer')

        if header:
            for anchor in header.find_all("a"):
                link = anchor.get("href", '')
                if link:
                    link = urljoin(base_url, link)
                    links.add(link)

        if footer:
            for anchor in footer.find_all("a"):
                link = anchor.get("href", '')
                if link:
                    link = urljoin(base_url, link)
                    links.add(link)

    except (requests.exceptions.RequestException, requests.exceptions.MissingSchema) as e:
        print(f"Error fetching URL {url}: {e}")

    return url, emails, links

# Function to write results to CSV immediately
def write_email_to_csv(file_path, website, page_url, email):
    with open(file_path, 'a', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        writer.writerow([website, page_url, email])

# Main function to handle crawling with multi-threading
def crawl(starting_urls, blacklist, max_threads=10, output_file='emails.csv'):
    unprocessed_urls = deque(starting_urls)
    processed_urls = set()
    website_name = urlsplit(starting_urls[0]).netloc  # Assuming the website name is the same for all URLs

    with ThreadPoolExecutor(max_threads) as executor:
        future_to_url = {executor.submit(extract_emails_and_links_from_url, url): url for url in starting_urls}
        
        while future_to_url:
            for future in as_completed(future_to_url):
                url = future_to_url.pop(future)
                try:
                    if url in blacklist:
                        print(f"URL {url} is in blacklist. Skipping.")
                        continue

                    page_url, emails, links = future.result()
                    if emails:
                        for email in emails:
                            write_email_to_csv(output_file, website_name, page_url, email)
                            print(f"Found email {email} on {page_url}")

                    # Add new links to the unprocessed URL list
                    for link in links:
                        if link not in processed_urls and link not in unprocessed_urls and link not in blacklist:
                            unprocessed_urls.append(link)
                            future_to_url[executor.submit(extract_emails_and_links_from_url, link)] = link

                    processed_urls.add(url)
                except Exception as e:
                    print(f"Error processing URL {url}: {e}")

# Read starting URLs from a text file
def read_urls_from_file(file_path):
    with open(file_path, 'r') as file:
        return [line.strip() for line in file if line.strip()]

if __name__ == "__main__":
    input_file = 'urls.txt'  # File containing the starting URLs
    blacklist_file = 'blacklist_links.txt'  # File containing the blacklisted URLs
    output_file = 'emails.csv'  # Output CSV file

    # Read URLs from the file
    starting_urls = read_urls_from_file(input_file)

    # Read blacklist URLs from the file
    blacklist = read_blacklist(blacklist_file)

    # Create or clear the CSV file and add headers
    with open(output_file, 'w', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        writer.writerow(["Website", "Page URL", "Email"])

    # Start crawling
    crawl(starting_urls, blacklist, output_file=output_file)

    print("Crawling complete. Results saved to", output_file)
